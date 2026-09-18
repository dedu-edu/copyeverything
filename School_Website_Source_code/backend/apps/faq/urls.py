from django.urls import path

from .views import *

urlpatterns = [
    path('', FAQAPIView.as_view()),
    path('<int:pk>/', FAQAPIView.as_view()),
    path('group/', FAQGroupAPIView.as_view()),
    path('group/<int:pk>/', FAQGroupAPIView.as_view()),
]
