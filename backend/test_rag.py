import os
import sys
import django
from pathlib import Path

# Setup Django Environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from services.rag_service import load_rag_pipeline, get_answer

def test_rag_system():
    print("\n" + "="*50)
    print("DERMA AI RAG SYSTEM TEST")
    print("="*50)

    # 1. Load pipeline
    try:
        load_rag_pipeline()
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load pipeline: {e}")
        return

    questions = [
        "What is eczema and what causes it?",
        "What are the warning signs of melanoma?",
        "How is psoriasis treated?",
        "What is the ABCDE rule for checking moles?",
        "What causes acne and how can it be prevented?",
        "Is basal cell carcinoma dangerous?",
        "What is the difference between benign and malignant skin lesions?"
    ]

    passed_count = 0
    failed_count = 0

    for i, q in enumerate(questions, 1):
        print(f"\nTEST {i}: {q}")
        result = get_answer(q)
        
        if result['status'] == 'success':
            print(f"ANSWER: {result['answer']}")
            print(f"SOURCES: {', '.join(result['sources'])}")
            print("-" * 20)
            print("STATUS: PASSED")
            passed_count += 1
        else:
            print(f"ERROR: {result['answer']}")
            print("-" * 20)
            print("STATUS: FAILED")
            failed_count += 1
        
        print("-" * 50)

    print("\n" + "="*50)
    print("FINAL TEST SUMMARY")
    print(f"Total Tests: {len(questions)}")
    print(f"Passed:      {passed_count}")
    print(f"Failed:      {failed_count}")
    
    if passed_count == len(questions):
        print("\nRESULT: RAG system is ready!")
    else:
        print("\nRESULT: Check errors above before starting server.")
    print("="*50 + "\n")

if __name__ == "__main__":
    test_rag_system()
