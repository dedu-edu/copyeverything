from django.urls import path

from .views import *

urlpatterns = [

    # Цагийн ачаалал тохиргоо
    path('settings/', CreditSettingsAPIView.as_view()),
    path('settings/suborgs', SubOrgOption.as_view()),
    path('settings/<int:pk>/', CreditSettingsAPIView.as_view()),

    path('a_teacher/<int:pk>/', ATeacherAPIView.as_view()),
    path('a_teacher/', ATeacherAPIView.as_view()),

    # б тооцооны нэгтгэл
    path('b_category/', BMainCategoryAPIView.as_view()),
    path('b_category/<int:pk>/', BMainCategoryAPIView.as_view()),
    path('b_category/sub/', BSubCategoryApiView.as_view()),
    path('b_category/sub/<int:pk>/', BSubCategoryApiView.as_view()),
    path('b_main/', MainEstimateAPIView.as_view()),
    path('b_list/', EstimateAPIView.as_view()),
    path('b_list/<int:pk>/', EstimateAPIView.as_view()),
    path('b_teacher/', BTeacherAPIView.as_view()),
    path('b_teacher/<int:pk>/', BTeacherAPIView.as_view()),

    path('w_category/', WMainCategoryAPIView.as_view()),
    path('w_category/<int:pk>/', WMainCategoryAPIView.as_view()),
    path('w_category/sub/', WSubCategoryApiView.as_view()),
    path('w_category/sub/<int:pk>/', WSubCategoryApiView.as_view()),
    path('w_list/', WEstimateAPIView.as_view()),
    path('w_list/<int:pk>/', WEstimateAPIView.as_view()),
    path('w_teacher/', WTeacherAPIView.as_view()),
    path('w_teacher/<int:pk>/', WTeacherAPIView.as_view()),

    path('g_category/', GMainCategoryAPIView.as_view()),
    path('g_category/<int:pk>/', GMainCategoryAPIView.as_view()),
    path('g_category/sub/', GSubCategoryApiView.as_view()),
    path('g_category/sub/<int:pk>/', GSubCategoryApiView.as_view()),
    path('g_list/', GEstimateAPIView.as_view()),
    path('g_list/<int:pk>/', GEstimateAPIView.as_view()),
    path('g_teacher/', GTeacherAPIView.as_view()),
    path('g_teacher/<int:pk>/', GTeacherAPIView.as_view()),

    # path('main_excel/', AExcelAPIView.as_view()),
    path('a_excel/', AExcelAPIView.as_view()),
    path('b_excel/', BExcelAPIView.as_view()),
    path('w_excel/', WExcelAPIView.as_view()),
    path('g_excel/', GExcelAPIView.as_view()),

    # Цагийн тооцоо итгэлцүүр
    path('itgeltsuur/<int:pk>/', ItgeltsuurAPIView.as_view()),
    path('itgeltsuur/', ItgeltsuurAPIView.as_view()),

    # А Цагийн тооцооны нэгтгэл
    path('a_negtgel/', ATootsooAPIView.as_view()),
]