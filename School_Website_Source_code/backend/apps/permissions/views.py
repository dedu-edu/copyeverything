from rest_framework import mixins
from rest_framework import generics

from datetime import datetime
from django.db import transaction
from django.views.decorators.http import require_GET
# from lms_package.notif import create_notif

from lms.models import Teachers
from lms.models import Student
from lms.models import TimeTable
from lms.models import LessonStandart
from lms.models import Lesson_to_teacher
from lms.models import PermissionsOtherInterval
from lms.models import Lesson_teacher_scoretype
from lms.models import PermissionsTeacherScore
from lms.models import ExamTimeTable
from lms.models import Exam_repeat
from lms.models import PermissionsStudentChoice
from lms.models import Crontab
from lms.models import Notification
from lms.models import Employee

from core.models import User

from rest_framework.filters import SearchFilter
from main.utils.function.pagination import CustomPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.utils import filter_queries, get_active_year_season, has_permission, null_to_none, get_service_url, add_crontab, remove_cron, json_load, json_dumps, create_notif

from request.serializers import TeacherSerializer
from .serializers import LessonStandartSerializer
from .serializers import PermissionsTeacherScoreSerializer
from .serializers import Lesson_teacher_scoretypeSerializer
from .serializers import PermissionsStudentChoiceSerializer
from .serializers import PermissionsTeacherScoreListSerializer
from .serializers import PermissionsOtherIntervalSerializer
from .serializers import PermissionsOtherIntervalListSerializer
from .serializers import CrontabSerializer

from .serializers import PermissionsStudentSerializer
from .serializers import PermissionsStudentChoiceListSerializer


def is_online_quiz_only_lesson(lesson_id, lesson_year, lesson_season_id):
    """Үндсэн болон давтан шалгалтууд бүгд автомат онлайн сорил эсэх."""
    if not lesson_id or not lesson_year or not lesson_season_id:
        return False

    main_exams = ExamTimeTable.objects.filter(
        lesson_id=lesson_id,
        lesson_year=lesson_year,
        lesson_season_id=lesson_season_id,
    )
    repeat_exams = Exam_repeat.objects.filter(
        lesson_id=lesson_id,
        lesson_year=lesson_year,
        lesson_season_id=lesson_season_id,
    )
    has_online_quiz = (
        main_exams.filter(is_online=True, stype=ExamTimeTable.SORIL).exists()
        or repeat_exams.filter(is_online=True, stype=Exam_repeat.SORIL).exists()
    )
    has_manual_exam = (
        main_exams.exclude(is_online=True, stype=ExamTimeTable.SORIL).exists()
        or repeat_exams.exclude(is_online=True, stype=Exam_repeat.SORIL).exists()
    )
    return has_online_quiz and not has_manual_exam

@permission_classes([IsAuthenticated])
class PermissionTeacherAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Багшийн дүн оруулах хандах эрх '''

    queryset = PermissionsTeacherScore.objects.all().order_by("-created_at")
    serializer_class = PermissionsTeacherScoreSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [ 'start_date', 'finish_date']

    def get_queryset(self):

        queryset = self.queryset
        school = self.request.query_params.get('school')
        teacher = self.request.query_params.get('teacher')
        lesson = self.request.query_params.get('lesson')

        search_value = self.request.query_params.get('search')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(
                teacher_scoretype__lesson_teacher__lesson__school=school
            )


        # Багшаар хайлт хийх
        if teacher:
            queryset = queryset.filter(teacher_scoretype__lesson_teacher__teacher=teacher)

        if lesson:
            queryset = queryset.filter(
                teacher_scoretype__lesson_teacher__lesson=lesson
            )

        # хайлт хийх
        # if search_value:
        #     queryset = filter_queries(queryset.model, search_value)

        return queryset

    @has_permission(must_permissions=['lms-role-teacher-score-read'])
    def get(self, request, pk=None):
        """ Идэвхитэй хичээлин жил,улиралд
            хичээлийн хуваарьтай багш дээр
            заасан хичээлээр дүгнэх хэлбэрийн жагсаалт
        """

        # Багшийн дүн оруулах хандах эрхийн жагсаалт авах
        self.serializer_class = PermissionsTeacherScoreListSerializer

        # Идэвхтэй жил ,улирал
        season = request.query_params.get('lesson_season') or request.query_params.get('season')
        year = request.query_params.get('lesson_year') or request.query_params.get('year')

        if season and year:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data
        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-role-teacher-score-create'])
    def post(self, request):
        """
            Идэвхитэй хичээлин жил,улиралд
            хичээлийн хуваарьтай багш дээр
            заасан хичээлээр дүгнэх хэлбэрийг
            шинээр үүсгэнэ

        """

        errors = []
        request_datas = request.data

        request_data = null_to_none(request_datas)

        teacher_score_type = request_data.get('teacher_scoretype')
        teacher = request_data.get('teacher')
        lesson = request_data.get('lesson')
        end_date = request_data.get('finish_date')
        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if teacher_score_type is None:
            return request.send_error('ERR_002', " Тухайн багшийн заасан хичээл дээр дүгнэх хэлбэр олдсонгүй.")

        # Frontend-ээс ирсэн ID-г choice-ийн код гэж үзэхгүй. Бодит задаргааг
        # багш, хичээлтэй нь хамт шалгаснаар өөр багшийн эрх нээхээс хамгаална.
        score_type_obj = Lesson_teacher_scoretype.objects.filter(
            id=teacher_score_type,
            lesson_teacher__teacher_id=teacher,
            lesson_teacher__lesson_id=lesson,
            score_type__in=[
                Lesson_teacher_scoretype.BUSAD,
                Lesson_teacher_scoretype.SHALGALT_ONOO,
            ],
            score__gt=0,
        ).first()
        if not score_type_obj:
            return request.send_error(
                'ERR_002',
                "Багш эхлээд тухайн хичээлийн дүнгийн задаргааны оноог тохируулсан байна."
            )

        if (
            score_type_obj.score_type == Lesson_teacher_scoretype.SHALGALT_ONOO
            and is_online_quiz_only_lesson(lesson, year, season)
        ):
            return request.send_error(
                'ERR_002',
                "Зөвхөн онлайн сорилтой хичээлд шалгалтын онооны эрх нээх шаардлагагүй."
            )


        # Идэвхитэй жил улирал
        # Хуучин өгөгдөлд нэг үндсэн төрөл олон мөрөөр давхардсан байж болно.
        # Иймд зөвхөн DB ID бус багш + хичээл + үндсэн төрлөөр давхардлыг шалгана.
        qs = self.queryset.filter(
            lesson_year=year,
            lesson_season=season,
            teacher_scoretype__lesson_teacher__teacher_id=teacher,
            teacher_scoretype__lesson_teacher__lesson_id=lesson,
            teacher_scoretype__score_type=score_type_obj.score_type,
        )
        if qs.exists():
            return request.send_error("ERR__002", "Энэ багшийн заасан хичээл дээр дүнгийн эрх бүртгэгдсэн байна")

        if season and year:
           self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        # teacher, lesson нь зөвхөн холбоосыг баталгаажуулах UI талбарууд тул
        # PermissionsTeacherScore serializer руу дамжуулах шаардлагагүй.
        request_data.pop('teacher', None)
        request_data.pop('lesson', None)

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):
            # Эрх болон мэдэгдлийг нэг transaction-д хадгална. Мэдэгдэл үүсгэхэд
            # алдаа гарвал "эрх хадгалагдсан боловч UI алдаа харуулсан" төлөв үүсэхгүй.
            with transaction.atomic():
                serializer.save()

                scope_teacher_user_id = Teachers.objects.filter(
                    id=teacher,
                ).values_list('user', flat=True).first()
                employee_ids = list(Employee.objects.filter(
                    user=scope_teacher_user_id,
                ).values_list('id', flat=True))

                if employee_ids:
                    create_notif(
                        request,
                        employee_ids,
                        "Таны {score_type_name} дүн оруулах эрх нээгдлээ.".format(
                            score_type_name=score_type_obj.get_score_type_display()
                        ),
                        "Дүн оруулах эрх {end_date}-д хаагдахыг анхаарна уу.".format(
                            end_date=end_date
                        ),
                        Notification.FROM_KIND_USER,
                        Notification.SCOPE_KIND_EMPLOYEE,
                        "important",
                    )

            return request.send_info("INF_013")

        else:
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-role-teacher-score-update'])
    def put(self, request, pk=None):

        errors = []
        datas = request.data
        request_data = null_to_none(datas)
        instance = self.get_object()

        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')


        if year and season:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        serializer = self.get_serializer(instance, data=request_data)
        if serializer.is_valid(raise_exception=True):
            self.update(request, pk)

        else:
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-role-teacher-score-delete'])
    def delete(self, request, pk=None):
        "хандах эрх устгах "
        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if not year or not season:
            year, season = get_active_year_season()

        self.destroy(request, pk)

        return request.send_info("INF_003")


class TimetableTeacherAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Энэ хичээлийн жилийн улиралд хичээлийн хуваарьт шивэгдсэн багшийн жагсаалт '''

    queryset = Teachers.objects
    serializer_class = TeacherSerializer

    def get(self, request, pk=None):
        """
            тухайн идэвхитэй хичээлийн
            жил болон улиралд хамаарах
            хичээлийн хуваарьт зөвхөн багшийн жагсаалт
        """
        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if not season and year:
            year, season = get_active_year_season()

        if year and season:
            teach_id = TimeTable.objects.filter(lesson_year=year, lesson_season=season).values_list("teacher", flat=True)
            self.queryset = self.queryset.filter(id__in=teach_id)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


class TeacherAndLessonAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    ''' Хуваарьт шивэгдсэн багшийн заах хичээлүүд '''

    queryset = LessonStandart.objects
    serializer_class = LessonStandartSerializer


    def get(self, request):
        """
            Багшийн заах зөвхөн хичээлүүд
        """
        season = request.query_params.get('lesson_season') or request.query_params.get('season')
        year = request.query_params.get('lesson_year') or request.query_params.get('year')
        teacher = request.query_params.get('teacher')

        if not year or not season:
            year, season = get_active_year_season()
        if year and season:
            lesson_id = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=teacher).values_list("lesson", flat=True)

            if lesson_id:
                self.queryset = self.queryset.filter(id__in=lesson_id)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


class LessonTeacherScoretypeAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Дүгнэх хэлбэрийг харуулах жагсаалт '''

    queryset = Lesson_teacher_scoretype.objects
    serializer_class = Lesson_teacher_scoretypeSerializer

    def get(self, request):
        """
            Багшийн заах хичээлүүдийн
            дүгнэх хэлбэрийн жагсаалт
        """
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        include_registered = request.query_params.get('include_registered') == 'true'

        lesson_teacher_ids = Lesson_to_teacher.objects.filter(
            teacher=teacher,
            lesson=lesson,
        ).values_list("id", flat=True)

        # Админд зөвхөн багшийн оноо тохируулсан үндсэн хоёр төрөл харагдана.
        # Ингэснээр дүнгийн задаргаагүй хичээл дээр хоосон эрх үүсэхгүй.
        self.queryset = self.queryset.filter(
            lesson_teacher_id__in=lesson_teacher_ids,
            score_type__in=[
                Lesson_teacher_scoretype.BUSAD,
                Lesson_teacher_scoretype.SHALGALT_ONOO,
            ],
            score__gt=0,
        ).order_by(
            'score_type',
            '-score',
            'id',
        ).distinct('score_type')

        # Хуучин DB-д unique constraint бодитоор байхгүйгээс нэг багш-хичээл
        # дээр ижил үндсэн төрөл давхар үүссэн өгөгдөл байна. Админы эрхийн
        # dropdown-д төрөл бүрээс хамгийн өндөр (нийт) оноотой нэг мөрийг л
        # харуулж, Явцын дотоод 10/20/30 задаргааг тусдаа үндсэн эрх болгохгүй.

        if is_online_quiz_only_lesson(lesson, lesson_year, lesson_season):
            self.queryset = self.queryset.exclude(
                score_type=Lesson_teacher_scoretype.SHALGALT_ONOO
            )

        if lesson_year and lesson_season and not include_registered:
            registered_score_types = PermissionsTeacherScore.objects.filter(
                lesson_year=lesson_year,
                lesson_season_id=lesson_season,
                teacher_scoretype__lesson_teacher_id__in=lesson_teacher_ids,
            ).values_list('teacher_scoretype__score_type', flat=True)
            self.queryset = self.queryset.exclude(score_type__in=registered_score_types)

        data = self.list(request).data

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class PermissionOtherAPIView(
     mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Бусад хандах эрх '''

    queryset = PermissionsOtherInterval.objects.all().order_by("-created_at")
    serializer_class = PermissionsOtherIntervalSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['start_date', 'finish_date']

    def get_queryset(self):

        queryset = self.queryset
        permission_other_id = self.request.query_params.get('other')
        search_value = self.request.query_params.get('search')

        # Хандах эрхээр хайлт хийх
        if permission_other_id:
            queryset = queryset.filter(permission_type=permission_other_id)

        # хайлт хийх
        # if search_value:
        #     queryset = filter_queries(queryset.model, search_value)

        return queryset

    @has_permission(must_permissions=['lms-role-other-read'])
    def get(self, request, pk=None):
        """ Идэвхитэй жил, улиралтай хандах эрхийн жагсаалт
        """

        #  хандах эрхийн жагсаалт авах
        self.serializer_class = PermissionsOtherIntervalListSerializer

        # Идэвхтэй жил ,улирал
        season = request.query_params.get('lesson_season') or request.query_params.get('season')
        year = request.query_params.get('lesson_year') or request.query_params.get('year')

        if season and year:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data
        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-role-other-create'])
    def post(self, request):
        """
            Идэвхитэй жил, улиралд хандах эрхийг шинээр үүсгэнэ
        """

        errors = []
        request_datas = request.data

        request_data = null_to_none(request_datas)

        permission_type = request_data.get('permission_type')
        try:
            permission_type_name = dict(PermissionsOtherInterval.PERMISSION_TYPE).get(int(permission_type))
        except (TypeError, ValueError):
            return request.send_error('ERR_002', "Хандах эрх олдсонгүй.")
        if not permission_type_name:
            return request.send_error('ERR_002', "Хандах эрх олдсонгүй.")


        # Идэвхитэй жил улирал
        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        end_date = request_data.get('finish_date')

        qs = self.queryset.filter(lesson_year=year, lesson_season=season, permission_type=permission_type)
        if qs.exists():
            return request.send_error("ERR_002", " Тухайн хандах эрх бүртгэгдсэн байна")

        if season and year:
           self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):
            # Системийн хугацаа бүх багшид үйлчилдэг тул зөвшөөрөгдсөн,
            # одоо ажиллаж байгаа багш нарын Employee ID-г мэдэгдэлд ашиглана.
            approved_teacher_user_ids = Teachers.objects.filter(
                action_status=Teachers.APPROVED,
            ).values_list('user_id', flat=True)
            employee_ids = list(Employee.objects.filter(
                user_id__in=approved_teacher_user_ids,
                org_position__is_teacher=True,
                state=Employee.STATE_WORKING,
            ).values_list('id', flat=True).distinct())

            # Эрх болон мэдэгдлийг нэг transaction-д хадгална. Аль нэг нь
            # алдаа өгвөл дутуу өгөгдөл үлдээлгүй бүх өөрчлөлтийг буцаана.
            with transaction.atomic():
                serializer.save()
                if employee_ids:
                    create_notif(
                        request,
                        employee_ids,
                        "Таны {permission_type_name} нээгдлээ.".format(permission_type_name=permission_type_name),
                        "Дүн оруулах эрх {end_date}-д хаагдахыг анхаарна уу.".format(end_date=end_date),
                        Notification.FROM_KIND_USER,
                        Notification.SCOPE_KIND_EMPLOYEE,
                        "important",
                    )

            return request.send_info("INF_013")

        else:
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-role-other-update'])
    def put(self, request, pk=None):
        " Идэвхитэй жил, улиралд хандах эрхийн хугацааг засах "

        errors = []
        datas = request.data

        request_data = null_to_none(datas)
        instance = self.get_object()

        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if year and season:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        serializer = self.get_serializer(instance, data=request_data, partial=True)

        if 'permission_type_name' in request_data:
            request_data['permission_type_name']

        if 'department_name' in request_data:
            request_data['department_name']

        if 'user_name' in request_data:
            request_data['user_name']

        if serializer.is_valid(raise_exception=True):
            serializer.save()
        else:
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")


    @has_permission(must_permissions=['lms-role-other-delete'])
    def delete(self, request, pk=None):
        "Идэвхитэй жил, улиралд хандах эрхийг устгах "

        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if not season and year:
            year, season = get_active_year_season()

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class PermissionsStudentChoiceAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх '''

    queryset = PermissionsStudentChoice.objects.all().order_by("-created_at")
    serializer_class = PermissionsStudentChoiceSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code',  'description', 'start_date', 'finish_date']

    def get_queryset(self):

        queryset = self.queryset
        student = self.request.query_params.get('student')

        search_value = self.request.query_params.get('search')

        # Оюутнаар хайлт хийх
        if student:
            queryset = queryset.filter(student=student)

        # хайлт хийх
        # if search_value:
        #     queryset = filter_queries(queryset.model, search_value)

        return queryset

    @has_permission(must_permissions=['lms-role-choice-payment-read'])
    def get(self, request, pk=None):
        """ Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх жагсаалт
        """

        # Багшийн дүн оруулах хандах эрхийн жагсаалт авах
        self.serializer_class = PermissionsStudentChoiceListSerializer

        # Идэвхтэй жил ,улирал
        season = request.query_params.get('season')
        year = request.query_params.get('year')

        if season and year:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data
        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-role-choice-payment-create'])
    def post(self, request):
        """
            Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх
            шинээр үүсгэнэ

        """

        errors = []
        request_datas = request.data

        request_data = null_to_none(request_datas)

        student = request_data.get('student')

        if not student:
            return request.send_error('ERR_002', " Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх олдсонгүй.")


        # Идэвхитэй жил улирал
        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        qs = self.queryset.filter(lesson_year=year, lesson_season=season, student=student)
        if qs:
            return request.send_error("ERR_002", "Энэ оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх бүртгэгдсэн байна")

        if season and year:
           self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):
            self.create(request).data

            return request.send_info("INF_013")

        else:
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-role-choice-payment-update'])
    def put(self, request, pk=None):

        errors = []
        datas = request.data
        student = datas.get('student')

        request_data = null_to_none(datas)
        instance = self.get_object()

        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if year and season:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        serializer = self.get_serializer(instance, data=request_data)
        if serializer.is_valid(raise_exception=True):
            self.update(request, pk)

        else:
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-role-choice-payment-delete'])
    def delete(self, request, pk=None):
        "Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх устгах "

        season = request.query_params.get('lesson_season')
        year = request.query_params.get('lesson_year')

        if not season and year:
            year, season = get_active_year_season()

        self.destroy(request, pk)

        return request.send_info("INF_003")


class PermissionsStudentAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх '''

    queryset = Student.objects
    serializer_class = PermissionsStudentSerializer

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name']

    def get(self, request):
        """ Оюутны жагсаалт
        """
        # Идэвхтэй жил ,улирал
        season = request.query_params.get('season')
        year = request.query_params.get('year')

        if season and year:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)


        return_datas = self.list(request).data

        return request.send_data(return_datas)

class PermissionsStudentSelectAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх '''

    queryset = Student.objects
    serializer_class = PermissionsStudentSerializer

    def get(self, request):
        """ Оюутны жагсаалт
        """
        # Идэвхтэй жил ,улирал
        season = request.query_params.get('season')
        year = request.query_params.get('year')
        state = request.query_params.get('state')

        if state == '2':
            qs_start = (int(state) - 2) * 10
            qs_filter = int(state) * 10
        else:
            qs_start = (int(state) - 1) * 10
            qs_filter = int(state) * 10

        if season and year:
            self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season)

        self.queryset = self.queryset.order_by('id')[qs_start:qs_filter]
        return_datas = self.list(request).data
        return request.send_data(return_datas)

class PermissionsCheckAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Хандах эрх хугацаа шалгах '''

    queryset = PermissionsOtherInterval.objects
    serializer_class = PermissionsOtherIntervalListSerializer


    def get(self, request):
        """ Оюутны жагсаалт
        """
        # Идэвхтэй жил ,улирал
        permission_type = request.query_params.get('permission_type')

        is_check_date = False

        if permission_type:
            check_qs = self.queryset.filter(permission_type=int(permission_type)).first()
            now_date = datetime.now()

            if check_qs:
                start_date = check_qs.start_date
                finish_date = check_qs.finish_date

                if start_date <= now_date <= finish_date:
                    is_check_date = True

        return request.send_data(is_check_date)


class CrontabAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """ Мэдэгдэл илгээх тохиргоо """

    queryset = Crontab.objects.all().order_by('-created_at')
    serializer_class = CrontabSerializer

    pagination_class = CustomPagination

    filter_backend = [SearchFilter]
    search_fields = ['name', 'command']

    def get(self, request, pk=None):
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        all_datas = self.list(request).data

        return request.send_data(all_datas)

    def post(self, request):
        request_datas = request.data

        minute =  int(request_datas.get('minute')) if request_datas.get('minute') else None
        hour =   int(request_datas.get('hour')) if request_datas.get('hour') else None
        day =  int(request_datas.get('day')) if request_datas.get('day') else None
        month =  int(request_datas.get('month')) if request_datas.get('month') else None
        day_week =  int(request_datas.get('week')) if request_datas.get('week') else None

        timing = {
            'minute': minute,
            'hour': hour,
            'day': day,
            'month': month,
            'day_week': day_week,
        }

        timing = json_dumps(timing)

        command = request_datas.get('command')

        command_url = 'curl ' + get_service_url(request, command)

        name = request_datas.get('name')
        description = request_datas.get('description')
        is_active = request_datas.get('is_active')

        with transaction.atomic():
            try:
                obj = self.queryset.create(
                    name=name,
                    description=description,
                    is_active=is_active,
                    timing=timing,
                    command=command,
                )

                # Идэвхжүүлсэн үед
                if is_active:
                    add_crontab(
                        command_url,
                        minute,
                        hour,
                        day,
                        month,
                        day_week
                    )

            except Exception as e:

                if obj:
                    obj.is_active = False
                    obj.save()

                    remove_cron(request, obj)

                return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):

        cron_obj = self.get_object()

        remove_cron(request, cron_obj)

        self.destroy(request, pk)

        return request.send_info("INF_003")


class CrontabActiveAPIView(
    generics.GenericAPIView,
):
    """ Crontab идэвхжүүлэх """

    def get(self, request, pk=None):
        cron = Crontab.objects.filter(id=pk).first()
        command = cron.command

        timing = json_load(cron.timing)
        minute = timing.get('minute')
        hour = timing.get('hour')
        day = timing.get('day')
        month = timing.get('month')
        day_week = timing.get('day_week')

        command_url = 'curl ' + get_service_url(request, command)

        try:
            add_crontab(
                command_url,
                minute,
                hour,
                day,
                month,
                day_week
            )

            cron.is_active = True
            cron.save()

        except Exception as e:
            return request.send_error('ERR_002')

        return request.send_info('INF_017')


class CrontabLimitAPIView(
    generics.GenericAPIView,
):
    """ Crontab зогсоох """

    def get(self, request, pk=None):
        cron = Crontab.objects.filter(id=pk).first()

        remove_cron(request, cron)

        cron.is_active = False
        cron.save()

        return request.send_info("INF_016")

@require_GET
def send_attendance(request):
    """ Ирцийн мэдээлэл захирал руу илгээх """

    print('vdsvsvd')
    print('vdsvsvd')

    return request.send_info('INF_001')
