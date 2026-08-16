from django.contrib import admin
from .models import Detection, Doctor

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'city', 'fee', 'rating', 'is_active')
    list_filter = ('city', 'specialty', 'is_active')
    search_fields = ('name', 'specialty', 'city')

@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'disease', 'confidence', 'status', 'created_at')
    list_filter = ('status', 'disease')
    search_fields = ('user__username', 'disease')
