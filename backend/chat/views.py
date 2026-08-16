import logging
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ChatSession, ChatMessage
from .serializers import (
    ChatRequestSerializer, ChatResponseSerializer, 
    ChatSessionSerializer, ChatSessionDetailSerializer
)
from services.rag_service import get_answer, is_pipeline_loaded

logger = logging.getLogger(__name__)

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Removed the early is_pipeline_loaded() check here 
        # so get_answer() can lazily load the model if needed.

        question = serializer.validated_data['question']
        
        try:
            # 1. Get RAG answer
            rag_result = get_answer(question)
            if rag_result['status'] == 'error':
                return Response({"detail": rag_result['answer']}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # 2. Get or create session
            session = ChatSession.objects.filter(user=request.user, is_active=True).first()
            if not session:
                session = ChatSession.objects.create(
                    user=request.user,
                    title=question[:50]
                )

            # 3. Save User Message
            ChatMessage.objects.create(
                session=session,
                role="user",
                content=question
            )

            # 4. Save Assistant Message
            ChatMessage.objects.create(
                session=session,
                role="assistant",
                content=rag_result['answer'],
                sources=rag_result['sources']
            )

            # 5. Update session timestamp
            session.updated_at = timezone.now()
            session.save()

            # 6. Response
            response_data = {
                "question": question,
                "answer": rag_result['answer'],
                "status": "success",
                "sources": rag_result['sources'],
                "session_id": session.id
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Unexpected error in ChatView")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user, is_active=True).order_by('-created_at')

class ChatSessionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionDetailSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user, is_active=True)

class NewChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', 'New Chat')
        session = ChatSession.objects.create(user=request.user, title=title)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DeleteChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, user=request.user)
            session.is_active = False
            session.save()
            return Response({"message": "Chat session deleted"}, status=status.HTTP_200_OK)
        except ChatSession.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        loaded = is_pipeline_loaded()
        return Response({
            "status": "ok",
            "rag_loaded": loaded,
            "model": "llama3-8b-8192",
            "message": "Ready" if loaded else "Loading pipeline..."
        }, status=status.HTTP_200_OK)
