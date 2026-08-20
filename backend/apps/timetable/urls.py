from django.urls import path

from .views import *

urlpatterns = [
    # Хичээлийн байр
    path('building/', BuildingAPIView.as_view()),
    path('building/<int:pk>/', BuildingAPIView.as_view()),

    # Өрөөний бүртгэл
    path('room/', RoomAPIView.as_view()),
    path('room/list/', RoomListAPIView.as_view()),
    path('room/<int:pk>/', RoomAPIView.as_view()),

    # Цагийн ачааллаас хичээлийн хуваарь авах
    path('resource1/', TimeTableResource1.as_view()),
    path('register-new/', TimeTableNewAPIView.as_view()),

    # Цагийн ачааллаас
    path('register/new/<int:pk>/', TimeTableNewAPIView.as_view()),

    path('print/', TimeTablePrint.as_view()),

    # Цагийн хуваарь үүссэний дараа
    path('register/', TimeTableAPIView.as_view()),
    path('register/<int:pk>/', TimeTableAPIView.as_view()),

    # Цагийн хуваариас event зөөх үед үүссэний дараа
    path('event/<int:pk>/', TimeTableEvent.as_view()),

    # Хичээлийн хуваарь шивэх V1
    # path('register1/', TimeTable1APIView.as_view()),
    path('register1/kurats/', TimeTableKuratsAPIView.as_view()),
    path('resource/', TimeTableResource.as_view()),

    path('file/', TimeTableFile.as_view()),

    # Хичээлийн хуваарийн хайлтын select option авах
    path('resource/select/', TimeTableSelectOption.as_view()),

    path('register/<int:pk>/', TimeTableAPIView.as_view()),

    # Поток хайлт
    path('list/', TimeTablePotok.as_view()),

    # Шалгалтын хуваарь
    path('examtimetable/', ExamTimeTableAPIView.as_view()),
    path('examtimetable/create/', ExamTimeTableCreateAPIView.as_view()),
    path('examtimetable/<int:pk>/', ExamTimeTableAPIView.as_view()),
    path('examtimetable/list/', ExamTimeTableListAPIView.as_view()),
    path('examtimetable/score/<int:pk>/', ExamTimeTableScoreListAPIView.as_view()),
    path('examtimetable/count/', ExamTimeTableCountAPIView.as_view()),
    path('examtimetable/organized-summary/', ExamOrganizedSummaryAPIView.as_view()),

    # Дахин шалгалтын бүртгэл
    path('exam_repeat/', Exam_repeatListAPIView.as_view()),
    path('exam_repeat/<int:pk>/', Exam_repeatListAPIView.as_view()),
    path('exam_repeat/list/', ExamListAPIView.as_view()),
    path('exam_repeat/list_exam/<int:pk>/', Exam_repeatTestListAPIView.as_view()),
    path('exam_repeat/list_exam/students/', ExamrepeatStudentsAPIView.as_view()),
    path('exam_repeat/list_exam/students/<int:pk>/', ExamrepeatStudentsAPIView.as_view()),
    path('exam_repeat/list_exam/one_student/<int:pk>/', ExamrepeatAddStudentAPIView.as_view()),
    path('exam_repeat/score/<int:student>/<int:lesson>/', ExamRepeatStudentScoreListAPIView.as_view()),
    path('exam_repeat/score/<int:pk>/', ExamRepeatTimeTableScoreListAPIView.as_view()),

    # Дэд дүн баталгаажуулалт
    path('confirm_score/', ScoreConfirmAPIView.as_view()),

    # Used in public page: /timetable/lessons_schedule/
	path('lessons-schedule/', LessonsScheduleAPIView.as_view()),
	path('lesson/', TimeTableLessonListApiView.as_view()),
	path('teachers/', TimeTableTeacherListApiView.as_view()),
	path('group/', TimeTableGroupListApiView.as_view()),

    path('register/schedule/', TimeTableScheduleAPIView.as_view()),
    path('register/schedule/<int:pk>/', TimeTableScheduleAPIView.as_view()),

    # Хичээлийн жилийн хичээл орж байгаа багш болон хичээлийн жагсаалт (1)
    path('irts_info/', LessonListIrtsAPIView.as_view()),

    # --- Get үйлдэл -----
    # Тухайн багш дээр тухайн хичээлийн үзэж байгаа бүх ангийн жагсаалт (2)
    path('irts_info/group/', GroupListIrtsAPIView.as_view()),

    # ангийн үзсэн хичээл тус бүрийн оюутны ирцийн мэдээлэл (3)
    path('irts_info/students/<int:group>/', TimetableIrtsAPIView.as_view()),

    path('irts_info/group/report/', GroupListIrtsReportAPIView.as_view()),
    path('irts_info/group/report/week/', GroupListIrtsReportWeekAPIView.as_view()),

    path('irts_info/student/list/',StudentListIrtsAPIView.as_view()),
    path('irts_info/student/detail/<int:student_id>/', StudentDetailIrtsAPIView.as_view()),
    path('irts_info/student/summary/', StudentSummaryIrtsAPIView.as_view()),
    path('irts_info/student/by-state/', StudentByStateIrtsAPIView.as_view()),
    path('irts_info/student/all-summary/', StudentAllSummaryIrtsAPIView.as_view()),
    path('irts_info/online/', OnlineIrtsReportAPIView.as_view()),
    path('irts_info/online/list/', OnlineIrtsListAPIView.as_view()),
    path('irts_info/summary/', AttendanceSummaryAPIView.as_view()),
    path('irts_info/timeline/', AttendanceTimelineAPIView.as_view()),
]
