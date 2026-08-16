from django.db import models
from django.contrib.auth.models import User


class Doctor(models.Model):
    name = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)
    rating = models.FloatField(default=0.0)
    reviews = models.IntegerField(default=0)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=50)
    fee = models.CharField(max_length=50)
    specialty = models.CharField(max_length=255, default='Dermatology', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-reviews']

    def __str__(self):
        return f"Dr. {self.name}"


class Detection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='detections')
    disease = models.CharField(max_length=255)
    confidence = models.FloatField()
    description = models.TextField()
    image = models.ImageField(upload_to='detections/', null=True, blank=True)
    status = models.CharField(max_length=50, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.disease} ({self.created_at})"
