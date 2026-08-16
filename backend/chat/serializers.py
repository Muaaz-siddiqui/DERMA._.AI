from rest_framework import serializers
from .models import ChatSession, ChatMessage

class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(min_length=3, max_length=500)

    def validate_question(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Question cannot be empty.")
        return stripped

class ChatResponseSerializer(serializers.Serializer):
    question = serializers.CharField(read_only=True)
    answer = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    sources = serializers.ListField(child=serializers.CharField(), read_only=True)
    session_id = serializers.IntegerField(read_only=True)

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'sources', 'created_at']
        read_only_fields = fields

class ChatSessionSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']
        read_only_fields = fields

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        return last_msg.content if last_msg else None

class ChatSessionDetailSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'messages']
        read_only_fields = fields
