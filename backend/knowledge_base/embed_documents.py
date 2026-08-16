import os
import sys
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

# Set up paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DOCS_DIR = BASE_DIR / "knowledge_base" / "raw_docs"
FAISS_INDEX_DIR = BASE_DIR / "knowledge_base" / "faiss_index"

def embed_documents() -> None:
    """
    Loads text documentation, splits it into chunks, and creates a FAISS vector index.
    """
    print(f"--- Starting Derma AI Knowledge Base Embedding ---")
    
    # 1. Check for existing index
    if FAISS_INDEX_DIR.exists():
        confirm = input(f"FAISS index already exists at {FAISS_INDEX_DIR}. Rebuild? (y/n): ")
        if confirm.lower() != 'y':
            print("Aborting rebuild.")
            return

    # 2. Load Documents
    print(f"Step 1: Loading documents from {RAW_DOCS_DIR}...")
    if not RAW_DOCS_DIR.exists():
        print(f"ERROR: {RAW_DOCS_DIR} does not exist. Please place your .txt files there.")
        return

    loader = DirectoryLoader(
        str(RAW_DOCS_DIR), 
        glob="*.txt", 
        loader_cls=TextLoader, 
        loader_kwargs={'encoding': 'utf-8'}
    )
    docs = loader.load()
    print(f"Successfully loaded {len(docs)} documents.")

    # 3. Split Text
    print("Step 2: Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = text_splitter.split_documents(docs)
    print(f"Created {len(chunks)} text chunks.")

    # 4. Create Embeddings & FAISS Index
    print("Step 3: Initializing OllamaEmbeddings (nomic-embed-text:latest)...")
    embeddings = OllamaEmbeddings(model="nomic-embed-text:latest")
    
    print("Step 4: Building FAISS index (this may take a minute)...")
    vector_db = FAISS.from_documents(chunks, embeddings)

    # 5. Save Index
    print(f"Step 5: Saving index to {FAISS_INDEX_DIR}...")
    FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vector_db.save_local(str(FAISS_INDEX_DIR))

    print("\n--- Final Summary ---")
    print(f"Total Documents Loaded: {len(docs)}")
    print(f"Total Chunks Created:   {len(chunks)}")
    print(f"Index Saved Path:       {FAISS_INDEX_DIR}")
    print("Embedding process complete!")

if __name__ == "__main__":
    embed_documents()
