import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)

class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'
    verbose_name = "Chat & RAG"

    def ready(self):
        # Avoid loading RAG during migrations or if not in main process
        import os
        import sys
        
        # Check if we are running a management command like makemigrations or migrate
        if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate', 'collectstatic', 'test']):
            return

        if os.environ.get('RUN_MAIN') == 'true':
            # This ensures it only runs once in the main process when using autoreloader
            from services.rag_service import load_rag_pipeline
            try:
                print("Derma AI: Loading RAG pipeline...")
                load_rag_pipeline()
            except Exception as e:
                logger.error(f"Derma AI: Error loading RAG pipeline in ready(): {e}")
