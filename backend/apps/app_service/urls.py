from django.urls import path

from .views import *

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('check/', CheckApi.as_view()),
    path('auth/token/', AppLoginView.as_view()),      # Нэвтрэх (access + refresh token)
    path('auth/refresh/', TokenRefreshView.as_view()),    # Refresh хийх
]