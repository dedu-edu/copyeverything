import os
import traceback
import pandas as pd
from django.utils import timezone
from datetime import datetime, timedelta

from collections import defaultdict
import json

from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.decorators import login_required

from core.fns import WithChoices, ArrayLength
from django.contrib.postgres.aggregates import StringAgg

from main.utils.function.pagination import CustomPagination, RawQueryCustomPagination
from main.utils.file import save_file, remove_folder
from main.utils.function.utils import build_filters_dict, get_week_num_from_date, qs_simple_filter, safe_get, str2bool, remove_key_from_dict, isLightOrDark, get_active_year_season, magicFunction, get_dates_from_week, get_lesson_choice_student
from main.utils.function.utils import has_permission, get_error_obj, get_fullName, get_teacher_queryset, get_weekday_kurats_date, start_time, end_time, get_weeks, dict_fetchall, get_translated_serializer_errors

from django.db import transaction
from django.conf import settings
from django.db import connection
from django.db.models import Q, Count, Case, When,F, Min, Max, FloatField, Value, IntegerField, Exists, OuterRef, Subquery, CharField, Sum,ExpressionWrapper, BooleanField
from django.db.models.functions import Concat, Upper, Substr, Coalesce
from django.db.models.expressions import RawSQL
from django.contrib.postgres.fields import ArrayField
from django.db.models.functions import ExtractHour, ExtractMinute


from core.models import Employee, OrgPosition, Teachers, SubOrgs
from lms.models import ExamToLevelGroup, ExamToSubGroup, LevelGroup, Room, IrtsQr, RegisterIrts, SubGroup
from lms.models import Season
from lms.models import Lesson_to_teacher
from lms.models import Building
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import ExamTimeTable
from lms.models import Exam_to_group
from lms.models import Student
from lms.models import TimeTable_to_student
from lms.models import Group
from lms.models import Exam_repeat
from lms.models import ScoreRegister
from lms.models import LessonStandart
from lms.models import SystemSettings
from lms.models import LearningPlan
from lms.models import TeacherCreditVolumePlan
from lms.models import TeacherCreditVolumePlan_group
from lms.models import Exam_to_student
from lms.models import (
    Challenge,
    TeacherScore,
    ChallengeStudents,
    DefinitionSignature,
    Lesson_teacher_scoretype,
    Score
)

from .serializers import Exam_repeatLiseSerializer, Exam_repeatSerializer, LessonsScheduleSerializer, TimeTableOneSerializer
from .serializers import RoomSerializer
from .serializers import BuildingSerializer
from .serializers import TimeTableSerializer
from .serializers import TimeTableListSerializer
from .serializers import RoomListSerializer
from .serializers import RoomInfoSerializer
from .serializers import ExamTimeTableSerializer
from .serializers import ExamTimeTableListSerializer
from .serializers import StudentScoreListSerializer
from .serializers import PotokSerializer
from .serializers import ExamTimeTableAllSerializer
from .serializers import (
    TimetablePrintSerializer,
    ChallengeStudentsSerializer,
    TeacherScoreStudentsSerializer,
)
from surgalt.serializers import ChallengeListSerializer

@permission_classes([IsAuthenticated])
class BuildingAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн байр """

    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

    @has_permission(must_permissions=['lms-timetable-building-read'])
    def get(self, request, pk=None):
        " хичээлийн байр жагсаалт "

        if pk:
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-timetable-building-create'])
    def post(self, request):
        " хичээлийн байр шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.perform_create(serializer)
            except Exception:
                return request.send_error("ERR_002")
            return request.send_info("INF_001")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-timetable-building-update'])
    def put(self, request, pk=None):
        " хичээлийн байр засах "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.perform_update(serializer)
            except Exception:
                return request.send_error("ERR_002")
            return request.send_info("INF_001")

        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-timetable-building-delete'])
    def delete(self, request, pk=None):
        " хичээлийн байр устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RoomAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Өрөө """

    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    @has_permission(must_permissions=['lms-timetable-room-read'])
    def get(self, request, pk=None):
        " Өрөө жагсаалт "
        self.serializer_class = RoomInfoSerializer

        if pk:
            room = self.retrieve(request, pk).data
            return request.send_data(room)

        room_list = self.list(request).data
        return request.send_data(room_list)

    @has_permission(must_permissions=['lms-timetable-room-create'])
    def post(self, request):
        " Өрөө шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            self.create(request).data
            return request.send_info("INF_001")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

    @has_permission(must_permissions=['lms-timetable-room-update'])
    def put(self, request, pk=None):
        " Өрөө засах "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.update(request).data
            except Exception:
                return request.send_error("ERR_002")
        else:
            errors = []
            for key in serializer.errors:
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)


        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-timetable-room-delete'])
    def delete(self, request, pk=None):
        " Өрөө устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RoomListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Өрөө """

    queryset = Room.objects
    serializer_class = RoomListSerializer

    def get_queryset(self):
        queryset = self.queryset
        room_type = self.request.query_params.get('room_type')
        if room_type:
            queryset = queryset.filter(type=room_type)

        return queryset

    def get(self, request):
        all_list = self.list(request).data
        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class TimeTableAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Цагийн хуваарь """

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['room__code', 'room__name', 'day', 'time', 'lesson__name', 'teacher__first_name']

    @has_permission(must_permissions=['lms-timetable-register-read'])
    def get(self, request, pk=None):
        "  Цагийн хуваарь жагсаалт "

        self.serializer_class = TimeTableListSerializer
        if pk:
            instance = self.queryset.filter(pk=pk).prefetch_related('sub_group', 'level_group').first()
            time_table = TimeTableOneSerializer(instance, many=False).data
            return request.send_data(time_table)

        time_table_list = self.list(request).data

        return request.send_data(time_table_list)

    @has_permission(must_permissions=['lms-timetable-register-create'])
    def post(self, request):
        " Цагийн хуваарь шинээр үүсгэх "

        st_time = start_time()
        errors = []
        user = request.user

        kweek_days = []
        kweek_list = []
        all_group_student_count = 0

        request_data = request.data
        queryset = self.queryset

        # Ангийн жагсаалт
        group_data = request_data.get('group')
        group_ids = [item.get('id') if not isinstance(item, int) else item for item in group_data]
        lesson = request_data.get('lesson')

        # Хичээлийн жил улирал ирэхгүй бол
        lesson_year, lesson_season = get_active_year_season()

        teacher = request_data.get('teacher')
        time = request_data.get('time')
        day = request_data.get('day')
        room = request_data.get('room')
        odd_even = request_data.get('odd_even_list')
        st_count = request_data.get('st_count')
        support_teacher = request_data.get('support_teacher')

        if 'support_teacher' in request_data:
            del request_data['support_teacher']

        # Туслах багш
        if support_teacher:
            request_data['support_teacher'] = [support_teacher]

        # Энгийн хичээлийн хуваарь
        is_simple = request_data.get('is_simple')

        # block хичээлийн хуваарь
        is_block = request_data.get('is_block')
        begin_week = request_data.get('begin_week')
        end_week = request_data.get('end_week')

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        begin_date = request_data.get('begin_date')
        end_date = request_data.get('end_date')

        # Курац хуваарийн өдрүүдийн хэддүгээр 7 хоног вэ гэдгийн жагсаалт
        kweek_ids = []

        kurats_times = request_data.get('kurats_time')

        add_students = request_data.get('students')
        remove_students = request_data.get('remove_students')

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Онлайн хичээл эсэх
        study_type = request_data.get('study_type')

        # Онлайнаар хичээл үзэх анги
        add_online_group = request_data.get('addgroup')
        add_online_group_ids = [item.get('id') if not isinstance(item, int) else item for item in add_online_group]

        if 'lesson_year' in request_data and not request_data['lesson_year']:
            request_data['lesson_year'] = lesson_year

        if 'lesson_season' in request_data and not request_data['lesson_season']:
            request_data['lesson_season'] = lesson_season

        if study_type != TimeTable.ONLINE and not is_kurats and not room:

            errors = get_error_obj("Хоосон байна.", 'room')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        if not is_kurats:
            qs_timetable = self.queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even__in=odd_even)

        # Курац байх үед сонгосон өдрүүдийн гаригууд, цагуудтай ижил хуваариудыг авна.
        if is_kurats:
            kweek_list = get_weekday_kurats_date(begin_date, end_date)
            for kweek in kweek_list:
                kweek_days.append(kweek.get('weekday'))
                kweek_ids.append(kweek.get('weekNum'))

            qs_timetable = self.queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day__in=kweek_days, time__in=kurats_times, odd_even__in=odd_even, end_date__gt=begin_date, end_date__lt=end_date)

        timetable_ids = qs_timetable.values_list('id', flat=True)

        # Ангийн өгөгдлийг dataнаас устгах
        request_data = remove_key_from_dict(request_data, 'group')

        # Сонгон хичээл биш үед анги заавал бөглөх ёстой
        if not is_optional and not group_data:
            msg = "Хоосон байна"
            errors = get_error_obj(msg, 'group')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        request_data['created_user'] = user.id
        if not request_data.get('school'):
            lesson_data = LessonStandart.objects.get(id=lesson)
            if lesson_data and lesson_data.school:
                request_data['school'] = lesson_data.school.id if lesson_data else None

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):
            # Сонгосон ангийн тоог авах хэсэг
            merge_groups = group_ids + add_online_group_ids
            group_student_count = Student.objects.filter(group_id__in=merge_groups).count()
            all_group_student_count += group_student_count

            if len(remove_students) > 0:
                all_group_student_count -= len(remove_students)

            if len(add_students) > 0:
                all_group_student_count += len(add_students)

            # Хуваарийн суралцагчдын тоо хуваарьд шивэгдсэн ангиудын хүүхдийн тооноос бага байгаа эсэх
            if all_group_student_count > int(st_count):
                msg = "Сонгосон ангиудын нийт оюутны тоо хуваарийн суралцагчийн тооноос хэтэрсэн байна."
                errors = get_error_obj(msg, 'st_count')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            qs_teacher = qs_timetable.filter(teacher_id=teacher)

            # Багшийн давхцал
            if len(qs_teacher) > 0:
                teacher_obj = qs_teacher.last()
                lesson = teacher_obj.lesson.name
                time = teacher_obj.time
                day = teacher_obj.day

                msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                errors = get_error_obj(msg, 'teacher')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            # Өрөөний давхцал
            if study_type != TimeTable.ONLINE and room:
                qs_room = qs_timetable.filter(room_id=room)
                if len(qs_room) > 0:
                    room_obj = qs_room.last()
                    lesson = room_obj.lesson.name
                    msg = "Энэ өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                    errors = get_error_obj(msg, 'room')
                    if len(errors) > 0:
                        return request.send_error("ERR_003", errors)

            # Block болон курац хуваарь үед тухайн сонгогдсон ангийн энгийн хичээлийн хуваарийн өдөр цагтай давхцаж байгааг шалгах
            if not is_simple:
                timetable_simple_ids = qs_timetable.filter(is_kurats=False, is_block=False).values_list('id', flat=True)
                for group_id in group_data:
                    for timetable_id in timetable_simple_ids:
                        qs_kurats = TimeTable_to_group.objects.filter(group_id=group_id, timetable_id=timetable_id)
                        timetable_simple = TimeTable.objects.get(id=timetable_id)

                        if qs_kurats:
                            lesson_name = timetable_simple.lesson.name

                            day = timetable_simple.day
                            time = timetable_simple.time

                            msg = "{day}-{time} дээр {lesson_name} хичээлийн хуваарьтай давхцаж байна.".format(lesson_name=lesson_name, day=day, time=time)
                            if is_kurats:
                                key = 'begin_date'
                            else:
                                key = 'begin_week'

                            errors = get_error_obj(msg, key)

                            return request.send_error("ERR_003", errors)

            if not is_optional:
                merge_group_data = group_data
                # Онлайнаар хичээл үзэх ангийн хичээлийг давхар шалгана
                if len(add_online_group) > 0:
                    merge_group_data += add_online_group

                for timetable_id in timetable_ids:
                    qs = self.queryset.get(pk=timetable_id)
                    # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
                    lesson = qs.lesson.name

                    for group_id in merge_group_data:

                        # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                        qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=group_id)
                        if qs_timetable_group:
                            qs_groups = qs_timetable_group.last()
                            group_name = qs_groups.group.name
                            msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=lesson, day=day, time=time)
                            errors = get_error_obj(msg, 'group')
                            if len(errors) > 0:
                                return request.send_error("ERR_003", errors)

                # Block хуваарь нь сонгогдсон 7 хоногууд дээр тухайн анги хичээлтэй эсэх
                if is_block:
                    block_timetables = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, is_kurats=False)

                    for btimetable in block_timetables:
                        lesson = btimetable.lesson.name

                        # Эхлэх 7 хоногоос дуусах 7 хоногуудын хоорондох 7 хоног бүрээр шалгах
                        for block_week in range(begin_week, end_week + 1):
                            for group_id in group_data:
                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable=btimetable, group_id=group_id).last()

                                if qs_timetable_group:
                                    group_name = qs_timetable_group.group.name

                                    t_begin_week = btimetable.begin_week
                                    t_end_week = btimetable.end_week

                                    if t_begin_week == block_week or t_end_week == block_week:
                                        key = 'begin_week'
                                        if block_week == end_week:
                                            key = 'end_week'

                                        msg = '{group_name} анги нь {day}-{time} дээр {block_week}-р 7 хоногт {lesson} хичээлийн хуваарьтай байна'.format(
                                            group_name=group_name,
                                            day=day,
                                            time=time,
                                            block_week=block_week,
                                            lesson=lesson
                                        )

                                        errors = get_error_obj(msg, key)
                                        if len(errors) > 0:
                                            return request.send_error("ERR_003", errors)

                # Нэмэлтээр судлаж байгаа оюутны хуваарийг шалгах
                if len(add_students) > 0:
                    qs_students = Student.objects.filter(id__in=add_students).values('group', 'code', 'id')

                    # Сонгосон ангийн оюутан нэмэлтээр элсэгч оюутнаар нэмэгдэж байгаа эсэх
                    for student in qs_students:
                        student_code = student.get('code')
                        student_group = student.get('group')
                        student_id = student.get('id')

                        # Нэмэлт элсэгчийн оюутны нэмэлт хуваарь болон хасалт хийлгэсэн байх queryset
                        qs_student = TimeTable_to_student.objects.filter(student_id=student_id)

                        # Сонгогдсон ангийн оюутан эсэхийг шалгах
                        if group_data:
                            for group in group_data:
                                obj_group = Group.objects.filter(pk=group.get('id')).last()

                                if group.get('id') == student_group:
                                    msg = "{student_code}-той оюутан нь {group_name} анги учир давхар хуваарь сонгох боломжгүй.".format(student_code=student_code, group_name=obj_group.name)

                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                        for timetable_id in timetable_ids:
                            rm_timetable_id = ''
                            qs = TimeTable.objects.filter(pk=timetable_id).first()
                            lesson = qs.lesson.name # Давхардаж байгаа хичээлийн нэр

                            # Өөрөөсөө өөр нэмэлт хуваариуд
                            qs_student_timetable = qs_student.filter(add_flag=True, timetable_id=timetable_id)

                            if len(qs_student_timetable) > 0:
                                msg = "{student_code}-той оюутан нь {day}-{time} дээр {lesson} хичээлийн нэмэлт хуваарьтай байна.".format(student_code=student_code, lesson=lesson, day=day, time=time)
                                error_obj = get_error_obj(msg, 'student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

                            # Тухайн оюутан ангийн хувиараасаа хасалт хийлгэсэн эсэх
                            qs_student_rm = qs_student.filter(add_flag=False).last()
                            if len(qs_student_rm) > 0:
                                rm_timetable_id = qs_student_rm.timetable_id # Нэмэлтээр судлаж байгаа оюутны хасалт хийлгэсэн хуваарь

                            # Хасалт хийлгээгүй үед л нэмэлтээр судалж байгаа оюутны ангийг тухайн хуваарь дээр хичээтэйг шалгана
                            if len(qs_student_rm) > 0 and rm_timetable_id != timetable_id:

                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=student_group).last()
                                student_group_qs = Group.objects.filter(id=student_group).last()

                                if len(qs_timetable_group) > 0:
                                    msg = "{student_code}-той оюутны {group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(student_code=student_code, group_name=student_group_qs.name, lesson=lesson, day=day, time=time)
                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                    # Сонгоогүй ангийн оюутан хасалт хийлгэсэн  эсэхийг шалгах
                    if len(remove_students) > 0:
                        qs_rm_students = Student.objects.filter(id__in=remove_students).values('group', 'code')
                        for rm_students in qs_rm_students:
                            student_rm_code = rm_students.get('code')
                            student_rm_group = rm_students.get('group')

                            if len(group_data) > 0:
                                group_ids = [item.get('id') for item in group_data]

                                if student_rm_group not in group_ids:
                                    msg = "{student_code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хуваариас хасалт хийх боломжгүй.".format(student_code=student_rm_code)
                                    error_obj = get_error_obj(msg, 'exclude_student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)
            end_time(st_time, 'Шалгалт хийж дуусах хугацаа')
            try:
                with transaction.atomic():
                    # Тухайн хичээлийн хуваарьт байгаа багш хичээл холбогдоогүй бол шинээр үүсгэх
                    Lesson_to_teacher.objects.update_or_create(
                        lesson_id=request_data.get('lesson'),
                        teacher_id=request_data.get('teacher'),
                        defaults={'is_active': True}
                    )

                    if study_type == TimeTable.COMBINED and len(add_online_group) > 0:
                        group_data = magicFunction(group_data, add_online_group)

                    if is_kurats:
                        kurats_ids = []
                        for kweek in kweek_list:
                            kday = kweek.get('weekday')
                            weekNum = kweek.get('weekNum')
                            for ktime in kurats_times:
                                request_data['day'] = kday
                                request_data['time'] = ktime
                                request_data['week_number'] = weekNum

                                kserializer = self.get_serializer(data=request_data)
                                kserializer.is_valid(raise_exception=True)

                                self.perform_create(kserializer)

                                table_data = kserializer.data

                                # Цагийн хуваарийн хүснэгтийн id
                                table_id = table_data.get('id')
                                kurats_ids.append(table_id)

                                # Хуваарь дээр ангиуд шивэх хэсэг
                                if len(group_data) > 0:
                                    group_datas = []
                                    for row in group_data:
                                        group_id = row.get("id")
                                        group_datas.append(
                                            TimeTable_to_group(
                                                group_id=row.get("id"),
                                                timetable_id=table_id
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(group_datas)

                                # Онлайнаар үзэж байгаа ангиудыг хадгалах
                                if len(add_online_group) > 0:
                                    add_online_group_datas = []
                                    for row in add_online_group:
                                        add_online_group_datas.append(
                                            TimeTable_to_group(
                                                group_id=row.get("id"),
                                                timetable_id=table_id,
                                                is_online = True
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(add_online_group_datas)

                                # Нэмэлтээр үзэж байгаа оюутан
                                if len(add_students) > 0:
                                    add_students_datas = []
                                    for student in add_students:
                                        add_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = student,
                                                add_flag = True
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(add_students_datas)

                                # Хувиараас хасалт хийлгэж байгаа оюутан
                                if len(remove_students) > 0:
                                    remove_students_datas = []
                                    for rstudent in remove_students:
                                        remove_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = rstudent,
                                                add_flag = False
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(remove_students_datas)

                        # Курац parent ids хадгалах
                        parent_id = kurats_ids[0]

                        qs_timetable = TimeTable.objects.filter(id__in=kurats_ids).update(
                            parent_kurats=parent_id
                        )
                    else:
                        table_data = self.create(request).data

                        # Цагийн хуваарийн хүснэгтийн id
                        table_id=table_data.get('id')

                        # Хуваарь дээр ангиуд шивэх хэсэг
                        if len(group_data) > 0:
                            group_datas = []

                            for row in group_data:
                                group_id = row.get("id")
                                group_datas.append(
                                    TimeTable_to_group(
                                        group_id=row.get("id"),
                                        timetable_id=table_id
                                    )
                                )

                            TimeTable_to_group.objects.bulk_create(group_datas)

                        # Онлайнаар үзэж байгаа ангиудыг хадгалах
                        if len(add_online_group) > 0:
                            add_online_group_datas = []
                            for row in add_online_group:
                                add_online_group_datas.append(
                                    TimeTable_to_group(
                                        group_id=row.get("id"),
                                        timetable_id=table_id,
                                        is_online = True
                                    )
                                )

                            TimeTable_to_group.objects.bulk_create(add_online_group_datas)

                        # Нэмэлтээр үзэж байгаа оюутан
                        if len(add_students) > 0:
                            add_students_datas = []
                            for student in add_students:
                                add_students_datas.append(
                                    TimeTable_to_student(
                                        timetable_id = table_id,
                                        student_id = student,
                                        add_flag = True
                                    )
                                )

                            TimeTable_to_student.objects.bulk_create(add_students_datas)

                        # Хувиараас хасалт хийлгэж байгаа оюутан
                        if len(remove_students) > 0:
                            remove_students_datas = []
                            for rstudent in remove_students:
                                remove_students_datas.append(
                                    TimeTable_to_student(
                                        timetable_id = table_id,
                                        student_id = rstudent,
                                        add_flag = False
                                    )
                                )

                            TimeTable_to_student.objects.bulk_create(remove_students_datas)

                    end_time(st_time, 'Хадгалах хугацаа')
                    return request.send_info("INF_001")
            except Exception as e:
                print(e)
                return request.send_error("ERR_002", "Хичээлийн хуваарь давхцаж байна.")
        else:
            print(serializer.errors)
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-timetable-register-update'])
    def put(self, request, pk=None):
        "  Цагийн хуваарь засах "

        errors = []
        kweek_days = []
        kweek_list = []
        all_group_student_count = 0
        user = request.user

        request_data = request.data

        request_data['updated_user'] = user.id
        request_data['updated_at'] = timezone.now()

        instance = TimeTable.objects.get(pk=pk)

        old_potok = instance.potok
        old_lesson = instance.lesson

        lesson = request_data.get('lesson')

        teacher = request_data.get('teacher')
        time = request_data.get('time')
        day = request_data.get('day')
        room = request_data.get('room')
        odd_even = request_data.get('odd_even_list')
        st_count = request_data.get('st_count')

        support_teacher = request_data.get('support_teacher')

        if 'support_teacher' in request_data:
            del request_data['support_teacher']

        # Туслах багш
        if support_teacher:
            request_data['support_teacher'] = [support_teacher]
        elif instance.support_teacher and not support_teacher:
            request_data['support_teacher'] = []

        lesson_year, lesson_season = get_active_year_season()

        # Энгийн хичээлийн хуваарь
        is_simple = request_data.get('is_simple')

        # block хичээлийн хуваарь
        is_block = request_data.get('is_block')
        begin_week = request_data.get('begin_week')
        end_week = request_data.get('end_week')
        study_type = request_data.get('study_type')

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        begin_date = request_data.get('begin_date')
        end_date = request_data.get('end_date')
        kurats_times = request_data.get('kurats_time')

        # Нэмэлтээр судлаж буй оюутнууд
        add_students = request_data.get('add_students')
        remove_students = request_data.get('remove_students')

        # Орж ирсэн group ids
        new_group_ids = []

        # Ангийн жагсаалт
        group_data = request_data.get('group')

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Хуучин курац хуваарийн ids
        old_timetable_ids = TimeTable.objects.filter(is_kurats=True, potok=old_potok, lesson=old_lesson).values_list('id', flat=True)

        if study_type != TimeTable.ONLINE and not room:

            errors = get_error_obj("Хоосон байна.", 'room')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        # Курац байх үед сонгосон өдрүүдийн гаригууд, цагуудтай ижил хуваариудыг авна.
        if is_kurats:
            queryset = self.queryset.exclude(id__in=old_timetable_ids)

            kweek_list = get_weekday_kurats_date(begin_date, end_date)
            for kweek in kweek_list:
                kweek_days.append(kweek.get('weekday'))

                qs_timetable = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day__in=kweek_days, time__in=kurats_times, odd_even__in=odd_even)

        else:
            queryset = self.queryset.exclude(id=pk)

            qs_timetable = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even__in=odd_even)

        timetable_ids = qs_timetable.values_list('id', flat=True)

        # Ангийн өгөгдлийг dataнаас устгах
        request_data = remove_key_from_dict(request_data, 'group')

        # Сонгон хичээл биш үед анги заавал бөглөх ёстой
        if not is_optional and not group_data:
            msg = "Хоосон байна"
            error_obj = get_error_obj(msg, 'group')
            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        serializer = self.get_serializer(instance, data=request_data, partial=True)

        if serializer.is_valid(raise_exception=False):

            # Сонгосон ангийн тоог авах хэсэг
            group_ids = [item.get('id') for item in group_data]
            group_student_count = Student.objects.filter(group_id__in=group_ids).count()
            all_group_student_count += group_student_count

            if remove_students:
                all_group_student_count -= len(remove_students)

            if add_students:
                all_group_student_count += len(add_students)

            # Хуваарийн суралцагчдын тоо хуваарьд шивэгдсэн ангиудын хүүхдийн тооноос бага байгаа эсэх
            if st_count and all_group_student_count > int(st_count):
                msg = "Сонгосон ангиудын нийт оюутны тоо хуваарийн суралцагчийн тооноос хэтэрсэн байна."
                errors = get_error_obj(msg, 'st_count')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            qs_teacher = qs_timetable.filter(teacher_id=teacher).first()
            qs_room = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, room_id=room, day=day, time=time).first()

            # Тухайн багшийн давхцлыг шалгах
            if qs_teacher != None:
                lesson = qs_teacher.lesson.name
                time = qs_teacher.time
                day = qs_teacher.day

                msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                error_obj = get_error_obj(msg, 'teacher')
                if len(error_obj) > 0:
                    return request.send_error("ERR_003", error_obj)

            # Тухайн өрөөний давхцлыг шалгах
            if not is_kurats and len(qs_timetable) > 0:
                qs_room = qs_timetable.filter(room_id=room).first()
                if qs_room:
                    lesson = qs_room.lesson.name
                    msg = "Энэ өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                    error_obj = get_error_obj(msg, 'room')
                    if len(error_obj) > 0:
                        return request.send_error("ERR_003", error_obj)

            # Block болон курац хуваарь үед тухайн сонгогдсон ангийн энгийн хичээлийн хуваарийн өдөр цагтай давхцаж байгааг шалгах
            if not is_simple:
                timetable_simple_ids = qs_timetable.filter(is_kurats=False, is_block=False).values_list('id', flat=True)
                for group in group_data:

                    qs_kurats_group = TimeTable_to_group.objects.filter(group_id=group.get('id'), timetable_id__in=timetable_simple_ids)
                    timetable_simple = TimeTable.objects.exclude(id=pk).filter(id__in=timetable_simple_ids).last()

                    if len(qs_kurats_group) > 0:
                        lesson_name = timetable_simple.lesson.name

                        day = timetable_simple.day
                        time = timetable_simple.time

                        msg = "{day}-{time} дээр {lesson_name} хичээлийн хуваарьтай давхцаж байна.".format(lesson_name=lesson_name, day=day, time=time)
                        if is_kurats:
                            key = 'begin_date'
                        else:
                            key = 'begin_week'

                        errors = get_error_obj(msg, key)

                        return request.send_error("ERR_003", errors)

            # Сонгон хичээл биш тухайн ангийн хичээлийн хуваарийн давхцалыг шалгах
            if not is_optional and len(timetable_ids) > 0:
                qs = queryset.filter(id__in=timetable_ids).first()

                # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
                lesson = qs.lesson.name

                for group in group_data:
                    group_id = group.get('id')

                    # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                    qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=qs.id, group_id=group_id).first()
                    if qs_timetable_group != None:
                        group_name = qs_timetable_group.group.name
                        msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=lesson, day=day, time=time)
                        errors = get_error_obj(msg, 'group')
                        if len(errors) > 0:
                            return request.send_error("ERR_003", errors)

                # Block хуваарь нь сонгогдсон 7 хоногууд дээр тухайн анги хичээлтэй эсэх
                if is_block:
                    block_timetables = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, is_block=True)

                    for btimetable in block_timetables:
                        lesson = btimetable.lesson.name

                        # Эхлэх 7 хоногоос дуусах 7 хоногуудын хоорондох 7 хоног бүрээр шалгах
                        for block_week in range(begin_week, end_week + 1):
                            for group in group_data:
                                group_id = group.get('id')
                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable=btimetable, group_id=group_id).first()

                                if len(qs_timetable_group) > 0:
                                    group_name = qs_timetable_group.group.name

                                    t_begin_week = btimetable.begin_week
                                    t_end_week = btimetable.end_week

                                    if t_begin_week == block_week or t_end_week == block_week:
                                        key = 'begin_week'
                                        if block_week == end_week:
                                            key = 'end_week'

                                        msg = '{group_name} анги нь {day}-{time} дээр {block_week}-р 7 хоногт {lesson} хичээлийн хуваарьтай байна'.format(
                                            group_name=group_name,
                                            day=day,
                                            time=time,
                                            block_week=block_week,
                                            lesson=lesson
                                        )

                                        errors = get_error_obj(msg, key)
                                        if len(errors) > 0:
                                            return request.send_error("ERR_003", errors)

                # Нэмэлтээр судлаж байгаа оюутны хуваарийг шалгах
                if add_students:
                    qs_students = Student.objects.filter(id__in=add_students).values('group', 'code', 'id')

                    # Сонгосон ангийн оюутан нэмэлтээр элсэгч оюутнаар нэмэгдэж байгаа эсэх
                    for student in qs_students:
                        student_code = student.get('code')
                        student_group = student.get('group')
                        student_id = student.get('id')

                        # Нэмэлт элсэгчийн оюутны нэмэлт хуваарь болон хасалт хийлгэсэн байх queryset
                        qs_student = TimeTable_to_student.objects.filter(student_id=student_id)

                        # Сонгогдсон ангийн оюутан эсэхийг шалгах
                        if group_data:
                            for group in group_data:
                                sgroup_id = group.get('id')
                                obj_group = qs_group.filter(pk=group.get('id')).first()

                                if sgroup_id == student_group:
                                    msg = "{student_code}-той оюутан нь {group_name} анги учир давхар хуваарь сонгох боломжгүй.".format(student_code=student_code, group_name=obj_group.name)

                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                        for timetable_id in timetable_ids:
                            rm_timetable_id = ''

                            qs = TimeTable.objects.filter(pk=timetable_id).first()
                            lesson = qs.lesson.name # Давхардаж байгаа хичээлийн нэр

                            # Өөрөөсөө өөр нэмэлт хуваариуд
                            qs_student_timetable = qs_student.exclude(timetable_id=pk).filter(add_flag=True, timetable_id=timetable_id)

                            if len(qs_student_timetable) > 0:
                                msg = "{student_code}-той оюутан нь {day}-{time} дээр {lesson} хичээлийн нэмэлт хуваарьтай байна.".format(student_code=student_code, lesson=lesson, day=day, time=time)
                                error_obj = get_error_obj(msg, 'student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

                            # Тухайн оюутан ангийн хувиараасаа хасалт хийлгэсэн эсэх
                            qs_student_rm = qs_student.exclude(timetable_id=pk).filter(add_flag=False).first()
                            if qs_student_rm != None:
                                rm_timetable_id = qs_student_rm.timetable_id # Нэмэлтээр судлаж байгаа оюутны хасалт хийлгэсэн хуваарь

                            # Хасалт хийлгээгүй үед л нэмэлтээр судалж байгаа оюутны ангийг тухайн хуваарь дээр хичээлтэйг шалгана
                            if qs_student_rm != None and rm_timetable_id != timetable_id:

                                qs_timetable = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=student_group).first()
                                student_group_qs = qs_group.filter(id=student_group).first()

                                if qs_timetable != None:
                                    msg = "{student_code}-той оюутны {group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(student_code=student_code, group_name=student_group_qs.name, lesson=lesson, day=day, time=time)
                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                # Сонгоогүй ангийн оюутан хасалт хийлгэсэн  эсэхийг шалгах
                if remove_students:
                    qs_rm_students = Student.objects.filter(id__in=remove_students).values('group', 'code')
                    for rm_students in qs_rm_students:
                        student_rm_code = rm_students.get('code')
                        student_rm_group = rm_students.get('group')

                        if group_data:
                            group_ids = []
                            for group in group_data:
                                group_ids.append(group.get('id'))

                            if student_rm_group not in group_ids:
                                msg = "{student_code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хуваариас хасалт хийх боломжгүй.".format(student_code=student_rm_code)
                                error_obj = get_error_obj(msg, 'exclude_student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

            try:
                with transaction.atomic():
                    # Тухайн хичээлийн хуваарьт байгаа багш хичээл холбогдоогүй бол шинээр үүсгэх
                    qs_lesson_teacher = Lesson_to_teacher.objects.filter(lesson=request_data.get('lesson'), teacher=request_data.get('teacher'))

                    if len(qs_lesson_teacher) == 0:
                        Lesson_to_teacher.objects.create(
                            lesson_id=request_data.get('lesson'),
                            teacher_id=request_data.get('teacher')
                        )

                    # Цагийн хуваарийн хүснэгтийн id
                    qs = TimeTable_to_group.objects.filter(timetable_id=pk)
                    qs_stu = TimeTable_to_student.objects.filter(timetable_id=pk)

                    # Хуучин ангийн ids
                    old_group_ids = list(qs.values_list('group', flat=True))

                    students_ids = qs_stu.filter(add_flag=False).values_list('student', flat=True)
                    student_group_ids = Student.objects.filter(id__in=students_ids).values('group', 'id')
                    kurats_ids = []
                    if is_kurats:
                        if len(old_timetable_ids) > 0:
                            old_queysets = TimeTable.objects.filter(id__in=old_timetable_ids)
                            if old_queysets:
                                old_queysets.delete()

                                request_data = remove_key_from_dict(request_data, ['event_id', 'parent_kurats'])

                        for kweek in kweek_list:
                            kday = kweek.get('weekday')

                            for ktime in kurats_times:
                                request_data['day'] = kday
                                request_data['time'] = ktime

                                kserializer = TimeTableSerializer(data=request_data)

                                kserializer.is_valid(raise_exception=True)

                                self.perform_create(kserializer)

                                table_data = kserializer.data

                                # Цагийн хуваарийн хүснэгтийн id
                                table_id = table_data.get('id')
                                kurats_ids.append(table_id)

                                # Хувиараас хасалт хийлгэж байгаа оюутан хадгалах хэсэг
                                if remove_students:
                                    add_remove_students = []
                                    for rstudent in remove_students:
                                        add_remove_students.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = rstudent,
                                                add_flag = False
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(add_remove_students)

                                # Хуваарь дээр ангиуд шивэх хэсэг
                                if group_data:
                                    group_add_datas = []
                                    for row in group_data:
                                        group_add_datas.append(
                                            TimeTable_to_group(
                                                timetable_id = table_id,
                                                group_id =  row.get("id")
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(group_add_datas)

                                # Нэмэлтээр үзэж байгаа оюутан хадгалах хэсэг
                                if add_students:
                                    add_students_datas = []
                                    for student in add_students:
                                        add_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = student,
                                                add_flag = True
                                            )
                                        )
                                    TimeTable_to_student.objects.bulk_create(add_students_datas)

                        # Курац parent ids хадгалах
                        parent_id = kurats_ids[0]

                        qs_timetable = TimeTable.objects.filter(id__in=kurats_ids).update(
                            parent_kurats=parent_id
                        )

                    else:
                        # self.update(request).data
                        self.perform_update(serializer)

                        # Цагийн хуваарийн хүснэгтийн id
                        qs = TimeTable_to_group.objects.filter(timetable_id=pk)
                        qs_stu = TimeTable_to_student.objects.filter(timetable_id=pk)

                        # Хуучин ангийн ids
                        old_group_ids = list(qs.values_list('group', flat=True))

                        students_ids = qs_stu.filter(add_flag=False).values_list('student', flat=True)
                        student_group_ids = Student.objects.filter(id__in=students_ids).values('group', 'id')

                        # Хувиараас хасалт хийлгэж байгаа оюутан
                        if remove_students:
                            qs_rm_stu = qs_stu.filter(add_flag=False)

                            # Хуучин хасалт хийгдсэн оюутны ids
                            old_remove_ids = list(qs_rm_stu.values_list('student', flat=True))

                            # Хасалт хийлгэж байгааг оюутныг хадгалах хэсэг
                            remove_student_data = []
                            for rstudent in remove_students:
                                student_qs = qs_rm_stu.filter(student_id=rstudent).last()
                                if student_qs != None:
                                    remove_student_data.append(
                                        TimeTable_to_student(
                                            timetable_id = pk,
                                            student_id = rstudent,
                                            add_flag = False
                                        )
                                    )
                            if len(remove_student_data) > 0:
                                TimeTable_to_student.objects.bulk_create(remove_student_data)

                            # Хасалт хийлгэж байгаа оюутан өөрчлөгдсөн бол устгах хэсэг
                            for old_rm_id in old_remove_ids:
                                if not (old_rm_id in remove_students):
                                    obj_rm = qs_rm_stu.filter(student_id=old_rm_id)
                                    if obj_rm:
                                        obj_rm.delete()
                        else:
                            qs_stu.filter(add_flag=False).delete()

                        # Хуваарь дээр ангиуд шивэх хэсэг
                        if len(group_data) > 0:
                            for row in group_data:
                                group_id = row.get("id")
                                new_group_ids.append(group_id)

                                qs_timegroup = qs.filter(group_id=group_id)

                                if len(qs_timegroup) == 0:
                                    obj = TimeTable_to_group.objects.create(
                                        timetable_id = pk,
                                        group_id =  group_id
                                    )

                            for old_group_id in old_group_ids:
                                if not (old_group_id in  new_group_ids):
                                    qs_group = qs.filter(group_id=old_group_id)

                                    if len(qs_group) > 0:
                                        qs_group.delete()

                                    for student in student_group_ids:
                                        student_group_id = student.get('group')
                                        student_id = student.get('id')

                                        if old_group_id == student_group_id:
                                            qs_rm  = qs_stu.filter(student_id=student_id, add_flag=False)
                                            if len(qs_rm) > 0:
                                                qs_rm.delete()
                        else:
                            qs.delete()

                            # Анги устгах үед хасалт хийгдсэн оюутнууд устгагдана
                            for student in student_group_ids:
                                student_group_id = student.get('group')
                                student_id = student.get('id')

                                for old_group_id in old_group_ids:
                                    if old_group_id == student_group_id:
                                        qs_rm  = qs_stu.filter(student_id=student_id, add_flag=False)
                                        if len(qs_rm) > 0:
                                            qs_rm.delete()


                        # Нэмэлтээр үзэж байгаа оюутан
                        if add_students:
                            qs_add_stu = qs_stu.filter(add_flag=True)

                            # Хуучин оюутны ids
                            old_stu_ids = list(qs_add_stu.values_list('student', flat=True))

                            # Нэмэлтээр хуваарь сонгож байгаа оюутныг хадгалах хэсэг
                            for student in add_students:
                                student_qs = qs_add_stu.filter(student_id=student).last()
                                if student_qs != None:
                                    obj = TimeTable_to_student.objects.create(
                                        timetable_id = pk,
                                        student_id = student,
                                        add_flag = True
                                    )

                            # Нэмэлтээр хуваарь сонгож байгаа өөрчлөгдсөн бол устгах хэсэг
                            for old_stu_id in old_stu_ids:
                                if not (old_stu_id in add_students):
                                    obj_add_stu = qs_add_stu.filter(student_id=old_stu_id)
                                    if len(obj_add_stu) > 0:
                                        obj_add_stu.delete()
                        else:
                            qs_stu.filter(add_flag=True).delete()

                    return request.send_info("INF_002")
            except Exception as e:
                print(e)
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

    @has_permission(must_permissions=['lms-timetable-register-delete'])
    def delete(self, request, pk=None):
        "  Цагийн хуваарь устгах "

        self.destroy(request, pk)

        return request.send_info("INF_003")


class TimeTableScheduleAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Цагийн хуваарь """

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    pagination_class = CustomPagination

    def check_timetable_time_conflicts(
        self,
        existing_tt,
        is_kurats,
        teacher_obj,
        study_type,
        new_weeks_set,
        add_groups,
        add_students,
        room
    ):

        kdates = list()
        # Тухайн цаг дээрх хуваарууд
        for tt in existing_tt:
            if not tt.is_kurats:
                # Тухайн байгаа хуваарийн долоо хоногуудыг олох
                existing_weeks = get_weeks(tt.odd_even, tt.begin_week or 1, tt.end_week or 16)
            elif tt.begin_date:
                kweek_list = get_weekday_kurats_date(tt.begin_date, tt.end_date, tt.lesson_year, tt.lesson_season_id)
                existing_weeks = [item.get('weekNum') for item in kweek_list] if kweek_list else []

            existing_weeks_set = set(existing_weeks)

            # Хоёр хуваарийн долоо хоногууд огтлолцож байгаа эсэх
            intersect_weeks = new_weeks_set.intersection(existing_weeks_set)

            # Хэрэв долоо хоногууд огтлолцохгүй бол дараагийн хуваарь руу алгасна
            if not intersect_weeks:
                continue

            # Хэрэв огтлолцож байвал (ядаж нэг ижил долоо хоног байвал) давхцал мөн
            common_weeks = sorted(list(intersect_weeks))
            week_text = f"{common_weeks[0]}-{common_weeks[-1]}" if len(common_weeks) > 1 else f"{common_weeks[0]}"

            # Багшийн давхцал
            if teacher_obj and tt.teacher_id == teacher_obj.id:
                msg = f"{teacher_obj.full_name} багш {week_text}-р долоо хоногт {tt.day}-{tt.time} дээр {tt.lesson.name} хичээлийн хуваарьтай байна."
                return False, msg

            # Өрөөний давхцал
            if room and study_type != TimeTable.ONLINE and tt.room_id == int(room) and tt.room.type != Room.ROOM_SPORT:
                msg = f"{tt.room.full_name} өрөө {week_text}-р долоо хоногт {tt.day}-{tt.time} дээр {tt.lesson.name} хичээлтэй байна."
                return False, msg

            # Тухайн хуваарьт холбогдсон ангиудыг prefetch-ээс авах
            tt_group_ids = {g.group_id for g in tt.timetable_to_group_set.all()}

            # Шинэ ангиуд болон хуваарьт байгаа ангиудын огтлолцол
            overlapping_groups = set(add_groups).intersection(tt_group_ids)

            if overlapping_groups:
                # Огтлолцож буй ангийн id авах
                first_group_id = list(overlapping_groups)[0]
                # Prefetch ашигласан тул энэ хандалт хурдан байна
                group_obj = next(tg.group for tg in tt.timetable_to_group_set.all() if tg.group_id == first_group_id)

                msg = f"{group_obj.name} анги нь {week_text}-р долоо хоногийн {tt.day}-{tt.time} дээр {tt.teacher.full_name} багшийн {tt.lesson.code} {tt.lesson.name} хичээлтэй байна."
                return False, msg

            if add_students:
                # Оюутны давхцал (Prefetched data ашиглах)
                tt_students = tt.timetable_to_student_set.all()

                # Нэмэлтээр үзэж буй оюутнуудын давхцал
                added_students_in_tt = {s.student_id for s in tt_students if s.add_flag}
                conflict_students = set(add_students).intersection(added_students_in_tt)

                if conflict_students:
                    s_id = list(conflict_students)[0]
                    # Оюутны кодыг олох (Prefetch ашигласан тул хурдан)
                    student_obj = next(s.student for s in tt_students if s.student_id == s_id)
                    msg = f"{student_obj.code} кодтой оюутан {week_text}-р долоо хоногийн {tt.day}-{tt.time} дээр {tt.teacher.full_name} багшийн {tt.lesson.code} {tt.lesson.name} хичээлийг нэмэлтээр үзэх хуваарьтай байна."
                    return False, msg

                # Үндсэн ангийн хуваарьтай давхцах (Хасалт хийлгээгүй бол)
                # Хэрэв оюутан тухайн ангид байгаа бөгөөд тухайн хуваарь дээр "Хасалт" (add_flag=False) хийгээгүй бол
                removed_student_ids = {s.student_id for s in tt_students if not s.add_flag}

                for s_id in add_students:
                    # Хэрэв оюутан тухайн хичээл орж буй ангийнх мөн боловч...
                    if s_id in [st_id for st_id in tt.timetable_to_group_set.all().values_list('group__student', flat=True)]:
                        # ...тухайн хичээлээс хасалт хийлгээгүй байгаа бол давхцал гэж үзнэ
                        if s_id not in removed_student_ids:
                            student_obj = next(tt_stu.student for tt_stu in tt_students if tt_stu.student_id == s_id)
                            # Оюутны мэдээллийг авах
                            msg = f"{student_obj.code}-той оюутны анги {week_text}-р долоо хоногийн {tt.day}-{tt.time} дээр {tt.lesson.code} {tt.lesson.name} хичээлтэй байна."
                            return False, msg

        return True, None

    def _create_related_records(self, timetables, group_data, online_groups, add_students, rm_students):
        group_links = []
        student_links = []

        for tt in timetables:
            # Ангиуд
            for g in group_data:
                group_links.append(TimeTable_to_group(timetable_id=tt, group_id=g))
            # Онлайн ангиуд
            for g in online_groups:
                group_links.append(TimeTable_to_group(timetable_id=tt, group_id=g, is_online=True))
            # Нэмэлт оюутнууд
            for s_id in add_students:
                student_links.append(TimeTable_to_student(timetable_id=tt, student_id=s_id, add_flag=True))
            # Хасагдсан оюутнууд
            for s_id in rm_students:
                student_links.append(TimeTable_to_student(timetable_id=tt, student_id=s_id, add_flag=False))

        TimeTable_to_group.objects.bulk_create(group_links, batch_size=500)
        TimeTable_to_student.objects.bulk_create(student_links, batch_size=500)

    @transaction.atomic
    @login_required()
    def post(self, request):
        " Цагийн хуваарь шинээр үүсгэх "

        errors = []
        user = request.user

        all_group_student_count = 0

        request_data = request.data

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        teacher = request_data.get('teacher')
        teacher_obj = Teachers.objects.get(id=teacher)

        # Курац хуваарийн өдрүүдийн хэддүгээр 7 хоног вэ гэдгийн жагсаалт
        kweek_numbers = []
        all_days = []

        # Ангийн жагсаалт
        new_group_ids = request_data.get('group') or []
        sub_group = request_data.get('sub_group') or []
        level_group = request_data.get('level_group') or []

        # Хичээлийн жил улирал ирэхгүй бол
        lesson_year, lesson_season = get_active_year_season()

        add_students = request_data.get('students') or []
        remove_students = request_data.get('remove_students') or []

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Онлайн хичээл эсэх
        study_type = request_data.get('study_type')

        # Онлайнаар хичээл үзэх анги
        add_online_group = request_data.get('addgroup') or []

        request_data['lesson_year'] = lesson_year
        request_data['lesson_season'] = lesson_season
        request_data['potok'] = 1
        request_data['created_user'] = user.id

        room = request_data.get('room')

        # Бүх сонгогдсон цаг цуглуулах
        all_time_ids = []
        week_numbers = []
        kweek_list = list()
        odd_even = TimeTable.ALL

        qs_timetable = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season_id=lesson_season)

        if is_kurats:
            end_date = request_data.get('end_date')
            all_time_ids = request_data.get('time')
            begin_date = request_data.get('begin_date')
            kweek_list = get_weekday_kurats_date(begin_date, end_date, lesson_year, lesson_season)

            if not kweek_list:
                return request.send_error("ERR_002", "Тухайн хугацаанд тохирох хичээлийн 7 хоног олдсонгүй. Хичээлийн жилийн идэвхитэй хугацаанд оруулна уу")

            week_numbers = [item.get('weekNum') for item in kweek_list] if kweek_list else []
            all_days = [int(item.get('weekday')) for item in kweek_list] if kweek_list else []

            new_weeks_set = set(week_numbers)
            # qs_timetable = qs_timetable.filter(week_number__in=week_numbers)

        else:
            all_time_ids = [int(request_data.get('time'))] if request_data.get('time') else []
            all_days = [int(request_data.get('day'))] if request_data.get('day') else []

            odd_even = int(request_data.get('odd_even')) if request_data.get('odd_even') else TimeTable.ALL
            begin_week = request_data.get('begin_week') or 1
            end_week = request_data.get("end_week") or 20

            week_numbers = get_weeks(odd_even, begin_week, end_week)
            # Шинээр үүсгэж буй хуваарийн долоо хоногуудын олонлог
            new_weeks_set = set(week_numbers)

            request_data['week_number'] = begin_week

        if not all_time_ids:
            errors = get_error_obj("Хоосон байна.", 'time')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        sid = transaction.savepoint()

        try:
            remove_keys = ['students', 'is_simple', 'addgroup', 'remove_students', 'group']
            request_data = remove_key_from_dict(request_data, remove_keys)

            # Сонгон хичээл биш үед анги заавал бөглөх ёстой
            if not is_optional and not new_group_ids and not sub_group and not level_group:
                msg = "Хоосон байна"
                errors = get_error_obj(msg, 'group')
                if len(errors) > 0:
                    return request.send_error("ERR_002", errors)

            # Оюутны хувиарын давхцал шалгана
            if not is_optional:
                # Нэмэлтээр судлах хүүхэд нь сонгогдсон ангиас өөр ангийн хүүхэд байх ёстой
                if add_students:
                    all_group_student_count += len(add_students)
                    bad_student = Student.objects.filter(id__in=add_students, group_id__in=new_group_ids).first()
                    if bad_student:
                        msg = f"{bad_student.code}-той оюутан нь {bad_student.group.name} анги учир давхар хуваарь сонгох боломжгүй."
                        return request.send_error("ERR_003", get_error_obj(msg, 'students'))

                active_student_qs = Student.objects.filter(status__code=1)

                # Хасалт хийлгэж байгаа оюутан тухайн ангийн хүүхэд мөн эсэхийг шалгана. Зөвхөн сонгогдсон ангийн хүүхэд л хасалт хийлгэнэ
                if remove_students:
                    active_student_qs = active_student_qs.exclude(id__in=remove_students)
                    not_in_group = Student.objects.filter(id__in=remove_students).exclude(group_id__in=new_group_ids).first()
                    if not_in_group:
                        msg = f"{not_in_group.code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хасалт хийх боломжгүй."
                        return request.send_error("ERR_003", get_error_obj(msg, 'remove_students'))

                # Сонгосон ангийн хүүхдийн тоог авах хэсэг
                merge_groups = new_group_ids + add_online_group if add_online_group else new_group_ids

                if merge_groups and len(merge_groups) > 0:
                    all_group_student_count += active_student_qs.filter(group_id__in=merge_groups).count()

                request_data['st_count'] = all_group_student_count

            if odd_even != TimeTable.ALL:
                qs_timetable = qs_timetable.filter(odd_even__in=[odd_even, TimeTable.ALL])

            qs_timetable = (
                qs_timetable.filter(
                    Q(
                        day__in=all_days,
                        time__in=all_time_ids,
                        teacher__isnull=False,
                    ) &
                    Q(
                        Q(is_kurats=True, week_number__in=week_numbers) |
                        Q(
                            Q(is_kurats=False) &
                            Q(
                                Q(week_number__in=week_numbers) |
                                Q(begin_week__in=week_numbers) |
                                Q(end_week__in=week_numbers)
                            )
                        )
                    )
                )
            )

            existing_tt = (
                qs_timetable.select_related('lesson', 'room', 'teacher')
                .prefetch_related('timetable_to_group_set__group', 'timetable_to_student_set__student')
            )

            is_success, msg = self.check_timetable_time_conflicts(
                existing_tt,
                is_kurats,
                teacher_obj,
                study_type,
                new_weeks_set,
                new_group_ids,
                add_students,
                room,
            )

            # is_success = False

            if not is_success:
                return request.send_error("ERR_002", msg)

            create_tt_ids = list()

            if not request_data.get('school'):
                school_id = None
                if teacher_obj and teacher_obj.sub_org_id:
                    school_id = teacher_obj.sub_org_id
                elif teacher_obj and teacher_obj.salbar_id and teacher_obj.salbar.sub_orgs_id:
                    school_id = teacher_obj.salbar.sub_orgs_id
                elif new_group_ids:
                    group_obj = Group.objects.filter(id__in=new_group_ids, school__isnull=False).first()
                    school_id = group_obj.school_id if group_obj else None

                request_data['school'] = school_id

            if not is_kurats:
                request_data['is_kurats'] = False

                serializer = self.get_serializer(data=request_data)
                if serializer.is_valid(raise_exception=False):
                    self.perform_create(serializer)
                    table_data = serializer.data
                    timetable_id = table_data.get('id')
                    create_tt_ids.append(timetable_id)
                else:
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer.errors)
            # Кураци хуваарь нэмэх үед
            else:
                # NOTE: кураци хуваарь үед бүх үүсэж болох огноон дээр нэг бүрчлэн эхлэх дуусах огноогоор үүсггэж байгаа.
                # Иймд буцаан буцаан уншихдаа шууд 7 7-н хоногоороо авахад асуудалгүй гэж тооцсон.
                # Харин эцэг хувиарийг харуулах шаардлагагүй
                # Курац parent ids хадгалах
                parent_id = None
                request_data['begin_date'] = begin_date
                request_data['end_date'] = end_date
                request_data['is_kurats'] = True
                request_data['day'] = 1
                request_data['time'] = 1

                parent_serializer = self.get_serializer(data=request_data)
                if parent_serializer.is_valid(raise_exception=False):
                    self.perform_create(parent_serializer)
                    table_data = parent_serializer.data
                    parent_id = table_data.get('id')

                    for kweek in kweek_list:
                        kday = kweek.get('weekday')
                        kbegin_date = kweek.get('begin_date')
                        week_num = kweek.get('weekNum')
                        request_data['day'] = kday
                        request_data['week_number'] = week_num
                        request_data['begin_week'] = week_num
                        request_data['end_week'] = week_num
                        request_data['parent_kurats'] = parent_id

                        # Кураци хуваарь үүсгэхдээ яг тохирох эхлэх дуусах огноог тооцож хадгалах
                        request_data['begin_date'] = kbegin_date
                        request_data['end_date'] = kbegin_date

                        for ktime in all_time_ids:
                            request_data['time'] = ktime
                            request_data['is_kurats'] = True

                            serializer = self.get_serializer(data=request_data)
                            if serializer.is_valid(raise_exception=False):
                                self.perform_create(serializer)
                                table_data = serializer.data
                                timetable_id = table_data.get('id')
                                create_tt_ids.append(timetable_id)
                            else:
                                transaction.savepoint_rollback(sid)
                                return request.send_error_valid(serializer.errors)

                else:
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(parent_serializer.errors)

            self._create_related_records(create_tt_ids, new_group_ids, add_online_group, add_students, remove_students)

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", e.__str__())

        return request.send_info("INF_001")

    @login_required()
    def put(self, request, pk=None):
        " Цагийн хуваарь шинээр үүсгэх "

        errors = []
        user = request.user

        instance = self.get_object()

        all_group_student_count = 0

        request_data = request.data
        teacher = request_data.get('teacher')

        # Ангийн жагсаалт
        new_group_ids = request_data.get('group') or []
        sub_group = request_data.get('sub_group') or []
        level_group = request_data.get('level_group') or []

        # Хичээлийн жил улирал ирэхгүй бол
        lesson_year, lesson_season = get_active_year_season()

        qs_timetable = TimeTable.objects.exclude(id=pk).filter(lesson_year=lesson_year, lesson_season=lesson_season)

        time = request_data.get("time")
        room = request_data.get('room')

        if not time:
            errors = get_error_obj("Хоосон байна.", 'time')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        odd_even = int(request_data.get('odd_even')) if request_data.get('odd_even') else TimeTable.ALL
        begin_week = request_data.get('begin_week')
        end_week = request_data.get('end_week')

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        end_date = request_data.get('end_date')
        begin_date = request_data.get('begin_date')
        all_days = list()

        if is_kurats:
            kweek_list = get_weekday_kurats_date(begin_date, end_date, lesson_year, lesson_season)

            if not kweek_list:
                return request.send_error("ERR_002", "Тухайн хугацаанд тохирох хичээлийн 7 хоног олдсонгүй. Хичээлийн жилийн идэвхитэй хугацаанд оруулна уу")

            week_numbers = [item.get('weekNum') for item in kweek_list] if kweek_list else []
            all_days = [int(item.get('weekday')) for item in kweek_list] if kweek_list else []
        else:
            all_days = [int(request_data.get('day'))] if request_data.get('day') else []
            week_numbers = get_weeks(odd_even, begin_week, end_week)

        # Шинээр үүсгэж буй хуваарийн долоо хоногуудын олонлог
        new_weeks_set = set(week_numbers)

        # Default potok
        # request_data['potok'] = 1

        add_students = request_data.get('students') or []
        remove_students = request_data.get('remove_students') or []

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Онлайн хичээл эсэх
        study_type = request_data.get('study_type')

        # Онлайнаар хичээл үзэх анги
        add_online_group = request_data.get('addgroup') or []

        request_data['lesson_year'] = lesson_year
        request_data['lesson_season'] = lesson_season

        sid = transaction.savepoint()

        try:
            remove_keys = ['students', 'is_simple', 'addgroup', 'remove_students', 'group']

            request_data = remove_key_from_dict(request_data, remove_keys)

            # Сонгон хичээл биш үед анги заавал бөглөх ёстой
            if not is_optional and not new_group_ids and not sub_group and not level_group:
                msg = "Хоосон байна"
                errors = get_error_obj(msg, 'group')
                if len(errors) > 0:
                    transaction.savepoint_rollback(sid)
                    return request.send_error("ERR_002", errors)

            if not request_data.get('school'):
                teacher_obj = Teachers.objects.get(id=teacher)
                school_id = None
                if teacher_obj and teacher_obj.sub_org_id:
                    school_id = teacher_obj.sub_org_id
                elif teacher_obj and teacher_obj.salbar_id and teacher_obj.salbar.sub_orgs_id:
                    school_id = teacher_obj.salbar.sub_orgs_id
                elif new_group_ids:
                    group_obj = Group.objects.filter(id__in=new_group_ids, school__isnull=False).first()
                    school_id = group_obj.school_id if group_obj else None

                request_data['school'] = school_id

            # Оюутны хувиарын давхцал шалгана
            if not is_optional:
                # Нэмэлтээр судлах хүүхэд нь сонгогдсон ангиас өөр ангийн хүүхэд байх ёстой
                if add_students:
                    all_group_student_count += len(add_students)
                    bad_student = Student.objects.filter(id__in=add_students, group_id__in=new_group_ids).first()
                    if bad_student:
                        msg = f"{bad_student.code}-той оюутан нь {bad_student.group.name} анги учир давхар хуваарь сонгох боломжгүй."
                        transaction.savepoint_rollback(sid)
                        return request.send_error("ERR_003", get_error_obj(msg, 'students'))

                active_student_qs = Student.objects.filter(status__code=1)

                # Хасалт хийлгэж байгаа оюутан тухайн ангийн хүүхэд мөн эсэхийг шалгана. Зөвхөн сонгогдсон ангийн хүүхэд л хасалт хийлгэнэ
                if remove_students:
                    active_student_qs = active_student_qs.exclude(id__in=remove_students)
                    not_in_group = Student.objects.filter(id__in=remove_students).exclude(group_id__in=new_group_ids).first()
                    if not_in_group:
                        msg = f"{not_in_group.code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хасалт хийх боломжгүй."
                        transaction.savepoint_rollback(sid)
                        return request.send_error("ERR_003", get_error_obj(msg, 'remove_students'))

                # Сонгосон ангийн хүүхдийн тоог авах хэсэг
                merge_groups = new_group_ids + add_online_group if add_online_group else new_group_ids

                if merge_groups and len(merge_groups) > 0:
                    all_group_student_count += active_student_qs.filter(group_id__in=merge_groups).count()

                request_data['st_count'] = all_group_student_count

            if odd_even != TimeTable.ALL:
                qs_timetable = qs_timetable.filter(odd_even__in=[odd_even, TimeTable.ALL])

            qs_timetable = (
                qs_timetable.filter(
                    Q(
                        day__in=all_days,
                        time=time,
                        teacher__isnull=False,
                    ) &
                    Q(
                        Q(is_kurats=True, week_number__in=week_numbers) |
                        Q(
                            Q(is_kurats=False) &
                            Q(
                                Q(week_number__in=week_numbers) |
                                Q(begin_week__in=week_numbers) |
                                Q(end_week__in=week_numbers)
                            )
                        )
                    )
                )
            )

            existing_tt = (
                qs_timetable.select_related('lesson', 'room', 'teacher')
                .prefetch_related('timetable_to_group_set__group', 'timetable_to_student_set__student')
            )
            request_data['updated_user'] = user.id
            teacher_obj = Teachers.objects.get(id=teacher)
            is_success, msg = self.check_timetable_time_conflicts(
                existing_tt,
                is_kurats,
                teacher_obj,
                study_type,
                new_weeks_set,
                new_group_ids,
                add_students,
                room,
            )

            if not is_success:
                return request.send_error("ERR_002", msg)

            group_relations = list()
            student_relations = list()

            old_tt_group_qs = instance.timetable_to_group_set.all()

            # --- 1. Handle Groups (Normal & Online) ---
            def sync_groups(input_ids, is_online):
                input_ids = set(input_ids or [])
                existing_ids = {g.group_id for g in old_tt_group_qs if g.is_online == is_online}

                # Add new ones
                for g_id in (input_ids - existing_ids):
                    group_relations.append(TimeTable_to_group(timetable=instance, group_id=g_id, is_online=is_online))

                # Delete removed ones - FIX: Added .objects.filter()
                to_delete_ids = existing_ids - input_ids
                if to_delete_ids:
                    TimeTable_to_group.objects.filter(timetable=instance, group_id__in=to_delete_ids, is_online=is_online).delete()
                elif not input_ids:
                    TimeTable_to_group.objects.filter(timetable=instance, is_online=is_online).delete()

            sync_groups(new_group_ids, is_online=False)
            sync_groups(add_online_group, is_online=True)

            # --- 2. Handle Students (Additions & Removals) ---
            tt_students = instance.timetable_to_student_set.all()

            def sync_students(input_ids, add_flag):
                input_ids = set(input_ids or [])
                existing_ids = {s.student_id for s in tt_students if s.add_flag == add_flag}

                # Add new ones
                for s_id in (input_ids - existing_ids):
                    student_relations.append(TimeTable_to_student(timetable=instance, student_id=s_id, add_flag=add_flag))

                # Delete removed ones - FIX: Use .objects.filter()
                to_delete_ids = existing_ids - input_ids
                if to_delete_ids:
                    TimeTable_to_student.objects.filter(timetable=instance, add_flag=add_flag, student_id__in=to_delete_ids).delete()
                elif not input_ids:
                    TimeTable_to_student.objects.filter(timetable=instance, add_flag=add_flag).delete()

            sync_students(add_students, add_flag=True)
            sync_students(remove_students, add_flag=False)

            if is_kurats:
                parent_id = instance.id
                create_tt_ids = list()
                kweek_list = get_weekday_kurats_date(begin_date, end_date, lesson_year, lesson_season)

                if len(kweek_list) > 1:
                    for kweek in kweek_list:
                        kday = kweek.get('weekday')
                        kbegin_date = kweek.get('begin_date')
                        week_num = kweek.get('weekNum')
                        request_data['day'] = kday
                        request_data['week_number'] = week_num
                        request_data['begin_week'] = week_num
                        request_data['end_week'] = week_num
                        request_data['parent_kurats'] = parent_id

                        # Кураци хуваарь үүсгэхдээ яг тохирох эхлэх дуусах огноог тооцож хадгалах
                        request_data['begin_date'] = kbegin_date
                        request_data['end_date'] = kbegin_date

                        serializer = self.get_serializer(data=request_data)
                        if serializer.is_valid(raise_exception=False):
                            self.perform_create(serializer)
                            table_data = serializer.data
                            timetable_id = table_data.get('id')
                            create_tt_ids.append(timetable_id)
                        else:
                            transaction.savepoint_rollback(sid)
                            return request.send_error_valid(serializer.errors)
                else:
                    for kweek in kweek_list:
                        kday = kweek.get('weekday')
                        kbegin_date = kweek.get('begin_date')
                        week_num = kweek.get('weekNum')
                        request_data['day'] = kday
                        request_data['week_number'] = week_num
                        request_data['begin_week'] = week_num
                        request_data['end_week'] = week_num
                        request_data['parent_kurats'] = None

                        # Кураци хуваарь үүсгэхдээ яг тохирох эхлэх дуусах огноог тооцож хадгалах
                        request_data['begin_date'] = kbegin_date
                        request_data['end_date'] = kbegin_date
                        parent_serializer = self.get_serializer(instance, data=request_data, partial=True)
                        if parent_serializer.is_valid(raise_exception=False):
                            self.perform_update(parent_serializer)
                        else:
                            transaction.savepoint_rollback(sid)
                            return request.send_error_valid(parent_serializer.errors)

                self._create_related_records(create_tt_ids, new_group_ids, add_online_group, add_students, remove_students)
            else:
                serializer = self.get_serializer(instance, data=request_data, partial=True)
                if serializer.is_valid(raise_exception=False):
                    self.perform_update(serializer)
                    if student_relations:
                        TimeTable_to_student.objects.bulk_create(student_relations)
                    if group_relations:
                        TimeTable_to_group.objects.bulk_create(group_relations)
                else:
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer.errors)

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @login_required()
    def delete(self, request, pk=None):
        "  Цагийн хуваарь устгах "

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ExamTimeTableAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын хуваарь """

    queryset = ExamTimeTable.objects.all().order_by('begin_date')
    serializer_class = ExamTimeTableSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'room__name',  'room__code', 'lesson__code']

    def get_queryset(self):
        queryset = self.queryset

        day = self.request.query_params.get('day')
        stype = self.request.query_params.get('stype')
        lesson = self.request.query_params.get('lesson')
        teacher = self.request.query_params.get('teacher')
        time = self.request.query_params.get('time')
        school = self.request.query_params.get('school')
        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')
        sorting = self.request.query_params.get("sorting")

        if year:
            queryset = queryset.filter(lesson_year=year, lesson_season=season)

        # Өдрөөр хайлт хийх
        if day:
            queryset = queryset.filter(day=day)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Багшаар хайлт хийх
        if teacher:
            queryset = queryset.filter(teacher__in=[teacher])

        # Цагаар хайлт хийх
        if time:
            queryset = queryset.filter(time=time)

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(
                Exists(Exam_to_group.objects.filter(exam=OuterRef('id'), group__school=school))|
                Exists(ExamToSubGroup.objects.filter(exam=OuterRef('id'), sub_group__student__group__school=school))|
                Exists(ExamToLevelGroup.objects.filter(exam=OuterRef('id'), level_group__student__group__school=school))|
                Exists(ExamTimeTable.objects.filter(id=OuterRef('id')).filter(Exists(Teachers.objects.filter(id=OuterRef('teacher'), sub_org=school))))
            )

        # Төрлөөр хайх хайлт хийх
        if stype:

            queryset = queryset.filter(stype=stype)

        if sorting:
            queryset = queryset.order_by(sorting)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()

        if not self.kwargs.get('pk'):
            context['active_year_season'] = get_active_year_season()

        return context

    @has_permission(must_permissions=['lms-timetable-exam-read'])
    def get(self, request, pk=None):
        " Шалгалтын хуваарь жагсаалт "

        self.serializer_class = ExamTimeTableAllSerializer

        if not request.user.is_superuser:
            arga_zuich_org_positions = [
                "Үнэлгээ, арга зүйн төвийн эрхлэгч",
                "Үнэлгээ арга зүйн төвийн мэргэжилтэн",
                "Үнэлгээ арга зүйн төвийн ахлах мэргэжилтэн",
                "Сургалтын арга зүйч",
                "Сургалт, арга зүй хариуцсан чиглэлийн ахлах мэргэжилтэн",
                "Сургалт, арга зүйн ахлах мэргэжилтэн",
                "Судалгааны арга зүйч-багш",
                "Судалгааны арга зүйч",
                "Арга зүйч",
                "Арга зүй, үнэлгээ хариуцсан чиглэлийн ахлах мэргэжилтэн",
                "Арга зүй, үнэлгээ хариуцсан ахлах мэргэжилтэн",
            ]

            org_position_ids = list(OrgPosition.objects.filter(name__in=arga_zuich_org_positions).values_list('id', flat=True))
            user_org_position_id = request.user.employee.org_position_id

            if user_org_position_id not in org_position_ids:
                if pk:
                    return request.send_data({})

                return request.send_data({'results': []})

        if pk:
            self.serializer_class = ExamTimeTableListSerializer
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-timetable-exam-create'])
    @transaction.atomic
    def post(self, request):
        " Шалгалтын хуваарь шинээр үүсгэх "

        error_obj = []
        request_data = request.data
        now = datetime.now()
        user = request.user
        sid = transaction.savepoint()

        # Оюутаны жагсаалт
        # student_data = request_data.get('student')

        # room = request_data.get('room')
        # lesson = request_data.get('lesson')
        # school = request_data.get('school')

        teachers = request_data.get('teacher')
        # lesson_year = request_data.get('lesson_year')
        # lesson_season = request_data.get('lesson_season')
        end_datetime = request_data.get('end_date')
        begin_datetime = request_data.get('begin_date')
        groups = request_data.get('group')
        sub_groups = request_data.get('sub_group')
        level_groups = request_data.get('level_group')

        begin_datetime = datetime.fromisoformat(begin_datetime)
        end_datetime = datetime.fromisoformat(end_datetime)

        # Group dataнаас оюутан устгах
        request_data = remove_key_from_dict(request_data, ['student', 'sub_group', 'level_group'])

        if 'group' in request_data:
            del request_data['group']

        serializer = self.get_serializer(data=request_data)
        def is_overlapping(dts,dte,dts2,dte2):
            if dts == None and dte == None:

                return False

            elif dts == None:
                if dts2 > dte:

                    return False
                else:

                    return True

            elif dte == None:
                if dte2 < dts:

                    return False
                else:

                    return True

            elif dte2 < dts or dts2 > dte:

                return False

            else:

                return True

        first_group = Group.objects.filter(id__in=groups).first()
        school_obj = safe_get(first_group, None, 'school')
        school_obj = safe_get(first_group, None, 'profession', 'school') if not school_obj else school_obj
        school_obj = safe_get(first_group, None, 'profession', 'department', 'sub_orgs') if not school_obj else school_obj

        first_sub_group = SubGroup.objects.filter(id__in=sub_groups).first()
        first_sub_group_group = first_sub_group.group.first() if first_sub_group else None
        school_obj = safe_get(first_sub_group_group, None, 'school') if not school_obj else school_obj
        school_obj = safe_get(first_sub_group_group, None, 'profession', 'school') if not school_obj else school_obj
        school_obj = safe_get(first_sub_group_group, None, 'profession', 'department', 'sub_orgs') if not school_obj else school_obj

        first_level_group = LevelGroup.objects.filter(id__in=level_groups).first()
        first_level_group_group = first_level_group.student.first().group if first_level_group else None
        school_obj = safe_get(first_level_group_group, None, 'school') if not school_obj else school_obj
        school_obj = safe_get(first_level_group_group, None, 'profession', 'school') if not school_obj else school_obj
        school_obj = safe_get(first_level_group_group, None, 'profession', 'department', 'sub_orgs') if not school_obj else school_obj

        request_data['school'] = school_obj.id

        try:
            if serializer.is_valid(raise_exception=False):
                # exam_table_qs = (
                #     ExamTimeTable.objects
                #         .filter(
                #             school=school,
                #             lesson_year=lesson_year,
                #             lesson_season=lesson_season
                #         )
                #         .exclude(Q(begin_date__gt=end_datetime)|Q(end_date__lt=begin_datetime))
                # )

                # qs_exam_teacher = exam_table_qs.filter(teacher__in=teachers)

                # qs_exam_room = exam_table_qs.filter(room=room)

                # qs_exam_lesson = exam_table_qs.filter(lesson=lesson).last()

                # # Тухайн хичээлийн жил, улирал, "selected datetime range" шалгалтын хуваарийн жагсаалт
                # qs_examtimetable_ids = exam_table_qs.values_list(
                #         'id',
                #         flat=True
                #     ).distinct()

                # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                # NOTE ДХИС хүсэлтээр болиулав
                # if qs_exam_teacher:
                #     qs_exam_teacher_times = qs_exam_teacher.values(
                #             'begin_date',
                #             'end_date',
                #             'lesson__name'
                #         )

                #     for teacher in qs_exam_teacher_times:
                #         start = teacher.get('begin_date')
                #         end = teacher.get('end_date')

                #         if is_overlapping(start,end,begin_datetime,end_datetime):
                #             lesson = teacher.get('lesson__name')

                #             msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                #                 .format(
                #                     lesson=lesson,
                #                     exam_date=start.date(),
                #                     begin_time=start,
                #                     end_time=end
                #                 )

                #             error_obj = get_error_obj(msg, 'teacher')

                # # Шалгалт авах өрөө давхцаж байгаа эсэхийг шалгана
                # if qs_exam_room and not request_data.get('is_online'):
                #     qs_exam_rooms = qs_exam_room.values(
                #             'begin_date',
                #             'end_date',
                #             'lesson__name'
                #         )

                #     for rooms in qs_exam_rooms:
                #         start = rooms.get('begin_date')
                #         end = rooms.get('end_date')

                #         if is_overlapping(start,end,begin_datetime,end_datetime):
                #             lesson = rooms.get('lesson__name')

                #             msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                #                 .format(
                #                     lesson=lesson,
                #                     exam_date=start.date(),
                #                     begin_time=start,
                #                     end_time=end
                #                 )

                #             error_obj = get_error_obj(msg, 'room')

                # NOTE ангийн шалгалтын хуваарийн давхцлыг шалгах
                # if groups and qs_examtimetable_ids:

                # # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                # if student_data and qs_examtimetable_ids:
                    # for exam_timetable_id in qs_examtimetable_ids:
                    #     exam_qs = ExamTimeTable.objects.filter(
                    #             pk=exam_timetable_id
                    #         ).first()

                    #     lesson = exam_qs.lesson.name
                    #     start = exam_qs.begin_date
                    #     end = exam_qs.end_date
                    #     students = []

                    #     for student_id in student_data:
                    #         qs = Exam_to_group.objects.filter(
                    #                 exam=exam_timetable_id,
                    #                 student=student_id
                    #             )

                    #         if qs:
                    #             for stu in qs:
                    #                 student_code = stu.student.code
                    #                 if student_code not in students:
                    #                     students.append(student_code)

                    #             if is_overlapping(start,end,begin_datetime,end_datetime):
                    #                 if students:
                    #                     msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                    #                         .format(
                    #                             student_code=', '.join(['{}'.format(f) for f in students]),
                    #                             lesson=lesson,
                    #                             exam_date=start.date(),
                    #                             begin_time=start,
                    #                             end_time=end,
                    #                             text='оюутнууд' if len(students) > 1 else 'оюутан'
                    #                         )

                    #                     error_obj = get_error_obj(msg, 'student')

                # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                # if qs_exam_lesson:
                #     start = qs_exam_lesson.begin_date
                #     end = qs_exam_lesson.end_date
                #     lesson = qs_exam_lesson.lesson.name

                #     if is_overlapping(start,end,begin_datetime,end_datetime):
                #         msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                #             .format(
                #                 lesson=lesson,
                #                 exam_date=start.date(),
                #                 begin_time=start,
                #                 end_time=end
                #             )

                #         error_obj = get_error_obj(msg, 'lesson')

                # if len(error_obj) > 0:

                #     return request.send_error("ERR_003", error_obj)

                create_groups = []
                try:
                    with transaction.atomic():
                        exam_data = self.create(request).data

                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_table_id = exam_data.get('id')
                        # Багшийг олноор нэмэх
                        ExamTimeTable.objects.get(id=exam_table_id).teacher.set(teachers)
                        if groups:
                            for group in groups:
                                if not Exam_to_group.objects.filter(exam=exam_table_id, group=group).exists():
                                    create_groups.append(
                                        Exam_to_group(
                                            exam_id=exam_table_id,
                                            group_id=group
                                        )
                                    )
                            Exam_to_group.objects.bulk_create(create_groups)

                        if sub_groups:
                            new_sub_groups_set = set(sub_groups)
                            current_sub_groups_set = set(ExamToSubGroup.objects.filter(exam=exam_table_id).values_list('sub_group', flat=True))

                            # to delete
                            sub_groups_to_delete_set = current_sub_groups_set - new_sub_groups_set
                            ExamToSubGroup.objects.filter(exam=exam_table_id, sub_group__in=sub_groups_to_delete_set).delete()

                            # to add
                            new_sub_groups_set = new_sub_groups_set - current_sub_groups_set
                            add_sub_groups = []

                            for sub_group in new_sub_groups_set:
                                add_sub_groups.append(
                                    ExamToSubGroup(
                                        exam_id=exam_table_id,
                                        sub_group_id=sub_group,
                                        created_at=now,
                                        created_by=user
                                    )
                                )

                            ExamToSubGroup.objects.bulk_create(add_sub_groups, batch_size=500)

                        if level_groups:
                            new_level_groups_set = set(level_groups)
                            current_level_groups_set = set(ExamToLevelGroup.objects.filter(exam=exam_table_id).values_list('level_group', flat=True))

                            # to delete
                            level_groups_to_delete_set = current_level_groups_set - new_level_groups_set
                            ExamToLevelGroup.objects.filter(exam=exam_table_id, level_group__in=level_groups_to_delete_set).delete()

                            # to add
                            new_level_groups_set = new_level_groups_set - current_level_groups_set
                            add_level_groups = []

                            for level_group in new_level_groups_set:
                                add_level_groups.append(
                                    ExamToLevelGroup(
                                        exam_id=exam_table_id,
                                        level_group_id=level_group,
                                        created_at=now,
                                        created_by=user
                                    )
                                )

                            ExamToLevelGroup.objects.bulk_create(add_level_groups, batch_size=500)

                    return request.send_info("INF_001")

                except Exception:
                    traceback.print_exc()

                    return request.send_error("ERR_002", "Шалгалтын хуваарь давхцаж байна.")

            else:
                transaction.savepoint_rollback(sid)
                print(serializer.errors)

                return request.send_error_valid(serializer.errors)

        except Exception as e:
            traceback.print_exc()

            return request.send_error('ERR_002', e.__str__())

    @has_permission(must_permissions=['lms-timetable-exam-update'])
    def put(self, request, pk=None):
        " Шалгалтын хуваарь засах "

        error_obj = []

        request_data = request.data
        now = datetime.now()
        user = request.user

        instance = self.get_object()

        # Оюутаны жагсаалт
        student_data = request_data.get('student')

        room = request_data.get('room')
        lesson = request_data.get('lesson')
        school = request_data.get('school')

        teacher = request_data.get('teacher')
        lesson_year = request_data.get('lesson_year')
        lesson_season = request_data.get('lesson_season')

        end_datetime = request_data.get('end_date')
        begin_datetime = request_data.get('begin_date')

        begin_datetime = datetime.fromisoformat(begin_datetime)
        end_datetime = datetime.fromisoformat(end_datetime)
        groups = request_data.get('group') or []
        sub_groups = request_data.get('sub_group') or []
        level_groups = request_data.get('level_group') or []
        teachers = request_data.get('teacher')

        # Group dataнаас юутан устгах
        if student_data:
            request_data = remove_key_from_dict(request_data, 'student')

        serializer = self.get_serializer(instance, data=request_data, partial=True)
        create_groups = []
        try:
            if serializer.is_valid(raise_exception=False):
                serializer.save()
                ExamTimeTable.objects.get(id=pk).teacher.set(teachers)

                # to update/remove groups
                if True:
                    current_groups = Exam_to_group.objects.filter(exam=pk)
                    groups_to_delete = current_groups.exclude(group_id__in=groups)
                    groups_to_delete.delete()

                    for group in groups:
                        if not Exam_to_group.objects.filter(exam=pk, group=group).exists():
                            create_groups.append(
                                Exam_to_group(
                                    exam_id=pk,
                                    group_id=group
                                )
                            )
                    Exam_to_group.objects.bulk_create(create_groups)

                # to update/remove sub groups
                if True:
                    new_sub_groups_set = set(sub_groups)
                    current_sub_groups_set = set(ExamToSubGroup.objects.filter(exam=pk).values_list('sub_group', flat=True))

                    # to delete
                    sub_groups_to_delete_set = current_sub_groups_set - new_sub_groups_set
                    ExamToSubGroup.objects.filter(exam=pk, sub_group__in=sub_groups_to_delete_set).delete()

                    # to add
                    new_sub_groups_set = new_sub_groups_set - current_sub_groups_set
                    add_sub_groups = []

                    for sub_group in new_sub_groups_set:
                        add_sub_groups.append(
                            ExamToSubGroup(
                                exam_id=pk,
                                sub_group_id=sub_group,
                                created_at=now,
                                created_by=user
                            )
                        )

                    ExamToSubGroup.objects.bulk_create(add_sub_groups, batch_size=500)

                # to update/remove level groups
                if True:
                    new_level_groups_set = set(level_groups)
                    current_level_groups_set = set(ExamToLevelGroup.objects.filter(exam=pk).values_list('level_group', flat=True))

                    # to delete
                    level_groups_to_delete_set = current_level_groups_set - new_level_groups_set
                    ExamToLevelGroup.objects.filter(exam=pk, level_group__in=level_groups_to_delete_set).delete()

                    # to add
                    new_level_groups_set = new_level_groups_set - current_level_groups_set
                    add_level_groups = []

                    for level_group in new_level_groups_set:
                        add_level_groups.append(
                            ExamToLevelGroup(
                                exam_id=pk,
                                level_group_id=level_group,
                                created_at=now,
                                created_by=user
                            )
                        )

                    ExamToLevelGroup.objects.bulk_create(add_level_groups, batch_size=500)

                # exam_table_qs = ExamTimeTable.objects.filter(
                #     school=school,
                #     lesson_year=lesson_year,
                #     lesson_season=lesson_season,
                # ).exclude(id=pk)

                # if exam_table_qs:

                #     # qs_exam_teacher = exam_table_qs.filter(teacher__in=teacher)

                #     qs_exam_room = exam_table_qs.filter(room=room).last()

                #     qs_exam_lesson = ExamTimeTable.objects.filter(
                #         school=school,
                #         lesson_year=lesson_year,
                #         lesson_season=lesson_season,
                #         lesson=lesson
                #     ).last()

                #     # Тухайн хичээлийн жил, улирал, өдрийн шалгалтын хуваарийн жагсаалт
                #     qs_examtimetable_ids = exam_table_qs.values_list(
                #         'id',
                #         flat=True
                #     ).distinct()

                    # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                    # NOTE дараа нь давхцалыг шалгана
                    # if qs_exam_teacher:
                    #     start = qs_exam_teacher.begin_time
                    #     end = qs_exam_teacher.end_time
                    #     lesson = qs_exam_teacher.lesson.name

                    #     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                    #         msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                    #             .format(
                    #                 lesson=lesson,
                    #                 exam_date=exam_date,
                    #                 begin_time=start,
                    #                 end_time=end
                    #             )

                    #         error_obj = get_error_obj(msg, 'teacher')

                    # Шалгалтын өрөө давхцаж байгаа эсэхийг шалгана
                    # NOTE давхцал шалгах
                    # if qs_exam_room:
                    #     start = qs_exam_room.begin_date
                    #     end = qs_exam_room.end_date
                    #     lesson = qs_exam_room.lesson.name

                    #     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                    #             msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                    #                 .format(
                    #                     lesson=lesson,
                    #                     exam_date=exam_date,
                    #                     begin_time=start,
                    #                     end_time=end
                    #                 )

                    #             error_obj = get_error_obj(msg, 'room')

                    # # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                    # if student_data:

                    #     if qs_examtimetable_ids:
                    #         for exam_timetable_id in qs_examtimetable_ids:

                    #             exam_qs = ExamTimeTable.objects.filter(
                    #                     pk=exam_timetable_id
                    #                 ).first()

                    #             lesson = exam_qs.lesson.name
                    #             start = exam_qs.begin_time
                    #             end = exam_qs.end_time
                    #             students = []

                    #             for student_id in student_data:
                    #                 # Шалгалтын хуваарь давхцаж байгаа оюутнуудын мэдээлэл авах
                    #                 qs = Exam_to_group.objects.filter(
                    #                         exam=exam_timetable_id,
                    #                         student=student_id
                    #                     )

                    #                 if qs:
                    #                     for stu in qs:
                    #                         student_code = stu.student.code
                    #                         if student_code not in students:
                    #                             students.append(student_code)

                    #                     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                    #                         if students:
                    #                             msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                    #                                 .format(
                    #                                     student_code=', '.join(['{}'.format(f) for f in students]),
                    #                                     lesson=lesson,
                    #                                     exam_date=exam_date,
                    #                                     begin_time=start,
                    #                                     end_time=end,
                    #                                     text='оюутнууд' if len(students) > 1 else 'оюутан'
                    #                                 )

                    #                             error_obj = get_error_obj(msg, 'student')

                    # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                    # NOTE дараа нь давхал шалгах
                    # if qs_exam_lesson:

                    #     start = qs_exam_lesson.begin_time
                    #     end = qs_exam_lesson.end_time
                    #     check_exam_date = qs_exam_lesson.exam_date
                    #     lesson = qs_exam_lesson.lesson.name

                    #     if start != begin_time or end != end_time or str(check_exam_date) != exam_date:
                    #         msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                    #             .format(
                    #                 lesson=lesson,
                    #                 exam_date=check_exam_date,
                    #                 begin_time=start,
                    #                 end_time=end
                    #             )

                    #         error_obj = get_error_obj(msg, 'lesson')

                    # if len(error_obj) > 0:
                    #     return request.send_error("ERR_003", error_obj)


                        # Шалгалтын хуваарийн хүснэгтийн id
                        # exam_qs = Exam_to_group.objects.filter(exam=pk)

                        # # Хуучин шалгалт өгөх байсан оюутаны жагсаалт
                        # old_student_ids = list(exam_qs.values_list('student', flat=True).distinct())

                        # # Зөвхөн оюутан сонгосон бол
                        # if student_data:
                            # for student_id in student_data:
                            #     qs_timegroup = exam_qs.filter(student=student_id)

                            #     if not qs_timegroup:
                            #         obj = Exam_to_group.objects.update_or_create(
                            #             exam_id=pk,
                            #             student_id=student_id
                            #         )

                            # for old_student_id in old_student_ids:
                            #     if not (old_student_id in student_data):
                            #         qs_student = exam_qs.filter(
                            #                 student=old_student_id
                            #             )
                            #         if qs_student:
                            #             qs_student.delete()

                return request.send_info("INF_002")
            else:
                return request.send_error_valid(serializer.errors)

        except Exception as e:
            return request.send_error('ERR_002', e.__str__())

    @has_permission(must_permissions=['lms-timetable-exam-delete'])
    def delete(self, request, pk=None):
        " Шалгалтын хуваарь устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ExamTimeTableCountAPIView(generics.GenericAPIView):
    """ Шалгалтын хуваарийн статистик тоо """

    queryset = ExamTimeTable.objects.all()
    def get_queryset(self):
        # --- Улирлын шалгалт
        queryset = self.queryset

        stype = self.request.query_params.get('stype')
        school = self.request.query_params.get('school')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        if stype:
            queryset = queryset.filter(stype=stype)

        if school:
            queryset = queryset.filter(school_id=school)
            # queryset = queryset.filter(
            #     Exists(Exam_to_group.objects.filter(exam=OuterRef('id'), group__school=school)) |
            #     Exists(ExamToSubGroup.objects.filter(exam=OuterRef('id'), sub_group__student__group__school=school)) |
            #     Exists(ExamToLevelGroup.objects.filter(exam=OuterRef('id'), level_group__student__group__school=school)) |
            #     Exists(ExamTimeTable.objects.filter(id=OuterRef('id')).filter(
            #         Exists(Teachers.objects.filter(id=OuterRef('teacher'), sub_org=school))
            #     ))
            # )

        return queryset

    # --- Давтан шалгалт
    def _get_repeat_queryset(self, repeat_count):
        # school = self.request.query_params.get('school')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        stype = self.request.query_params.get('stype')
        status = self.request.query_params.get('status')

        queryset = Exam_repeat.objects.filter(repeat_count=repeat_count)

        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)
        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)
        if stype:
            queryset = queryset.filter(stype=stype)
        if status:
            queryset = queryset.filter(status=status)
        # if school:
        #     queryset = queryset.filter(school=school)

        return queryset

    def _get_score_ranges(self):
        """ Score моделоос үнэлгээ тус бүрийн интервалыг нэгтгэж авах """
        ranges = {}

        for item in Score.objects.all():
            assessment = (item.assesment or '').replace('+', '')
            if assessment not in ranges:
                ranges[assessment] = {'score_min': item.score_min, 'score_max': item.score_max}
            else:
                if item.score_min < ranges[assessment]['score_min']:
                    ranges[assessment]['score_min'] = item.score_min
                if item.score_max > ranges[assessment]['score_max']:
                    ranges[assessment]['score_max'] = item.score_max
        return ranges

    def _calc_letter_distribution(self, student_ids, lesson_ids, lesson_year, lesson_season):
        """ Оюутны id, хичээлийн id-аар TeacherScore-с үсгэн үнэлгээ тооцох
        (энгийн болон давтан шалгалт хоёрт хоёуланд нь ашиглагдана) """
        result = {
            'a_students_count': 0,
            'b_students_count': 0,
            'c_students_count': 0,
            'd_students_count': 0,
            'f_students_count': 0,     # F + WF нийлбэр (унасан)
            'wf_students_count': 0,    # зөвхөн WF тоо (мэдээллийн зорилгоор тусад нь)
            'total_count': 0,
            'success': '',
            'quality': '',
        }

        ranges = self._get_score_ranges()
        # WF заавал байх ёстой гэж шаардахгүй (зарим сургуульд ашигладаггүй байж болно тул)
        if not all(letter in ranges for letter in ('A', 'B', 'C', 'D', 'F')):
            return result

        if not student_ids or not lesson_ids:
            return result

        rows = (
            TeacherScore.objects
            .filter(
                student_id__in=student_ids,
                score_type__lesson_teacher__lesson_id__in=lesson_ids,
                lesson_year=lesson_year,
                lesson_season=lesson_season,
            )
            .values('student_id', 'score_type__lesson_teacher__lesson_id')
            .annotate(
                teacher_score=Max(Case(
                    When(score_type__score_type=Lesson_teacher_scoretype.BUSAD, then=F('score')),
                    default=Value(0),
                    output_field=FloatField()
                )),
                exam_score=Max(Case(
                    When(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, then=F('score')),
                    default=Value(0),
                    output_field=FloatField()
                )),
                has_exam=Max(Case(
                    When(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField()
                )),
            )
        )

        # WF-ийг F-тэй ижил ач холбогдолтой боловч тусад нь тоолохын тулд жагсаалтад нэмсэн
        letters = ('A', 'B', 'C', 'D', 'F', 'WF')
        letter_counts = {letter: 0 for letter in letters}
        total_count = 0

        for row in rows:
            total_count += 1
            if not row['has_exam']:
                continue

            teacher_score = row['teacher_score'] or 0
            exam_score = row['exam_score'] or 0
            total = teacher_score + exam_score

            if teacher_score and teacher_score < 42:
                total = 0
            elif exam_score and exam_score < 18:
                total = 0

            for letter in letters:
                score_range = ranges.get(letter)
                if not score_range:
                    continue   # ranges-д WF байхгүй бол алгасна
                if score_range['score_min'] <= total <= score_range['score_max']:
                    letter_counts[letter] += 1
                    break

        # "Унасан" тоо нь F болон WF хоёрын нийлбэр
        unapproved_count = letter_counts['F'] + letter_counts['WF']

        result.update({
            'a_students_count': letter_counts['A'],
            'b_students_count': letter_counts['B'],
            'c_students_count': letter_counts['C'],
            'd_students_count': letter_counts['D'],
            'f_students_count': unapproved_count,
            'wf_students_count': letter_counts['WF'],
            'total_count': total_count,
        })

        if total_count > 0:
            # Success/quality тооцоход WF-ийг амжилттай гэж тооцохгүй тул F шиг адил хасна
            success = ((letter_counts['A'] + letter_counts['B'] + letter_counts['C']) * 100) / total_count
            quality = ((letter_counts['A'] + letter_counts['B']) * 100) / total_count
            result['success'] = f'{round(success)}%'
            result['quality'] = f'{round(quality)}%'

        return result

    def _get_score_distribution(self, queryset, exam_ids):
        """ Энгийн улирлын шалгалтын (ExamTimeTable) тархалт """
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if not lesson_year or not lesson_season:
            return self._calc_letter_distribution([], [], lesson_year, lesson_season)

        lesson_ids = list(queryset.values_list('lesson_id', flat=True).distinct())

        student_ids = set(
            Student.objects.filter(
                Exists(Exam_to_group.objects.filter(exam_id__in=exam_ids, group__student=OuterRef('pk'))) |
                Exists(ExamToSubGroup.objects.filter(exam_id__in=exam_ids, sub_group__student=OuterRef('pk'))) |
                Exists(ExamToLevelGroup.objects.filter(exam_id__in=exam_ids, level_group__student=OuterRef('pk')))
            ).values_list('id', flat=True)
        )

        return self._calc_letter_distribution(list(student_ids), lesson_ids, lesson_year, lesson_season)

    def _get_repeat_score_distribution(self, queryset, exam_ids, student_ids):
        """ Давтан шалгалтын (Exam_repeat) тархалт """
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if not lesson_year or not lesson_season:
            return self._calc_letter_distribution([], [], lesson_year, lesson_season)

        lesson_ids = list(queryset.values_list('lesson_id', flat=True).distinct())

        return self._calc_letter_distribution(student_ids, lesson_ids, lesson_year, lesson_season)

    def _get_regular_counts(self):
        """ repeat_count=0 үеийн энгийн тоолол — өмнөх логик хэвээрээ """
        queryset = self.get_queryset()
        exam_ids = list(queryset.values_list('id', flat=True))

        exam_count = len(exam_ids)
        lesson_count = queryset.values('lesson').distinct().count()

        group_count = (
            Exam_to_group.objects.filter(exam_id__in=exam_ids).values('group').distinct().count()
        )

        student_count = (
            Student.objects
            .filter(
                Exists(Exam_to_group.objects.filter(exam_id__in=exam_ids, group__student=OuterRef('pk'))) |
                Exists(ExamToSubGroup.objects.filter(exam_id__in=exam_ids, sub_group__student=OuterRef('pk'))) |
                Exists(ExamToLevelGroup.objects.filter(exam_id__in=exam_ids, level_group__student=OuterRef('pk')))
            )
            .distinct()
            .count()
        )

        score_distribution = self._get_score_distribution(queryset, exam_ids)

        is_confirmed = False
        confirm_date = None
        if queryset.exists():
            first_item = queryset.first()
            is_confirmed = getattr(first_item, 'is_confirm_ded', False)
            confirm_date = getattr(first_item, 'confirm_date_ded', None)

        return {
            'exam_count': exam_count,
            'lesson_count': lesson_count,
            'group_count': group_count,
            'student_count': student_count,
            'unapproved_student_count': score_distribution['f_students_count'],
            'success': score_distribution['success'],
            'quality': score_distribution['quality'],
            'is_confirmed': is_confirmed,
            'confirm_date': confirm_date.strftime('%Y-%m-%d %H:%M') if confirm_date else None,
        }

    def _get_repeat_counts(self, repeat_count):
        """ repeat_count=1 эсвэл 2 үеийн Exam_repeat дээрх тоолол """
        queryset = self._get_repeat_queryset(repeat_count)
        exam_ids = list(queryset.values_list('id', flat=True))

        exam_count = len(exam_ids)
        lesson_count = queryset.values('lesson').distinct().count()

        # Exam_repeat дээр group шууд байхгүй тул бүртгэгдсэн оюутнуудаар нь гаргана
        student_ids = list(
            Exam_to_student.objects.filter(exam_id__in=exam_ids)
            .values_list('student_id', flat=True).distinct()
        )
        student_count = len(student_ids)

        group_count = (
            Student.objects.filter(id__in=student_ids).values('group').distinct().count()
        )

        score_distribution = self._get_repeat_score_distribution(queryset, exam_ids, student_ids)

        is_confirmed = False
        confirm_date = None
        if queryset.exists():
            first_item = queryset.first()
            is_confirmed = getattr(first_item, 'is_confirm_ded', False)
            confirm_date = getattr(first_item, 'confirm_date_ded', None)

        return {
            'exam_count': exam_count,
            'lesson_count': lesson_count,
            'group_count': group_count,
            'student_count': student_count,
            'unapproved_student_count': score_distribution['f_students_count'],
            'success': score_distribution['success'],
            'quality': score_distribution['quality'],
            'is_confirmed': is_confirmed,
            'confirm_date': confirm_date.strftime('%Y-%m-%d %H:%M') if confirm_date else None,
        }

    def get(self, request):
        " Шалгалтын хуваарийн статистик тоо "

        repeat_count = request.query_params.get('repeat_count')
        try:
            repeat_count = int(repeat_count) if repeat_count not in (None, '') else 0
        except (TypeError, ValueError):
            repeat_count = 0

        if repeat_count in (Exam_repeat.REPEAT_1, Exam_repeat.REPEAT_2):
            data = self._get_repeat_counts(repeat_count)
        else:
            data = self._get_regular_counts()

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class Exam_repeatListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Exam_repeat.objects.all()
    serializer_class = Exam_repeatSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name','teacher__last_name']

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.kwargs.get('pk') or (self.request.parser_context and self.request.parser_context.get('kwargs', {}).get('pk')):
            return queryset

        params = self.request.query_params
        filters = {}
        sorting = params.get("sorting")

        if params.get('lesson_year'):
            filters['lesson_year'] = params.get('lesson_year')
        if params.get('lesson_season'):
            filters['lesson_season'] = params.get('lesson_season')
        if params.get('status'):
            filters['status'] = params.get('status')
        else:
            queryset = queryset.exclude(status=Exam_repeat.REPLACE_EXAM)
        if params.get('teacher'):
            filters['teacher'] = params.get('teacher')

        if params.get('repeat_count'):
            filters['repeat_count'] = params.get('repeat_count')
        else:
            return self.request.send_error("ERR_002")

        queryset = queryset.filter(**filters)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)
            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):
        self.serializer_class = Exam_repeatLiseSerializer

        if pk:
            repeat = self.retrieve(request, pk).data
            return request.send_data(repeat)

        all_result = self.list(request).data
        return request.send_data(all_result)

    @transaction.atomic
    def post(self, request):
        " Дахин шалгалт өгөх бүртгэл шинээр үүсгэх "
        self.serializer_class = Exam_repeatSerializer

        request_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        students = request_data.get('students')
        teachers = request_data.get('teacher')
        repeat_count = int(request_data.get('repeat_count', 1))

        if students:
            request_data = remove_key_from_dict(request_data,'students')
        else:
            return request.send_error("ERR_001", "Сурагчгүй шалгалт авах боломжгүй")

        exams_ids = request_data.get('exams', [])

        if repeat_count == Exam_repeat.REPEAT_2:
            if exams_ids:
                if not isinstance(exams_ids, list):
                    exams_ids = [exams_ids]
                previous_repeats_exist = Exam_repeat.objects.filter(id__in=exams_ids).exists()
                if not previous_repeats_exist:
                    return request.send_error("ERR_002", "Өмнөх давтан шалгалтын бүртгэл олдсонгүй.")
            else:
                return request.send_error("ERR_002", "Өмнөх шалгалтын хуваарийг сонгоно уу.")

        create_students = []
        serializer = self.get_serializer(data=request_data)

        try:
            if serializer.is_valid(raise_exception=False):
                try:
                    with transaction.atomic():
                        exam_instance = serializer.save()
                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_table_id = exam_instance.id

                        if exams_ids and hasattr(exam_instance, 'exams'):
                            exam_instance.exams.set(exams_ids)

                        # Багшийг олноор нэмэх
                        Exam_repeat.objects.get(id=exam_table_id).teacher.set(teachers)
                        if students:
                            for student in students:
                                if not Exam_to_student.objects.filter(exam=exam_table_id, student=student).exists():
                                    create_students.append(
                                        Exam_to_student(
                                            exam_id=exam_table_id,
                                            student_id=student
                                        )
                                    )
                            Exam_to_student.objects.bulk_create(create_students)

                    return request.send_info("INF_001")

                except Exception:
                    traceback.print_exc()

                    return request.send_error("ERR_002", "Шалгалтын хуваарь давхцаж байна.")
            else:
                print(serializer.errors)

                return request.send_error_valid(get_translated_serializer_errors(serializer.errors))

        except Exception as e:
            traceback.print_exc()

            return request.send_error('ERR_002', e.__str__())

    @transaction.atomic
    def put(self, request, pk=None):
        " Дахин шалгалт өгөх бүртгэл шинээр үүсгэх "

        request_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        instance = self.get_object()

        students = request_data.get('selected_students') or request_data.get('students')
        exams_ids = request_data.get('exams', [])
        teachers = request_data.get('teacher')

        serializer = self.get_serializer(instance, data=request_data, partial=True)

        try:
            if serializer.is_valid():
                with transaction.atomic():
                    updated_instance = serializer.save()

                    # Handle Many-to-Many updates safely if present in payload
                    if exams_ids is not None:
                        if not isinstance(exams_ids, list):
                            exams_ids = [exams_ids]
                        if hasattr(updated_instance, 'exams'):
                            updated_instance.exams.set(exams_ids)

                    if teachers is not None:
                        updated_instance.teacher.set(teachers)

                    # Update students if the list is passed during edit
                    if students is not None:
                        # Clear old mappings and write new ones
                        Exam_to_student.objects.filter(exam=updated_instance.id).delete()
                        create_students = [
                            Exam_to_student(exam_id=updated_instance.id, student_id=student)
                            for student in students
                        ]
                        Exam_to_student.objects.bulk_create(create_students)
            else:
                print(serializer.errors)
                return request.send_error_valid(get_translated_serializer_errors(serializer.errors))

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        " Дахин шалгалт өгөх бүртгэл устгах "

        exam_qs = self.queryset.filter(id=pk).first()
        if exam_qs:
            lesson = exam_qs.lesson
            status = exam_qs.status
            id = exam_qs.id
            lesson_year = exam_qs.lesson_year
            lesson_season = exam_qs.lesson_season
            students = Exam_to_student.objects.filter(exam=id).values_list('student',flat=True)

            score_qs = ScoreRegister.objects.filter(lesson=lesson,student_id__in=students,status=int(status)+4,lesson_year=lesson_year,lesson_season=lesson_season,is_delete=False)
            if score_qs:
                return request.send_error("ERR_003", 'Энэ шалгалтын дүн нь орсон тул устгах боломжгүй.')

            Exam_to_student.objects.filter(exam=id).delete()

        self.destroy(request, pk)
        return request.send_info("INF_003")


class ExamListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = Exam_repeat.objects.all()
    serializer_class = Exam_repeatLiseSerializer
    def get(self, request, pk=None):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(
            lesson_year=lesson_year,
            lesson_season=lesson_season
        ).prefetch_related('exams', 'teacher')
        all_result = self.list(request).data
        return request.send_data(all_result)


class ExamRepeatStudentScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    queryset = ScoreRegister.objects.all()
    serializer_class = StudentScoreListSerializer

    @has_permission(must_permissions=['lms-stipend-read'])
    def get(self, request, student=None, lesson=None):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        if student and lesson:
            self.queryset = self.queryset.filter(
                    lesson=lesson,
                    student=student,
                    is_delete=False
                )

        all_result = self.list(request).data

        return request.send_data(all_result)


@permission_classes([IsAuthenticated])
class TimeTablePotok(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects
    serializer_class = PotokSerializer

    def get_queryset(self):
        queryset = self.queryset.filter(is_kurats=False, is_block=False)

        year = self.request.query_params.get('year')
        season = self.request.query_params.get('season')
        lesson = self.request.query_params.get('lesson')
        potok = self.request.query_params.get('potok')
        school = self.request.query_params.get('school')

        if school:
            queryset = queryset.filter(school=school)

        # Жил хайлт хийх
        if year:
            queryset = queryset.filter(lesson_year=year)

        # Улирал хайлт хийх
        if season:
            queryset = queryset.filter(lesson_season=season)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        if potok:
            queryset = queryset.filter(potok=potok)

        return queryset

    def get(self, request):
        """ Нэг хичээлийн нэг потокийн хуваарь """

        datas = self.list(request).data

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class TimeTable1APIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    def get(self, request):
        queryset = self.queryset

        year = self.request.query_params.get('year')
        season = self.request.query_params.get('season')
        is_calendar = self.request.query_params.get('isCalendar')
        dep_id = self.request.query_params.get('selectedValue')

        # Хичээлийн жил
        if year:
            queryset = queryset.filter(lesson_year=year)

        # Хичээлийн улирал
        if season:
            queryset = queryset.filter(lesson_season=season)

        if not year and not season:
            year, season = get_active_year_season()

        if str2bool(is_calendar):
            timetables = queryset.filter(is_kurats=True).values('end_date', 'begin_date', 'potok', 'lesson').distinct('end_date', 'begin_date', 'potok', 'lesson')
            time_ids = []

            for timetable in timetables:
                end_date = timetable.get('end_date')
                begin_date = timetable.get('begin_date')
                potok = timetable.get('potok')
                lesson = timetable.get('lesson')

                obj_time = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date, potok=potok, lesson=lesson).first()
                time_id = obj_time.id

                time_ids.append(time_id)

            queryset = queryset.filter(id__in=time_ids)
        else:
            queryset = queryset.filter(is_kurats=False)

        # Хөтөлбөрийн багаар хайлт хийх
        if dep_id:
            group_ids = Group.objects.filter(department_id=dep_id).values_list('id', flat=True)
            t_ids = TimeTable_to_group.objects.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            queryset = queryset.filter(id__in=t_ids)

        self.queryset = queryset

        self.serializer_class = TimeTableListSerializer

        serializer = self.list(request)

        timetable_list = serializer.data

        def check_score_lesson(lesson, teacher):
            score = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson, teacher=teacher, teach_score__isnull=False).first()
            if score:
                return True

            return False

        for clist in timetable_list:

            begin_date = clist.get('begin_date')
            end_date = clist.get('end_date')
            times = []
            if begin_date and end_date:
                times = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date).values_list('time', flat=True).distinct('time')
                clist['times'] = list(times)

            # Хичээлийн дүн орсон эсэхийг шалгах
            teacher = clist.get('teacher').get('id')
            t_lesson = clist.get('lesson').get('id')
            is_score = check_score_lesson(t_lesson, teacher)
            clist['is_score'] = is_score

            # Өнгө шалгах
            if clist.get('color'):
                color_type = isLightOrDark(clist.get('color'))
                clist['textColor'] = color_type
                clist['scolor'] = clist.get('color')

            clist['color'] = clist.get('color')

        return request.send_data(timetable_list)


@permission_classes([IsAuthenticated])
class TimeTableKuratsAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    def get(self, request):
        dep_id = self.request.query_params.get('selectedValue')
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')

        year, season = get_active_year_season()

        start_month = datetime.strptime(start_date, '%Y-%m-%d')
        end_month = datetime.strptime(end_date, '%Y-%m-%d')
        queryset = self.queryset.filter(is_kurats=True, lesson_year=year, begin_date__gte=start_month, end_date__lte=end_month)

        timetables = queryset.values('end_date', 'begin_date', 'potok', 'lesson').distinct('end_date', 'begin_date', 'lesson', 'potok')
        time_ids = []

        for timetable in timetables:
            end_date = timetable.get('end_date')
            begin_date = timetable.get('begin_date')
            potok = timetable.get('potok')
            lesson = timetable.get('lesson')

            obj_time = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date, potok=potok, lesson=lesson).first()
            time_id = obj_time.id

            time_ids.append(time_id)

        self.queryset = self.queryset.filter(id__in=time_ids)

        # Хөтөлбөрийн багаар хайлт хийх
        if dep_id:
            group_ids = Group.objects.filter(department_id=dep_id).values_list('id', flat=True)
            t_ids = TimeTable_to_group.objects.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            self.queryset = self.queryset.filter(id__in=t_ids)

        # region frontend filters
        filters_dict = build_filters_dict(['teacher', 'day', 'lesson'], request.query_params)
        self.queryset = self.queryset.filter(**filters_dict)

        # region to filter by group
        group = request.query_params.get('group')

        if group:
            self.queryset = self.queryset.filter(Exists(TimeTable_to_group.objects.filter(timetable=OuterRef('id'), group=group)))
        # endregion
        # endregion frontend filters

        self.serializer_class = TimeTableListSerializer
        serializer = self.list(request)
        timetable_list = serializer.data

        def check_score_lesson(lesson, teacher):
            score = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson, teacher=teacher, teach_score__isnull=False).first()
            if score:
                return True

            return False

        for clist in timetable_list:

            begin_date = clist.get('begin_date')
            end_date = clist.get('end_date')
            times = []
            if begin_date and end_date:
                times = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date).values_list('time', flat=True).distinct('time')
                clist['times'] = list(times)

            # Хичээлийн дүн орсон эсэхийг шалгах
            teacher = clist.get('teacher').get('id')
            t_lesson = clist.get('lesson').get('id')
            is_score = check_score_lesson(t_lesson, teacher)
            clist['is_score'] = is_score

            # Өнгө шалгах
            if clist.get('color'):
                color_type = isLightOrDark(clist.get('color'))
                clist['textColor'] = color_type
                clist['scolor'] = clist.get('color')

            clist['color'] = clist.get('color')

        return request.send_data(timetable_list)


@permission_classes([IsAuthenticated])
class TimeTableNewAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all().filter(is_kurats=False)
    serializer_class = TimeTableSerializer

    # pagination_class = RawQueryCustomPagination

    def get(self, request):
        st_time = start_time()
        # queryset = self.get_queryset()
        week = get_dates_from_week()

        begin_date = week.get('start_date')
        end_date = week.get('end_date')
        is_volume = request.query_params.get('is_volume')

        if not begin_date and not end_date:
            current_date = datetime.today()
            begin_date = current_date - timedelta(days=current_date.weekday())
            end_date = begin_date + timedelta(days=6)

        dep_id = self.request.query_params.get('selectedValue')

        year, season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=year.strip(), lesson_season=season)

        # frontend filters
        teacher = request.query_params.get('teacher')
        group = request.query_params.get('group')
        day = request.query_params.get('day')
        lesson = request.query_params.get('lesson')
        is_include_kurats = request.query_params.get('isIncludeKurats')

        estimate_query = '''
            SELECT 8 as day, true as is_default, ls.school_id, tt.id as event_id,  tt.lesson_id AS lesson, ls.is_general,  tt.teacher_id as teacher, ls.name as lesson_name,  CONCAT(SUBSTRING(cu.last_name, 1, 1), '.', cu.first_name) as teacher_name,
            CASE
                WHEN tt.type = 1 THEN 'Лаб'
                WHEN tt.type  = 2 THEN 'Лк'
                WHEN tt.type  = 3 THEN 'Сем'
                WHEN tt.type  = 4 THEN 'Бу'
                WHEN tt.type  = 5 THEN 'Прак'
                WHEN tt.type  = 6 THEN 'Б/д'
            ELSE ''
            END AS title,

            CASE
                WHEN tt.type = 1 THEN 'Лаборатори'
                WHEN tt.type  = 2 THEN 'Лекц'
                WHEN tt.type  = 3 THEN 'Семинар'
                WHEN tt.type  = 4 THEN 'Бусад'
                WHEN tt.type  = 5 THEN 'Практик'
                WHEN tt.type  = 6 THEN 'Бие даалт'
            ELSE ''
            END AS type_name,
            t.group,
            ta.group_list,
            public.get_time(tt.id) as time
            FROM lms_teachercreditvolumeplan tt
            LEFT JOIN lms_lessonstandart ls
            ON tt.lesson_id = ls.id
            LEFT JOIN core_userinfo cu
            ON tt.teacher_id = cu.id,
            LATERAL (
                SELECT ARRAY(
                    SELECT gr.name
                    FROM lms_TeacherCreditVolumePlan_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.creditvolume_id=tt.id

                ) AS group
            ) t,

            LATERAL (
                SELECT ARRAY(
                    SELECT  CAST(gr.id as varchar)
                    FROM lms_TeacherCreditVolumePlan_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.creditvolume_id=tt.id

                ) AS group_list
            ) ta

            WHERE tt.lesson_year='{year}' and tt.lesson_season_id ='{season}' and tt.teacher_id is not null and is_timetable is false {dep_condition}
            {teacher_filter}
            {group_filter}
            {day_filter}
            {lesson_filter}
        '''.format(
            year=year,
            season=season,
            dep_condition=f"AND tt.id in ( SELECT creditvolume_id FROM lms_TeacherCreditVolumePlan_group WHERE group_id in (SELECT id FROM lms_group WHERE department_id={dep_id}))" if dep_id else '',
            teacher_filter=f'and tt.teacher_id = {teacher}' if teacher else '',
            group_filter=f"and '{group}' = ANY(ta.group_list)" if group else '',
            # day_filter=f'and tt.day = {day}' if day else '',
            day_filter='',
            lesson_filter=f'and tt.lesson_id = {lesson}' if lesson else '',
        )

        query = '''
            SELECT tt.color, tt.is_optional, ls.school_id, tt.id as event_id, tt.day, tt.time,  tt.lesson_id AS lesson, ls.is_general,  tt.room_id AS room, tt.teacher_id as teacher, ls.name as lesson_name,  CONCAT(r.code , ' ', r.name) as room_name, CONCAT(SUBSTRING(cu.last_name, 1, 1), '.', cu.first_name) as teacher_name,
            CASE
                WHEN tt.type = 1 THEN 'Лаб'
                WHEN tt.type  = 2 THEN 'Лк'
                WHEN tt.type  = 3 THEN 'Сем'
                WHEN tt.type  = 4 THEN 'Бу'
                WHEN tt.type  = 5 THEN 'Прак'
                WHEN tt.type  = 6 THEN 'Б/д'
            ELSE ''
            END AS title,

            CASE
                WHEN tt.type = 1 THEN 'Лаборатори'
                WHEN tt.type  = 2 THEN 'Лекц'
                WHEN tt.type  = 3 THEN 'Семинар'
                WHEN tt.type  = 4 THEN 'Бусад'
                WHEN tt.type  = 5 THEN 'Практик'
                WHEN tt.type  = 6 THEN 'Бие даалт'
            ELSE ''
            END AS type_name,
            t.group,
            ta.group_list,
            (SELECT  case when COUNT(*)>0 THEN True ELSE False end gg FROM lms_scoreregister  ls WHERE ls.lesson_id = tt.lesson_id and ls.teacher_id = tt.teacher_id and lesson_year='{year}' and lesson_season_id={season})  as is_score,
            public.get_color(tt.color) as textColor

            FROM lms_timetable tt
            LEFT JOIN lms_lessonstandart ls
            ON tt.lesson_id = ls.id
            LEFT JOIN lms_room r
            ON tt.room_id = r.id
            LEFT JOIN core_userinfo cu
            ON tt.teacher_id = cu.id,
            LATERAL (
                SELECT ARRAY(
                    SELECT gr.name
                    FROM lms_timetable_to_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.timetable_id=tt.id

                ) AS group
            ) t,

            LATERAL (
                SELECT ARRAY(
                    SELECT  CAST(gr.id as varchar)
                    FROM lms_timetable_to_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.timetable_id=tt.id

                ) AS group_list
            ) ta

            WHERE tt.lesson_year='{year}' and tt.lesson_season_id ={season} {dep_condition} {is_kurats}
            {teacher_filter}
            {group_filter}
            {day_filter}
            {lesson_filter}
        '''.format(
            year=year,
            season=season,
            begin_date=begin_date,
            end_date=end_date,
            dep_condition=f"AND tt.id in ( SELECT timetable_id FROM lms_timetable_to_group WHERE group_id in (SELECT id FROM lms_group WHERE department_id={dep_id}))" if dep_id else '',
            teacher_filter=f'and tt.teacher_id = {teacher}' if teacher else '',
            group_filter=f"and '{group}' = ANY(ta.group_list)" if group else '',
            day_filter=f'and tt.day = {day}' if day else '',
            lesson_filter=f'and tt.lesson_id = {lesson}' if lesson else '',
            is_kurats=f'' if is_include_kurats == 'true' else 'and is_kurats is false',
        )

        cursor = connection.cursor()
        cursor.execute(query)
        rows = list(dict_fetchall(cursor))

        if is_volume == 'true':
            # Цагийн ачаалал
            credit_cursor = connection.cursor()
            credit_cursor.execute(estimate_query)
            estimate_rows = list(dict_fetchall(credit_cursor))
            for est_row in estimate_rows:
                rows.append(est_row)

        return request.send_data(rows)

    def put(self, request, pk=None):
        errors = []

        datas = request.data

        estimate = TeacherCreditVolumePlan.objects.get(pk=pk)

        day = datas.get('day')
        time = datas.get('time')
        odd_even = datas.get('odd_even')
        school = datas.get('school')

        lesson = estimate.lesson
        teacher = estimate.teacher
        year, season = get_active_year_season()

        season_obj = Season.objects.get(id=season)
        school_obj = SubOrgs.objects.get(pk=school)

        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume=pk).values_list('group', flat=True)

        st_count = Student.objects.filter(group_id__in=group_ids).count()

        datas['st_count'] = st_count

        qs_timetable = self.queryset.filter(lesson_year=year, lesson_season_id=season, day=day, time=time, odd_even__in=[odd_even])

        timetable_ids = qs_timetable.values_list('id', flat=True)

        qs_teacher = qs_timetable.filter(teacher_id=teacher)

        # Багшийн давхцал
        if len(qs_teacher) > 0:
            teacher_obj = qs_teacher.first()
            clesson = teacher_obj.lesson.name
            time = teacher_obj.time
            day = teacher_obj.day

            msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=clesson, day=day, time=time)

            return request.send_error("ERR_003", msg)

        # Сонгон хичээл биш тухайн ангийн хичээлийн хуваарийн давхцалыг шалгах
        if len(timetable_ids) > 0:
            qs = self.queryset.filter(id__in=timetable_ids).first()

            # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
            glesson = qs.lesson.name
            for group in group_ids:

                # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id__in=timetable_ids, group_id=group)
                if len(qs_timetable_group) > 0:
                    qs_groups = qs_timetable_group.first()
                    group_name = qs_groups.group.name
                    msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=glesson, day=day, time=time)
                    return request.send_error("ERR_003", msg)

        datas['lesson_id'] = lesson.id
        datas['teacher_id'] = teacher.id
        datas['school'] = school_obj if school_obj else None
        datas['type'] = estimate.type
        datas['lesson_season'] = season_obj
        datas['lesson_year'] = year
        datas['created_user_id'] = request.user.id

        try:
            with transaction.atomic():
                table_data, created = self.queryset.update_or_create(
                    lesson=lesson,
                    teacher=teacher,
                    type=estimate.type,
                    lesson_year=year,
                    lesson_season=season_obj,
                    defaults={
                        **datas
                    }
                )
                # Цагийн хуваарийн хүснэгтийн id
                table_id=table_data.id

                if len(group_ids) > 0:
                    group_datas = []

                    for group_id in group_ids:
                        timetable_group = TimeTable_to_group.objects.filter(group_id=group_id, timetable_id=table_id).first()
                        if not timetable_group:
                            group_datas.append(
                                TimeTable_to_group(
                                    group_id=group_id,
                                    timetable_id=table_id
                                )
                            )

                    TimeTable_to_group.objects.bulk_create(group_datas)

                estimate.is_timetable = True
                estimate.save()

                return request.send_info("INF_001")

        except Exception as e:
            print(e)
            print(e)
            return request.send_error("ERR_002", "Хичээлийн хуваарь давхцаж байна.")


@permission_classes([IsAuthenticated])
class TimeTableResource(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн resource """

    def get(self, request):
        all_list = []
        qs_lesson = LessonStandart.objects
        qs_room = Room.objects

        # Хэрэглэгчид дундаас багш нарыг авах queryset
        qs_teacher = get_teacher_queryset()

        qs_tgroup = TimeTable_to_group.objects

        school = self.request.query_params.get('school')

        selectedValue = self.request.query_params.get('selectedValue')

        # Calendar төрөл (энгийн, курац)
        stype = self.request.query_params.get('stype')

        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')

        queryset = TimeTable.objects.all().filter(is_kurats=False)
        credit_queryset = TeacherCreditVolumePlan.objects.all().exclude(teacher__isnull=True)

        # Хичээлийн жил
        if year:
            queryset = queryset.filter(lesson_year=year)
            credit_queryset = credit_queryset.filter(lesson_year=year)

        # Хичээлийн улирал
        if season:
            queryset = queryset.filter(lesson_season=season)
            credit_queryset = credit_queryset.filter(lesson_season=season)

        if school:
            queryset = queryset.filter(school=school)
            qs_tgroup = qs_tgroup.filter(group__school=school)
            credit_queryset = credit_queryset.filter(school=school)

        try:
            # Ангиар хайлт хийх хэсэг
            if stype == 'group':
                if selectedValue:
                    qs_tgroup = qs_tgroup.filter(group__department_id=selectedValue)

                timetable_group_ids = qs_tgroup.order_by('group__name').values('group')

                for tgroup in timetable_group_ids:
                    obj_datas = {}
                    group_id = tgroup.get('group')

                    obj_group = Group.objects.filter(id=group_id).first()
                    obj_datas['title'] = obj_group.name
                    obj_datas['id'] =  '{group_id}'.format(group_id=group_id)

                    all_list.append(obj_datas)

            # Багшаар хайлт хийх хэсэг
            elif stype == 'teacher':

                if school:
                    qs_teacher = qs_teacher.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))
                if selectedValue:
                    qs_teacher = qs_teacher.filter(salbar_id=selectedValue)

                all_list = qs_teacher.values('id', 'first_name', 'last_name')

                for item in all_list:
                    firstName = item.get('first_name')
                    lastName = item.get('last_name')
                    teacher_id = item.get('id')

                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)
                    lesson = Lesson_to_teacher.objects.filter(teacher_id=teacher_id).last()

                    item['title'] = fullName
                    item['lesson_id'] = lesson.lesson.id if lesson else ""

            # Хичээлээр хайх үед тухайн сургуулийн сургалтын төлөвлөгөөнд байгаа идэвхтэй улиралд шивэгдсэн хичээлүүдийг авна
            elif stype == 'lesson':

                # Идэвхтэй жил
                qs_set = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).last()
                active_season = qs_set.active_lesson_season
                season_code = active_season.season_code

                qs_lplan = LearningPlan.objects.all()

                if school:
                    qs_lplan = qs_lplan.filter(school=school)
                even_i = []
                odd_i = []

                if selectedValue:
                    qs_lplan = qs_lplan.filter(department_id=selectedValue)

                for i in range(1,13):
                    if i % 2 == 0:
                        even_i.append(str(i))
                    else:
                        odd_i.append(str(i))

                # Идэвхтэй улиралд байгаа хичээлүүдийг авах
                if season_code == 1:
                    lookups = [Q(season__contains=str(value)) for value in odd_i]

                    # Combine the individual lookups using the OR operator (|) for a match on any of the values
                    filter_query = Q()
                    for lookup in lookups:
                        filter_query |= lookup

                    lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')
                else:
                    lookups = [Q(season__contains=str(value)) for value in even_i]

                    # Combine the individual lookups using the OR operator (|) for a match on any of the values
                    filter_query = Q()
                    for lookup in lookups:
                        filter_query |= lookup

                    lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')

                for lesson_id in lesson_ids:
                    lesson = qs_lesson.filter(id=lesson_id).last()

                    # Хичээл багш холбогдсон байгаа хичээлийг авна.
                    teachers = Lesson_to_teacher.objects.filter(lesson_id=lesson_id).values_list('teacher', flat=True)
                    for teacher_id in teachers:
                        obj_datas= {}

                        teacher = qs_teacher.filter(id=teacher_id).first()
                        if not teacher:
                            continue

                        firstName = teacher.first_name if teacher else ''
                        lastName =teacher.last_name if teacher else ''
                        fullName = None

                        if firstName and lastName:
                            fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                        obj_datas['title'] = fullName if fullName else lesson.name
                        obj_datas['lesson'] = lesson.name if lesson else ''
                        obj_datas['id'] = '{}_{}'.format(lesson_id, teacher_id)

                        all_list.append(obj_datas)
            else:
                all_list = qs_room.values('id', 'code').order_by('code')

                for item in all_list:
                    room_obj = qs_room.filter(id=item.get('id')).first()
                    item['title'] = room_obj.full_name

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class TimeTableResource1(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн resource """

    def filter_tcvpg_by_frontend(self, teacher_credit_volume_plan_group_qs):
        teacher_credit_volume_plan_group_qs = qs_simple_filter(teacher_credit_volume_plan_group_qs, 'creditvolume__teacher', self.request.query_params.get('teacher'))
        teacher_credit_volume_plan_group_qs = qs_simple_filter(teacher_credit_volume_plan_group_qs, 'creditvolume__lesson', self.request.query_params.get('lesson'))
        teacher_credit_volume_plan_group_qs = qs_simple_filter(teacher_credit_volume_plan_group_qs, 'group', self.request.query_params.get('group'))

        # NOTE this hides all in test on 2025-11-17. may be data in database is not right sometimes so it is commented for better days
        # region to filter by day
        # day = self.request.query_params.get('day')

        # if day:
        #     teacher_credit_volume_plan_group_qs = teacher_credit_volume_plan_group_qs.filter(
        #         Exists(
        #             TimeTable.objects.annotate(tcvpg_group=OuterRef('group')).filter(
        #                 Exists(
        #                     TimeTable_to_group.objects.filter(
        #                         timetable=OuterRef('id'),
        #                         group=OuterRef('tcvpg_group'),
        #                     ),
        #                 ),
        #                 lesson_year=OuterRef('creditvolume__lesson_year'),
        #                 lesson_season=OuterRef('creditvolume__lesson_season'),
        #                 lesson=OuterRef('creditvolume__lesson'),
        #                 teacher=OuterRef('creditvolume__teacher'),
        #                 day=day,
        #             )
        #         )
        #     )
        # endregion

        return teacher_credit_volume_plan_group_qs

    def filter_tcvp_by_frontend(self, teacher_credit_volume_plan_qs):
        teacher_credit_volume_plan_qs = qs_simple_filter(teacher_credit_volume_plan_qs, 'teacher', self.request.query_params.get('teacher'))
        teacher_credit_volume_plan_qs = qs_simple_filter(teacher_credit_volume_plan_qs, 'lesson', self.request.query_params.get('lesson'))

        # region to filter by group
        group = self.request.query_params.get('group')

        if group:
            teacher_credit_volume_plan_qs = teacher_credit_volume_plan_qs.filter(Exists(TeacherCreditVolumePlan_group.objects.filter(creditvolume=OuterRef('id'), group=group)))
        # endregion

        # NOTE this hides all in test on 2025-11-17. may be data in database is not right sometimes so it is commented for better days
        # region to filter by day
        # day = self.request.query_params.get('day')

        # if day:
        #     teacher_credit_volume_plan_qs = teacher_credit_volume_plan_qs.filter(
        #         Exists(
        #             TimeTable.objects.annotate(tcvp=OuterRef('id')).filter(
        #                 Exists(
        #                     TimeTable_to_group.objects.annotate(tcvp=OuterRef('tcvp')).filter(
        #                         Exists(
        #                             TeacherCreditVolumePlan_group.objects.filter(
        #                                 creditvolume=OuterRef('tcvp'),
        #                                 group=OuterRef('group'),
        #                             )
        #                         ),
        #                         timetable=OuterRef('id'),
        #                     ),
        #                 ),
        #                 lesson_year=OuterRef('lesson_year'),
        #                 lesson_season=OuterRef('lesson_season'),
        #                 lesson=OuterRef('lesson'),
        #                 teacher=OuterRef('teacher'),
        #                 day=day,
        #             )
        #         )
        #     )
        # endregion

        return teacher_credit_volume_plan_qs

    def filter_ttg_by_frontend(self, timetable_to_group_qs):
        timetable_to_group_qs = qs_simple_filter(timetable_to_group_qs, 'timetable__teacher', self.request.query_params.get('teacher'))
        timetable_to_group_qs = qs_simple_filter(timetable_to_group_qs, 'timetable__day', self.request.query_params.get('day'))
        timetable_to_group_qs = qs_simple_filter(timetable_to_group_qs, 'timetable__lesson', self.request.query_params.get('lesson'))
        timetable_to_group_qs = qs_simple_filter(timetable_to_group_qs, 'group', self.request.query_params.get('group'))

        return timetable_to_group_qs

    def filter_tt_by_frontend(self, timetable_qs):
        timetable_qs = qs_simple_filter(timetable_qs, 'teacher', self.request.query_params.get('teacher'))
        timetable_qs = qs_simple_filter(timetable_qs, 'day', self.request.query_params.get('day'))
        timetable_qs = qs_simple_filter(timetable_qs, 'lesson', self.request.query_params.get('lesson'))

        # region to filter by group
        group = self.request.query_params.get('group')

        if group:
            timetable_qs = timetable_qs.filter(Exists(TimeTable_to_group.objects.filter(timetable=OuterRef('id'), group=group)))
        # endregion

        return timetable_qs

    def get(self, request):
        all_list = []

        # Хэрэглэгчид дундаас багш нарыг авах queryset
        qs_teacher = get_teacher_queryset()
        year, season = get_active_year_season()

        is_volume = request.query_params.get('is_volume')
        is_volume = "false"

        if str2bool(is_volume):
            qs_tgroup = TeacherCreditVolumePlan_group.objects.filter(creditvolume__lesson_year=year, creditvolume__lesson_season=season)
            time_tablequeryset = TeacherCreditVolumePlan.objects.exclude(teacher__isnull=True).filter(lesson_year=year.strip(), lesson_season=season)

            # frontend filters
            qs_tgroup = self.filter_tcvpg_by_frontend(qs_tgroup)
            time_tablequeryset = self.filter_tcvp_by_frontend(time_tablequeryset)
        else:
            time_tablequeryset = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
            timetable_ids = time_tablequeryset.values_list('id', flat=True)
            qs_tgroup = TimeTable_to_group.objects.filter(timetable__in=list(timetable_ids))

            # frontend filters
            qs_tgroup = self.filter_ttg_by_frontend(qs_tgroup)
            time_tablequeryset = self.filter_tt_by_frontend(time_tablequeryset)

        school = self.request.query_params.get('school')
        selectedValue = self.request.query_params.get('selectedValue')

        # Хайх төрлөөс хамаараад сонгогдсон утга
        option_filter = self.request.query_params.get('option')

        # Calendar төрөл (энгийн, курац)
        stype = self.request.query_params.get('stype')

        if selectedValue:
            group_ids = Group.objects.filter(department_id=selectedValue).values_list('id', flat=True)
            if is_volume == 'true':
                t_ids = qs_tgroup.filter(group_id__in=group_ids).values_list('creditvolume', flat=True)
            else:
                t_ids = qs_tgroup.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            time_tablequeryset = time_tablequeryset.filter(id__in=t_ids)

        if school:
            qs_tgroup = qs_tgroup.filter(group__school=school)
            time_tablequeryset = time_tablequeryset.filter(Q(Q(school=school) | Q(lesson__is_general=True)))

        # Ангиар хайлт хийх хэсэг
        if stype == 'group':
            if selectedValue:
                qs_tgroup = qs_tgroup.filter(group__department=selectedValue)

            if option_filter:
                qs_tgroup = qs_tgroup.filter(group=option_filter)

            groups = qs_tgroup.order_by('group__name').values('group__name', 'group')

            for tgroup in groups:
                obj_datas = {}

                obj_datas['title'] = tgroup.get('group__name')
                obj_datas['id'] =  '{group_id}'.format(group_id=tgroup.get('group'))

                all_list.append(obj_datas)

        # Багшаар хайлт хийх хэсэг
        elif stype == 'teacher':

            timetable_teachers = time_tablequeryset.values_list('teacher', flat=True)
            qs_teacher = qs_teacher.filter(id__in=timetable_teachers)

            if school:
                qs_teacher = qs_teacher.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))

            if selectedValue:
                qs_teacher = qs_teacher.filter(salbar_id=selectedValue)

            if option_filter:
                qs_teacher = qs_teacher.filter(id=option_filter)

            all_list = qs_teacher.values('id', 'first_name', 'last_name')

            for item in all_list:
                firstName = item.get('first_name')
                lastName = item.get('last_name')
                teacher_id = item.get('id')

                fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)
                lesson = Lesson_to_teacher.objects.filter(teacher_id=teacher_id).first()

                item['title'] = fullName
                item['lesson_id'] = lesson.lesson.id if lesson else ""

        # Хичээлээр хайх үед тухайн сургуулийн сургалтын төлөвлөгөөнд байгаа идэвхтэй улиралд шивэгдсэн хичээлүүдийг авна
        elif stype == 'lesson':
            if option_filter:
                time_tablequeryset = time_tablequeryset.filter(lesson=option_filter)

            lesson_ids = time_tablequeryset.values('lesson', 'teacher', 'lesson__code', 'lesson__name', 'teacher__first_name', 'teacher__last_name')

            for timetable in lesson_ids:
                lesson_id = timetable.get('lesson')
                teacher_id = timetable.get('teacher')
                lesson_name = timetable.get('lesson__name')
                lesson_code = timetable.get('lesson__code')
                firstName = timetable.get('teacher__first_name')
                lastName = timetable.get('teacher__last_name')

                obj_datas= {}
                fullName = None

                if firstName and lastName:
                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                    # Хичээлийг багшаар групп хийх
                    # obj_datas['lesson'] = fullName if fullName else lesson.name
                    # obj_datas['title'] = lesson.name if lesson else ''

                is_resource_grouping = request.query_params.get('isResourceGrouping') == 'true'

                if is_resource_grouping:
                    # to enable grouping (collapse/expand in resource column)
                    obj_datas['title'] = fullName if fullName else firstName
                    obj_datas['lesson'] = f"{lesson_code} {lesson_name}"

                else:
                    # to disable grouping (collapse/expand in resource column)
                    obj_datas['title'] = f"{lesson_code} {lesson_name}"

                obj_datas['id'] = '{}_{}'.format(lesson_id, teacher_id)

                all_list.append(obj_datas)
        else:
            room_ids = time_tablequeryset.values_list('room', flat=True)
            room_queryset = Room.objects.filter(id__in=room_ids)
            if option_filter:
                room_queryset = room_queryset.filter(id=option_filter)

            all_list = room_queryset.values('id', 'code').order_by('code')

            for item in all_list:
                room_obj =  Room.objects.filter(id=item.get('id')).first()
                item['title'] = room_obj.full_name

            return request.send_data(list(all_list))

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class TimeTableSelectOption(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн хайлтын select option """

    def get(self, request):

        all_list = []
        qs_group = Group.objects.order_by('name')
        qs_lesson = LessonStandart.objects.order_by('name')

        qs_room = Room.objects.order_by('code')
        qs_teacher = get_teacher_queryset()

        school = self.request.query_params.get('school')
        stype = self.request.query_params.get('stype')

        try:
            if stype == 'group':
                if school:
                    qs_group = qs_group.filter(school=school)

                all_list = list(qs_group.values('id', 'name'))

                for group in all_list:
                    group['itemId'] = group.get('id')
                    group['itemName'] = group.get('name')

            elif stype == 'teacher':
                all_list = qs_teacher.values('id', 'first_name', 'last_name')

                for item in all_list:
                    firstName = item.get('first_name')
                    lastName = item.get('last_name')
                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                    item['itemId'] = item.get('id')
                    item['itemName'] = fullName

            elif stype == 'lesson':
                all_list = qs_lesson.values('id', 'name')

                for item in all_list:
                    item['itemId'] = item.get('id')
                    item['itemName'] = item.get('name')

            else:
                all_list = qs_room.values('id', 'code')

                for item in all_list:
                    room_obj = qs_room.filter(id=item.get('id')).first()
                    item['itemId'] = item.get('id')
                    item['itemName'] = room_obj.full_name

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class TimeTableEvent(
    generics.GenericAPIView
):
    """ Event change """
    queryset = TimeTable.objects.all()

    def put(self, request, pk):

        datas = request.data
        user = request.user

        datas['updated_user'] = user.id
        datas['updated_at'] = timezone.now()

        day = datas.get('day')
        time = datas.get('time')
        teacher = datas.get('teacher')
        lesson = datas.get('lesson')
        lesson_year = datas.get('lesson_year')
        lesson_season = datas.get('lesson_season')
        odd_even = datas.get('odd_even')
        is_online = datas.get('odd_even')

        # Хичээлийн хуваариас буцаад цагийн ачаалал руу зөөж байгаа гэсэн үг
        if day == 0:
            timetable_group_ids = TimeTable_to_group.objects.filter(timetable=pk).values_list('group', flat=True)
            credit_volume_group = TeacherCreditVolumePlan_group.objects.filter(creditvolume__teacher=teacher, creditvolume__lesson=lesson, creditvolume__lesson_year=lesson_year, creditvolume__lesson_season=lesson_season, group_id__in=timetable_group_ids).first()
            credit_volume = credit_volume_group.creditvolume if credit_volume_group else None

            credit_volume_obj = TeacherCreditVolumePlan.objects.filter(id=credit_volume).first()

            with transaction.atomic():
                if credit_volume_obj:
                    credit_volume_obj.is_timetable = False
                    credit_volume_obj.save()

                # Цагийн ачаалал руу зөөх үед хичээлийн хуваарь устгах
                self.queryset.filter(id=pk).delete()

                return request.send_info('INF_002')

        qs_timetable = self.queryset.filter(id=pk).first()
        if not qs_timetable:
            return request.send_error('ERR_002', 'Хуваарийн мэдээлэл олдсонгүй')

        timetable_room = qs_timetable.room
        timetable_teacher = qs_timetable.teacher

        timetable_qs = self.queryset.exclude(id=pk).filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even=odd_even)
        timetables = timetable_qs.values_list('id', flat=True)
        for timetable in timetables:
            timetable_obj = self.queryset.filter(id=timetable, teacher=timetable_teacher).first()
            if timetable_obj:
                firstname = timetable_teacher.first_name
                tname = ''
                type_name = timetable_obj.get_type_display()

                if type_name:
                    tname = type_name[0:3]

                lesson_name = timetable_obj.lesson.name
                msg = "Тухайн цаг дээр {firstname} багш {lesson_name}({tname}) хичээлийн хуваарьтай байна.".format(firstname=firstname, day=day, time=time, lesson_name=lesson_name, tname=tname)

                return request.send_error('ERR_002', msg)


        qs_room = timetable_qs.filter(room=timetable_room).first()
        if qs_room and not is_online:
            lesson = qs_room.lesson.name
            room_name = timetable_room.full_name
            msg = "{room_name} өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(room_name=room_name, lesson=lesson, day=day, time=time)

            return request.send_error('ERR_002', msg)

        try:
            with transaction.atomic():
                qs_timetable.update(
                    **datas
                )

            return request.send_info('INF_002')
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хуваарь хадгалахад алдаа гарлаа.')


@permission_classes([IsAuthenticated])
class TimeTableFile(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарь excel файлаар хадгалах """

    def post(self, request):

        request_data = request.data

        file = request_data.get('file')
        ext = request_data.get('ext')

        if not file:
            return request.send_error('ERR_002', 'Файл оруулна уу')

        file_save_folder = os.path.join(settings.MEDIA_ROOT, settings.TIMETABLE)

        if not os.path.exists(file_save_folder):
            os.mkdir(file_save_folder)

        try:
            file_save_path = save_file(file, settings.TIMETABLE, '')
            file_path = os.path.join(settings.MEDIA_ROOT, file_save_path)

            if ext == 'xlsx':
                excel_data = pd.read_excel(file_path)
            else:
                excel_data = pd.read_csv(file_path)

            json_str = excel_data.to_json(orient='records')
            remove_folder(file_save_path)
        except Exception as e:
            print(e)

        return request.send_info('INF_013')


@permission_classes([IsAuthenticated])
class ExamTimeTableCreateAPIView(
    generics.GenericAPIView
):
    """ Шалгалтын хуваарь үүсгэх """

    queryset = ExamTimeTable.objects.all()

    def get(self, request):
        year, season = get_active_year_season()

        lesson_season = Season.objects.get(id=season)
        school = request.query_params.get('school')

        timetables = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
        if school:
            timetables = timetables.filter(school=school)

        timetables = timetables.values('lesson', 'school').distinct('lesson')

        exam_to_group_datas = []
        exam_ids = []
        try:
            with transaction.atomic():
                for timetable in timetables:
                    lesson = timetable.get('lesson')
                    create_lesson = timetable.get('school')

                    all_students = get_lesson_choice_student(lesson=lesson, lesson_season=season, lesson_year=year)

                    # Шалгалт үүсгэх
                    exam, created = ExamTimeTable.objects.update_or_create(
                        lesson_id=lesson,
                        lesson_year=year.strip(),
                        lesson_season=lesson_season,
                        defaults={
                            'school_id': create_lesson,
                            'created_user': request.user,
                        }
                    )

                    print('Шалгалт үүсч байна')

                    exam_ids.append(exam.id)

                    for student in all_students:
                        exam_to_group_datas.append(
                            Exam_to_group(
                                exam=exam,
                                student=student,
                                group=student.group
                            )
                        )

                exam_to_groups = Exam_to_group.objects.filter(exam_id__in=exam_ids)

                if len(exam_to_groups) > 0:
                    exam_to_groups.delete()

                # Exam_to_group үүсгэх
                if len(exam_to_group_datas) > 0:
                    Exam_to_group.objects.bulk_create(exam_to_group_datas)

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хуваарь хадгалахад алдаа гарлаа.')

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class TimeTablePrint(
    generics.GenericAPIView,
):
    """ Хичээлийн хуваарь хэвлэх """

    def get(self, request):

        school = request.query_params.get('school')

        lesson_year, lesson_season = get_active_year_season()

        season_obj = Season.objects.get(pk=lesson_season)

        timetable_ids = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, school=school).values_list('id', flat=True)

        timetable_group = TimeTable_to_group.objects.filter(timetable__in=timetable_ids, group__profession__school=school).values('group', 'group__name').distinct('group')

        user = request.user

        employee = Employee.objects.filter(user=user, state=Employee.STATE_WORKING).first()
        position_name = employee.org_position.name if employee.org_position else ''

        user_info = Teachers.objects.filter(user=user, action_status=Teachers.APPROVED).first()

        info = {}
        info['bolovsruulsan_name'] = user_info.full_name if user_info else ''
        info['bolovsruulsan_position'] = position_name

        sign_obj = DefinitionSignature.objects.filter(dedication_type=DefinitionSignature.TIMETABLE).first()

        info['director_name'] = sign_obj.name if sign_obj else ''
        info['director_position'] = sign_obj.position_name if sign_obj else ''

        school_obj = SubOrgs.objects.get(id=school)
        monit_obj = DefinitionSignature.objects.filter(dedication_type=DefinitionSignature.TIMETABLE, school=school_obj.id).first()

        info['hynasan_name'] = monit_obj.name if monit_obj else ''
        info['hynasan_position'] = sign_obj.position_name if sign_obj else ''
        info['school_name'] = school_obj.name if school_obj else ''
        info['lesson_year'] = lesson_year if lesson_year else ''
        info['lesson_season'] = season_obj.season_code if season_obj else lesson_season

        all_datas = []

        for group_obj in list(timetable_group):
            obj = {}
            obj['name'] = group_obj.get('group__name')

            timetable_group_ids = TimeTable_to_group.objects.filter(group=group_obj.get('group'), timetable__lesson_year=lesson_year, timetable__lesson_season=lesson_season).values_list('timetable', flat=True)
            timetable_qs = TimeTable.objects.filter(id__in=list(timetable_group_ids)).order_by('day', 'time')
            data = TimetablePrintSerializer(timetable_qs, many=True).data
            obj['schedule']= data
            all_datas.append(obj)

        return_datas = {
            'data': all_datas,
            'info': info
        }

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class ExamTimeTableListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын хуваарийн жагсаалт """

    queryset = ExamTimeTable.objects.all()
    serializer_class = ExamTimeTableSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()

        if not self.kwargs.get('pk'):
            context['active_year_season'] = get_active_year_season()

        return context

    @has_permission(must_permissions=['lms-timetable-exam-read'])
    def get(self, request, pk=None):
        " Шалгалтын хуваарь жагсаалт "

        is_online = self.request.query_params.get("is_online")
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()
        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        if is_online:
            is_online = str2bool(is_online)
            self.queryset = self.queryset.filter(is_online=is_online)

        self.serializer_class = ExamTimeTableAllSerializer

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)


@permission_classes([IsAuthenticated])
class ExamTimeTableScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """
        Шалгалтын дүн татах
        Зөвхөн шалгалтанд байгаа анги болон явцын дүн гарсан оюутны шалгалтын оноо татагдана
    """

    queryset = ExamTimeTable.objects.all()
    serializer_class = ExamTimeTableSerializer

    @login_required()
    @has_permission(must_permissions=['lms-timetable-exam-score-download'])
    @transaction.atomic()
    def put(self, request, pk=None):
        """
            pk- ExamTimeTable id
        """

        challenge_student_data = list()

        try:

            lesson = self.request.query_params.get("lesson")
            lesson_year = self.request.query_params.get("lesson_year")
            lesson_season = self.request.query_params.get("lesson_season")

            instance = self.get_object()

            # Шалгалт өгсөн анги
            exam_groups = Exam_to_group.objects.filter(exam=instance).values_list('group', flat=True)

            # Онлайнаар шалгалт өгсөн бол энд дүн нь байгаа
            # NOTE: Хэрвээ давтан шалгалт өгсөн бол аль дүнг нь авах вэ?. Хэрвээ давтан шалгалтын дүн татсаны дараа шалгалтын хуваариас дүн татвал шалгалтын оноо сүүлд татагдсанаараа эрэмбэлэгдэж байгаа
            all_challenge_qs = Challenge.objects.filter(challenge_type=Challenge.SEMESTR_EXAM, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season)

            # TODO: Энд зөвхөн үндсэн шалгалтын дүнг л татна гэж Дариа Ганаад хэлсэн
            # Тиймээс давтан шалгалтын дүнг харуулдаггүй болгосон
            challenge_qs = all_challenge_qs.filter(is_repeat=False)

            # Багш 70 оноо оруулсан эсэх
            other_scoretype_qs = Lesson_teacher_scoretype.objects.filter(score_type=Lesson_teacher_scoretype.BUSAD, lesson_teacher__lesson=lesson)

            # Багш явцын оноо оруулсан оюутны жагсаалт
            ywts_score_students = TeacherScore.objects.filter(score_type__in=other_scoretype_qs, lesson_year=lesson_year, lesson_season=lesson_season).values_list("student", flat=True)

            # Шалгалтад нэмсэн анги болон явцын оноо гарсан хүүхдүүдийн дүнг татна
            challenge_students = ChallengeStudents.objects.filter(
                Q(challenge__in=challenge_qs) &
                Q(
                    Q(student__group__in=exam_groups) |
                    Q(student__in=ywts_score_students)
                )
            ).order_by('score')

            if not challenge_students.exists():
                return request.send_data([])

            scoretype_qs = other_scoretype_qs.first()

            # 70-н оноо оруулсан багш
            other_lesson_teacher = scoretype_qs.lesson_teacher if scoretype_qs else None

            scoretype = Lesson_teacher_scoretype.objects.filter(lesson_teacher=other_lesson_teacher, score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()

            if not scoretype:
                scoretype = Lesson_teacher_scoretype.objects.create(
                    lesson_teacher=other_lesson_teacher,
                    score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    score=30
                )

            challenge_students_ids = challenge_students.values_list("student_id", flat=True).distinct()

            for student in challenge_students_ids:
                # NOTE: Давтан шалгалтч бай юу ч бай хамгийн сүүлд өгсөн шалгалтын оноог авсан
                challenge_student = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student=student).order_by('-updated_at').first()

                score = challenge_student.score or 0                     # авсан оноо
                take_score = challenge_student.take_score or 0           # авах оноо

                # Шалгалтаар авах оноо буюу хувилах оноо
                max_score = challenge_student.challenge.max_score
                exam_score = 0
                if score != 0:
                    # (Авсан оноо * Хувиргах оноо) / авах оноо
                    exam_score = round((score * 30) / take_score)

                if exam_score > max_score:
                    exam_score = max_score

                challenge_student_data.append({
                    "student": student,
                    "score": exam_score,
                    "student_code": challenge_student.student.code,
                    "student_name": challenge_student.student.full_name,
                    "take_score": max_score,
                })

                TeacherScore.objects.update_or_create(
                    score_type=scoretype,
                    student_id=student,
                    lesson_year=lesson_year,
                    lesson_season_id=lesson_season,
                    defaults={
                        "score": float(exam_score) if exam_score else 0,
                        "updated_user": request.user,
                        "created_user": request.user,
                    }
                )

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", "Шалгалтын дүн татахад алдаа гарлаа")

        return request.send_info("INF_021", challenge_student_data)


@permission_classes([IsAuthenticated])
class Exam_repeatTestListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = ExamTimeTable.objects.all()

    def get(self, request, pk=None):
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")
        repeat_count = int(request.query_params.get("repeat_count", 1))

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        if pk:
            if repeat_count == Exam_repeat.REPEAT_2:
                queryset = Exam_repeat.objects.filter(
                    lesson=pk,
                    lesson_year=lesson_year,
                    lesson_season=lesson_season,
                    repeat_count=Exam_repeat.REPEAT_1
                ).select_related('lesson').prefetch_related('exams').order_by("begin_date")

                datas = []
                for obj in queryset:
                    all_groups = []
                    all_levels = []
                    all_subs = []
                    for exam in obj.exams.all():
                        assigned_groups = Exam_to_group.objects.filter(exam=exam).values_list('group__name', flat=True).distinct()
                        all_groups.extend(filter(None, assigned_groups))

                        level_groups = ExamToLevelGroup.objects.filter(exam=exam).values_list('level_group__name', flat=True).distinct()
                        all_levels.extend(level_groups)

                        sub_groups = ExamToSubGroup.objects.filter(exam=exam).values_list('sub_group__name', flat=True).distinct()
                        all_subs.extend(sub_groups)

                    unique_groups = list(set(all_groups))
                    group_names = ", ".join(unique_groups) if unique_groups else "-"

                    level_group_list = [{"name": name} for name in set(all_levels)]
                    sub_group_list = [{"name": name} for name in set(all_subs)]
                    datas.append({
                        "id": obj.id,
                        "lesson": {
                            "id": obj.lesson.id,
                            "full_name": obj.lesson.name,
                        },
                        "lesson_name": obj.lesson.name,
                        "begin_date": obj.begin_date.isoformat() if obj.begin_date else None,
                        "end_date": obj.end_date.isoformat() if obj.end_date else None,
                        "group_name": f"{group_names} (давтан)",
                        "level_group": level_group_list,
                        "sub_group": sub_group_list
                    })
                return request.send_data(datas)
            else:
                self.queryset = ExamTimeTable.objects.filter(
                    lesson=pk,
                    lesson_year=lesson_year,
                    lesson_season=lesson_season
                ).order_by("begin_date")

                self.serializer_class = ExamTimeTableListSerializer
                repeat = self.serializer_class(self.queryset, many=True).data
                return request.send_data(repeat)

        all_result = self.list(request).data
        return request.send_data(all_result)


@permission_classes([IsAuthenticated])
class ExamrepeatStudentsAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    def get(self , request, pk=None):
        if pk:
            students = Exam_to_student.objects.filter(exam=pk).select_related('student')

            datas = [
                {
                    "student_id": obj.student.id,
                    "code": obj.student.code,
                    "student_name": f"{obj.student.code}-{obj.student.last_name[0]}.{obj.student.first_name}",
                    "group_name":f"{obj.student.group.profession.name} - {obj.student.group.name}"
                }
                for obj in students
            ]
            return request.send_data(datas)

        return request.send_error("ERR_004")

    def post(self, request,pk=None):
        data = request.data
        exam_time_table_ids = data
        challenge = request.query_params.get('challenge')
        repeat_count = int(request.query_params.get('repeat_count', 1))

        try:
            if repeat_count == Exam_repeat.REPEAT_2:
                student_ids = list(Exam_to_student.objects.filter(
                    exam_id__in=exam_time_table_ids,
                    status=Exam_to_student.ACTIVE,
                ).values_list('student_id', flat=True).distinct())

                exam_qs = ExamTimeTable.objects.values_list('lesson', flat=True)
                exclude_qs = TeacherScore.objects.filter(
                    score__gt=0,
                    student_id__in=student_ids,
                    score_type__lesson_teacher__lesson__in=exam_qs
                ).values('student_id').annotate(
                    scored_lesson_count=Count('score_type__lesson_teacher__lesson__name', distinct=True),
                    is_fail=Exists(
                        TeacherScore.objects.filter(
                            score_type__lesson_teacher__lesson=pk,
                            student=OuterRef('student'),
                            score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                            score__lt=18
                        )
                    ),
                    success_scored_lesson_count=Count(
                        Case(
                            When(
                                Q(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO) & Q(score__gte=18),
                                then='score_type__lesson_teacher__lesson__name'
                            )
                        ),
                        distinct=True
                    ),
                    failed_scored_lesson_count=F('scored_lesson_count') - F('success_scored_lesson_count')
                ).filter(failed_scored_lesson_count__gte=3, is_fail=True)

                excluded_student_ids = list(exclude_qs.values_list('student_id', flat=True))

                included_students = []
                excluded_students = []

                students_qs = Student.objects.filter(id__in=student_ids).select_related('group', 'group__profession')

                for stud in students_qs:
                    ts_score = TeacherScore.objects.filter(
                        student_id=stud.id,
                        score_type__lesson_teacher__lesson_id=pk,
                        score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    ).values_list('score', flat=True).first()

                    exam_score = ts_score if ts_score is not None else 0

                    if exam_score >= 18:
                        continue

                    student_payload = {
                        "student_id": stud.id,
                        "student__first_name": stud.first_name,
                        "student__last_name": stud.last_name,
                        "student__code": stud.code,
                        "exam_score": exam_score,
                        "student__group__name": stud.group.name if stud.group else None,
                        "student__group__profession__name": stud.group.profession.name if stud.group and stud.group.profession else None
                    }

                    if stud.id in excluded_student_ids:
                        excluded_students.append(student_payload)
                    else:
                        included_students.append(student_payload)

                return request.send_data({
                    "included_students": included_students,
                    "excluded_students": excluded_students
                })

            student_ids = Student.objects.filter(
                Q(Exists(Exam_to_group.objects.filter(exam__in=exam_time_table_ids, group__student=OuterRef('id')))) |
                Q(Exists(ExamToSubGroup.objects.filter(exam__in=exam_time_table_ids, sub_group__student=OuterRef('id')))) |
                Q(Exists(ExamToLevelGroup.objects.filter(exam__in=exam_time_table_ids, level_group__student=OuterRef('id'))))
            ).values_list('id', flat=True)

            exam_time_table_qs = ExamTimeTable.objects.filter(id__in=exam_time_table_ids, stype=ExamTimeTable.AMAN, is_online=True)

            if exam_time_table_qs and challenge:
                student_ids = list(student_ids)
                student_ids.extend(list(ChallengeStudents.objects.filter(challenge=challenge).values_list('student_id', flat=True)))

            exam_qs = ExamTimeTable.objects.values_list('lesson', flat=True)

            # Нийт 3 аас илүү хичээл дээр унасан сурагчид
            exclude_qs = TeacherScore.objects.filter(score__gt=0, student_id__in=student_ids, score_type__lesson_teacher__lesson__in=exam_qs).values('student_id').annotate(
                    scored_lesson_count=Count('score_type__lesson_teacher__lesson__name', distinct=True),
                    is_fail=Exists(
                        TeacherScore.objects.filter(score_type__lesson_teacher__lesson=pk, student=OuterRef('student'), score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__lt=18)
                    ),
                    success_scored_lesson_count=Count(
                        Case(
                            When(
                                Q(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO) &
                                Q(score__gte=18),
                                then='score_type__lesson_teacher__lesson__name'
                            )
                        ),
                        distinct=True
                    ),
                    failed_scored_lesson_count=F('scored_lesson_count') - F('success_scored_lesson_count')
                    ).filter(failed_scored_lesson_count__gte=3, is_fail=True)

            exclude_qs = exclude_qs.values_list('student_id', flat=True)
            excluded_student_ids = list(exclude_qs)

            excluded_students = TeacherScore.objects.filter(
                Q(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO),
                (Q(score__lt=18) | Q(score__isnull=True)),
                student_id__in=excluded_student_ids,
                score_type__lesson_teacher__lesson=pk
            ).values(
                'student_id',
                'student__first_name',
                'student__last_name',
                'student__code',
                'score',
                'student__group__name',
                'student__group__profession__name',
                exam_score=F('score')
            ).distinct('student_id')

            queryset = (
                TeacherScore.objects
                .filter(
                    score_type__lesson_teacher__lesson=pk
                )
                .annotate(
                    is_exam=Exists(
                        TeacherScore.objects.filter(score_type__lesson_teacher__lesson=pk, student=OuterRef('student'), score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO)
                    ),
                    exam_score=(
                        Case(
                            When(
                                is_exam=True,
                                then='score',
                            ),
                            When(
                                is_exam=False,
                                then=Value(0),
                            ),
                            default=Value(1001), output_field=FloatField(),
                        )
                    ),
                    stype=(
                        Case(
                            When(
                                is_exam=True,
                                then='score_type__score_type',
                            ),
                            When(
                                is_exam=False,
                                then=Value(Lesson_teacher_scoretype.SHALGALT_ONOO),
                            ),
                            default=Value(8), output_field=IntegerField(),
                        )
                    ),
                )
                .filter(
                    Q(
                        Q(is_exam=False) |
                        Q(is_exam=True, score__lt=18)
                    ),
                    stype=Lesson_teacher_scoretype.SHALGALT_ONOO,  # Optional: filter specific type
                    student_id__in=student_ids,  # Filter by student IDs
                )
                .exclude(student_id__in=excluded_student_ids)
            )

            return_list = queryset.values('student_id', 'student__first_name','student__last_name','student__code','exam_score','student__group__name','student__group__profession__name').order_by('exam_score')
            response_data = {
                "included_students": list(return_list),
                "excluded_students": list(excluded_students),
            }

            return request.send_data(response_data)
        except Exception as e:
            traceback.print_exc()
            return request.send_error('ERR_002', f"An error occurred: {str(e)}")


@permission_classes([IsAuthenticated])
class ExamRepeatTimeTableScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын дүн татах """

    queryset = Exam_repeat.objects.all()
    serializer_class = ExamTimeTableSerializer

    @has_permission(must_permissions=['lms-timetable-exam-score-download'])
    @transaction.atomic()
    def put(self, request, pk=None):
        """
            pk- Exam-repeat id
        """

        challenge_student_data = list()
        try:

            lesson = self.request.query_params.get("lesson")
            lesson_year = self.request.query_params.get("lesson_year")
            lesson_season = self.request.query_params.get("lesson_season")

            instance = self.get_object()
            repeat_count = instance.repeat_count

            # Шалгалт өгсөн сурагчид
            exam_students = Exam_to_student.objects.filter(exam=instance, status=Exam_to_student.ACTIVE).values_list('student', flat=True)

            # Онлайнаар шалгалт өгсөн бол энд дүн нь байгаа
            challenge_qs = Challenge.objects.filter(challenge_type=Challenge.SEMESTR_EXAM, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season, is_repeat=True)
            challenge_students = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student__in=exam_students)

            if challenge_students.count() == 0:
                return request.send_data([])

            scoretype_qs = Lesson_teacher_scoretype.objects.filter(score_type=Lesson_teacher_scoretype.BUSAD, lesson_teacher__lesson=lesson).first()

            # 70-н оноо оруулсан багш
            other_lesson_teacher = scoretype_qs.lesson_teacher if scoretype_qs else None

            scoretype = Lesson_teacher_scoretype.objects.filter(lesson_teacher=other_lesson_teacher, score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()
            if not scoretype:
                scoretype = Lesson_teacher_scoretype.objects.create(
                    lesson_teacher=other_lesson_teacher,
                    score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    score=30
                )

            for challenge_student in challenge_students:
                student = challenge_student.student

                # Давтан шалгалт бүрт авах ёстой дээд оноог гараас тохируулна шалгалтын хуваарь үүсгэхдээ.
                max_score = challenge_student.challenge.max_score
                challenge_student_obj = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student=student).order_by('-updated_at').first()
                score = challenge_student_obj.score or 0                     # авсан оноо
                take_score = challenge_student_obj.take_score or 0           # авах оноо

                exam_score = 0
                if score != 0:
                    # (Авсан оноо * Хувиргах оноо) / авах оноо
                    exam_score = round((score * 30) / take_score)

                if exam_score > max_score:
                    exam_score = max_score

                challenge_student_data.append({
                    "student": student.id,
                    "score": exam_score,
                    "student_code": student.code,
                    "student_name": student.full_name,
                    "take_score": max_score,
                    "repeat_count": repeat_count,
                })

                TeacherScore.objects.update_or_create(
                    score_type=scoretype,
                    student=student,
                    lesson_year=lesson_year,
                    lesson_season_id=lesson_season,
                    defaults={
                        "score": exam_score,
                        "updated_user": request.user,
                        "created_user": request.user,
                    }
                )
                # # --- NOTE: RAW WORKAROUND FOR OUT-OF-SYNC DATABASE MIGRATIONS ---
                # choices_dict = {
                #     1: 'Сорил',
                #     2: 'Аман шалгалт',
                #     3: 'Дасгал',
                # }

                # lt = scoretype.lesson_teacher
                # info_dict = {
                #     "score_type_id": scoretype.id,
                #     "score_type": choices_dict.get(scoretype.score_type, "30 онооны шалгалт"),
                #     "scoretype": scoretype.score_type,
                #     "score": float(scoretype.score) if scoretype.score else 30.0,
                #     "lesson_id": lt.lesson.id if lt and lt.lesson else None,
                #     "teacher_id": lt.teacher.id if lt and lt.teacher else None,
                # }
                # score_type_info_json = json.dumps(info_dict, ensure_ascii=False)

                # with connection.cursor() as cursor:
                #     cursor.execute("""
                #         SELECT id FROM lms_teacherscore
                #         WHERE student_id = %s AND lesson_year = %s AND lesson_season_id = %s AND score_type_id = %s
                #     """, [student.id, lesson_year, lesson_season, scoretype.id])

                #     row = cursor.fetchone()

                #     if row:
                #         cursor.execute("""
                #             UPDATE lms_teacherscore
                #             SET score = %s, score_type_info = %s, updated_user_id = %s, updated_at = NOW()
                #             WHERE id = %s
                #         """, [exam_score, score_type_info_json, request.user.id, row[0]])
                #     else:
                #         cursor.execute("""
                #             INSERT INTO lms_teacherscore (
                #                 student_id, lesson_year, lesson_season_id, score, score_type_id, score_type_info,
                #                 is_approved, is_confirm_teacher, is_confirm_student, is_confirm_ded,
                #                 created_user_id, updated_user_id, created_at, updated_at
                #             ) VALUES (%s, %s, %s, %s, %s, %s, False, False, False, False, %s, %s, NOW(), NOW())
                #         """, [student.id, lesson_year, lesson_season, exam_score, scoretype.id, score_type_info_json, request.user.id, request.user.id])
                # # --- END OF WORKAROUND ---

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", "Шалгалтын дүн татахад алдаа гарлаа")

        return request.send_info("INF_021", challenge_student_data)

@permission_classes([IsAuthenticated])
class ExamrepeatAddStudentAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    def post(self, request,pk=None):
        student_id = request.data
        if Exam_to_student.objects.filter(exam=pk, student_id=student_id).exists():
            return request.send_error("ERR_002","Тухайн оюутан шалгалт өгөх оюутан дотор байна")

        obj = Exam_to_student(
            exam_id=pk,
            student_id=student_id
        )
        obj.save()
        return request.send_info("INF_022")


class LessonsScheduleAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн хуваарь """

    queryset = TimeTable.objects.all()
    serializer_class = LessonsScheduleSerializer

    def get_queryset(self):
        year = self.request.query_params.get("lesson_year")
        season = self.request.query_params.get("lesson_season")

        if not year:
            year, season = get_active_year_season()

        current_week_dates = get_dates_from_week(year, season)
        current_week = current_week_dates.get('id')
        is_curent_week_even = current_week % 2 == 0 if current_week else None
        current_week_odd_even = TimeTable.EVEN if is_curent_week_even else TimeTable.ODD if is_curent_week_even else TimeTable.ALL

        queryset = super().get_queryset().filter(
            Q(lesson_year=year, lesson_season=season) &
            Q(
                Q(
                    Q(is_kurats=True)
                    &
                    Q(
                        # Q(
                        #     Q(begin_date__gte=current_week_start_date) |
                        #     Q(end_date__lte=current_week_end_date)
                        # ) |
                        Q(
                            week_number=current_week
                        )
                    )
                ) |
                Q(begin_week__lte=current_week, end_week__gte=current_week) |
                Q(is_kurats=False, is_block=False)
            ) &
            Q(
                Q(odd_even=TimeTable.ALL) |
                Q(odd_even=current_week_odd_even)
            )
        )

        # region frontend filters
        filters_dict = build_filters_dict(['teacher', 'day', 'lesson', 'school'], self.request.query_params)
        queryset = queryset.filter(**filters_dict)

        # region to filter by group
        group = self.request.query_params.get('group')

        if group:
            queryset = queryset.filter(Exists(TimeTable_to_group.objects.filter(timetable=OuterRef('id'), group=group)))
        # endregion
        # endregion frontend filters

        """
            TODO
            timetable_to_student is not required to include into filter?
            timetable_to_group.is_online is not required to exclude from filter?
        """
        queryset = queryset.select_related('lesson', 'room').prefetch_related('timetable_to_group_set__group')
        return queryset

    def get(self, request):
        """ Public. Because task is: Хичээлийн хуваарийг нээлттэй байдлаар хардаг болох (https://github.com/dxis-school/dxis/issues/625) """

        return request.send_data(self.list(request).data)


class TimeTableLessonListApiView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    def get(self, request):
        """ Хичээлийн хуваарьтай хичээлийн жагсаалт """

        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        return_datas = list(
            LessonStandart.objects.annotate(
                is_timetable=Exists(TimeTable.objects.filter(lesson=OuterRef("pk"), lesson_year=lesson_year, lesson_season=lesson_season))
            ).filter(is_timetable=True)
            .values("id", "name", "code")
        )

        return request.send_data(return_datas)


class TimeTableTeacherListApiView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    def get(self, request):
        """ Хичээлийн хуваарьтай багшийн жагсаалт """

        lesson = request.query_params.get("lesson")
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        filters = {
            "lesson_year": lesson_year,
            "lesson_season": lesson_season,
        }

        if lesson:
            filters["lesson"] = lesson

        return_datas = list(
            Teachers.objects.annotate(
                is_timetable=Exists(TimeTable.objects.filter(teacher=OuterRef("pk"), **filters))
            ).filter(is_timetable=True)
            .values("id", "first_name", "last_name")
        )

        return request.send_data(return_datas)


class TimeTableGroupListApiView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    def get(self, request):
        """ Хичээлийн хуваарьтай багшийн жагсаалт """

        lesson = request.query_params.get("lesson")
        teacher = request.query_params.get("teacher")
        lesson_year = request.query_params.get("lesson_year")
        lesson_season = request.query_params.get("lesson_season")

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        filters = {
            "lesson_year": lesson_year,
            "lesson_season": lesson_season,
        }

        if lesson:
            filters["lesson"] = lesson

        if teacher:
            filters["teacher"] = teacher

        return_datas = list(
            Group.objects.annotate(
                is_timetable=Exists(TimeTable.objects.filter(timetable_to_group__group=OuterRef("pk"), **filters))
            ).filter(is_timetable=True)
            .values("id", "name")
        )

        return request.send_data(return_datas)


class LessonListIrtsAPIView(
    generics.GenericAPIView
):
    """ Хичээлийн жилийн хичээл орж байгаа багш болон хичээлийн жагсаалт """

    @login_required()
    def get(self, request):

        day = request.query_params.get('day')
        week = request.query_params.get('week')
        group = request.query_params.get('group')
        l_time = request.query_params.get('time')
        school = request.query_params.get('school')
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        timetable_qs = TimeTable.objects.generate_weeks()

        filters = dict()
        irts_filters = dict()
        sub_filters = dict()

        if lesson_season:
            filters["lesson_season"] = lesson_season
            irts_filters["timetable__lesson_season"] = lesson_season
            sub_filters["irtsqr__timetable__lesson_season"] = lesson_season

        if lesson_year:
            filters["lesson_year"] = lesson_year
            irts_filters["timetable__lesson_year"] = lesson_year
            sub_filters["irtsqr__timetable__lesson_year"] = lesson_year

        if lesson:
            filters["lesson"] = lesson
            irts_filters["timetable__lesson"] = lesson
            sub_filters["irtsqr__timetable__lesson"] = lesson

        if school:
            filters["school"] = school
            irts_filters["timetable__school"] = school
            sub_filters["irtsqr__timetable__school"] = school

        if teacher:
            filters["teacher"] = teacher
            irts_filters["timetable__teacher"] = teacher
            sub_filters["irtsqr__timetable__teacher"] = teacher

        if day:
            filters["day"] = day
            irts_filters["timetable__day"] = day
            sub_filters["irtsqr__timetable__day"] = day

        if l_time:
            filters["time"] = l_time
            irts_filters["timetable__time"] = l_time
            sub_filters["irtsqr__timetable__time"] = l_time

        if group:
            filters["timetable_to_group__group_id"] = group
            irts_filters["timetable__timetable_to_group__group_id"] = group
            sub_filters["irtsqr__timetable__timetable_to_group__group_id"] = group

        lesson_info_qs = (
            timetable_qs
            .filter(**filters)
            .annotate(
                season_name=F("lesson_season__season_name"),
                lesson_name=Concat("lesson__code", Value(" "), "lesson__name", output_field=CharField()),
                teacher_name=Concat(Upper(Substr("teacher__last_name", 1, 1)), Value('.'), "teacher__first_name", output_field=CharField()),
                start_week=Case(
                    When(begin_week__isnull=True, is_kurats=False, then=Value(1)),
                    When(is_kurats=False, then=F("begin_week")),
                    default=Value(None),
                    output_field=IntegerField()
                ),
                finish_week=Case(
                    When(end_week__isnull=True, is_kurats=False, then=Value(16)),
                    When(is_kurats=False, then=F("end_week")),
                    default=Value(None),
                    output_field=IntegerField()
                ),
                old_in_count=Case(
                    When(start_week__isnull=False, then=F("finish_week")-F("start_week") + 1),
                    default=Value(1),
                    output_field=IntegerField()
                ),
                in_count=Case(
                    When(~Q(odd_even=TimeTable.ALL), then=F("old_in_count") / 2),
                    default=F("old_in_count"),
                    output_field=IntegerField()
                )
            )
            .order_by("teacher__first_name", "lesson__name")
        )

        if week:
            sub_filters["irtsqr__week"] = week
            lesson_info_qs = lesson_info_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(week_number=week)
            )

        lesson_info = (
            lesson_info_qs
            .values(
                "lesson_id",
                "lesson_name",
                "teacher_id",
                "teacher_name",
                "season_name",
                "lesson_year",
                "lesson_season_id"
            )
            .annotate(
                week_time=Count(
                    Concat('day', Value('_'), 'time', Value('_'), 'type', Value('_'), 'odd_even', output_field=CharField()),
                    distinct=True
                ),
                learn_week=Max("in_count"),
                irsen_count=Count(
                    Concat('irtsqr__week', Value('_'), 'irtsqr__registerirts__student', output_field=CharField()),
                    filter=Q(**sub_filters, irtsqr__timetable__lesson_id=F('lesson_id'), week_numbers__contains=[F('irtsqr__week')], irtsqr__timetable__teacher_id=F('teacher_id'), irtsqr__registerirts__state=RegisterIrts.STATE_IRSEN),
                    distinct=True
                ),
                tas_count=Count(
                    Concat('irtsqr__week', Value('_'), 'irtsqr__registerirts__student', output_field=CharField()),
                    filter=Q(**sub_filters, irtsqr__timetable__lesson_id=F('lesson_id'), week_numbers__contains=[F('irtsqr__week')], irtsqr__timetable__teacher_id=F('teacher_id'), irtsqr__registerirts__state=RegisterIrts.STATE_TAS),
                    distinct=True
                ),
                chuluu_count=Count(
                    Concat('irtsqr__week', Value('_'), 'irtsqr__registerirts__student', output_field=CharField()),
                    filter=Q(**sub_filters, irtsqr__timetable__lesson_id=F('lesson_id'), week_numbers__contains=[F('irtsqr__week')], irtsqr__timetable__teacher_id=F('teacher_id'), irtsqr__registerirts__state=RegisterIrts.STATE_CHULUULSUN),
                    distinct=True
                ),
                sick_count=Count(
                    Concat('irtsqr__week', Value('_'), 'irtsqr__registerirts__student', output_field=CharField()),
                    filter=Q(**sub_filters, irtsqr__timetable__lesson_id=F('lesson_id'), week_numbers__contains=[F('irtsqr__week')], irtsqr__timetable__teacher_id=F('teacher_id'), irtsqr__registerirts__state=RegisterIrts.STATE_SICK),
                    distinct=True
                ),
                irts_qr_count=Count(
                    'irtsqr',
                    filter=Q(
                        irtsqr__timetable__lesson_id=F('lesson_id'),
                        irtsqr__timetable__teacher_id=F('teacher_id'),
                        irtsqr__registerirts__isnull=False,
                        **({'irtsqr__week': week} if week else {})
                    ),
                    distinct=True
                ),
            )
            .annotate(
                total_week_time=F("week_time") if week else F("week_time") * F("learn_week"),
                irts_count=F("irsen_count") + F("tas_count") + F("chuluu_count") + F("sick_count"),
                not_created_count=Case(
                    When(irts_qr_count__gte=F("total_week_time"), then=Value(0)),
                    default=F("total_week_time") - F("irts_qr_count"),
                    output_field=IntegerField()
                ),
            )
            .values(
                "lesson_id", "lesson_name", "teacher_name", "teacher_id", "season_name",
                "lesson_year", "week_time", "total_week_time", "learn_week",
                "irts_count", "irsen_count", "tas_count", "chuluu_count", "sick_count",
                "irts_qr_count",
                "not_created_count",
            )
        )

        aggregate_qs = (
            lesson_info
            .aggregate(
                total_irsen=Sum("irsen_count"),
                total_tas=Sum("tas_count"),
                total_chuluu=Sum("chuluu_count"),
                total_sick=Sum("sick_count"),
            )
        )

        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 40))
        ordered_qs = lesson_info.order_by("-irts_count", "teacher__first_name", "lesson__name")
        total = ordered_qs.count()
        offset = (page - 1) * limit

        return_data = {
            "datas": list(ordered_qs[offset:offset + limit]),
            "totals": aggregate_qs,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

        return request.send_data(return_data)


class GroupListIrtsAPIView(
    generics.GenericAPIView
):
    """ Тухайн багш дээр тухайн хичээлийг үзэж байгаа ангийн жагсаалт """

    @login_required()
    def get(self, request):
        data = []

        day = request.query_params.get('day')
        week = request.query_params.get('week')
        group = request.query_params.get('group')
        l_time = request.query_params.get('time')
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        filters = dict()

        if lesson_season:
            filters["timetable__lesson_season"] = lesson_season

        if lesson_year:
            filters["timetable__lesson_year"] = lesson_year

        if lesson:
            filters["timetable__lesson"] = lesson

        if teacher:
            filters["timetable__teacher"] = teacher

        if day:
            filters["timetable__day"] = day

        if l_time:
            filters["timetable__time"] = l_time

        if group:
            filters["group_id"] = group

        subquery_sql = """
            (
                SELECT odd_even
                FROM lms_systemsettings
                WHERE active_lesson_year = lms_timetable.lesson_year
                AND active_lesson_season_id = lms_timetable.lesson_season_id
                LIMIT 1
            )
        """

        timetable_to_group_qs = TimeTable_to_group.objects.filter(**filters).select_related("timetable").annotate(
            week_numbers=RawSQL(
                f"""
                    SELECT ARRAY(
                        SELECT s.w
                        FROM generate_series(
                            (CASE WHEN lms_timetable.begin_week IS NULL AND lms_timetable.is_kurats = False THEN 1 ELSE lms_timetable.begin_week END),
                            (CASE WHEN lms_timetable.end_week IS NULL AND lms_timetable.is_kurats = False THEN 16 ELSE lms_timetable.end_week END)
                        ) AS s(w)
                        WHERE
                            (lms_timetable.odd_even = 3) OR
                            (
                                {subquery_sql} = 2 AND
                                (
                                    lms_timetable.odd_even = 1 AND s.w %% 2 = 0 OR
                                    lms_timetable.odd_even = 2 AND s.w %% 2 <> 0
                                )
                            ) OR
                            (
                                {subquery_sql} = 1 AND
                                (
                                    lms_timetable.odd_even = 2 AND s.w %% 2 = 0 OR
                                    lms_timetable.odd_even = 1 AND s.w %% 2 <> 0
                                )
                            )
                    )
                """, [], output_field=ArrayField(IntegerField())
            )
        )

        if week:
            timetable_to_group_qs = timetable_to_group_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(timetable__week_number=week)
            )

        data = list(
            timetable_to_group_qs
            .select_related('group__profession')
            .values("group")
            .annotate(
                count_gr=Count("group"),
                id=F("group_id"),
                name=F("group__name"),
                level=F("group__level"),
                profession_name=F("group__profession__name"),
                irsen_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_IRSEN),
                    distinct=True
                ),
                tas_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_TAS),
                    distinct=True
                ),
                chuluu_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_CHULUULSUN),
                    distinct=True
                ),
                sick_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_SICK),
                    distinct=True
                ),
                irts_count=Count(
                    Concat(
                        'timetable__irtsqr__week',
                        Value('_'),
                        'timetable__irtsqr__timetable',
                        output_field=CharField()
                    ),
                    filter=Q(timetable__irtsqr__registerirts__student__group=F('group'), week_numbers__contains=[F('timetable__irtsqr__week')]),
                    distinct=True
                )
            )
            .values("id", "name", "level", "irts_count", "profession_name", "irsen_count", "tas_count", "chuluu_count", "sick_count").order_by('name')
        )

        return request.send_data(data)


class TimetableIrtsAPIView(generics.GenericAPIView):
    """ Тухайн ангийн хүүхдийн ирцийн мэдээлэл """

    @login_required()
    def get(self, request, group):

        timetables = None
        filters = dict()
        irts_filters = dict()
        student_qs = None
        lesson_info =[]
        student_qs = []
        result_list = []

        day = request.query_params.get('day')
        week = request.query_params.get('week')
        l_time = request.query_params.get('time')
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        if day:
            filters["day"] = day
            irts_filters["timetable__day"] = day

        if l_time:
            filters["time"] = l_time
            irts_filters["timetable__time"] = l_time

        if lesson_season:
            filters["lesson_season"] = lesson_season
            irts_filters["timetable__lesson_season"] = lesson_season

        if lesson_year:
            filters["lesson_year"] = lesson_year
            irts_filters["timetable__lesson_year"] = lesson_year

        if lesson:
            filters["lesson"] = lesson
            irts_filters["timetable__lesson"] = lesson

        if teacher:
            filters["teacher"] = teacher
            irts_filters["timetable__teacher"] = teacher

        if group:
            filters["timetable_to_group__group"] = group
            irts_filters["timetable__timetable_to_group__group"] = group

        subquery_sql = """
            (
                SELECT odd_even
                FROM lms_systemsettings
                WHERE active_lesson_year = lesson_year
                AND active_lesson_season_id = lesson_season_id
                LIMIT 1
            )
        """

        timetable_qs = (
            TimeTable.objects.filter(**filters)
            .annotate(
                type_name=WithChoices(TimeTable.LESSON_TYPE, 'type'),
                odd_even_name=WithChoices(TimeTable.ODD_EVEN_VALUE, 'odd_even'),
                week_numbers=RawSQL(
                    f"""
                        SELECT ARRAY(
                            SELECT s.w
                            FROM generate_series(
                                (CASE WHEN begin_week IS NULL AND is_kurats = False THEN 1 ELSE begin_week END),
                                (CASE WHEN end_week IS NULL AND is_kurats = False THEN 16 ELSE end_week END)
                            ) AS s(w)
                            WHERE
                                (odd_even = 3) OR
                                (
                                    {subquery_sql} = 2 AND
                                    (
                                        odd_even = 1 AND s.w %% 2 = 0 OR
                                        odd_even = 2 AND s.w %% 2 <> 0
                                    )
                                ) OR
                                (
                                    {subquery_sql} = 1 AND
                                    (
                                        odd_even = 2 AND s.w %% 2 = 0 OR
                                        odd_even = 1 AND s.w %% 2 <> 0
                                    )
                                )
                        )
                    """, [], output_field=ArrayField(IntegerField())
                )
            )
        )

        if week:
            timetable_qs = timetable_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(week_number=week)
            )

        timetables = (
            timetable_qs
            .values("odd_even", "begin_week", "end_week", "day", "time", "type", "type_name", "odd_even_name", "week_numbers")
            .distinct()
        )

        # хичээлийн хуваарьт ангийн хассан болон нэмсэн оюутнууд
        student_qs = get_lesson_choice_student(lesson, teacher, '', lesson_year, lesson_season, group)

        # 1. Fetch all IrtsQr for these filters once
        all_irts_qr = IrtsQr.objects.filter(
            Exists(timetable_qs.filter(id=OuterRef("timetable"), week_numbers__contains=[OuterRef('week')]))
        ).select_related('timetable')

        # 2. Fetch ALL relevant attendance records for ALL students in this group/lesson
        # This is the "Big Fetch" that replaces the N+1 queries.
        attendance_records = RegisterIrts.objects.filter(
            student__in=student_qs,
            qr__in=all_irts_qr,
        ).order_by('student_id', 'qr_id', '-created_at').distinct('student_id', 'qr_id')

        # 3. Build a lookup dictionary: {(student_id, qr_id): state_name}
        attendance_map = {}
        state_labels = {
            RegisterIrts.STATE_IRSEN: "и",
            RegisterIrts.STATE_TAS: "т",
            RegisterIrts.STATE_CHULUULSUN: "ч",
            RegisterIrts.STATE_SICK: "ө",
        }

        for reg in attendance_records:
            attendance_map[(reg.student_id, reg.qr_id)] = state_labels.get(reg.state, "X")

        # 4. Now, run your loops without any database hits inside them
        for timetable in timetables:
            lesson_info = {
                "type": timetable.get("type_name"),
                "odd_even_name": timetable.get("odd_even_name"),
                "day": timetable.get("day"),
                "time": timetable.get("time"),
                "student_count": student_qs.count(),
                "students": [],
                "weeks": timetable.get("week_numbers"),
                "irsen_count": 0,
                "tas_count": 0,
                "chuluu_count": 0,
                "sick_count": 0,
            }

            # Filter the QRs relevant to this specific timetable slot in memory
            current_qrs = [
                qr for qr in all_irts_qr
                if qr.timetable.time == timetable.get("time")
                and qr.timetable.day == timetable.get("day")
                and qr.timetable.type == timetable.get("type")
            ]

            for student in student_qs:
                student_weeks = []
                for qr in current_qrs:
                    # Look up attendance in our pre-fetched map
                    state = attendance_map.get((student.id, qr.id))
                    if state:
                        student_weeks.append({
                            "week": qr.week,
                            "state_name": state
                        })

                        if state == "и":
                            lesson_info["irsen_count"] += 1
                        elif state == "т":
                            lesson_info["tas_count"] += 1
                        elif state == "ч":
                            lesson_info["chuluu_count"] += 1
                        elif state == "ө":
                            lesson_info["sick_count"] += 1

                # Оюутны бүх долоо хоног
                lesson_info["students"].append({
                    "student_id": student.id,
                    "name": f"{student.code} {student.full_name}",
                    "weeks": student_weeks,
                })

            result_list.append(lesson_info)

        return request.send_data(result_list)


class GroupListIrtsReportAPIView(
    generics.GenericAPIView
):
    """
        Дамжаагаар ирцийн мэдээлэл гаргах
    """

    @login_required()
    def get(self, request):
        day = request.query_params.get('day')
        week = request.query_params.get('week')
        group = request.query_params.get('group')
        school = request.query_params.get('school')
        l_time = request.query_params.get('time')
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        filters = dict()
        sub_filters = dict()

        if lesson_season:
            filters["timetable__lesson_season"] = lesson_season

        if lesson_year:
            filters["timetable__lesson_year"] = lesson_year

        if lesson:
            filters["timetable__lesson"] = lesson

        if teacher:
            filters["timetable__teacher"] = teacher

        if day:
            filters["timetable__day"] = day

        if l_time:
            filters["timetable__time"] = l_time

        if group:
            filters["group_id"] = group

        if school:
            filters["timetable__school"] = school

        subquery_sql = """
            (
                SELECT odd_even
                FROM lms_systemsettings
                WHERE active_lesson_year = lms_timetable.lesson_year
                AND active_lesson_season_id = lms_timetable.lesson_season_id
                LIMIT 1
            )
        """

        timetable_to_group_qs = TimeTable_to_group.objects.filter(**filters).select_related("timetable").annotate(
            week_numbers=RawSQL(
                f"""
                    SELECT ARRAY(
                        SELECT s.w
                        FROM generate_series(
                            (CASE WHEN lms_timetable.begin_week IS NULL AND lms_timetable.is_kurats = False THEN 1 ELSE lms_timetable.begin_week END),
                            (CASE WHEN lms_timetable.end_week IS NULL AND lms_timetable.is_kurats = False THEN 16 ELSE lms_timetable.end_week END)
                        ) AS s(w)
                        WHERE
                            (lms_timetable.odd_even = 3) OR
                            (
                                {subquery_sql} = 2 AND
                                (
                                    lms_timetable.odd_even = 1 AND s.w %% 2 = 0 OR
                                    lms_timetable.odd_even = 2 AND s.w %% 2 <> 0
                                )
                            ) OR
                            (
                                {subquery_sql} = 1 AND
                                (
                                    lms_timetable.odd_even = 2 AND s.w %% 2 = 0 OR
                                    lms_timetable.odd_even = 1 AND s.w %% 2 <> 0
                                )
                            )
                    )
                """, [], output_field=ArrayField(IntegerField())
            )
        )

        if week:
            sub_filters["timetable__irtsqr__week"] = week
            timetable_to_group_qs = timetable_to_group_qs.filter(week_numbers__overlap=[week])

        group_irst_qs = (
            timetable_to_group_qs
            .select_related('group__profession', 'timetable')
            .values("group")
            .annotate(
                count_gr=Count("group"),
                id=F("group_id"),
                name=F("group__name"),
                level=F("group__level"),
                profession_name=F("group__profession__name"),
                active_student=Subquery(Student.objects.filter(group=OuterRef("group_id"), status__code=1).values("group").annotate(cnt=Count("pk")).values("cnt")),
                irsen_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(**sub_filters, timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_IRSEN),
                    distinct=True
                ),
                tas_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(**sub_filters, timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_TAS),
                    distinct=True
                ),
                chuluu_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(**sub_filters, timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_CHULUULSUN),
                    distinct=True
                ),
                sick_count=Count(
                    'timetable__irtsqr__registerirts__student',
                    filter=Q(**sub_filters, timetable__irtsqr__registerirts__student__group=F("group"), week_numbers__contains=[F('timetable__irtsqr__week')], timetable__irtsqr__registerirts__state=RegisterIrts.STATE_SICK),
                    distinct=True
                ),
                irts_count=Count(
                    Concat(
                        'timetable__irtsqr__week',
                        Value('_'),
                        'timetable__irtsqr__timetable',
                        output_field=CharField()
                    ),
                    filter=Q(**sub_filters, timetable__irtsqr__registerirts__student__group=F('group'), week_numbers__contains=[F('timetable__irtsqr__week')]),
                    distinct=True
                )
            )
            .values("id", "name", "level", "irts_count", "profession_name", "irsen_count", "tas_count", "chuluu_count", "sick_count", "active_student")
        )

        aggregate_qs = (
            group_irst_qs
            .aggregate(
                total_student=Sum("active_student"),
                total_irsen=Sum("irsen_count"),
                total_tas=Sum("tas_count"),
                total_chuluu=Sum("chuluu_count"),
                total_sick=Sum("sick_count"),
            )
        )

        return_data = {
            "datas": list(group_irst_qs.order_by("name", "level", "-irts_count")),
            "totals": aggregate_qs
        }

        return request.send_data(return_data)


class GroupListIrtsReportWeekAPIView(
    generics.GenericAPIView
):
    """
        Дамжаагаар ирцийн мэдээлэл гаргах
    """

    @login_required()
    def get(self, request):
        week = request.query_params.get('week')
        group = request.query_params.get('group')
        school = request.query_params.get('school')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        filters = dict()
        sub_filters = dict()

        if lesson_season:
            filters["lesson_season"] = lesson_season
            sub_filters["qr__timetable__lesson_season"] = lesson_season

        if lesson_year:
            filters["lesson_year"] = lesson_year
            sub_filters["qr__timetable__lesson_year"] = lesson_year

        if school:
            filters["school"] = school
            sub_filters["qr__timetable__school"] = school

        if group:
            filters["timetable_to_group__group_id"] = group
            sub_filters["qr__timetable__timetable_to_group__group_id"] = group

        timetable_qs = TimeTable.objects.generate_weeks().filter(**filters)

        if week:
            sub_filters["qr__week"] = week
            timetable_qs = timetable_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(week_number=week)
            )

        student_stats = (
            RegisterIrts.objects.filter(
                **sub_filters,
                qr__timetable__in=timetable_qs
            )
            .values("student_id", "student__first_name", "student__last_name", "student__group_id", "student__group__name")
            .annotate(
                s_count=Count(
                    Concat('qr__timetable__day', Value('_'), 'student_id', output_field=CharField()),
                    filter=Q(state=RegisterIrts.STATE_SICK),
                    distinct=True
                ),
                c_count=Count(
                    Concat('qr__timetable__day', Value('_'), 'student_id', output_field=CharField()),
                    filter=Q(state=RegisterIrts.STATE_CHULUULSUN),
                    distinct=True
                ),
                t_count=Count(
                    Concat('qr__timetable__time', Value('_'), 'student_id', output_field=CharField()),
                    filter=Q(state=RegisterIrts.STATE_TAS),
                    distinct=True
                ),
                full_name=Concat("student__code", Value(" "), Upper(Substr("student__last_name", 1, 1)), Value('.'), "student__first_name", output_field=CharField()),
            )
            .filter(Q(s_count__gte=3) | Q(c_count__gte=5) | Q(t_count__gte=6))
        )

        grouped_data = defaultdict(lambda: {"tas_students": [], "chuluu_students": [], "sick_students": [], "group_id": None })

        # 2. Оюутан бүрээр гүйж, нөхцөл хангасан ангид нь хуваарилна
        for student in student_stats:
            group_id = student['student__group_id']
            group_name = student['student__group__name']
            full_name = student['full_name']

            grouped_data[group_name]["group_id"] = group_id

            # Таслалт: t_count >= 6 (tas_students)
            if student['t_count'] >= 6:
                grouped_data[group_name]["tas_students"].append(full_name)

            # Чөлөө: c_count >= 5 (c_students)
            if student['c_count'] >= 5:
                grouped_data[group_name]["chuluu_students"].append(full_name)

            # Өвчин: s_count >= 3 (s_students - нэмэлтээр)
            if student['s_count'] >= 3:
                grouped_data[group_name]["sick_students"].append(full_name)

        final_result = [
            {
                "name": group_name,
                "tas_students": list(set(data["tas_students"])),
                "sick_students": list(set(data["sick_students"])),
                "chuluu_students": list(set(data["chuluu_students"])),
                "student_count": Student.objects.filter(group=data["group_id"], status__code=1).count()
            }
            for group_name, data in grouped_data.items()
        ]

        return request.send_data(final_result)

STATE_LABEL_MAP = {
    RegisterIrts.STATE_IRSEN:      'и',
    RegisterIrts.STATE_TAS:        'т',
    RegisterIrts.STATE_CHULUULSUN: 'ч',
    RegisterIrts.STATE_SICK:       'ө',
}

STATE_KEY_MAP = {v: k for k, v in STATE_LABEL_MAP.items()}

EMPTY_COUNTS = {'и': 0, 'т': 0, 'ч': 0, 'ө': 0}


def _resolve_year_season(request):
    """Query param-аас lesson_year, lesson_season авах эсвэл идэвхтэй улирлыг буцаах."""
    lesson_year   = request.query_params.get('lesson_year')
    lesson_season = request.query_params.get('lesson_season')
    if not lesson_year:
        lesson_year, lesson_season = get_active_year_season()
    return lesson_year, lesson_season


def _get_irts_qr_ids(lesson_year, lesson_season, week=None, school=None):
    filters = {
        'timetable__lesson_year':   lesson_year,
        'timetable__lesson_season': lesson_season,
    }
    if week and str(week).isdigit():
        filters['week'] = int(week)
    if school:
        filters['timetable__school'] = school
    return IrtsQr.objects.filter(**filters).values_list('id', flat=True)


def _deduplicated_irts_ids(qr_ids, extra_filters=None):
    """
    Нэг (student, qr) хосоор хамгийн сүүлийн ирцийг сонгох.
    Давхардлыг арилгана (DISTINCT ON student_id, qr_id).
    """
    qs = RegisterIrts.objects.filter(qr_id__in=qr_ids)
    if extra_filters:
        qs = qs.filter(**extra_filters)
    return (
        qs
        .order_by('student_id', 'qr_id', '-created_at')
        .distinct('student_id', 'qr_id')
        .values_list('id', flat=True)
    )
class StudentListIrtsAPIView(generics.GenericAPIView):
    """Оюутнуудын хуудасласан жагсаалт"""

    @login_required()
    def get(self, request):
        lesson_year, lesson_season = _resolve_year_season(request)

        search       = request.query_params.get('search', '')
        group_search = request.query_params.get('group_search', '')
        week         = request.query_params.get('week', '')
        school       = request.query_params.get('school', '')
        page         = int(request.query_params.get('page', 1))
        limit        = int(request.query_params.get('limit', 40))

        # 1. Сонгосон улирал/7 хоногийн QR ID-г авах
        irts_qr_ids = _get_irts_qr_ids(lesson_year, lesson_season, week, school)

        timetable_filter = dict(lesson_year=lesson_year, lesson_season=lesson_season)
        if school:
            timetable_filter['school'] = school
        # 2. Тухайн улиралд хичээлтэй ангиудыг олох
        active_group_ids = (
            TimeTable.objects
            .filter(lesson_year=lesson_year, lesson_season=lesson_season)
            .values_list('timetable_to_group__group', flat=True)
            .distinct()
        )

        # 3. Суралцаж буй оюутны үндсэн QuerySet
        student_qs = (
            Student.objects
            .filter(
                Q(status__name__icontains='Суралцаж буй') |
                Q(status__name__icontains='Суралцаж байгаа')
            )
            .select_related('group', 'group__profession')
        )

        # Хайлтгүй үед зөвхөн идэвхтэй ангиудаар хязгаарлах
        if not search and not group_search:
            student_qs = student_qs.filter(group_id__in=active_group_ids)

        if search:
            student_qs = student_qs.filter(
                Q(last_name__icontains=search)  |
                Q(first_name__icontains=search) |
                Q(code__icontains=search)
            )

        if group_search:
            student_qs = student_qs.filter(group__name__icontains=group_search)

        # 4. Pagination
        total       = student_qs.count()
        total_pages = max(1, (total + limit - 1) // limit)
        start       = (page - 1) * limit
        paged_qs    = student_qs[start : start + limit]
        paged_ids   = [s.id for s in paged_qs]

        dedup_ids = _deduplicated_irts_ids(
            irts_qr_ids,
            extra_filters={'student_id__in': paged_ids},
        )
        raw_counts = (
            RegisterIrts.objects
            .filter(id__in=dedup_ids)
            .values('student_id', 'state')
            .annotate(cnt=Count('id'))
        )

        summary_map = defaultdict(lambda: dict(EMPTY_COUNTS))
        for row in raw_counts:
            label = STATE_LABEL_MAP.get(row['state'])
            if label:
                summary_map[row['student_id']][label] = row['cnt']

        results = [
            {
                'student_id':      s.id,
                'name':            s.full_name,
                'code':            s.code or '',
                'group_name':      s.group.name if s.group else '',
                'profession_name': s.group.profession.name if s.group and s.group.profession else '',
                'level':           s.group.level if s.group else '',
                'summary':         summary_map[s.id],
            }
            for s in paged_qs
        ]

        return request.send_data({
            'results':    results,
            'total':      total,
            'page':       page,
            'limit':      limit,
            'totalPages': total_pages,
        })
class StudentDetailIrtsAPIView(generics.GenericAPIView):
    """Оюутны хичээл + бүх ирц"""

    @login_required()
    def get(self, request, student_id):
        lesson_year, lesson_season = _resolve_year_season(request)
        school = request.query_params.get('school', '')

        student = (
            Student.objects
            .filter(id=student_id)
            .select_related('group')
            .first()
        )
        if not student:
            return request.send_data({'lessons': [], 'attendance': {}})
        timetable_base_filter = dict(lesson_year=lesson_year, lesson_season=lesson_season)
        if school:
            timetable_base_filter['school'] = school
        lessons = list(
            TimeTable.objects
            .filter(**timetable_base_filter,)
            .annotate(
                is_group_exists=Exists(
                    TimeTable_to_group.objects.filter(
                        group=student.group, timetable_id=OuterRef('pk')
                    )
                ),
                is_exclude_exists=Exists(
                    TimeTable_to_student.objects.filter(
                        timetable_id=OuterRef('pk'), student_id=student, add_flag=False
                    )
                ),
                is_add_student_exists=Exists(
                    TimeTable_to_student.objects.filter(
                        student=student, timetable_id=OuterRef('pk'), add_flag=True
                    )
                ),
                is_level_exists=ExpressionWrapper(
                    Q(level_group=student.group.level),
                    output_field=BooleanField(),
                ),
            )
            .filter(
                Q(is_group_exists=True) | Q(is_add_student_exists=True) | Q(is_level_exists=True),
                is_exclude_exists=False,
            )
            .select_related('lesson', 'teacher', 'lesson_season')
            .annotate(
                lesson_name=F('lesson__name'),
                teacher_name=Concat(
                    Upper(Substr('teacher__last_name', 1, 1)), Value('.'),
                    'teacher__first_name',
                    output_field=CharField(),
                ),
                season_name=F('lesson_season__season_name'),
            )
            .values('lesson_id', 'teacher_id', 'lesson_name', 'teacher_name', 'season_name')
            .distinct()
        )

        lesson_teacher_set = {(l['lesson_id'], l['teacher_id']) for l in lessons}
        lesson_ids  = [p[0] for p in lesson_teacher_set]
        teacher_ids = [p[1] for p in lesson_teacher_set]

        timetable_qs = TimeTable.objects.filter(
            **timetable_base_filter,
            lesson_id__in=lesson_ids,
            teacher_id__in=teacher_ids,
        )

        timetables = list(
            timetable_qs
            .annotate(type_name=WithChoices(TimeTable.LESSON_TYPE, 'type'))
            .values('id', 'lesson_id', 'teacher_id', 'odd_even', 'begin_week', 'end_week', 'day', 'time', 'type', 'type_name')
        )

        timetables = [
            tt for tt in timetables
            if (tt['lesson_id'], tt['teacher_id']) in lesson_teacher_set
        ]

        all_qrs = list(
            IrtsQr.objects
            .filter(timetable__in=[tt['id'] for tt in timetables])
            .select_related('timetable')
        )

        qrs_by_timetable = defaultdict(list)
        for qr in all_qrs:
            qrs_by_timetable[qr.timetable_id].append(qr)

        attendance_records = (
            RegisterIrts.objects
            .filter(student_id=student_id, qr_id__in=[qr.id for qr in all_qrs])
            .order_by('qr_id', '-created_at')
            .distinct('qr_id')
        )
        attendance_map = {
            rec.qr_id: STATE_LABEL_MAP.get(rec.state, 'X')
            for rec in attendance_records
        }

        bulk_result = defaultdict(list)
        for tt in timetables:
            current_qrs = qrs_by_timetable.get(tt['id'], [])

            week_ids = sorted({qr.week for qr in current_qrs if qr.week is not None})

            student_weeks = [
                {'week': qr.week, 'state_name': attendance_map[qr.id]}
                for qr in current_qrs
                if qr.id in attendance_map
            ]
            key = f"{tt['lesson_id']}_{tt['teacher_id']}"
            bulk_result[key].append({
                'type':     tt.get('type_name'),
                'day':      tt.get('day'),
                'time':     tt.get('time'),
                'week_ids': week_ids,
                'weeks':    student_weeks,
            })

        return request.send_data({
            'lessons':    lessons,
            'attendance': dict(bulk_result),
        })
class StudentSummaryIrtsAPIView(generics.GenericAPIView):
    """Нийт И Т Ч Ө тоо"""
    @login_required()
    def get(self, request):
        lesson_year, lesson_season = _resolve_year_season(request)
        week = request.query_params.get('week', '')
        school = request.query_params.get('school', '')

        irts_qr_ids = _get_irts_qr_ids(lesson_year, lesson_season, week, school)
        dedup_ids   = _deduplicated_irts_ids(irts_qr_ids)

        rows = (
            RegisterIrts.objects
            .filter(id__in=dedup_ids)
            .values('state')
            .annotate(cnt=Count('id'))
        )
        totals = dict(EMPTY_COUNTS)
        for row in rows:
            label = STATE_LABEL_MAP.get(row['state'])
            if label:
                totals[label] = row['cnt']

        return request.send_data(totals)
class StudentAllSummaryIrtsAPIView(generics.GenericAPIView):
    """Оюутан тус бүрийн И Т Ч Ө тоо."""

    @login_required()
    def get(self, request):
        lesson_year, lesson_season = _resolve_year_season(request)
        week = request.query_params.get('week', '')
        school = request.query_params.get('school', '')

        irts_qr_ids = _get_irts_qr_ids(lesson_year, lesson_season, week, school)
        dedup_ids   = _deduplicated_irts_ids(irts_qr_ids)

        rows = (
            RegisterIrts.objects
            .filter(id__in=dedup_ids)
            .values('student_id', 'state')
            .annotate(cnt=Count('id'))
        )

        result = {}
        for row in rows:
            sid   = row['student_id']
            label = STATE_LABEL_MAP.get(row['state'])
            if not label:
                continue
            result.setdefault(sid, dict(EMPTY_COUNTS))
            result[sid][label] = row['cnt']

        return request.send_data(result)

class StudentByStateIrtsAPIView(generics.GenericAPIView):
    """Тухайн ирцийн төлөвөөр оюутны жагсаалт."""

    # @login_required()
    def get(self, request):
        lesson_year, lesson_season = _resolve_year_season(request)

        state_param = request.query_params.get('state')
        page        = int(request.query_params.get('page', 1))
        limit       = int(request.query_params.get('limit', 50))
        week        = request.query_params.get('week', '')
        school = request.query_params.get('school', '')
        search      = request.query_params.get('search', '')

        state = STATE_KEY_MAP.get(state_param)
        if not state:
            return request.send_data([])

        irts_qr_ids = _get_irts_qr_ids(lesson_year, lesson_season, week, school)

        extra_filters = {'state': state}
        if search:
            matching_ids = (
                Student.objects
                .filter(
                    Q(last_name__icontains=search)  |
                    Q(first_name__icontains=search) |
                    Q(code__icontains=search)       |
                    Q(group__name__icontains=search)
                )
                .values_list('id', flat=True)
            )
            extra_filters['student_id__in'] = list(matching_ids)

        dedup_ids = _deduplicated_irts_ids(irts_qr_ids, extra_filters=extra_filters)

        data_qs = (
            RegisterIrts.objects
            .filter(id__in=dedup_ids)
            .values('student_id')
            .annotate(
                count=Count('id'),
                name=Concat(
                    'student__last_name', Value(' '),
                    'student__first_name',
                    output_field=CharField(),
                ),
                code=F('student__code'),
                group_name=F('student__group__name'),
            )
            .values('student_id', 'name', 'code', 'group_name', 'count')
            .order_by('-count')
        )

        total       = data_qs.count()
        total_pages = max(1, (total + limit - 1) // limit)
        start       = (page - 1) * limit
        paged       = list(data_qs[start : start + limit])

        return request.send_data({
            'results':    paged,
            'total':      total,
            'page':       page,
            'limit':      limit,
            'totalPages': total_pages,
        })

class OnlineIrtsReportAPIView(generics.GenericAPIView):
    @login_required()
    def get(self, request):
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        week = request.query_params.get('week')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        tt_filters = {}
        if lesson_year:
            tt_filters['lesson_year'] = lesson_year
        if lesson_season:
            tt_filters['lesson_season'] = lesson_season
        if lesson:
            tt_filters['lesson'] = lesson
        if teacher:
            tt_filters['teacher'] = teacher

        # 1. Тухайн 7 хоногт орох ёстой бүх хуваарь
        timetable_qs = TimeTable.objects.generate_weeks().filter(**tt_filters)
        if week:
            timetable_qs = timetable_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(week_number=week)
            )

        timetables = timetable_qs.annotate(
            lesson_name=Concat('lesson__code', Value(' '), 'lesson__name', output_field=CharField()),
            teacher_name=Concat(Upper(Substr('teacher__last_name', 1, 1)), Value('.'), 'teacher__first_name', output_field=CharField()),
        ).values('id', 'lesson_id', 'teacher_id', 'lesson_name', 'teacher_name', 'day', 'time').distinct()

        # 2. Үүссэн IrtsQr-уудыг dict болгоно
        qr_filters = {'timetable__lesson_year': lesson_year, 'timetable__lesson_season': lesson_season}
        if lesson: qr_filters['timetable__lesson'] = lesson
        if teacher: qr_filters['timetable__teacher'] = teacher
        if week: qr_filters['week'] = week

        qr_qs = IrtsQr.objects.filter(**qr_filters).annotate(
            created_hour=ExtractHour('created_at'),
            created_minute=ExtractMinute('created_at'),
        ).values('timetable_id', 'created_at', 'created_hour', 'created_minute')

        qr_map = {}
        for qr in qr_qs:
            qr_map[qr['timetable_id']] = qr

        # 3. Хуваарь бүрт QR байгаа эсэхийг шалгана
        result = []
        for tt in timetables:
            qr = qr_map.get(tt['id'])
            result.append({
                'lesson_name': tt['lesson_name'],
                'teacher_name': tt['teacher_name'],
                'schedule_day': tt['day'],
                'schedule_time': tt['time'],
                'created_at': qr['created_at'].isoformat() if qr and qr.get('created_at') else None,
                'created_hour': qr['created_hour'] if qr else None,
                'created_minute': qr['created_minute'] if qr else None,
            })

        return request.send_data(result)


class OnlineIrtsListAPIView(generics.GenericAPIView):
    @login_required()
    def get(self, request):

        day = request.query_params.get('day')
        week = request.query_params.get('week')
        group = request.query_params.get('group')
        l_time = request.query_params.get('time')
        school = request.query_params.get('school')
        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 40))

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        timetable_qs = TimeTable.objects.generate_weeks()

        filters = dict()

        if lesson_season:
            filters["lesson_season"] = lesson_season
        if lesson_year:
            filters["lesson_year"] = lesson_year
        if lesson:
            filters["lesson"] = lesson
        if school:
            filters["school"] = school
        if teacher:
            filters["teacher"] = teacher
        if day:
            filters["day"] = day
        if l_time:
            filters["time"] = l_time
        if group:
            filters["timetable_to_group__group_id"] = group

        lesson_info_qs = (
            timetable_qs
            .filter(**filters)
            .annotate(
                season_name=F("lesson_season__season_name"),
                lesson_name=Concat("lesson__code", Value(" "), "lesson__name", output_field=CharField()),
                teacher_name=Concat(Upper(Substr("teacher__last_name", 1, 1)), Value('.'), "teacher__first_name", output_field=CharField()),
                start_week=Case(
                    When(begin_week__isnull=True, is_kurats=False, then=Value(1)),
                    When(is_kurats=False, then=F("begin_week")),
                    default=Value(None),
                    output_field=IntegerField()
                ),
                finish_week=Case(
                    When(end_week__isnull=True, is_kurats=False, then=Value(16)),
                    When(is_kurats=False, then=F("end_week")),
                    default=Value(None),
                    output_field=IntegerField()
                ),
                old_in_count=Case(
                    When(start_week__isnull=False, then=F("finish_week") - F("start_week") + 1),
                    default=Value(1),
                    output_field=IntegerField()
                ),
                in_count=Case(
                    When(~Q(odd_even=TimeTable.ALL), then=F("old_in_count") / 2),
                    default=F("old_in_count"),
                    output_field=IntegerField()
                )
            )
            .order_by("teacher__first_name", "lesson__name")
        )

        if week:
            lesson_info_qs = lesson_info_qs.filter(
                Q(week_numbers__overlap=[week]) | Q(week_number=week)
            )

        lesson_info = (
            lesson_info_qs
            .values(
                "lesson_id",
                "lesson_name",
                "teacher_id",
                "teacher_name",
                "season_name",
                "lesson_year",
                "lesson_season_id",
            )
            .annotate(
                week_time=Count(
                    Concat('day', Value('_'), 'time', Value('_'), 'type', Value('_'), 'odd_even', output_field=CharField()),
                    distinct=True
                ),
                learn_week=Max("in_count"),
                irts_qr_count=Count(
                    'irtsqr',
                    filter=Q(
                        irtsqr__timetable__lesson_id=F('lesson_id'),
                        irtsqr__timetable__teacher_id=F('teacher_id'),
                        irtsqr__registerirts__isnull=False,
                        **({'irtsqr__week': week} if week else {})
                    ),
                    distinct=True
                ),
            )
            .annotate(
                total_week_time=F("week_time") if week else F("week_time") * F("learn_week"),
                not_created_count=Case(
                    When(irts_qr_count__gte=F("total_week_time"), then=Value(0)),
                    default=F("total_week_time") - F("irts_qr_count"),
                    output_field=IntegerField()
                ),
            )
            .values(
                "lesson_id", "lesson_name", "teacher_name", "teacher_id",
                "season_name", "lesson_year", "week_time", "total_week_time",
                "learn_week", "irts_qr_count", "not_created_count",
            )
        )

        ordered_qs = lesson_info.order_by("-irts_qr_count", "teacher__first_name", "lesson__name")
        all_datas = list(ordered_qs)
        total = len(all_datas)
        offset = (page - 1) * limit

        return request.send_data({
            "datas": all_datas[offset:offset + limit],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        })


@permission_classes([IsAuthenticated])
class ScoreConfirmAPIView(generics.GenericAPIView):
    @login_required()

    def post(self, request):
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        school_id = request.query_params.get('school_id')
        repeat_count = request.query_params.get('repeat_count')

        try:
            repeat_count = int(repeat_count) if repeat_count not in (None, '') else 0
        except (TypeError, ValueError):
            repeat_count = 0

        is_repeat = repeat_count in (Exam_repeat.REPEAT_1, Exam_repeat.REPEAT_2)

        if not lesson_year or not lesson_season:
            return request.send_error("ERR_002", "Жил, улирал сонгоно уу")

        if not is_repeat and not school_id:
            return request.send_error("ERR_002", "Сургууль сонгоно уу")

        if is_repeat:
            qs = Exam_repeat.objects.filter(
                lesson_year=lesson_year,
                lesson_season=lesson_season,
                # school=school_id
                repeat_count=repeat_count,
            )
            not_found_msg = "Энэ жил, улирлын давтан шалгалт олдсонгүй"
        else:
            qs = ExamTimeTable.objects.filter(
                lesson_year=lesson_year,
                lesson_season=lesson_season,
                school=school_id
            )
            not_found_msg = "Энэ жил, улирлын шалгалт олдсонгүй"

        if not qs.exists():
            return request.send_error("ERR_002", not_found_msg)

        if not qs.exclude(is_confirm_ded=True).exists():
            return request.send_error("ERR_002", "Дүн баталгаажсан байна")

        target_qs = qs.exclude(is_confirm_ded=True)
        exam_ids = list(target_qs.values_list('id', flat=True))

        exam_count = len(exam_ids)
        lesson_count = target_qs.values('lesson').distinct().count()

        if is_repeat:
            student_ids = list(
                Exam_to_student.objects.filter(exam_id__in=exam_ids)
                .values_list('student_id', flat=True).distinct()
            )
            student_count = len(student_ids)
            group_count = (
                Student.objects.filter(id__in=student_ids).values('group').distinct().count()
            )
        else:
            group_count = (
                Exam_to_group.objects.filter(exam_id__in=exam_ids).values('group').distinct().count()
            )
            student_count = (
                Student.objects
                .filter(
                    Exists(Exam_to_group.objects.filter(exam_id__in=exam_ids, group__student=OuterRef('pk'))) |
                    Exists(ExamToSubGroup.objects.filter(exam_id__in=exam_ids, sub_group__student=OuterRef('pk'))) |
                    Exists(ExamToLevelGroup.objects.filter(exam_id__in=exam_ids, level_group__student=OuterRef('pk')))
                )
                .distinct()
                .count()
            )

        target_qs.update(
            is_confirm_ded=True,
            confirm_date_ded=timezone.now()
        )

        return request.send_data({
            "message": "Дүн амжилттай баталгаажлаа",
            "stats": {
                "exam_count": exam_count,
                "lesson_count": lesson_count,
                "group_count": group_count,
                "student_count": student_count,
            }
        })


class AttendanceSummaryAPIView(generics.GenericAPIView):
    """ Сүүлийн N долоо хоногийн дундаж ирцийн мэдээлэл """

    @login_required()
    def get(self, request):
        group = request.query_params.get('group') or None
        school = request.query_params.get('school') or None
        lesson_year = request.query_params.get('lesson_year') or None
        lesson_season = request.query_params.get('lesson_season') or None
        weeks_count = int(request.query_params.get('weeks_count', 4))

        settings_obj = SystemSettings.objects.filter(
            season_type=SystemSettings.ACTIVE
        ).first()

        if not settings_obj:
            return request.send_data({
                "average_percent": 0,
                "teacher_percent": 0,
                "weeks_count": 0,
                "below_threshold_count": 0,
                "datas": [],
            })

        start_date = settings_obj.start_date
        finish_date = settings_obj.finish_date

        last_week_number = ((finish_date - start_date).days // 7) + 1

        # Сүүлийн долоо хоногоос урагш нийт weeks_count ширхэг долоо хоног
        first_week_number = max(1, last_week_number - weeks_count + 1)
        week_numbers = list(range(first_week_number, last_week_number + 1))

        # Тухайн долоо хоног бүрийн эхлэх/дуусах огноог тооцоолно
        week_ranges = {}
        for w in week_numbers:
            w_start = start_date + timedelta(days=(w - 1) * 7)
            w_end = w_start + timedelta(days=6)
            week_ranges[w] = (w_start, w_end)

        filters = dict(
            qr__timetable__lesson_year=lesson_year,
            qr__timetable__lesson_season=lesson_season,
            qr__week__in=week_numbers,
        )
        if group:
            filters["student__group_id"] = group
        if school:
            filters["qr__timetable__school"] = school

        qs = (
            RegisterIrts.objects.filter(**filters)
            .values("qr__week")
            .annotate(
                total=Count("id"),
                irsen=Count("id", filter=Q(state=RegisterIrts.STATE_IRSEN)),
            )
        )

        stats_by_week = {row["qr__week"]: row for row in qs}

        # мэдээлэлгүй долоо хоногийг 0%-тай харуулна
        datas = []
        for w in week_numbers:
            w_start, w_end = week_ranges[w]
            row = stats_by_week.get(w)
            if row and row["total"]:
                percent = round((row["irsen"] / row["total"]) * 100, 1)
            else:
                percent = 0

            datas.append({
                "week": w,
                "percent": percent,
                "start_date": w_start,
                "end_date": w_end,
            })

        percents = [d["percent"] for d in datas]
        avg_percent = round(sum(percents) / len(percents), 1) if percents else 0

        group_qs = (
            RegisterIrts.objects.filter(**filters)
            .values("student__group_id")
            .annotate(
                total=Count("id"),
                irsen=Count("id", filter=Q(state=RegisterIrts.STATE_IRSEN)),
            )
        )

        below_threshold_count = 0
        for g_row in group_qs:
            if g_row["total"] > 0:
                g_percent = (g_row["irsen"] / g_row["total"]) * 100
                if g_percent < 70:
                    below_threshold_count += 1

        tt_qs = TimeTable_to_group.objects.filter(
            timetable__lesson_year=lesson_year,
            timetable__lesson_season=lesson_season,
        )
        if group:
            tt_qs = tt_qs.filter(group_id=group)
        if school:
            tt_qs = tt_qs.filter(timetable__school=school)

        timetable_weeks = list(tt_qs.values_list('timetable_id', 'timetable__begin_week', 'timetable__end_week'))

        total_expected_slots = 0
        for tt_id, b_week, e_week in timetable_weeks:
            if b_week is not None and e_week is not None:
                for w in week_numbers:
                    if b_week <= w <= e_week:
                        total_expected_slots += 1

        irts_qr_qs = IrtsQr.objects.filter(
            timetable__lesson_year=lesson_year,
            timetable__lesson_season=lesson_season,
            week__in=week_numbers,
        )
        if school:
            irts_qr_qs = irts_qr_qs.filter(timetable__school=school)
        if group:
            timetable_ids = list(set([item[0] for item in timetable_weeks]))
            irts_qr_qs = irts_qr_qs.filter(timetable_id__in=timetable_ids)

        total_taken_slots = irts_qr_qs.count()

        teacher_percent = round((total_taken_slots / total_expected_slots) * 100, 1) if total_expected_slots > 0 else 0
        teacher_percent = min(teacher_percent, 100.0)

        return request.send_data({
            "average_percent": avg_percent,
            "teacher_percent": teacher_percent,
            "weeks_count": len(datas),
            "below_threshold_count": below_threshold_count,
            "datas": datas,
        })


class AttendanceTimelineAPIView(generics.GenericAPIView):
    """ Ирцийн мэдээлэл долоо хоногоор, сургуулиар харуулах """

    @login_required()
    def get(self, request):
        lesson_year = request.query_params.get('lesson_year') or None
        lesson_season = request.query_params.get('lesson_season') or None
        selected_week = request.query_params.get('week')
        school_id = request.query_params.get('school')

        settings_obj = SystemSettings.objects.filter(
            season_type=SystemSettings.ACTIVE
        ).first()

        empty_response = {
            "selected_week": None,
            "selected_week_average_percent": 0,
            "below_threshold_school_count": 0,
            "schools": [],
        }

        if not settings_obj:
            return request.send_data(empty_response)

        start_date = settings_obj.start_date
        finish_date = settings_obj.finish_date

        week_numbers = list(range(1, 21))

        week_ranges = {}
        for w in week_numbers:
            w_start = start_date + timedelta(days=(w - 1) * 7)
            w_end = w_start + timedelta(days=6)
            week_ranges[w] = (w_start, w_end)

        try:
            selected_week = int(selected_week) if selected_week is not None else None
        except (TypeError, ValueError):
            selected_week = None

        if selected_week not in week_numbers:
            current_date = datetime.now()
            current_week = get_week_num_from_date(current_date.strftime('%Y-%m-%d'), lesson_year, lesson_season)
            selected_week = current_week if current_week in week_numbers else None

            if selected_week is None and week_numbers:
                selected_week = week_numbers[-1]

        if selected_week is None:
            return request.send_data(empty_response)

        filters = dict(
            qr__timetable__lesson_year=lesson_year,
            qr__timetable__lesson_season=lesson_season,
            qr__week=selected_week,
        )

        if school_id:
            filters.update(student__school=school_id)

        qs = (
            RegisterIrts.objects.filter(**filters)
            .values(
                "student__school",
                "student__school__name",
            )
            .annotate(
                total=Count("id"),
                irsen=Count("id", filter=Q(state=RegisterIrts.STATE_IRSEN)),
            )
        )

        schools = []
        for row in qs:
            total = row.get("total", 0)
            percent = round((row.get("irsen", 0) / total) * 100, 1) if total else 0
            schools.append({
                "id": row.get("student__school"),
                "name": row.get("student__school__name") or "",
                "percent": percent,
            })

        schools = sorted(schools, key=lambda s: (s["name"].lower() if s["name"] else "", s["id"] or 0))
        below_threshold_school_count = sum(school["percent"] < 70 for school in schools)
        selected_week_average_percent = round(
            sum(s["percent"] for s in schools) / len(schools), 1
        ) if schools else 0

        return request.send_data({
            "selected_week": selected_week,
            "selected_week_average_percent": selected_week_average_percent,
            "below_threshold_school_count": below_threshold_school_count,
            "schools": schools,
        })


def get_exam_organized_summary(lesson_year=None, lesson_season=None, school=None):
    """
    Шалгалтын ерөнхий тойм тоо (бүх дүгнэх хэлбэрийг /SCORE_TYPE/ хамарна):

    - organized_count: Зохион байгуулсан шалгалтын тоо
      (бодитоор оноо орсон Lesson_teacher_scoretype-ийн ялгаатай тоо)
    - participant_count: Ямар нэг дүн орсон (оролцсон) ялгаатай оюутны тоо
    - retake_lesson_count: Дахин шалгалттай (Exam_repeat) ялгаатай хичээлийн тоо
    """
    ts_filters = {}
    if lesson_year:
        ts_filters['lesson_year'] = lesson_year
    if lesson_season:
        ts_filters['lesson_season'] = lesson_season
    if school:
        ts_filters['student__school'] = school

    ts_qs = TeacherScore.objects.filter(**ts_filters)

    # Зохион байгуулсан шалгалт: score_type бүр нь тодорхой хичээл+багш+дүгнэх
    # хэлбэрийн нэг "шалгалт" гэж үзнэ (Lesson_teacher_scoretype давхардуулахгүй тоолно)
    organized_count = ts_qs.values('score_type').distinct().count()

    # Оролцсон оюутан: аль нэг дүгнэх хэлбэрт (SCORE_TYPE) оноо орсон бүх ялгаатай оюутан
    participant_count = ts_qs.values('student').distinct().count()

    # Дахин шалгалттай хичээл
    repeat_filters = {}
    if lesson_year:
        repeat_filters['lesson_year'] = lesson_year
    if lesson_season:
        repeat_filters['lesson_season'] = lesson_season

    retake_lesson_count = (
        Exam_repeat.objects.filter(**repeat_filters)
        .values('lesson')
        .distinct()
        .count()
    )

    rows = (
        ts_qs
        .values('student_id', 'score_type__lesson_teacher__lesson_id')
        .annotate(
            exam_score=Max(Case(
                When(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, then=F('score')),
                default=Value(0),
                output_field=FloatField()
            )),
            has_exam=Max(Case(
                When(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )),
        )
    )

    failed_student_ids = set()
    for row in rows:
        if not row['has_exam']:
            continue

        exam_score = row['exam_score'] or 0
        if exam_score < 18:
            failed_student_ids.add(row['student_id'])

    failed_count = len(failed_student_ids)

    return {
        'organized_count': organized_count,
        'participant_count': participant_count,
        'retake_lesson_count': retake_lesson_count,
        'failed_count': failed_count,
    }


@permission_classes([IsAuthenticated])
class ExamOrganizedSummaryAPIView(generics.GenericAPIView):
    """ Шалгалтын ерөнхий тойм (бүх SCORE_TYPE хамарсан) """

    def get(self, request):
        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        school = request.query_params.get('school')

        data = get_exam_organized_summary(
            lesson_year=lesson_year,
            lesson_season=lesson_season,
            school=school,
        )

        return request.send_data(data)
