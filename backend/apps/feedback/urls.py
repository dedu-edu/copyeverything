from django.urls import path

from .views import *

urlpatterns = [
    path('', FeedbackAPIView.as_view()),
    path('<int:pk>/', FeedbackAPIView.as_view()),
]
