from django.urls import path
from .views import (
    ChatView, ChatHistoryView, ChatSessionDetailView, 
    NewChatSessionView, DeleteChatSessionView, HealthCheckView
)

urlpatterns = [
    path('', ChatView.as_view(), name='chat'),
    path('history/', ChatHistoryView.as_view(), name='chat-history'),
    path('session/<int:pk>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('new-session/', NewChatSessionView.as_view(), name='new-chat-session'),
    path('session/<int:pk>/delete/', DeleteChatSessionView.as_view(), name='delete-chat-session'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
