from django.urls import path

from .views import *

urlpatterns = [
    path('', DigitalJournalAPIView.as_view()),
    path('par/', DigitalJournalParAPIView.as_view()),
    path('department/', DigitalJournalDepartmentAPIView.as_view()),
    path('teacher/', DigitalJournalTeacherAPIView.as_view()),
    path('lesson/', DigitalJournalLessonAPIView.as_view()),
    path('group/', DigitalJournalGroupAPIView.as_view()),
]
