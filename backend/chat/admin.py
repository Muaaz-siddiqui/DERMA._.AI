from django.contrib import admin
from .models import ChatSession, ChatMessage

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'is_active')
    search_fields = ('title', 'user__username')
    list_filter = ('created_at', 'is_active')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'created_at')
    search_fields = ('content', 'session__title')
    list_filter = ('role', 'created_at')
