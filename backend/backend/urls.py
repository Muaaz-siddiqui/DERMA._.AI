from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Customizing the Django Admin header/title globally
admin.site.site_header = 'DermaAI Administration'
admin.site.site_title = 'DermaAI Admin Portal'
admin.site.index_title = 'Welcome to DermaAI Administration'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include([
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    path('api/chat/', include('chat.urls')),
    path('api/detection/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
