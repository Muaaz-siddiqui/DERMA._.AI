import os
import logging
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Logging
logger = logging.getLogger(__name__)

# Constants & Paths
BASE_DIR = Path(__file__).resolve().parent.parent
FAISS_INDEX_PATH = BASE_DIR / "knowledge_base" / "faiss_index"
RAW_DOCS_DIR = BASE_DIR / "knowledge_base" / "raw_docs"

# Global Pipeline State
_pipeline_loaded = False
_qa_chain = None
_retriever = None
_pipeline_error: Optional[str] = None
_fallback_docs: Optional[List[Dict[str, str]]] = None

RAG_PROMPT_TEMPLATE = """
You are a helpful and knowledgeable medical assistant
for Derma AI, an AI powered skin disease detection app.

Your role is to answer questions about skin diseases
and skin health clearly and simply.

STRICT RULES:
1. Answer ONLY using the provided context below
2. If the answer is not in context respond exactly:
   "I don't have specific information about that.
   Please consult a qualified dermatologist."
3. Always end every answer with this reminder:
   "Remember: Always consult a qualified dermatologist
   for proper diagnosis and treatment."
4. Never make up or guess medical information
5. Use simple language anyone can understand
6. Do not use complex medical jargon

Context:
{context}

Question: {question}

Answer:
"""

def _load_fallback_documents() -> List[Dict[str, str]]:
    """Load local skin-disease knowledge documents for offline fallback."""
    global _fallback_docs
    if _fallback_docs is not None:
        return _fallback_docs

    if not RAW_DOCS_DIR.exists():
        _fallback_docs = []
        return _fallback_docs

    docs = []
    for path in sorted(RAW_DOCS_DIR.glob("*.txt")):
        try:
            text = path.read_text(encoding="utf-8").strip()
        except Exception:
            continue
        if text:
            docs.append({
                "title": path.stem.replace("_", " ").title(),
                "content": text
            })

    _fallback_docs = docs
    return _fallback_docs


def _build_fallback_answer(question: str, reason: Optional[str] = None) -> Dict[str, Any]:
    """Create a helpful answer from local knowledge documents when RAG services fail."""
    docs = _load_fallback_documents()
    q = (question or "").lower()
    best_doc = None
    best_score = 0

    for doc in docs:
        content = doc["content"].lower()
        title = doc["title"].lower()
        words = re.findall(r"[a-z]+", q)
        score = 0
        if title in q:
            score += 5
        for word in words:
            if len(word) < 3:
                continue
            if word in content:
                score += 1
        if score > best_score:
            best_score = score
            best_doc = doc

    if best_doc:
        summary = " ".join(best_doc["content"].splitlines()[:2]).strip()
        if len(summary) > 280:
            summary = summary[:277] + "..."
        answer = (
            f"I’m using the local knowledge base because the full RAG service is currently unavailable. "
            f"For {best_doc['title']}, the available information says: {summary}\n\n"
            "If you share your symptoms or the area affected, I can help you narrow down the concern further."
        )
        sources = [best_doc["title"]]
    else:
        answer = (
            "I can provide general guidance for common skin conditions such as acne, eczema, psoriasis, melanoma, and more. "
            "Please describe your symptoms or the affected area so I can help you more clearly."
        )
        sources = []

    if reason:
        answer = answer + f"\n\nNote: {reason}"

    return {
        "question": question,
        "answer": answer,
        "status": "success",
        "sources": sources
    }


def load_rag_pipeline() -> None:
    """
    Initializes the RAG components: Embeddings, Vector Store, and LLM.
    Updates global states for the singleton-like behavior.
    """
    global _pipeline_loaded, _qa_chain, _retriever

    if _pipeline_loaded:
        return

    try:
        from langchain_groq import ChatGroq
        from langchain_ollama import OllamaEmbeddings
        from langchain_community.vectorstores import FAISS
        from langchain_core.prompts import PromptTemplate
        from langchain_core.runnables import RunnablePassthrough
        from langchain_core.output_parsers import StrOutputParser

        logger.info("Derma AI: Loading RAG pipeline...")
        print("Derma AI: Loading Embeddings (Ollama: nomic-embed-text)...")
        embeddings = OllamaEmbeddings(
            model="nomic-embed-text:latest",
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        )

        print("Derma AI: Loading FAISS Index...")
        if not FAISS_INDEX_PATH.exists():
            raise FileNotFoundError(f"FAISS index not found at {FAISS_INDEX_PATH}. Run embed_documents.py first.")

        vector_db = FAISS.load_local(
            str(FAISS_INDEX_PATH),
            embeddings,
            allow_dangerous_deserialization=True
        )

        print("Derma AI: Initializing Groq LLM...")
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is missing from environment variables.")

        llm = ChatGroq(
            groq_api_key=api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024
        )

        print("Derma AI: Building RAG Chain using LCEL...")

        # Create prompt template
        prompt = PromptTemplate(
            template=RAG_PROMPT_TEMPLATE,
            input_variables=["context", "question"]
        )

        # Define function to format docs
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        # Build the RAG chain using LCEL
        # 1. Retrieve docs
        # 2. Format docs
        # 3. Pass to prompt
        # 4. Pass to LLM
        # 5. Parse output

        retriever = vector_db.as_retriever(search_kwargs={"k": 3})

        # Create the chain using LCEL (LangChain Expression Language)
        _qa_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

        # Store retriever for source extraction
        global _retriever
        _retriever = retriever

        _pipeline_loaded = True
        logger.info("Derma AI: RAG pipeline ready!")
        print("Derma AI: RAG pipeline ready!")

    except Exception as e:
        _pipeline_loaded = False
        _pipeline_error = str(e)
        logger.error(f"Failed to load RAG pipeline: {str(e)}")
        print(f"ERROR: Failed to load RAG pipeline: {e}")

def is_pipeline_loaded() -> bool:
    """Returns the status of the RAG pipeline."""
    return _pipeline_loaded


def get_pipeline_error() -> Optional[str]:
    """Returns a human-readable pipeline error if present."""
    return _pipeline_error

def get_answer(question: str) -> Dict[str, Any]:
    """
    Queries the RAG pipeline and returns a structured response.
    """
    if not _pipeline_loaded:
        # Try to load if not loaded (lazy loading)
        load_rag_pipeline()

        if not _pipeline_loaded:
            err = get_pipeline_error()
            return _build_fallback_answer(question, err or "The full RAG pipeline is unavailable.")

    try:
        # Get the answer
        answer = _qa_chain.invoke(question)

        # Get source documents for sourcing
        docs = _retriever.invoke(question)

        # Extract source filenames
        sources = []
        for doc in docs:
            source_path = doc.metadata.get("source", "Unknown")
            sources.append(Path(source_path).name)

        # Remove duplicates
        sources = list(set(sources))

        return {
            "question": question,
            "answer": answer,
            "status": "success",
            "sources": sources
        }
    except Exception as e:
        _pipeline_error = str(e)
        logger.error(f"Error getting RAG answer: {str(e)}")
        return _build_fallback_answer(question, str(e))