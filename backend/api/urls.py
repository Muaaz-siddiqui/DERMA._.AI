from django.urls import path
from .views import detect_image, register_user, login_user, get_history, get_detection_details, get_doctors

urlpatterns = [
    path('detect/', detect_image, name='detect_image'),
    path('auth/register/', register_user, name='register_user'),
    path('auth/login/', login_user, name='login_user'),
    path('v1/detections/', get_history, name='get_history'),
    path('v1/detections/<int:id>/', get_detection_details, name='get_detection_details'),
    path('v1/doctors/', get_doctors, name='get_doctors'),
]
