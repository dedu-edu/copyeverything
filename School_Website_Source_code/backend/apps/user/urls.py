from django.urls import path

from .views import AccessHistoryLmsStudentAPI, UserDetailAPI
from .views import UserAPILoginView
from .views import UserAPILogoutView
from .views import UserMenuAPI
# Түр хаасан: нууц үг мартсан
# from .views import UserForgotPasswordAPI
# from .views import UserForgotPasswordConfirmAPI
from .views import UserChangePasswordAPI

urlpatterns = [
    path('login/', UserAPILoginView.as_view()),
    path('logged/', UserAPILoginView.as_view()),
    path('logout/', UserAPILogoutView.as_view()),
    path('access-history/', UserDetailAPI.as_view()),
    path('access-history/student/', AccessHistoryLmsStudentAPI.as_view()),
    path('access-history/student/<int:pk>/', AccessHistoryLmsStudentAPI.as_view()),
    path('menu/', UserMenuAPI.as_view()),
    # Түр хаасан: нууц үг мартсан
    # path('forgot-password/', UserForgotPasswordAPI.as_view()),
    # path('forgot-password-confirm/', UserForgotPasswordConfirmAPI.as_view()),
    path('change-password/', UserChangePasswordAPI.as_view()),
]
