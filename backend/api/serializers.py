from rest_framework import serializers
from .models import Detection, Doctor

class DetectionSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M")

    class Meta:
        model = Detection
        fields = ['id', 'disease', 'confidence', 'description', 'status', 'date']


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'qualification', 'rating', 'reviews', 'address', 'city', 'phone', 'fee', 'specialty', 'is_active']
