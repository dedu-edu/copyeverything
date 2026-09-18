import os
import openpyxl_dictreader

from datetime import datetime
from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings
from django.db.models import  Count, Q,  Value, CharField, FloatField, DateTimeField, F, Subquery, OuterRef, Case, When, Exists
from django.db.models.functions import Concat, Cast, ExtractYear
from django.contrib.postgres.aggregates import ArrayAgg
from django.utils import timezone

from core.fns import WithChoices

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.decorators import login_required

from main.utils.function.utils import get_lesson_choice_student, has_permission, remove_key_from_dict, get_fullName, get_active_year_season, json_load, calculate_birthday, str2bool
from main.utils.file import save_file, remove_folder
from lms.models import ExamTimeTable, ExamToLevelGroup, ExamToSubGroup, ScoreRegister, SubGroup, GraduationWork
from lms.models import Student
from lms.models import LessonStandart
from lms.models import Score
from lms.models import Exam_repeat
from lms.models import Exam_to_student
from lms.models import Lesson_to_teacher
from lms.models import TeacherScore
from lms.models import Lesson_teacher_scoretype
from lms.models import LearningPlan, Exam_to_group
from lms.models import Season, Group, GradeLetter, Country, AddScoreRegister
from core.models import Employee, Teachers, User

from .serializers import CorrespondSerailizer, TeacherScoreListPrintSerializer, TeacherScoreSerializer
from .serializers import CorrespondListSerailizer
from .serializers import ScoreRegisterSerializer
from .serializers import ReScoreSerializer
from .serializers import ReScoreListSerializer
from .serializers import ScoreRegisterListSerializer
from .serializers import ScoreRegisterPrintSerializer
from .serializers import AddScoreRegisterSerializer
from .serializers import AddScoreRegisterPostSerializer


from apps.student.serializers import StudentListSerializer
from main.utils.function.pagination import CustomPagination
from rest_framework.filters import SearchFilter
from django.db.models import Count
from django.db.models import Sum

@permission_classes([IsAuthenticated])
class ScoreRegisterAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ дүн crud """

    queryset = ScoreRegister.objects.all()
    serializer_class = ScoreRegisterSerializer

    @has_permission(must_permissions=['lms-score-register-create'])
    def post(self, request):
        " дүн шинээр үүсгэх "

        data = request.data
        student = data.get("student")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        school = data.get("school")
        lesson = data.get("lesson")

        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")
        total_score = 0
        add_score = 0
        add_score_obj = {}

        # нэмэлт оноо
        add_score_obj = AddScoreRegister.objects.filter(student=student, lesson_year=lesson_year, lesson_season_id=lesson_season, lesson=lesson).first()
        if add_score_obj:
            add_score = add_score_obj.add_score
            data['add_score'] = add_score

        if teach_score:
            total_score = float(teach_score)

        if exam_score:
            total_score = total_score + float(exam_score)

        if add_score:
            total_score = total_score + float(add_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessment = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessment:
                request.data['assessment'] = assessment['id']

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.create(request)
                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

                return request.send_info("INF_001")
        else:
            errors = []
            if student:
                score_info = self.queryset.filter(student=student,lesson_year=lesson_year,lesson_season=lesson_season,school=school,lesson=lesson)
                if score_info:
                    return_error = {
                        "field": "student",
                        "msg": "Тухайн оюутны дүн бүртгэгдсэн байна"
                    }
                    errors.append(return_error)
                    return request.send_error("ERR_003", errors)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }
                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-score-register-update'])
    def put(self, request, pk=None):
        ''' дүн засах
            pk: Оюутны ID
        '''

        total_score = 0
        data = request.data

        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        lesson = data.get("lesson")

        instance = self.queryset.filter(student=pk, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season).first()
        add_score = instance.add_score or 0

        if teach_score:
            total_score = float(teach_score)

        if exam_score:
            total_score = total_score + float(exam_score)

        total_score += add_score

        if total_score > 100:
            return request.send_error("ERR_002", "0-100 хооронд утга оруулна уу")

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()
            if assessment:
                request.data['assessment'] = assessment.id

        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                   self.perform_update(serializer)
                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

                return request.send_info("INF_002", assessment.get('assesment'))
        else:
            errors = []

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": serializer.errors[msg]
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-score-register-delete'])
    def delete(self, request, pk=None):
        ''' Хичээлийн дүн устгах '''

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ScoreRegisterDeleteAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ дүн crud """

    queryset = ScoreRegister.objects.all()

    # Баталгаажсан дүн буцаах
    def post(self, request):

        data = request.data

        lesson_year, lesson_season = get_active_year_season()

        teacher = data.get('teacher_id')
        lesson = data.get('lesson_id')
        group = data.get('group_id')

        if not lesson:
            return request.send_error("ERR_001", "Хоосон сонголт")

        # # Багш хичээл холболт
        # lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()

        # # Багшийн дүнгийн задаргааны төрлүүд
        # score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher).values_list('id', flat=True)

        # # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
        # teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids)

        teacher_score_qs = TeacherScore.objects.filter(
            lesson_year=lesson_year, lesson_season=lesson_season,
            score_type__lesson_teacher__lesson=lesson,
            score_type__score_type__in=[Lesson_teacher_scoretype.BUSAD, Lesson_teacher_scoretype.SHALGALT_ONOO],
        )

        # Анги байвал тухайн ангийн оюутны дүнг татна.
        if group:
            teacher_score_qs = teacher_score_qs.filter(student__group=group)

        # Баталгаажсан төлвийг болиулна
        if teacher_score_qs.exists():
            students = list(teacher_score_qs.values_list("student", flat=True))
            student_score_qs = ScoreRegister.objects.filter(
                lesson_year=lesson_year,
                lesson_season=lesson_season,
                lesson=lesson,
                status=ScoreRegister.TEACHER_WEB,
                student__group=group,
                student__in=students
            )

            # Татагдсан дүнг устгана
            if student_score_qs.exists():
                student_score_qs.delete()

            teacher_score_qs.update(
                is_approved=False,
                approved_date=None,
            )

        return request.send_info("INF_026")


class ScoreRegisterStudentView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Student.objects
    serializer_class = StudentListSerializer

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name', 'last_name']

    def get(self,request):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school_id = self.request.query_params.get('school')
        lesson = self.request.query_params.get('lesson')
        group = self.request.query_params.get('group')
        teacher = self.request.query_params.get('teacher')

        all_student = get_lesson_choice_student(lesson, teacher, school_id, lesson_year, lesson_season, group)

        score_queryset =  ScoreRegister.objects.all()
        if school_id:
            score_queryset = score_queryset.filter(school=school_id)

        score_list = score_queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson, teacher=teacher)

        score_list_ids = score_list.values_list('student', flat=True)

        self.queryset = self.queryset.filter(id__in=all_student).exclude(id__in=score_list_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class CorrespondAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Дүйцүүлсэн дүн crud """

    queryset = ScoreRegister.objects
    serializer_class = CorrespondSerailizer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code','student__last_name','student__first_name', 'lesson__name', 'lesson__code', 'teach_score', 'exam_score', 'assessment__assesment']

    def get_queryset(self):
        queryset = self.queryset.filter(status=ScoreRegister.CORRESPOND)
        school = self.request.query_params.get('school')
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        sorting = self.request.query_params.get('sorting')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school=school)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season_id=lesson_season)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-score-correspond-read'])
    def get(self, request, pk=None):
        " Дүйцүүлсэн дүн жагсаалт "

        self.serializer_class = CorrespondListSerailizer
        if pk:
            correspond_info = self.retrieve(request, pk).data
            return request.send_data(correspond_info)

        correspond_list = self.list(request).data
        return request.send_data(correspond_list)

    @has_permission(must_permissions=['lms-score-correspond-create'])
    @transaction.atomic
    def post(self, request):
        " Дүйцүүлсэн дүн шинээр үүсгэх "

        sid = transaction.savepoint()

        data = request.data
        student = data.get("student")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        school = data.get("school")
        lesson = data.get("lesson")
        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        total_score = 0
        if teach_score:
            total_score = float(teach_score)
        if exam_score:
            total_score = total_score + float(exam_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessments = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessments:
                request.data['assessment'] = assessments['id']

        if student:
            score_info = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season, school=school, lesson=lesson)
            if score_info:
                return request.send_error("ERR_002", 'Оюутан дээр тухайн хичээлийн дүн бүртгэлтэй байна')

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-score-correspond-update'])
    def put(self, request, pk=None):
        "Дүйцүүлсэн дүн засах"

        data = request.data
        student = data.get("student")
        data = request.data
        assessment = data.get("assessment")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        school = data.get("school")
        lesson = data.get("lesson")
        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        total_score = 0
        if teach_score:
            total_score = float(teach_score)
        if exam_score:
            total_score = total_score + float(exam_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessments = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessments:
                request.data['assessment'] = assessments['id']

        instance = self.get_object()

        score_info = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season, school=school, lesson=lesson).exclude(id=pk)
        if score_info:
            return request.send_error("ERR_002", 'Оюутан дээр тухайн хичээлийн дүн бүртгэлтэй байна')

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.update(request).data

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-score-correspond-delete'])
    def delete(self, request, pk=None):
        " Дүйцүүлсэн дүн устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ReScoreAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):

    """ Дахин шалгалтын дүн crud """

    queryset = Exam_repeat.objects
    serializer_class = ReScoreSerializer

    filter_backends = [SearchFilter]
    search_fields = ['student__code','student__last_name','student__first_name']

    def get_queryset(self):
        queryset = self.queryset.filter(status__in=[1,2,3])
        school = self.request.query_params.get('school')
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        status = self.request.query_params.get('status')
        lesson = self.request.query_params.get('lesson')
        sorting = self.request.query_params.get('sorting')

       # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school=school)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season_id=lesson_season)

        # Шалгалтын төлөвөөр хайлт хийх
        if status:
            queryset = queryset.filter(status=status)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        if status:
            score_status = int(status) + 4
            if score_status and lesson:
                student_ids = ScoreRegister.objects.filter(lesson=lesson, status=score_status,is_delete=False).values_list('student', flat=True)
                queryset = queryset.filter(student__in=student_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-score-restudy-read'])
    def get(self, request, pk=None):
        " Дахин шалгалтын дүн жагсаалт "

        self.serializer_class = ReScoreListSerializer

        if pk:
            rescore_info = self.retrieve(request, pk).data
            return request.send_data(rescore_info)

        rescore_list = self.list(request).data
        return request.send_data(rescore_list)

    @has_permission(must_permissions=['lms-score-restudy-create'])
    def post(self, request):
        " Дахин шалгалтын дүн үүсгэх "

        self.queryset = ScoreRegister.objects.all()
        data = request.data
        teach_score = data.get('teach_score')
        exam_score = data.get('exam_score')
        lesson = data.get('lesson')
        student = data.get('student')
        status = data.get('status')
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        school = data.get('school')
        instance = self.queryset.filter().first()
        serializer = self.get_serializer(instance, data=data)

        if status != 6: #Шууд тооцохоос бусад үед өмнө нь дүнтэй эсэхийг шалгана
            before_score = ScoreRegister.objects.filter(lesson=lesson, student=student).exclude(lesson_year=lesson_year, lesson_season=lesson_season)
            if not before_score:
                return request.send_error("ERR_003", 'Энэ хичээлийг өмнө судлаагүй тул дүн оруулах боломжгүй')
        now_score = ScoreRegister.objects.filter(lesson=lesson, student=student, lesson_year=lesson_year, lesson_season=lesson_season)
        if now_score:
            return request.send_error("ERR_003", 'Энэ улиралд дүн бүртгэгдсэн байна.')

        delete_score = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=True)
        if delete_score:
            delete_score.delete()

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    result = ScoreRegister.objects.create(
                        teach_score = teach_score,
                        exam_score = exam_score,
                        teacher = None,
                        lesson_id = lesson,
                        student_id = student,
                        lesson_year = lesson_year,
                        lesson_season_id = lesson_season,
                        school_id = school,
                        status = status,
                    )

                    result1 = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=False).exclude(lesson_year=lesson_year, lesson_season=lesson_season).update(
                        is_delete = True
                    )

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-score-restudy-update'])
    def put(self, request, pk=None):
        " Дахин шалгалтын дүн засах "

        self.queryset = ScoreRegister.objects.all()
        data = request.data
        teach_score = data.get('teach_score')
        exam_score = data.get('exam_score')
        lesson = data.get('lesson')
        student = data.get('student')
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    result = ScoreRegister.objects.filter(id=pk).update(
                        teach_score = teach_score,
                        exam_score = exam_score,
                        teacher = None
                    )

                    result1 = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=False).exclude(lesson_year=lesson_year, lesson_season=lesson_season).update(
                        is_delete = True
                    )

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

@permission_classes([IsAuthenticated])
class ReScoreStudentView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Student.objects
    serializer_class = StudentListSerializer

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name', 'last_name']

    def get(self,request):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school_id = self.request.query_params.get('school')
        lesson = self.request.query_params.get('lesson')
        status = self.request.query_params.get('status')

        qs_choice = Exam_repeat.objects.all()
        qs_score = ScoreRegister.objects.all().filter(status__in=[5,6,7])

        if lesson_year:
            qs_choice = qs_choice.filter(lesson_year=lesson_year)
            qs_score = qs_score.filter(lesson_year=lesson_year)
        if lesson_season:
            qs_choice = qs_choice.filter(lesson_season=lesson_season)
            qs_score = qs_score.filter(lesson_season=lesson_season)
        if school_id:
            qs_choice = qs_choice.filter(school=school_id)
            qs_score = qs_score.filter(school=school_id)
        if lesson:
            qs_choice = qs_choice.filter(lesson=lesson)
            qs_score = qs_score.filter(lesson=lesson)
        if status:
            qs_choice = qs_choice.filter(status=status)
            score_status = int(status) + 4
            if score_status:
                qs_score = qs_score.filter(status=score_status)
        choice_list_ids = qs_choice.values_list('student', flat=True)

        score_list_ids = qs_score.values_list('student', flat=True)

        self.queryset = self.queryset.filter(id__in=choice_list_ids).exclude(id__in=score_list_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class ScoreRegisterListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ дүн crud """

    queryset = ScoreRegister.objects.all().exclude(status=ScoreRegister.CORRESPOND).order_by('-teach_score', '-exam_score')

    serializer_class = ScoreRegisterListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'student__last_name']

    @has_permission(must_permissions=['lms-score-register-read'])
    def get(self, request, pk=None):
        " дүн жагсаалт "

        teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')
        group = request.query_params.get('group')

        have_teach_score = False

        lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        if teacher:
            self.queryset = self.queryset.filter(teacher=teacher)

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)

        if group:
            self.queryset = self.queryset.filter(student__group=group)

        all_list = self.list(request).data

        if teacher:
            # Багш хичээл холболт
            lesson_teacher_qs = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher)

            # Багшийн дүнгийн задаргааны төрлүүд
            score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher__in=lesson_teacher_qs).values_list('id', flat=True)

            have_teach_score = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids).exists()

        return_datas = {
            'datas': all_list,
            'have_teach_score': have_teach_score
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class ScoreTeacherDownloadAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Багшийн дүн нэгтгэж татах хэсэг """

    queryset = ScoreRegister.objects.all().exclude(status=ScoreRegister.CORRESPOND)
    serializer_class = ScoreRegisterListSerializer

    def get(self, request):

        all_students_teach_scores = []
        have_score_students = []

        student_queryset = Student.objects.all()

        teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')
        group = request.query_params.get('group')
        school_id = self.request.query_params.get('school')

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not teacher and not lesson:
            return request.send_data([])

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        # Багш хичээл холболт
        lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).last()

        # Багшийн дүнгийн задаргааны төрлүүд
        score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher).values_list('id', flat=True)

        # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
        teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids)

        # Анги байвал тухайн ангийн оюутны дүнг татна.
        if group:
            teach_score_qs = teach_score_qs.filter(student__group=group)

        # Дүнтэй оюутнууд
        teacher_score_students = teach_score_qs.values_list('student', flat=True).distinct('student')

        # Оюутны дүн нэгтэх
        for student_id in teacher_score_students:
            obj = {}

            #  NOTE: Оюутны хувьд нэг хичээл дээр тухайн жилд нэг л дүн байх ёстой
            total_score = teach_score_qs.filter(student=student_id).exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')
            exam_score = teach_score_qs.filter(student=student_id).filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')
            add_score_qs = AddScoreRegister.objects.filter(student=student_id, lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson).first()
            add_score = add_score_qs.add_score if add_score_qs else 0

            obj['student'] = student_id
            obj['add_score'] = add_score
            obj['teach_score'] = total_score
            obj['exam_score'] = exam_score

            all_students_teach_scores.append(obj)

        # Тухайн хуваарь дээр хичээл үзэж байгаа бүх оюутнууд
        # all_student = get_lesson_choice_student(lesson, teacher, school_id, lesson_year, lesson_season, group)
        # if all_student:
        #     student_queryset = student_queryset.filter(id__in=all_student)
        # else:
        student_queryset = student_queryset.filter(id__in=teacher_score_students)

        # Хичээлийн хуваарьтай бүх оюутнууд
        all_timetable_student_ids = student_queryset.values_list('id', flat=True)

        with transaction.atomic():

            # Багшийн дүн оруулсан оюутны дүнг үүсгэнэ
            create_score_students = []
            update_score_students = []
            for student_teach_score in all_students_teach_scores:
                student_id = student_teach_score.get('student')
                student_teacher_score = student_teach_score.get('teach_score') or 0
                student_exam_score = student_teach_score.get('exam_score') or 0
                student_add_score = student_teach_score.get('add_score') or 0

                have_score_students.append(student_id)

                # Өмнө нь дүн орсон эсэхийг шалгах
                student_score_have = ScoreRegister.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, student=student_id, lesson=lesson).first()

                # Үсгэн үнэлгээ
                student_score_total = student_teacher_score + student_exam_score + student_add_score
                student_score_total = round(student_score_total, 2)
                assessment = Score.objects.filter(score_max__gte=student_score_total, score_min__lte=student_score_total).first()

                student = Student.objects.filter(id=student_id).first()

                # Өмнө нь дүн орчихсон байвал update хийнэ
                if student_score_have:
                    grade_letter = None
                    if round(student_exam_score) < 18:
                        grade_letter = GradeLetter.objects.filter(letter='W').values_list('id', flat=True).first()

                    student_score_have.teach_score = student_teacher_score
                    student_score_have.add_score = student_add_score
                    student_score_have.exam_score = student_exam_score
                    student_score_have.assessment = assessment
                    student_score_have.lesson_year = lesson_year
                    student_score_have.lesson_season = Season.objects.get(id=lesson_season)
                    student_score_have.status = ScoreRegister.TEACHER_WEB
                    student_score_have.grade_letter = grade_letter
                    update_score_students.append(student_score_have)
                else:
                    create_score_students.append(
                        ScoreRegister(
                            lesson_year=lesson_year,
                            lesson_season=Season.objects.get(id=lesson_season),
                            lesson_id=lesson,
                            student_id=student_id,
                            add_score=student_add_score,
                            teach_score=student_teacher_score if student_teacher_score else 0,
                            exam_score=student_exam_score if student_exam_score else 0,
                            teacher_id=teacher,
                            assessment=assessment or None,
                            status=ScoreRegister.TEACHER_WEB,
                            school=student.school if student else None
                        )
                    )
            ScoreRegister.objects.bulk_create(create_score_students)
            ScoreRegister.objects.bulk_update(update_score_students, ['teach_score', 'exam_score', 'status', 'add_score', 'assessment', 'lesson_year', 'lesson_season', 'grade_letter'])

            # Дүнгүй оюутнууд
            not_score_students = list(set(all_timetable_student_ids) - set(have_score_students))

            # Багшаас дүн аваагүй ч хуваарьт байгаа оюутнуудыг create хийх
            if not_score_students:
                create_students = []
                update_students = []
                for student_id in not_score_students:
                    student_score_total = 0
                    student_teacher_score = student_teach_score.get('teach_score') or 0
                    student_exam_score = student_teach_score.get('exam_score') or 0
                    student_add_score = student_teach_score.get('add_score') or 0
                    student_not_score = ScoreRegister.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, student=student_id, lesson=lesson).first()
                    student = Student.objects.filter(id=student_id).first()

                    # Үсгэн үнэлгээ
                    student_score_total = student_teacher_score + student_exam_score + student_add_score
                    student_score_total = round(student_score_total, 2)
                    assessment = Score.objects.filter(score_max__gte=student_score_total, score_min__lte=student_score_total).first()

                    # Өмнө нь дүн орчихсон байвал update хийнэ
                    if student_not_score:
                        student_not_score.teach_score = student_teacher_score
                        student_not_score.exam_score = student_exam_score
                        student_not_score.add_score = student_add_score
                        student_not_score.assessment = assessment
                        student_not_score.lesson_year = lesson_year
                        student_not_score.lesson_season = Season.objects.get(id=lesson_season)
                        student_not_score.status = ScoreRegister.TEACHER_WEB
                        update_students.append(student_not_score)
                    else:
                        create_students.append(
                            ScoreRegister(
                                lesson_year=lesson_year,
                                lesson_season=Season.objects.get(id=lesson_season),
                                lesson_id=lesson,
                                add_score=student_add_score,
                                student_id=student_id,
                                teach_score=student_teacher_score,
                                exam_score=student_exam_score,
                                teacher_id=teacher,
                                assessment_id=assessment if assessment else None,
                                status=ScoreRegister.TEACHER_WEB,
                                school=student.school if student else None
                            )
                        )

                ScoreRegister.objects.bulk_create(create_students)
                ScoreRegister.objects.bulk_update(update_students, ['teach_score', 'exam_score', 'status', 'assessment', 'lesson_year', 'lesson_season', 'add_score'])

        self.queryset = self.queryset.filter(student__in=student_queryset, lesson=lesson)

        all_list = self.list(request).data

        return request.send_data(all_list)


class ScoreOldAPIView(
    generics.GenericAPIView
):
    """ Оюутан бүрийн хуучин дүн оруулах """

    #  Хичээлийн жил улирал оруулах
    def post(self, request):

        data = request.data.dict()
        assessment = None

        not_found_lesson = []
        not_found_student = []
        all_create_datas = []

        file = data.get('file')

        file_name = file.name

        # Файл түр хадгалах
        path = save_file(file, 'score_sheet', 1)

        full_path = os.path.join(settings.MEDIA_ROOT, str(path))

        # try:
        reader = openpyxl_dictreader.DictReader(full_path)
        for row in reader:
            season = None
            lesson_year = None

            student_code = row.get('Оюутны код')
            student_full_name = row.get('Оюутны нэр')

            if not student_code or not student_full_name:
                continue

            splitted_name = student_full_name.split('.')
            first_name = splitted_name[0]
            last_name = splitted_name[-1]

            student = Student.objects.filter(code__iexact=student_code).first()

            # Оюутны код таарахгүй байхгүй үед
            if not student:
                obj = {}
                obj['student_code'] = student_code
                obj['student_name'] = student_full_name

                not_found_student.append(obj)
                continue

            group_obj = Group.objects.get(id=student.group.id)

            # Ангийн элссэн хичээлийн жил
            student_group_year = group_obj.join_year

            # Мэргэжил
            student_profession = group_obj.profession
            lessons = LearningPlan.objects.filter(profession=student_profession).annotate(full_name=Concat("lesson__code", Value("-"), "lesson__name", output_field=CharField())).values('lesson__id', 'full_name').order_by('lesson_level', 'lesson__name')

            for lesson in list(lessons):
                score = row.get('{}'.format(lesson.get('full_name')))

                if not score:
                    obj = {}
                    obj['student_code'] = student_code
                    obj['lesson_code'] = lesson.get('full_name')
                    obj['lesson_name'] = lesson.get('full_name')
                    obj['exam_score'] = score

                    not_found_lesson.append(obj)
                    continue

                splitted_list = student_group_year.split('-')

                start_year = int(splitted_list[0]) # Анги эхэлсэн жил
                end_year = int(splitted_list[1]) # Анги дууссан жил

                lesson = LessonStandart.objects.get(id=lesson.get('lesson__id'))

                # Cургалтын төлөвлөгөөнөөс мэргэжил хичээлээр хайж хичээл үзэх улирлыг авна
                learningplan = LearningPlan.objects.filter(profession=student_profession, lesson=lesson.id).first()
                learningplan_season = json_load(learningplan.season)

                if isinstance(learningplan_season, list) and len(learningplan_season) > 0:
                    learningplan_season = learningplan_season[0]

                    # Улирал тэгш сондгой эсэхийг шалгах
                    if int(learningplan_season) % 2 == 0:
                        year_count = int(learningplan_season) / 2
                        cyear_count = int(year_count - 1)

                        qs_season = Season.objects.filter(season_name='Хавар').first()
                        season = qs_season.id
                    else:
                        year_count = (int(learningplan_season) + 1) / 2
                        cyear_count = int(year_count - 1)

                        qs_season = Season.objects.filter(season_name='Намар').first()
                        season = qs_season.id

                    score_start_year = str(start_year + cyear_count)
                    score_end_year = str(end_year + cyear_count)

                    lesson_year = score_start_year + '-' + score_end_year

                grade_letter = None

                # Тооцов дүн оруулах хэсэг S үнэлгээ нь тооцов
                if isinstance(score, str) and (score == 'S' or score == 's'):
                    grade_letter = GradeLetter.objects.filter(letter__iexact=score).first()
                elif isinstance(score, str) and (score != 'S' and score != 's'):
                    return request.send_error("ERR_002", "Үсгэн үнэлгээ оруулах бол зөвхөн S үнэлгээ оруулна уу. Үгүй бол тохирох дүнгийн оноог оруулна уу.")
                elif score:
                    score  = float(score)
                    score = round(score, 2)
                    assessment = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()

                exam_score = None
                if isinstance(score, int) or isinstance(score, float):
                    exam_score = round(score, 2)

                # Үсгэн үнэлгээ орж ирвэл
                if isinstance(score, str):
                    exam_score = score

                create_datas = {
                    'student_id': student.id,
                    'student_code': student.code,
                    'lesson_id': lesson.id,
                    'lesson_name': lesson.name,
                    'lesson_code': lesson.code,
                    "exam_score": exam_score,
                    'assessment_id': assessment.id if assessment else None,
                    'grade_letter_id': grade_letter.id if grade_letter else None,
                    'status': ScoreRegister.START_SYSTEM_SCORE,
                    'school_id': student.school.id if student.school else None,
                    'lesson_year': lesson_year,
                    'lesson_season_id': season
                }

                all_create_datas.append(create_datas)

            # Хадгалж дууссаны дараа файлаа устгах
            remove_folder(path)

        # except Exception as e:
            # print(e)
            # Алдаа гарвал файлаа устгах
            # remove_folder(path)

        all_error_datas = not_found_lesson + not_found_student

        return_datas = {
            'create_datas': all_create_datas,
            'not_found_lesson': not_found_lesson,
            'not_found_student': not_found_student,
            'all_error_datas': all_error_datas,
            'file_name': file_name
        }

        return request.send_data(return_datas)

    def put(self, request, pk=None):
        """ Хуучин дүн тулгах """

        datas = request.data
        user = request.user
        not_score = datas.get('not_score')
        now = datetime.now()

        if 'not_score' in datas:
            del datas['not_score']

        datas['updated_user'] = user
        datas['updated_at'] = now

        score_obj = ScoreRegister.objects.get(pk=pk)

        # Дүн засахад үсгэн үнэлгээ өөрчлөх
        with transaction.atomic():
            ScoreRegister.objects.filter(pk=pk).update(
                **datas
            )

            if not not_score:
                score_obj = ScoreRegister.objects.get(pk=pk)
                score = round(score_obj.score_total, 2)

                assessment = Score.objects.filter(score_max__gte=score,score_min__lt=score).first()
                score_obj.assessment = assessment
                score_obj.updated_user = request.user
                score_obj.save()

        return request.send_info('INF_002')


class ScoreImportAPIView(
    generics.GenericAPIView
):
    """ Хуучин дүн import хийх """

    def post(self, request):

        datas = request.data
        user = request.user

        with transaction.atomic():
            try:
                # Бүх датагаа хадгалах
                for create_data in datas:
                    student = create_data.get('student_id')
                    lesson_id = create_data.get('lesson_id')
                    score = create_data.get('exam_score')
                    score = create_data.get('exam_score')

                    if isinstance(score, int) or isinstance(score, float):
                        create_data['exam_score'] = float(score)

                    else:
                        create_data['exam_score'] = 0

                    create_data = remove_key_from_dict(create_data, ['student_code', 'lesson_code', 'lesson_name'])

                    # Тухайн хичээл дүнтэй байвал
                    score_obj = ScoreRegister.objects.filter(student=student, lesson=lesson_id).first()
                    if score_obj:
                        # Үсгэн үнэлгээ хадгалах үед S, CR гээд тооцов
                        if isinstance(score, str) and create_data.get('grade_letter_id'):
                            score_obj.exam_score = 0
                            score_obj.teach_score = 0
                            score_obj.grade_letter = GradeLetter.objects.get(pk=create_data.get('grade_letter_id'))
                            score_obj.assessment = None
                        else:
                            teach_score =  score_obj.teach_score if score_obj.teach_score else 0
                            total_score = teach_score + float(score)

                            # Дүн засахад үсгэн үнэлгээ өөрчлөх
                            total_score = round(total_score, 2)
                            assessment = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).first()
                            score_obj.exam_score = float(score)
                            score_obj.assessment = assessment
                            score_obj.updated_user = User.objects.get(id=user.id)

                            if create_data.get('lesson_year'):
                                score_obj.lesson_year = create_data.get('lesson_year')

                            if create_data.get('lesson_season_id'):
                                score_obj.lesson_season__id = create_data.get('lesson_season_id')

                        score_obj.save()
                    else:
                        # Үсгэн үнэлгээ хадгалах үед
                        if isinstance(score, str) and create_data.get('grade_letter_id'):
                            create_data['exam_score'] = 0

                        create_data['created_user'] = User.objects.get(id=user.id)
                        ScoreRegister.objects.create(**create_data)

            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_013')


class ScoreRegisterPrintAPIView(
    generics.GenericAPIView,
):
    """ Дүн хэвлэх """

    queryset = ScoreRegister.objects.all().order_by("-lesson_year")
    serializer_class = ScoreRegisterPrintSerializer

    def get(self, request, student=None):
        """ Дүнгийн тодорхойлолт (ганц оюутны хувьд) """

        # жил улиралаар хайх
        lesson_year = self.request.query_params.get('year')
        lesson_season = self.request.query_params.get('season')

        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            self.queryset = self.queryset.filter(lesson_season=lesson_season)

        all_data = []
        score_info = {}
        lessons_qs = {}
        asses_qs = {}
        total = []

        lesson_counts = []
        lesson_code_count = []

        # үсгэн дүн тоолох нь
        asses_qs = (self.queryset.filter(student_id=student, is_delete=False).values('assessment__assesment')
            .annotate(asses_count=Count('assessment__assesment')).order_by('assessment__assesment'))

        # тухайн жил, улирал болгоны үзсэн хичээлүүдыг тоолох нь
        lessons_qs = (self.queryset.filter(student_id=student, is_delete=False ).values("lesson_year", "lesson_season__season_name")
            .annotate(less_count=Count('lesson')).order_by("lesson_season__season_name")).order_by("lesson_year")

        if asses_qs and lessons_qs:
            lesson_code_count = list(asses_qs)
            lesson_counts = list(lessons_qs)

        # тухайн оюутны мэдээлэл дүнгийн мэдээлэл
        score_qs = self.queryset.filter(student_id=student).order_by("lesson_year", "lesson_season")

        # to get graduation lesson year and season
        profession_id, join_year, duration, level = Student.objects.filter(id=student).values_list('group__profession', 'group__join_year', 'group__profession__duration', 'group__level').first()
        graduate_year_by_lesson = {}
        study_end_lesson_season_obj = None

        if profession_id and join_year and (duration or level):
            graduate_year_by_lesson = dict(GraduationWork.objects.filter(student=student).annotate(grad_year=ExtractYear('decision_date')).values_list('lesson', 'grad_year').order_by('-id'))

            if graduate_year_by_lesson:
                study_end_lesson_season_obj = Season.objects.filter(season_name__iexact='Хавар').last()

        for qs in score_qs:
            year = ''

            # to set graduation lesson year and season if default fields are empty
            if (not qs.lesson_year or not qs.lesson_season) and qs.lesson_id in graduate_year_by_lesson:
                study_end_lesson_year = graduate_year_by_lesson.get(qs.lesson_id)

                if not qs.lesson_year and study_end_lesson_year:
                    qs.lesson_year = f"{study_end_lesson_year - 1}-{study_end_lesson_year}"

                if not qs.lesson_season:
                    qs.lesson_season = study_end_lesson_season_obj

            # жил улирал
            if qs.lesson_year and qs.lesson_season:
                year = qs.lesson_year + " " + qs.lesson_season.season_name

            if year not in score_info:
                score_info[year] = []

            score_info[year].append(qs)

        # Бүх year total
        total_kr_count = 0
        total_skr_count = 0
        total_onoo_count = 0
        total_gpa_scores = 0
        total_gpa_count = 0
        total_onoo_avg = 0
        niit_gpa = 0

        degree_name = ''
        student_code = ''
        proffession = ''
        join_year = ''
        full_names = ''

        for key in score_info.keys():
            list_info = []

            # total
            onoo = 0
            total_kr = 0
            total_gpa = 0

            # суралцсан жил,улирал болгоны дүнгүүд
            for eachScore in score_info[key]:
                assessments = None
                status_num = None
                gpa = 0

                total_scores = eachScore.score_total
                status_num = eachScore.status

                # exam + teach
                total_scores = round(total_scores, 2)
                assessment = Score.objects.filter(score_max__gte=total_scores, score_min__lte=total_scores).first()
                if assessment:
                    assessments = assessment.assesment
                    gpa = assessment.gpa

                # оюутны мэдээлэл
                student_code = eachScore.student.code
                proffession = eachScore.student.group.profession.name
                join_year = eachScore.student.group.join_year
                degree_name = eachScore.student.group.degree.degree_name
                full_names = get_fullName(eachScore.student.last_name + " овогтой " + eachScore.student.first_name, False, True )

                # хичээлүүд
                list_info.append({
                    "lesson_year":eachScore.lesson_year if eachScore.lesson_year else '',
                    "lesson_season":eachScore.lesson_season.season_name if eachScore.lesson_season else '',
                    "lesson_code":eachScore.lesson.code if eachScore.lesson.code else '',
                    "lesson_name":eachScore.lesson.name if eachScore.lesson.name else '',
                    "lesson_kr":eachScore.lesson.kredit if eachScore.lesson.kredit else 0,
                    "exam_score":eachScore.exam_score if eachScore.exam_score is not None else '',
                    "teach_score":eachScore.teach_score if eachScore.teach_score is not None else '',
                    "add_score":eachScore.add_score if eachScore.add_score is not None else '',
                    "total_scores":total_scores if total_scores else 0,
                    "assessment":assessments if assessments else '',
                    "status_num":status_num if status_num else 0,
                    "gpa": gpa,
                    'grade_letter': eachScore.grade_letter.letter if eachScore.grade_letter else ''
                })

                total_kr = total_kr + (eachScore.lesson.kredit if eachScore.lesson.kredit else 0)

                if eachScore.grade_letter and eachScore.grade_letter.letter == 'S':
                    total_skr_count = total_skr_count + eachScore.lesson.kredit
                else:
                    onoo = onoo + total_scores * eachScore.lesson.kredit
                    total_gpa_scores = total_gpa_scores + (gpa * eachScore.lesson.kredit)

            total_onoo = 0
            # дундаж олох нь
            if onoo != 0:
                total_onoo = round(onoo / total_kr, 2)
                total_gpa = round(total_gpa_scores / total_kr, 2)

            # нийт kr
            total_kr_count = total_kr_count + total_kr
            total_onoo_count = total_onoo_count + onoo

            # жил,улирал болгоны kr and lesson жагсаалт
            year_splitted = key.split(' ')
            all_data.append(
                {
                    "year": year_splitted[0] if len(year_splitted) > 0 else '',
                    "season": year_splitted[-1] if len(year_splitted) > 0 else '',
                    "total":{
                        "kr":total_kr,
                        "onoo":total_onoo,
                        "gpa":total_gpa,
                    },
                    "lesson_info":list_info,

                }
            )

        # ------------ Бүх жилийн total -----------
        if (total_kr_count and total_onoo_count) > 0:

            # дундаж олох нь
            total_onoo_avg = round(total_onoo_count / total_kr_count, 2)

        estimate_count = total_kr_count - total_skr_count
        if total_gpa_scores != 0.0:
            niit_gpa = round((total_gpa_scores / estimate_count), 2)

        total.append({
            "all_total":
            {
                "total_kr": total_kr_count if total_kr_count else "",
                "total_onoo": total_onoo_avg,
                "total_gpa":niit_gpa,
            },
            "student_info":
            {
                "full_name": full_names if full_names else "",
                "code": student_code if student_code else "",
                "proffession": proffession if proffession else "",
                "join_year": join_year if join_year else "",
                "degree_name":degree_name if degree_name else "",
            },
        })
        data = {
            "scoreregister":all_data,
            "asses_count":lesson_code_count,
            "lesson_count":lesson_counts,
            "all_total":total,
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class TeacherScoreAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Явцын оноо """

    queryset = TeacherScore.objects
    serializer_class = TeacherScoreSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__register_num', 'student__first_name']

    @login_required()
    def put(self, request):
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)
        school_id = self.request.query_params.get('school')
        data = request.data
        groups = data.get('groups')
        teachers = data.get('teachers')

        if school_id:
            self.queryset = self.queryset.filter(
                Q(student__group__profession__department__isnull=False, student__group__profession__department__sub_orgs=school_id) |
                Q(student__group__profession__department__isnull=True, student__group__profession__school=school_id)
            )

        lesson = self.request.query_params.get('lesson')

        if lesson:
            self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=lesson)

        if teachers:
            self.queryset = self.queryset.filter(score_type__lesson_teacher__teacher__in=teachers)

        if groups:
            self.queryset = self.queryset.filter(student__group__in=groups)

        is_fall = self.request.query_params.get('isFall')

        if is_fall == 'true':
            self.queryset = self.queryset.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__lt=18)
        elif is_fall == 'false':
            self.queryset = self.queryset.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__gte=18)

        # to select fields to display
        self.queryset = self.queryset.annotate(
            student_code=F('student__code'),
            group_name=F('student__group__name'),
        )

        sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class TeacherScoreReportSchoolAPIView(
    generics.GenericAPIView
):
    """ Явцын дүн тайлан """

    @has_permission(must_permissions=['lms-score-read'])
    def get(self, request):
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        # to generate score_type names conditions for total count by Lesson_teacher_scoretype.SHALGALT_ONOO
        score_type_conditions = [
            When(score_type__score_type=score_type_item[0], then=Value(score_type_item[1]))
            for score_type_item in Lesson_teacher_scoretype.SCORE_TYPE
        ]

        # to generate conditions to get exam type names
        exam_type_conditions = [
            When(stype=exan_type_item[0], then=Value(exan_type_item[1]))
            for exan_type_item in ExamTimeTable.EXAM_TYPE
        ]

        # NOTE why it is needed? it is not real total count. i think it is weird but i did as you said so far: i use Lesson_teacher_scoretype.SHALGALT_ONOO to get total count
        # total_count = TeacherScore.objects.filter(
        #     lesson_year=lesson_year,
        #     lesson_season=lesson_season,
        #     score__isnull=False,
        #     score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
        # ).count()

        # print(total_count)

        queryset = TeacherScore.objects.filter(
            lesson_year=lesson_year,
            lesson_season=lesson_season,
            score__isnull=False,

        ).annotate(
            score_type_name=Case(
                *score_type_conditions,
                default=Cast(F('score_type__score_type'), CharField()),
                output_field=CharField()
            ),

            school_name=Case(
                When(student__group__profession__department__isnull=False, then=F('student__group__profession__department__sub_orgs__name')),
                default=F('student__group__profession__school__name')
            ),

            group_level=F('student__group__level'),
            group_name=F('student__group__name'),
            lesson_name=F('score_type__lesson_teacher__lesson__name'),


            exam_type_name=Subquery(ExamTimeTable.objects.filter(
                lesson_year=OuterRef('lesson_year'),
                lesson_season=OuterRef('lesson_season'),
                lesson=OuterRef('score_type__lesson_teacher__lesson'),
                exam_to_group__student=OuterRef('student'),

            )[:1].annotate(
                exam_type_name=Case(
                    *exam_type_conditions,
                    default=Cast(F('stype'), CharField()),
                    output_field=CharField()
                )
            ).values('exam_type_name')),


            is_repeat=Exists(
                Exam_repeat.objects.filter(
                    lesson_year=OuterRef('lesson_year'),
                    lesson_season=OuterRef('lesson_season'),
                    status=Exam_repeat.UPGRADE_SCORE,
                    lesson=OuterRef('score_type__lesson_teacher__lesson'),
                    exam_to_student__student=OuterRef('student'),

                )[:1]
            ),

            total_score=Subquery(
                # to get score i copied this way from TeacherScoreSerializer.get_assessment(). It is weird for me but it is used in TeacherScoreSerializer.get_assessment() so maybe it is okey
                TeacherScore.objects.filter(
                    student=OuterRef('student'),
                    score_type__lesson_teacher__lesson=OuterRef('score_type__lesson_teacher__lesson')
                ).values(
                    'student',
                    'score_type__lesson_teacher__lesson'
                ).annotate(
                    total=Sum('score')
                )[:1].values('total')
            )
        ).values(
            'score_type_name',
            'student',
            'total_score',
            'school_name',
            'group_level',
            'group_name',
            'lesson_name',
            'exam_type_name',
            'is_repeat'
        )
        # print(queryset.query)

        response = list(queryset)

        return request.send_data(response)


@permission_classes([IsAuthenticated])
class TeacherLessonScorePrintAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    queryset = TeacherScore.objects
    serializer_class = TeacherScoreListPrintSerializer

    # to pass extra complex data to serializer, because annotate() does not support complex data like list, dict, etc
    # and because it call sql query only 1 time instead of serializer way that calls sql query on every row. Therefore database will be slowed down very hard if for example calling queryset.filter() (and any other similar calls) is made inside serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        exam = self.request.query_params.get('exam')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        student_ids_param = self.request.query_params.get('student_ids')
        student_ids = [int(i) for i in student_ids_param.split(',') if i] if student_ids_param else None

        exam_committee = []
        if exam and lesson_year and lesson_season:
            exam_time_table_qs = ExamTimeTable.objects.filter(pk=exam, lesson_year=lesson_year, lesson_season=lesson_season).prefetch_related('teacher')
            last_exam_time_table = exam_time_table_qs.first()

            if last_exam_time_table:
                exam_committee_teachers = last_exam_time_table.teacher.all()

                if exam_committee_teachers:
                    for exam_committee_teacher in exam_committee_teachers:

                        user_id = exam_committee_teacher.user

                        teacherscore_Qs = TeacherScore.objects.filter(
                            score_type__lesson_teacher__lesson=last_exam_time_table.lesson,
                            lesson_year=lesson_year,
                            lesson_season=lesson_season,
                            score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                        )

                        teacher_quiz_score_Qs = TeacherScore.objects.filter(
                            score_type__lesson_teacher__lesson=last_exam_time_table.lesson,
                            lesson_year=lesson_year,
                            lesson_season=lesson_season,
                            score_type__score_type=Lesson_teacher_scoretype.BUSAD,
                        )

                        ded_confirm_qs = ExamTimeTable.objects.filter(
                            lesson=last_exam_time_table.lesson,
                            lesson_year=lesson_year,
                            lesson_season=lesson_season,
                        )

                        if exam_committee_teachers.count() > 1:
                            teacherscore_Qs = teacherscore_Qs.filter(created_user=user_id)

                        selected_student_ids = []

                        if student_ids:
                            selected_student_ids = TeacherScore.objects.filter(id__in=student_ids).values_list('student_id', flat=True)

                        if selected_student_ids:
                            teacherscore_Qs = teacherscore_Qs.filter(student_id__in=selected_student_ids)
                            teacher_quiz_score_Qs = teacher_quiz_score_Qs.filter(student_id__in=selected_student_ids)

                        teacher_score_updated_at = teacherscore_Qs.values_list('updated_at', flat=True).order_by('updated_at').first()

                        teacher_exam_score_confirm_date_qs = teacherscore_Qs.values_list('confirm_date_teacher', flat=True).order_by('confirm_date_teacher')
                        teacher_quiz_score_confirm_date_qs = teacher_quiz_score_Qs.values_list('confirm_date_teacher', flat=True).order_by('confirm_date_teacher')
                        ded_confirm_date = ded_confirm_qs.values_list('confirm_date_ded', flat=True).order_by('confirm_date_ded').first()

                        all_exam_confirmed = teacherscore_Qs.exists() and not teacherscore_Qs.exclude(is_confirm_teacher=True).exists()
                        all_quiz_confirmed = teacher_quiz_score_Qs.exists() and not teacher_quiz_score_Qs.exclude(is_confirm_teacher=True).exists()

                        teacher_exam_score_confirm_date = teacher_exam_score_confirm_date_qs.last() if all_exam_confirmed else None
                        teacher_quiz_score_confirm_date = teacher_quiz_score_confirm_date_qs.last() if all_quiz_confirmed else None

                        exam_committee.append(
                            {
                                'teacher_org_position': Employee.objects.filter(user=exam_committee_teacher.user.id).values_list('org_position__name', flat=True).first(),
                                'teacher_name': exam_committee_teacher.full_name,
                                'teacher_score_updated_at': teacher_score_updated_at.strftime('%Y-%m-%d %H:%M:%S') if teacher_score_updated_at else None,
                                'teacher_exam_score_confirm_date': teacher_exam_score_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if teacher_exam_score_confirm_date else None,
                                'teacher_quiz_score_confirm_date': teacher_quiz_score_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if teacher_quiz_score_confirm_date else None,
                                'ded_confirm_date': ded_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if ded_confirm_date else None,
                            }
                        )

        context['exam_committee'] = exam_committee

        return context

    def put(self, request):
        exam = request.query_params.get('exam')
        # lesson_year, lesson_season = get_active_year_season()
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        request_data = request.data
        group_id = request_data.get('group_id')
        sub_group_id = request_data.get('sub_group_id')
        level_group_id = request_data.get('level_group_id')

        # Тухайн шалгалтын хуваариас хичээлийг авах
        exam_obj = ExamTimeTable.objects.get(pk=exam)

        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season)

        # Шалгалтанд нэмэгдээгүй ангийн хүүхдүүд шалгалтад оролцох боломжтой тул ангиар хайж байгаа үед бүртгэгдсэн ангиар хайсан
        exam_to_group_qs = Exam_to_group.objects.filter(exam=exam, group__student=OuterRef('student'))
        exam_to_sub_group_qs = ExamToSubGroup.objects.filter(exam=exam, sub_group__student=OuterRef('student'))
        exam_to_level_group_qs = ExamToLevelGroup.objects.filter(exam=exam, level_group__student=OuterRef('student'))
        self.queryset = self.queryset.filter(Exists(exam_to_group_qs)|Exists(exam_to_sub_group_qs)|Exists(exam_to_level_group_qs))

        or_filter = Q()

        if group_id:
            or_filter |= Exists(exam_to_group_qs.filter(group=group_id))

        if sub_group_id:
            or_filter |= Exists(exam_to_sub_group_qs.filter(sub_group=sub_group_id))

        if level_group_id:
            or_filter |= Exists(exam_to_level_group_qs.filter(level_group=level_group_id))

        self.queryset = self.queryset.filter(or_filter)

        # Дүн гаргасан багшийн мэдээлэл
        teacher_id = self.queryset.values_list('score_type__lesson_teacher__teacher', flat=True).first()
        if not teacher_id:
            return request.send_error('ERR_002', 'Тухайн анги (/дэд/түвшин) бүлэгт багшийн дүн шивэгдээгүй байна.')

        teacher = Teachers.objects.filter(id=teacher_id).first()

        student_ids = self.queryset.values_list('id', flat=True).distinct('student')
        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season, id__in=student_ids)

        lesson_kredit = LessonStandart.objects.filter(id=exam_obj.lesson.id).values_list('kredit', flat=True).first()

        teacher_org_position = Employee.objects.filter(user=teacher.user).values_list('org_position__name', flat=True).first()
        teacher_quiz_score_updated_at = self.queryset.filter(
            score_type__score_type=Lesson_teacher_scoretype.BUSAD
        ).values_list('updated_at', flat=True).order_by('updated_at').last()
        teacher_score_updated_at = teacher_quiz_score_updated_at or self.queryset.values_list('updated_at', flat=True).order_by('updated_at').last()

        self.queryset = self.queryset.annotate(
            lesson_kredit=Value(lesson_kredit, output_field=FloatField()),
            teacher_name=Value(teacher.full_name, output_field=CharField()),
            teacher_org_position=Value(teacher_org_position, output_field=CharField()),
            teacher_score_updated_at=Value(teacher_score_updated_at, output_field=DateTimeField()),
        )

        self.queryset = self.queryset.order_by('student__first_name')
        all_list = self.list(request).data

        return request.send_data(all_list)


class ScoreOldV2APIView(
    generics.GenericAPIView
):
    """ Оюутан бүрийн хуучин дүн оруулах """

    def post(self, request):

        data = request.data.dict()  # Ирж байгаа датаг dict болгоно
        not_found_lesson = []  # Олдоогүй хичээлүүдийг хадгалах list
        not_found_student = []  # Олдоогүй оюутнуудыг хадгалана
        all_create_datas = []  # create хийсан датануудыг хадгалах list

        file = data.get('file')  # front-оос ирсэн файлыг авна
        group_id = data.get('group_id')  # тухайн ангийн id-г авна

        file_name = file.name  # файлын нэр
        path = save_file(file, 'score_sheet', 1)  # Түр хугацаанд файлыг folder дотор хадгалж ашиглана
        full_path = os.path.join(settings.MEDIA_ROOT, str(path))  # Хадгалсан файлын замыг авна

        reader = openpyxl_dictreader.DictReader(full_path)  # Dict reader ашиглан файлыг уншина (файлын замыг ашиглан)

        group_obj = Group.objects.get(id=group_id)  # Group моделийн датаг group_id-аа ашиглан филтер хийж олж авна
        student_group_year = group_obj.join_year  # Тухайн ангийн элссэн жил
        student_profession = group_obj.profession  # Тухайн ангийн мэргэжилүүд

        # Тухайн мэргэжилтэй холбоотой хичээлүүдийг авсан тэгэхдээ тус хичээлүүдийн зөвхөн id, code, name-ийг авч level болон нэрээр нь жагсаана
        lessons = list(LearningPlan.objects.filter(profession=student_profession)
                       .values('lesson__id', 'lesson__code', 'lesson__name')
                       .order_by('lesson_level', 'lesson__name'))

        # файл доторх мөр бүрээр нь давталд гүйлгэнэ
        for row in reader:

            # Тухайн нэг мөр датанаас
            student_code = row.get('Оюутны код')  # Оюутны код
            student_last_name = row.get('Эцэг/эхийн нэр')  # Эцэг/эхийн нэр
            student_first_name = row.get('Нэр')  # Нэр
            register = row.get('Регистр')  # Регистр гэсэн нэртэй багануудын датаг хадгална
            birth_date, gender = calculate_birthday(register)  # Оюутны регистрын дугаарыг ашиглан төрсөн өдөр болон хүйсийг олж авсан

            if not student_code or not student_last_name or not student_first_name:
                continue  # Шаардлагатай өгөгдлүүдийн аль нэг нь дутуу байвал алгасна

            # Оюутан гэсэн модел дотроос нэр болон кодын ашиглан тухайн оюутныг олно
            student = Student.objects.filter(Q(code__iexact=student_code) | Q(register_num__iexact=register)).first()

            # Хэрвээ оюутан олдохгүй бол
            if student is None:
                # Шинээр тэр оюутыг нэмж өгнө бас тэр ангид нь хуваальлана
                student = Student.objects.create(
                    code=student_code,
                    first_name=student_first_name,
                    last_name=student_last_name,
                    register_num=register,
                    gender=gender,
                    birth_date=birth_date,
                    group_id=group_id,
                    status_id=1,
                    department=group_obj.department,
                    school=group_obj.school,
                    citizenship=Country.objects.get(code='496')
                )
            else:
                # Хэрвээ тэр оюутан нь олдвол тэр оюутан тэр ангидаа байна уу гэдгийг шалгана
                student_exists_in_group = Student.objects.filter(group=group_id, id=student.id).exists()
                # Оюутан тэр ангидаа байхгүй бол тэр оюутныг тэр ангид нь оруулна
                if not student_exists_in_group:
                    Student.objects.filter(id=student.id).update(group=group_id)

            if not student:
                # Хэрвээ файл доторх оюутны мэдээлэл алдаатай байгаад тэр оюутан олдохгүй үед оюутан олдсонгүй гэсэн list дотор нэмнэ
                not_found_student.append({
                    'student_code': student_code,
                    'student_name': f"{student_last_name} {student_first_name}"
                })
                continue

            # Тухайн ангийн элссэн жилийг эхлэсэн болон төгссөнөөр нь хуваана
            splitted_list = student_group_year.split('-')
            start_year, end_year = int(splitted_list[0]), int(splitted_list[1])

            for lesson in lessons:
                # Хэрвээ тус мэргэжилтэй холбоотой хичээлүүд файл доторх хичээлийн кодтой тохирсон үед файл доторх хичээлийн оноог авна
                score = row.get('{}'.format(lesson.get("lesson__code")))
                if not score:
                    score = row.get(' {}'.format(lesson.get("lesson__code")))

                if not score:
                    score = row.get('{} '.format(lesson.get("lesson__code")))

                if score:
                    check_score = str(score)
                    if  check_score.isalpha() or check_score.isspace() or not check_score.isnumeric():
                        continue

                if score is None and score != 0 :
                    # Хэрвээ хичээлийн оноо олдоогүй үед бас тэр оноо нь 0-ээс ялгаатай үед хичээл олдсонгүй гэсэн list-д нэмнэ
                    not_found_lesson.append({
                        'student_code': student_code,
                        'lesson_code': lesson.get('lesson__code'),
                        'lesson_name': lesson.get('lesson__name'),
                        'exam_score': score
                    })
                    continue

                # Lesson obj-ийг lesson_id ашиглан филтер хийж авна
                lesson_obj = LessonStandart.objects.get(id=lesson.get('lesson__id'))
                # Оюутны мэргэжил болон хичээлийн id-г ашиглан сургалтын төлөвлөгөөний мэдээллийг авна
                learningplan = LearningPlan.objects.filter(profession=student_profession, lesson=lesson_obj.id).first()

                # Сургалтын төлөвлөгөөнөөс үзэх улирлуудыг листээр авах
                learningplan_season = json_load(learningplan.season) if learningplan else []

                if learningplan_season:
                    learningplan_season = learningplan_season[0]  # Эхний улирлаал аваад байх шиг байна
                    # learning plan-ий улиралд үндэслээд жил, улирлыг авсан
                    year_count = (int(learningplan_season) + 1) // 2 if int(learningplan_season) % 2 != 0 else int(learningplan_season) // 2
                    cyear_count = year_count - 1
                    season = Season.objects.filter(season_name='Намар' if int(learningplan_season) % 2 != 0 else 'Хавар').first().id

                    score_start_year = str(start_year + cyear_count)  # Эхний улирлын жил
                    score_end_year = str(end_year + cyear_count)  # Сүүлийн улирлын жил
                    lesson_year = f"{score_start_year}-{score_end_year}"  # 2 жилээ нэгтгэсэн
                else:
                    continue

                score = float(score) if isinstance(score, str) else score  # score string байвал float болгоно
                score = round(score, 2)  # цэгээс хойших эхний 2 оронгоор зааглан авна
                assessment = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()  # score-ийг ашиглан түүнд тохирох үнэлгээг авна

                # create хийх болох датануудаа all_create_datas list дотор нэмж өгнө
                all_create_datas.append({
                    'student_id': student.id,
                    'student_code': student.code,
                    'lesson_id': lesson_obj.id,
                    'lesson_name': lesson_obj.name,
                    'lesson_code': lesson_obj.code,
                    'exam_score': score,
                    'assessment_id': assessment.id if assessment else None,
                    'status': ScoreRegister.START_SYSTEM_SCORE,
                    'school_id': student.school.id if student.school else None,
                    'lesson_year': lesson_year,
                    'lesson_season_id': season
                })

        remove_folder(path)  # Процесс явагдаж дууссны дараа түр зуур хадгалсан filе-аа устгана

        # front-руу буцаах датанууд
        return_datas = {
            'create_datas': all_create_datas,
            'not_found_lesson': not_found_lesson,
            'not_found_student': not_found_student,
            'all_error_datas': not_found_lesson + not_found_student,
            'file_name': file_name
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class ScoreRefreshAPIView(
    generics.GenericAPIView
):
    """ Дүнгийн бүртгэл """

    queryset = ScoreRegister.objects.all()

    @transaction.atomic
    def get(self, request, group=None):
        all_student = self.queryset.filter(student__group=group)
        update_datas = []

        try:
            for student_score in all_student:
                score_total = student_score.score_total
                score = round(score_total, 2)
                assessment = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()
                student_score.assessment = assessment
                student_score.grade_letter = student_score.grade_letter if student_score.grade_letter and score < 60 else None
                update_datas.append(student_score)

            ScoreRegister.objects.bulk_update(update_datas, ['grade_letter', 'assessment'], batch_size=500)

        except Exception as e:
            print("Үнэлгээ шинэчлэх", len(update_datas), e)
            return request.send_error('ERR_002', 'Үнэлгээ шинэчлэхэд алдаа гарлаа дахин оролдоно уу')

        return request.send_info('INF_002', 'Амжилттай шинэчлэлээ')


@permission_classes([IsAuthenticated])
class ScoreRegisterLessonAPIView(
    generics.GenericAPIView
):
    """ Тухайн хичээлийн тухайн жил улирлын дүнтэй оюутныг авах """

    queryset = Student.objects.all()
    def get(self, request, lesson=None):
        all_students_teach_scores = []
        lesson_year, lesson_season = get_active_year_season()
        lesson_teacher_ids = Lesson_to_teacher.objects.filter(lesson=lesson).values_list('id', flat=True)
        exam = request.query_params.get('exam')
        is_repeat = request.query_params.get('is_repeat')
        if is_repeat == 'true':
            teacher_score_students = Exam_to_student.objects.filter(exam=exam).values('student', 'student__code', 'student__first_name', 'student__last_name', 'student__register_num', 'student__group__name').distinct('student')
            for student in teacher_score_students:
                obj = {}
                obj['id'] = student.get('student')
                obj['first_name'] = student.get('student__first_name')
                obj['last_name'] = student.get('student__last_name')
                obj['register_num'] = student.get('student__register_num')
                obj['code'] = student.get('student__code')
                obj['group_name'] = student.get('student__group__name')
                obj['total_score'] = 0
                obj['is_fail'] = False

                all_students_teach_scores.append(obj)
        else:
            if exam:
                group_ids = Exam_to_group.objects.filter(exam=exam).values_list('group', flat=True)
                sub_group_student_qs = ExamToSubGroup.objects.filter(exam=exam).values_list('sub_group__student', flat=True)
                level_group_student_qs = ExamToLevelGroup.objects.filter(exam=exam).values_list('level_group__student', flat=True)

                # Багшийн дүнгийн задаргааны төрлүүд
                score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher__in=lesson_teacher_ids).exclude(score_type__in=[Lesson_teacher_scoretype.QUIZ1, Lesson_teacher_scoretype.QUIZ2]).values_list('id', flat=True)

                # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
                teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids)

                teach_score_qs = teach_score_qs.filter(
                    Q(student__group__in=group_ids)|
                    Q(student__in=sub_group_student_qs)|
                    Q(student__in=level_group_student_qs)
                )

                # Дүнтэй оюутнууд
                teacher_score_students = teach_score_qs.values('student', 'student__code', 'student__first_name', 'student__last_name', 'student__register_num', 'student__group__name').distinct('student')

                # Оюутны дүн нэгтэх
                for student in teacher_score_students:
                    obj = {}
                    scores = teach_score_qs.filter(student=student.get('student')).values_list('score', flat=True)
                    total_score = sum(scores) if scores else 0
                    obj['id'] = student.get('student')
                    obj['first_name'] = student.get('student__first_name')
                    obj['last_name'] = student.get('student__last_name')
                    obj['register_num'] = student.get('student__register_num')
                    obj['code'] = student.get('student__code')
                    obj['group_name'] = student.get('student__group__name')
                    obj['total_score'] = total_score
                    obj['is_fail'] = False
                    if total_score <= 42:
                        obj['is_fail'] = True

                    all_students_teach_scores.append(obj)

        sorted_scores = sorted(all_students_teach_scores, key=lambda x: x['total_score'], reverse=True)
        return request.send_data(sorted_scores)

@permission_classes([IsAuthenticated])
class ReExamTeacherLessonScorePrintAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    queryset = TeacherScore.objects
    serializer_class = TeacherScoreListPrintSerializer

    # to pass extra complex data to serializer, because annotate() does not support complex data like list, dict, etc
    # and because it call sql query only 1 time instead of serializer way that calls sql query on every row. Therefore database will be slowed down very hard if for example calling queryset.filter() (and any other similar calls) is made inside serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        exam = self.request.query_params.get('exam')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        exam_committee = []
        exam_time_table_qs = Exam_repeat.objects.filter(pk=exam).prefetch_related('teacher')
        last_exam_time_table = exam_time_table_qs.first()

        if last_exam_time_table:
            exam_committee_teachers = last_exam_time_table.teacher.all()

            if exam_committee_teachers:
                for exam_committee_teacher in exam_committee_teachers:

                    teacherscore_Qs = TeacherScore.objects.filter(
                        score_type__lesson_teacher__lesson=last_exam_time_table.lesson,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    )

                    teacher_quiz_score_Qs = TeacherScore.objects.filter(
                        score_type__lesson_teacher__lesson=last_exam_time_table.lesson,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        score_type__score_type=Lesson_teacher_scoretype.BUSAD,
                    )

                    ded_confirm_qs = Exam_repeat.objects.filter(
                            lesson=last_exam_time_table.lesson,
                            lesson_year=lesson_year,
                            lesson_season=lesson_season,
                        )

                    all_exam_confirmed = teacherscore_Qs.exists() and not teacherscore_Qs.exclude(is_confirm_teacher=True).exists()
                    all_quiz_confirmed = teacher_quiz_score_Qs.exists() and not teacher_quiz_score_Qs.exclude(is_confirm_teacher=True).exists()
                    ded_confirm_date = ded_confirm_qs.values_list('confirm_date_ded', flat=True).order_by('confirm_date_ded').first()

                    exam_committee.append(
                        {
                            'teacher_org_position': Employee.objects.filter(user=exam_committee_teacher.user.id).values_list('org_position__name', flat=True).first(),
                            'teacher_name': exam_committee_teacher.full_name,
                            'teacher_score_updated_at': last_exam_time_table.updated_at.strftime('%Y-%m-%d %H:%M:%S') if last_exam_time_table.updated_at else None,
                            'teacher_exam_score_confirm_date': teacherscore_Qs.values_list('confirm_date_teacher', flat=True).order_by('confirm_date_teacher').last() if all_exam_confirmed else None,
                            'teacher_quiz_score_confirm_date': teacher_quiz_score_Qs.values_list('confirm_date_teacher', flat=True).order_by('confirm_date_teacher').last() if all_quiz_confirmed else None,
                            'ded_confirm_date': ded_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if ded_confirm_date else None,
                        }
                    )

        context['exam_committee'] = exam_committee

        return context

    def put(self, request):
        exam = request.query_params.get('exam')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        # lesson_year, lesson_season = get_active_year_season()
        student_ids = request.data

        # Тухайн дахин шалгалтын хуваариас хичээлийг авах
        exam_obj = Exam_repeat.objects.get(pk=exam)
        exam_students = Exam_to_student.objects.filter(exam=exam)
        if student_ids:
            exam_students = exam_students.filter(student_id__in=student_ids)

        student_ids = exam_students.values_list('student', flat=True)

        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season)
        if len(student_ids) > 0:
            self.queryset = self.queryset.filter(student__in=student_ids)
        else:
            self.queryset = self.queryset.filter(score__gt=0)

        # Дүн гаргасан багшийн мэдээлэл
        teacher_id = self.queryset.values_list('score_type__lesson_teacher__teacher', flat=True).first()
        if not teacher_id:
            return request.send_error('ERR_002', 'Тухайн анги бүлэгт багшийн дүн шивэгдээгүй байна.')

        teacher = Teachers.objects.filter(id=teacher_id).first()

        student_ids = self.queryset.values_list('id', flat=True).distinct('student')
        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season, id__in=student_ids)

        lesson_kredit = LessonStandart.objects.filter(id=exam_obj.lesson.id).values_list('kredit', flat=True).first()

        teacher_org_position = Employee.objects.filter(user=teacher.user).values_list('org_position__name', flat=True).first()
        teacher_score_updated_at = self.queryset.values_list('updated_at', flat=True).order_by('updated_at').last()

        self.queryset = self.queryset.annotate(
            lesson_kredit=Value(lesson_kredit, output_field=FloatField()),
            teacher_name=Value(teacher.full_name, output_field=CharField()),
            teacher_org_position=Value(teacher_org_position, output_field=CharField()),
            teacher_score_updated_at=Value(teacher_score_updated_at, output_field=DateTimeField()),
        )

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class TeacherScoreRegisterListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ дүн crud """

    queryset = TeacherScore.objects.all()

    pagination_class = CustomPagination

    @has_permission(must_permissions=['lms-score-register-read'])
    def get(self, request, pk=None):
        """ дүн жагсаалт """

        group = request.query_params.get('group')
        lesson = request.query_params.get('lesson')
        school = request.query_params.get('school')
        teacher = request.query_params.get('teacher')
        approved_type = request.query_params.get('approved_type')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        sorting = self.request.query_params.get('sorting')

        # lesson_year, lesson_season = get_active_year_season()

        filters = dict()

        if not lesson_year:
            return request.send_error("ERR_002", "Идэвхитэй хичээлийн жил байхгүй байна")

        query = request.query_params.get('search', '')
        if query:
            self.queryset = self.queryset.filter(
                Q(score_type__lesson_teacher__lesson__name__icontains=query) |
                Q(score_type__lesson_teacher__lesson__code__icontains=query) |
                Q(score_type__lesson_teacher__teacher__first_name__icontains=query) |
                Q(score_type__lesson_teacher__teacher__last_name__icontains=query) |
                Q(student__group__name__icontains=query)
            )

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type__score_type=Lesson_teacher_scoretype.BUSAD)

        if approved_type:
            approved_type = str2bool(approved_type)
            filters["is_approved"] = approved_type

        if teacher:
            filters["score_type__lesson_teacher__teacher"] = teacher

        if lesson:
            filters["score_type__lesson_teacher__lesson"] = lesson

        if group:
            filters["student__group"] = group

        if school:
            filters["student__group__school"] = school

        self.queryset = self.queryset.filter(**filters).annotate(
            is_score_approved=Exists(
                ScoreRegister.objects.filter(
                    lesson_year=OuterRef("lesson_year"),
                    lesson_season=OuterRef("lesson_season"),
                    lesson=OuterRef("score_type__lesson_teacher__lesson_id"),
                    student=OuterRef("student"),
                )
            )
        )

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        grouped_queryset = self.queryset.values(
            'is_score_approved',
            'student__group',
            'score_type__lesson_teacher__lesson',
        ).annotate(
            student_count=Count('student', distinct=True),
            score_count=Count('id'),
            confirmed_score_count=Count('id', filter=Q(is_confirm_teacher=True)),
            teacher_ids_array=ArrayAgg('score_type__lesson_teacher__teacher', filter=Q(score_type__score_type=Lesson_teacher_scoretype.BUSAD), distinct=True),
        ).annotate(
            group_id=F("student__group_id"),
            group_name=F("student__group__name"),
            lesson_id=F("score_type__lesson_teacher__lesson_id"),
            lesson_full_name=Concat("score_type__lesson_teacher__lesson__code", Value(" "), "score_type__lesson_teacher__lesson__name", output_field=CharField()),
        )

        page = self.paginate_queryset(grouped_queryset)
        if page is not None:
            result = []
            for item in page:
                teacher_ids = item.get("teacher_ids_array")
                is_approved = item['is_score_approved']
                is_confirm_teacher = item['score_count'] > 0 and item['confirmed_score_count'] == item['score_count']
                last_approved_obj = None
                last_confirm_teacher_obj = None

                teacher_qs = (
                    Teachers.objects.filter(id__in=teacher_ids).order_by("first_name")
                    .annotate(
                        full_name=Concat("last_name", Value(" "), "first_name", output_field=CharField())
                    )
                )

                teachers = list(teacher_qs.values('full_name', 'id'))
                teacher_names = list(teacher_qs.values_list("full_name", flat=True))

                if is_approved:
                    last_approved_obj = self.queryset.filter(score_type__lesson_teacher__lesson=item.get("lesson_id"), student__group=item.get("group_id"), score_type__lesson_teacher__teacher__in=teacher_ids).order_by("-approved_date").first()

                if is_confirm_teacher:
                    last_confirm_teacher_obj = self.queryset.filter(score_type__lesson_teacher__lesson=item.get("lesson_id"), student__group=item.get("group_id"), score_type__lesson_teacher__teacher__in=teacher_ids, is_confirm_teacher=True).order_by("-confirm_date_teacher").first()

                result.append({
                    'lesson': {"id": item.get("lesson_id"), "full_name": item.get("lesson_full_name")},
                    'teachers': teachers,
                    'teacher_names': ', '.join(teacher_names),
                    'teacher': None,
                    'group': {"id": item.get("group_id"), "name": item.get("group_name")},
                    'student_count': item['student_count'],
                    'is_confirm_teacher': is_confirm_teacher,
                    'confirm_date_teacher': last_confirm_teacher_obj.confirm_date_teacher.date() if is_confirm_teacher and last_confirm_teacher_obj and last_confirm_teacher_obj.confirm_date_teacher else None,
                    'is_approved': is_approved,
                    'approved_date': last_approved_obj.approved_date.date() if is_approved and last_approved_obj and last_approved_obj.approved_date else None,
                })

            paginated_response = self.get_paginated_response(result)

            return request.send_data(paginated_response.data)

        return request.send_data({})

    @login_required()
    def post(self, request):
        """ Багшийн дүн баталгаажуулах буюу татах """

        data = request.data

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_season:
            lesson_year, lesson_season = get_active_year_season()

        # TODO: Өмнөх улирлын дүн баталгаажуулах бол
        # lesson_year = '2024-2025'
        # lesson_season = 1

        for item in data:
            all_students_teach_scores = []
            have_score_students = []

            # teacher = item['teacher']
            lesson = item['lesson']
            group = item['group']

            if not lesson:
                return request.send_error("ERR_001","Хоосон сонголт")

            # Багш хичээл холболт
            # lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher)

            # Багшийн дүнгийн задаргааны төрлүүд
            # score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher__in=lesson_teacher, score_type__in=[Lesson_teacher_scoretype.BUSAD, Lesson_teacher_scoretype.SHALGALT_ONOO]).values_list('id', flat=True)

            # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
            teacher_score_qs = TeacherScore.objects.filter(
                lesson_year=lesson_year, lesson_season=lesson_season,
                score_type__lesson_teacher__lesson=lesson,
                score_type__score_type__in=[Lesson_teacher_scoretype.BUSAD, Lesson_teacher_scoretype.SHALGALT_ONOO],
            )

            add_score_qs = AddScoreRegister.objects.filter(lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season)

            # Анги байвал тухайн ангийн оюутны дүнг татна.
            if group:
                add_score_qs = add_score_qs.filter(student__group=group)
                teacher_score_qs = teacher_score_qs.filter(student__group=group)

            # Баталгаажсан огноог хайж олох (Олдохгүй бол None байна)
            approved_date = teacher_score_qs.filter(
                is_approved=True
            ).values_list('approved_date', flat=True).first()

            # Хэрэв өмнө нь баталгаажсан огноо байхгүй бол одоогийн цагийг онооно
            if not approved_date:
                approved_date = timezone.now()

            # Бүгдийг нь нэг Query-ээр шинэчлэх
            teacher_score_qs.update(
                is_approved=True,
                approved_date=approved_date
            )

            # Дүнтэй оюутнууд
            teacher_score_students = teacher_score_qs.values_list('student', flat=True).distinct('student')

            # Оюутны дүн нэгтэх
            for student_id in teacher_score_students:
                obj = {}
                # Одоогоор зөвхөн 70 болон 30 гэж задарч байгаа. Тиймээс Зөвхөн 70 оноог л авна
                student_teacher_score_qs = teacher_score_qs.filter(student=student_id)
                other_teacher_score_obj = student_teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.BUSAD).order_by(F('score').desc(nulls_last=True)).first()
                exam_teacher_score_obj = student_teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).order_by(F('score').desc(nulls_last=True)).first()

                teach_score = other_teacher_score_obj.score or 0 if other_teacher_score_obj else 0
                exam_score = exam_teacher_score_obj.score or 0 if exam_teacher_score_obj else 0
                teacher_id = other_teacher_score_obj.score_type.lesson_teacher.teacher_id if other_teacher_score_obj and other_teacher_score_obj.score_type_id else None

                grade_letter = student_teacher_score_qs.values_list('grade_letter', flat=True).first()

                # идэвхитэй хичээлийн жилээр нэмэлт оноог авах
                add_score_obj = add_score_qs.filter(student=student_id).first()
                add_score = add_score_obj.add_score if add_score_obj else 0

                if round(exam_score) < 18:
                    grade_letter = GradeLetter.objects.filter(letter='W').values_list('id', flat=True).first()
                    exam_score = 0

                total_score = teach_score + add_score + exam_score

                # TODO: 100 онооноос их болсон үед яах вэ
                if total_score > 100:
                    print('student_id -- total_score', student_id, total_score)
                    continue

                obj['student'] = student_id
                obj['teacher_id'] = teacher_id
                obj['teach_score'] = round(teach_score, 2)
                obj['add_score'] = add_score
                obj['exam_score'] = round(exam_score, 2)
                obj['grade_letter'] = grade_letter
                obj['total_score'] = round(total_score, 2)

                all_students_teach_scores.append(obj)

            with transaction.atomic():

                # Багшийн дүн оруулсан оюутны дүнг үүсгэнэ
                for student_teach_score in all_students_teach_scores:
                    student_id = student_teach_score.get('student')
                    teacher_id = student_teach_score.get('teacher_id')
                    add_score = student_teach_score.get('add_score') or 0
                    student_teacher_score = student_teach_score.get('teach_score') or 0
                    student_exam_score = student_teach_score.get('exam_score') or 0
                    student_score_total = student_teach_score.get('total_score') or 0
                    grade_letter = student_teach_score.get('grade_letter') or None

                    have_score_students.append(student_id)

                    # Өмнө нь дүн орсон эсэхийг шалгах
                    student_score_qs = ScoreRegister.objects.filter(student=student_id, lesson=lesson, lesson_year=lesson_year, lesson_season_id=lesson_season, is_delete=False)

                    # Үсгэн үнэлгээ
                    assessment_obj = Score.objects.filter(score_max__gte=student_score_total, score_min__lte=student_score_total).first()

                    student_obj = Student.objects.filter(id=student_id).first()
                    update_defaults = {
                        'teach_score': student_teacher_score or 0,
                        'exam_score': student_exam_score or 0,
                        'grade_letter_id': grade_letter,
                        'assessment': assessment_obj if assessment_obj and not grade_letter else None,
                        'status': ScoreRegister.TEACHER_WEB,
                        'add_score': add_score,
                        'school': student_obj.school if student_obj else None,
                    }

                    # Өмнө нь дүн орчихсон байвал update хийнэ
                    if student_score_qs.exists():
                        score_obj = student_score_qs.first()
                        score_obj.updated_user = request.user
                        score_obj.updated_at = datetime.now()
                        # Хэрвээ арга зүйч гараас дүн оруулсан бол өөрчлөхгүй.
                        if score_obj.status != ScoreRegister.START_SYSTEM_SCORE:
                            for key, value in update_defaults.items():
                                setattr(score_obj, key, value)
                            score_obj.save()
                    else:
                        ScoreRegister.objects.create(
                            student=student_obj,
                            lesson_id=lesson,
                            teacher_id=teacher_id,
                            lesson_year=lesson_year,
                            lesson_season_id=lesson_season,
                            created_user=request.user,
                            **update_defaults
                        )

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class TeacherScoreStudentListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """Дүн crud"""

    queryset = TeacherScore.objects

    SCORE_TYPE_NAMES = {
        Lesson_teacher_scoretype.QUIZ1: 'Явцын шалгалт',
        Lesson_teacher_scoretype.QUIZ2: 'Сорил 2',
        Lesson_teacher_scoretype.IRTS: 'Ирц',
        Lesson_teacher_scoretype.BIEDAALT1: 'Бие даалт 1',
        Lesson_teacher_scoretype.BIEDAALT2: 'Бие даалт 2',
        Lesson_teacher_scoretype.BUSAD: 'Явцын оноо',
        Lesson_teacher_scoretype.SHALGALT_ONOO: 'Шалгалтын оноо',
    }

    def post(self, request, pk=None):
        data = request.data

        teacher = data.get('teacher')
        lesson = data.get('lesson')
        group = data.get('group')
        is_approved = data.get('is_approved')

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        teacher_score_qs = TeacherScore.objects.filter(
            lesson_year=lesson_year,
            lesson_season=lesson_season,
        )

        teacher_score_qs = teacher_score_qs.annotate(
            is_score_approved=Exists(
                ScoreRegister.objects.filter(
                    lesson_year=lesson_year,
                    lesson_season=lesson_season,
                    lesson=OuterRef(
                        'score_type__lesson_teacher__lesson'
                    ),
                    student=OuterRef('student'),
                )
            )
        ).filter(
            is_score_approved=is_approved
        ).select_related(
            'student',
            'score_type',
            'grade_letter',
            'score_type__lesson_teacher',
        )

        if teacher:
            teacher_score_qs = teacher_score_qs.filter(
                score_type__lesson_teacher__teacher=teacher
            )

        if lesson:
            teacher_score_qs = teacher_score_qs.filter(
                score_type__lesson_teacher__lesson=lesson
            )

        if group:
            teacher_score_qs = teacher_score_qs.filter(
                student__group=group
            )

        score_type_ids = (
            teacher_score_qs
            .values_list('score_type_id', flat=True)
            .distinct()
        )

        teacher_score_types = (
            Lesson_teacher_scoretype.objects
            .filter(id__in=score_type_ids)
            .order_by('score_type', 'id')
        )

        busad_ids_with_named_breakdown = set(
            teacher_score_types
            .filter(
                score_type=Lesson_teacher_scoretype.BUSAD,
            )
            .exclude(
                Q(name__isnull=True) | Q(name='')
            )
            .values_list('lesson_teacher_id', flat=True)
            .distinct()
        )

        if busad_ids_with_named_breakdown:
            teacher_score_types = teacher_score_types.exclude(
                Q(score_type=Lesson_teacher_scoretype.BUSAD) &
                Q(Q(name__isnull=True) | Q(name='')) &
                Q(lesson_teacher_id__in=busad_ids_with_named_breakdown)
            )

        student_qs = Student.objects.filter(
            id__in=teacher_score_qs.values_list(
                'student',
                flat=True
            )
        )

        if group:
            student_qs = student_qs.filter(
                group=group
            )

        student_qs = student_qs.order_by(
            'group__name',
            'code'
        )

        add_score_qs = AddScoreRegister.objects.filter(
            lesson_year=lesson_year,
            lesson_season_id=lesson_season,
            lesson=lesson
        )

        grouped_data = []

        for student_obj in student_qs:
            scores = []
            total_score = 0
            add_score = 0

            student_teacher_score = teacher_score_qs.filter(
                student=student_obj
            )

            grade_letter_obj = student_teacher_score.filter(
                grade_letter__isnull=False
            ).first()

            add_score_obj = add_score_qs.filter(
                student=student_obj
            ).first()

            if add_score_obj:
                add_score = add_score_obj.add_score or 0

            for teacher_score in student_teacher_score:
                score_type_obj = teacher_score.score_type

                score_type_name = (
                    score_type_obj.name
                    or self.SCORE_TYPE_NAMES.get(
                        score_type_obj.score_type,
                        ''
                    )
                )

                score = teacher_score.score or 0

                scores.append({
                    'id': teacher_score.id,
                    'score_type_id': score_type_obj.id,
                    'score_type': score_type_obj.score_type,
                    'score_type_name': score_type_name,
                    'score': score,
                })

                total_score += float(score)

            total_score += float(add_score)

            grouped_data.append({
                'student_id': student_obj.id,
                'student_name': (
                    f'{student_obj.code} '
                    f'{student_obj.full_name}'
                ),
                'group_name': (
                    student_obj.group.name
                    if student_obj.group
                    else None
                ),
                'add_score': round(add_score, 2),
                'total_score': round(total_score, 2),
                'scores': scores,
                'letter_grade': (
                    grade_letter_obj.grade_letter.letter
                    if (
                        grade_letter_obj
                        and grade_letter_obj.grade_letter_id
                    )
                    else None
                ),
            })

        progress_group = {
            'score_type': 'progress',
            'name': 'Явцын оноо',
            'score': 0,
            'score_type_id': None,
            'children': [],
        }

        exam_group = {
            'score_type': 'exam',
            'name': 'Шалгалтын оноо',
            'score': 0,
            'score_type_id': None,
        }

        for score_type in teacher_score_types:
            score_type_value = score_type.score_type
            score_value = score_type.score or 0

            if (
                score_type_value
                == Lesson_teacher_scoretype.SHALGALT_ONOO
            ):
                exam_group['score_type_id'] = score_type.id
                exam_group['score'] = score_value

                continue

            name = (
                score_type.name
                or self.SCORE_TYPE_NAMES.get(
                    score_type_value,
                    ''
                )
            )

            progress_group['children'].append({
                'id': score_type.id,
                'score_type': score_type_value,
                'name': name,
                'score': score_value,
            })

            progress_group['score'] += score_value

        progress_group['has_breakdown'] = (
            len(progress_group['children']) > 1
        )

        if not progress_group['has_breakdown'] and progress_group['children']:
            progress_group['score_type_id'] = (
                progress_group['children'][0]['id']
            )

        score_headers = []

        if progress_group['children']:
            score_headers.append(progress_group)

        if exam_group['score_type_id'] is not None:
            score_headers.append(exam_group)

        return_data = {
            'student_datas': grouped_data,
            'score_types': score_headers,
        }

        return request.send_data(return_data)


@permission_classes([IsAuthenticated])
class AddScoreRegisterAPIView(
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    """ Нэмэлт дүн оруулах"""

    queryset = AddScoreRegister.objects.all()
    serializer_class = AddScoreRegisterSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__code', 'student__first_name', 'student__last_name', 'lesson__name', 'created_at', 'add_score', 'description', 'student__code', 'student__register_num']

    @has_permission(must_permissions=['lms-arga-zuich-score-update'])
    def get(self, request, pk=None):

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_seson')
        lesson = request.query_params.get('lesson')

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)

        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            self.queryset = self.queryset.filter(lesson_season_id=lesson_season)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        serializer = self.list(request).data
        return request.send_data(serializer)

    @login_required()
    @has_permission(must_permissions=['lms-arga-zuich-score-update'])
    def post(self, request):
        self.serializer_class = AddScoreRegisterPostSerializer

        data = request.data
        data['created_user'] = request.user.pk
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        lesson = data.get('lesson')
        student = data.get('student')
        add_score = data.get('add_score') or 0
        qs = self.queryset.filter(student_id=student, lesson=lesson, lesson_year=lesson_year)
        lesson_name = LessonStandart.objects.filter(id=lesson).first().name
        student_code = Student.objects.filter(id=student).first().code

        if qs.exists():
            return request.send_error("ERR_002", f"{student_code} кодтэй оюутанд {lesson_name} хичээл дээр нэмэлт дүн орсон байна. Та бүртгэж байгаа мэдээллийг нягталж шалгана уу!!")

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            score_qs = ScoreRegister.objects.filter(student_id=student, lesson=lesson, lesson_year=lesson_year, lesson_season_id=lesson_season).first()

            # Хэрвээ дүн татагдсаны дараа нэмэлт дүн оруулвал нэмэлт оноо үсгэн үнэлгээг шинэчилнэ
            if score_qs:
                total_score = 0
                teach_score = score_qs.teach_score
                exam_score = score_qs.exam_score

                if teach_score:
                    total_score = float(teach_score)

                if exam_score:
                    total_score = total_score + float(exam_score)

                if add_score:
                    total_score = total_score + float(add_score)

                if total_score > 100:
                    return request.send_error("ERR_002", "Оюутны дүн 100-с их байж болохгүй тул нэмэлт оноо оруулах боломжгүй байна")

                if not total_score == 0:
                    total_score = round(total_score, 2)
                    assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()
                    score_qs.assessment = assessment if assessment else None

                score_qs.add_score = add_score
                score_qs.save()

            self.create(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info("INF_001")

    @login_required()
    @has_permission(must_permissions=['lms-arga-zuich-score-update'])
    def put(self, request, pk=None):
        self.serializer_class = AddScoreRegisterPostSerializer
        data = request.data
        data['updated_user'] = request.user.pk
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        lesson = data.get('lesson')
        student = data.get('student')
        add_score = data.get('add_score') or 0
        instance = self.queryset.filter(id=pk).first()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            score_qs = ScoreRegister.objects.filter(student_id=student, lesson=lesson, lesson_year=lesson_year, lesson_season_id=lesson_season).first()

            # Хэрвээ дүн татагдсаны дараа нэмэлт дүн оруулвал нэмэлт оноо үсгэн үнэлгээг шинэчилнэ
            if score_qs:
                total_score = 0
                teach_score = score_qs.teach_score
                exam_score = score_qs.exam_score

                if teach_score:
                    total_score = float(teach_score)

                if exam_score:
                    total_score = total_score + float(exam_score)

                if add_score:
                    total_score = total_score + float(add_score)

                if total_score > 100:
                    return request.send_error("ERR_002", "Оюутны дүн 100-с их байж болохгүй тул нэмэлт оноо оруулах боломжгүй байна")

                if not total_score == 0:
                    total_score = round(total_score, 2)
                    assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()
                    score_qs.assessment = assessment if assessment else None

                score_qs.add_score = add_score
                score_qs.save()

            self.update(request).data

        except Exception as e:
            return request.send_error("ERR_002", e.__str__)

        return request.send_info('INF_002')
