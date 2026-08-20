from html.parser import HTMLParser
import json
import math
import re
import time
import cyrtranslit
import requests
import traceback

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from functools import reduce
from random import randint
from crontab import CronTab

from urllib.parse import unquote, unquote_plus, urljoin, urlparse
from typing import Dict, Optional, List
from rest_framework import serializers

from io import BytesIO
import PIL.Image as Image
from asgiref.sync import async_to_sync

from django.apps import apps
from django.conf import settings
from django.core.mail import get_connection
from django.db import connections
from django.db import transaction
from django.utils.encoding import filepath_to_uri

from django.db.models import PositiveIntegerField, Model
from django.db.models.functions import Cast

from datetime import datetime, timedelta
from django.db.models import Q
from django.db.models import CharField
from django.db.models import DateTimeField
from django.db.models import ForeignKey

from django.db.models.query import QuerySet

from django.shortcuts import get_object_or_404
from django.shortcuts import reverse
from operator import or_
from functools import reduce

import os

from main.utils.file import create_folder, remove_folder

import subprocess

from googletrans import Translator
translator = Translator()

from lms_package.notif import create_notif


def list_to_dict(data):
    """ List датаг Dict рүү хөрвүүлэх """

    extract_data = json.dumps(data)
    parsed_data = json.loads(extract_data)
    return parsed_data


def check_datetime(input_datetime):
    """ datetime төрөлтэй эсэх """
    is_datetime = True
    if not isinstance(input_datetime, datetime):
        is_datetime = False

    return is_datetime


def fix_format_date(input_date, format='%Y-%m-%d %H:%M:%S'):
    """ Date format хөрвүүлэх """

    date_data = ''

    is_date = check_datetime(input_date)

    if is_date:
        date_data = input_date.strftime(format)

    return date_data


def date_fix_format(input_date):
    if not isinstance(input_date, datetime):
        if '/' in input_date:
            input_date = input_date.replace('/', '-')

    return input_date


def datetime_to_string(cdate='', time=False):
    date_data = cdate

    if cdate:
        if isinstance(cdate, datetime):
            date_data = cdate.strftime('%Y-%m-%d')
            if time:
                date_data = cdate.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(cdate, date):
            date_data = cdate.strftime('%Y-%m-%d')
        else:
            date_data = date_fix_format(cdate)
    return date_data


def time_tango(date, time):
    """ Date болон цаг нийлүүлэх """

    return datetime.combine(date, time)


def str2bool(v):
    """ string утгыг boolean рүү хувиргах """

    return v.lower() in ("yes", "true", "t", "1", "True") if v else False


def null_to_none(datas):
    """ str null утгыг None руу хөрвүүлэх """

    for key, value in datas.items():
        if isinstance(value, str):
            if value == 'null':
                datas[key] = None

    return datas


def remove_key_from_dict(input_dict, keys):
    """ Dict-ээс key ашиглаж дата устгах """

    if isinstance(keys, list):
        for key in keys:
            if key in input_dict:
                del input_dict[key]
    else:
        del input_dict[keys]

    return input_dict


def _filter_queries(model, search_item='', fields=[]):
    """ field өгсөн байвал field-с өгөөгүй бол model-ийн field-н утгаар хайна """

    if not search_item:
        return model

    if len(fields) > 0:
        queries = [Q(**{f + "__icontains": search_item}) for f in fields if f]
    else:
        char_fields = [f for f in model._meta.fields if isinstance(f, CharField)]
        date_fields = [f for f in model._meta.fields if isinstance(f, DateTimeField)]
        fields = char_fields + date_fields

    qs = Q()
    for query in queries:
        qs = qs | query

    filtered_qs = model.filter(qs)
    return filtered_qs


def filter_queries(model, search_item=''):
    """ Моделийн бүр field -ээс хайлтын утгаар хайна """

    if not search_item:
        return model.objects

    char_fields = [f for f in model._meta.fields if isinstance(f, CharField)]
    date_fields = [f for f in model._meta.fields if isinstance(f, DateTimeField)]
    fields = char_fields + date_fields

    queries = [Q(**{f.name + "__icontains": search_item}) for f in fields]

    qs = Q()
    for query in queries:
        qs = qs | query

    filtered_qs = model.filter(qs)
    return filtered_qs


def override_get_queryset(self):
    """ Хайлт болон эрэмблэлттэй жагсаалт гаргах үед queryset буцаана """

    queryset = self.queryset
    search_value = self.request.query_params.get('search')
    sorting = self.request.query_params.get('sorting')
    schoolId = self.request.query_params.get('schoolId')
    lesson_year =  self.request.query_params.get('lesson_year')
    lesson_season = self.request.query_params.get('lesson_season')
    lesson = self.request.query_params.get('lesson')
    school = self.request.query_params.get('school')
    department = self.request.query_params.get('department')
    if isinstance(queryset, QuerySet):
        queryset = queryset.all()

    # Хайлт хийх үед ажиллана.
    if search_value:
        queryset = filter_queries(queryset.model, search_value)

    # Сургуулиар хайх
    if schoolId:
        queryset=queryset.filter(school_id=schoolId)

    if school:
        queryset=queryset.filter(school=school)

    # Хичээлийн жилээр хайлт хийх
    if lesson_year:
        queryset = queryset.filter(lesson_year=lesson_year)

    # Хичээлийн улиралаар хайлт хийх
    if lesson_season:
        queryset = queryset.filter(lesson_season=lesson_season)

    # Хичээлээр хайлт хийх
    if lesson:
        queryset = queryset.filter(lesson=lesson)

    # Тэнхимээр хайлт хийх
    if department:
        queryset = queryset.filter(department=department)

    # Sort хийх үед ажиллана
    if sorting:
        if not isinstance(sorting, str):
            sorting = str(sorting)

        queryset = queryset.order_by(sorting)

    return queryset

def default_rsp():
    rsp = {
        'success': False,
        'error': ''
    }

    return rsp


def json_load(data):
    if isinstance(data, str):
        data = json.loads(data)
    return data


def json_dumps(data):
    if isinstance(data, dict) or isinstance(data, list):
        data = json.dumps(data, ensure_ascii=False)
    return data


def generate_random_numbers(n):
    """ Random digit N number """

    range_start = 10 ** (n - 1)
    range_end = (10 ** n) - 1

    return randint(range_start, range_end)


def get_user_permissions(user):
    """ Хэрэглэгчийн бүх эрхийг авах
        RETURN list
    """

    Employee = apps.get_model('core', 'Employee')
    Permissions = apps.get_model('core', 'Permissions')
    emp_obj = Employee.objects.filter(user=user,state=Employee.STATE_WORKING).first()

    permissions = []

    if user.is_superuser:
        if not user.is_staff:
            permissions = list(Permissions.objects.all().filter(Q(name__startswith='lms') | (Q(name='role-read'))).exclude(name__icontains='lms-elselt').values_list('name', flat=True))
        else:
            permissions = list(Permissions.objects.all().filter(Q(name__startswith='lms') | (Q(name='role-read'))).values_list('name', flat=True))

    elif emp_obj and not user.is_superuser:
        permissions = list(emp_obj.org_position.roles.values_list("permissions__name", flat=True))
        removed_perms = list(emp_obj.org_position.removed_perms.values_list("name", flat=True))
        permissions = permissions + list(emp_obj.org_position.permissions.values_list("name", flat=True))

        removed_perms = set(removed_perms)
        permissions = set(permissions)
        permissions = permissions.difference(removed_perms)

    return list(permissions)


def has_permission(allowed_permissions=[], must_permissions=[], back_url=None):
    """ Хэрэглэгчийн эрх дунд зөвшөөрөгдсөн эрх байгаа эсэхийг шалгах нь
        allowed_permissions = аль нэг эрх нь байхад л зөвшөөрнө гэж үзнэ
        must_permissions = бүх эрх нь байж байж л зөвшөөрөгдөнө
    """
    def decorator(view_func):

        def wrap(self, request, *args, **kwargs):

            permissions = []
            if request.user:
                permissions = get_user_permissions(request.user)

            if permissions:
                def check_allowed_perm():
                    """ Аль нэг эрх нь байгааг шалгах """
                    check = any(item in permissions for item in allowed_permissions)
                    return check

                def check_must_perm():
                    """ Бүх эрх нь байгааг шалгах """
                    check = all(item in permissions for item in must_permissions)
                    return check

            has_perm = False

            if allowed_permissions:
                has_perm = check_allowed_perm()

            if must_permissions:
                has_perm = check_must_perm()

            if not has_perm:
                request.send_error("ERR_011", "Хэрэглэгч эрхгүй байна.")

            return view_func(self, request, *args, **kwargs)

        return wrap

    return decorator


def get_fullName(firstName='', lastName="", is_dot=True, is_strim_first=False):
    """ return fullName
        firstName: Эхэнд бичигдэх нэр
        lastName: Сүүлд бичигдэх нэр
        is_dot: Дунд нь цэг байх эсэх
        is_strim_first: Эхний нэрний эхний үсгийг авах эсэх
    """

    full_name = ''

    if is_strim_first:
        if len(firstName)>0:
            firstName = firstName[0]

    if firstName:
        full_name += firstName

    if is_dot:
        full_name += '. '
    else:
        full_name += ' '

    if lastName:
        full_name += lastName

    return full_name


def get_error_obj(msg='', field=""):
    """ Input error мессеж буцаадаг хэсгийг return"""
    errors = []
    if field:
        return_error = {
            "field": field,
            "msg": msg
        }
        errors.append(return_error)

    return errors


def get_lesson_choice_student(lesson=None, teacher=None, school=None, lesson_year=None, lesson_season=None, group=None):
    """
        Хичээл сонголт харуулах function
        Поток тус бүрийн add/remove логик зөв дагаж, foreign key-уудыг prefetch/ select_related ашиглан cache-дсэн хувилбар
    """

    start_time = time.time()  # Функц эхлэх үеийн цаг

    TimeTable = apps.get_model('lms', 'TimeTable')
    TimeTable_to_group = apps.get_model('lms', 'TimeTable_to_group')
    TimeTable_to_student = apps.get_model('lms', 'TimeTable_to_student')
    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')

    # Суралцаж буй статус
    status = StudentRegister.objects.filter(name__icontains='Суралцаж буй').first()
    if not status or not lesson_year or not lesson_season:
        return Student.objects.none()

    # Хуваарьны queryset
    timetable_qs = TimeTable.objects.filter(
        lesson_year=lesson_year,
        lesson_season=lesson_season,
        lesson=lesson
    )
    if school:
        timetable_qs = timetable_qs.filter(school=school)
    if teacher:
        timetable_qs = timetable_qs.filter(teacher=teacher)

    timetable_ids = list(timetable_qs.values_list('id', flat=True))
    if not timetable_ids:
        return Student.objects.none()

    # Бүх TimeTable_to_group-г нэг удаа query хийж dictionary-д хадгалах
    tt_groups_qs = TimeTable_to_group.objects.filter(timetable_id__in=timetable_ids)
    if group:
        tt_groups_qs = tt_groups_qs.filter(group=group)

    groups_dict = {}
    for tt_id, group_id in tt_groups_qs.values_list('timetable_id', 'group_id'):
        groups_dict.setdefault(tt_id, []).append(group_id)

    # Бүх TimeTable_to_student-г нэг удаа query хийж dictionary-д хадгалах
    add_dict = {}
    remove_dict = {}

    tt_students_qs = TimeTable_to_student.objects.filter(timetable_id__in=timetable_ids)
    for tt_id, student_id, add_flag in tt_students_qs.values_list('timetable_id', 'student_id', 'add_flag'):
        if add_flag:
            add_dict.setdefault(tt_id, []).append(student_id)
        else:
            remove_dict.setdefault(tt_id, []).append(student_id)

    # Эцсийн student IDs-г Python set-д хадгалах
    student_ids = set()

    student_qs = Student.objects.filter(status=status)
    if group:
        student_qs = student_qs.filter(group=group)

    for tt_id in timetable_ids:
        group_ids = groups_dict.get(tt_id, [])
        add_ids = add_dict.get(tt_id, [])
        remove_ids = remove_dict.get(tt_id, [])

        qs_ids = student_qs.filter(
            Q(group_id__in=group_ids) | Q(id__in=add_ids)
        ).exclude(id__in=remove_ids).values_list('id', flat=True)

        student_ids.update(qs_ids)

    # Эцсийн queryset-ийг ганц удаа авахдаа .select_related() хийх
    all_student = student_qs.filter(id__in=student_ids).select_related('group', 'status')

    end_time = time.time()    # Функц дуусах үеийн цаг
    elapsed_time = end_time - start_time

    print(f"Функцын нийт ажиллах хугацаа: {elapsed_time:.4f} секунд")

    return all_student


def get_schedule(lesson_year = '', school = '' , lesson_season = '' , room = '' , student = '', group = '', teacher = '', lesson = ''):
    """ Хичээл Хуваарь харуулах function """

    TimeTable = apps.get_model('lms', 'TimeTable')
    TimeTable_to_group = apps.get_model('lms', 'TimeTable_to_group')
    TimeTable_to_student = apps.get_model('lms', 'TimeTable_to_student')
    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')

    schedule = []

    if not school or not lesson_season or not lesson_year :
        return schedule

    timetable = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, school=school)

    # Багшаар хайлт хийх хэсэг
    if teacher:
        timetable = timetable.filter(teacher=teacher)

    # Өрөөгөөр хайлт хийх хэсэг
    if room:
        timetable = timetable.filter(room=room)

    # Оюутнаар хайлт хийх хэсэг
    if student:
        timetable = timetable.filter(student=student)

    # Хичээлээр хайлт хийх хэсэг
    if lesson:
        timetable = timetable.filter(lesson=lesson)

    # Ангиар хайлт хийх хэсэг
    if group:
        timetable_group = timetable_group.filter(group=group)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваарийн ids
    timetable_ids = timetable.values_list('id',flat=True)

    # Тухайн хайлт хийсэн хуваарьтай ангийн мэдээлэл
    timetable_group = TimeTable_to_group.objects.filter(timetable__in=timetable_ids)

    # Тухайн хайлт хийсэн хуваарьтай ангийн ids
    timetable_group_ids = timetable_group.values_list('group', flat=True)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваарийг нэмэлтээр үзэж байгаа оюутны мэдээлэл
    timetable_student1 = TimeTable_to_student.objects.filter(timetable__in=timetable_ids, add_flag=True)

    # Ангиар хайлт хийсэн байвал нэмэлтээр үзэж байгаа оюутны ангиар хайлт хийх хэсэг
    if group:
        timetable_student1 = timetable_student1.filter(student__group=group)

    # Нэмэлтээр үзэж байгаа оюутны ids
    timetable_student1_ids = timetable_student1.values_list('student', flat=True)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваариас хасалт хийлгэсэн оюутны мэдээлэл
    timetable_student2 = TimeTable_to_student.objects.filter(timetable__in =timetable_ids, add_flag=False)

    # Хасалт хийлгэсэн оюутнуудын ids
    timetable_student2_id = timetable_student2.values_list('student', flat=True)

    status = StudentRegister.objects.filter(name__contains='Суралцаж буй').first()

    # Тухайн хуваарийг үзэж байгаа ангийн оюутнууд
    group_student = Student.objects.exclude(Q(id__in=timetable_student2_id)).filter(status=status).filter(Q(group__in=timetable_group_ids, school=school)).values_list('id', flat=True)

    # Тухайн хуваарийг нэмэлтээр үзэж байгаа ангийн оюутнууд
    add_student = Student.objects.filter(id__in=list(timetable_student1_ids), school=school).values_list('id', flat=True)

    # Оюутны мэдээллийг нэгтгэж байгаа хэсэг
    schedule = add_student.union(group_student)

    return schedule

def get_connection_db():
    db = get_primary_db_name()
    return connections[db]


def get_primary_db_name():
    primary_db = 'default'
    if settings.DEBUG:
        return primary_db

    for db_name in settings.DATABASES:
        try:
            sql = """
                SELECT pg_is_in_recovery()
            """
            cursor = connections[db_name].cursor()
            cursor.execute(sql)
            value = cursor.fetchone()

            is_read_only = value[0]
            if not is_read_only:
                primary_db = db_name
                break

        except:
            pass

    return primary_db


def get_teacher_queryset(is_working=True):
    """ Бүх хэрэглэгчдээс багш төлөвтэй хэрэглэгчийг л авах хэсэг
        is_working - Зөвхөн ажиллаж байгаа ажилтны жагсаалт авах эсэх
        return querysets
    """

    Teacher = apps.get_model('core', 'Teachers')
    Employee = apps.get_model('core', 'Employee')

    queryset = Teacher.objects.all().filter(action_status=Teacher.APPROVED).order_by('id')

    teacher_queryset = queryset.values_list('user', flat=True)
    qs_employee_user = Employee.objects.filter(user_id__in=list(teacher_queryset))

    if is_working:
        qs_employee_user = qs_employee_user.filter(state=Employee.STATE_WORKING)

    qs_employee_user = qs_employee_user.values_list('user', flat=True)

    if len(qs_employee_user) > 0:
        queryset = queryset.filter(user_id__in = list(qs_employee_user))
        #sub_org__isnull=False  Дараа нь багшийн бүртгэл бүтэн болох үед ажиллана

    return queryset

def get_teacher_qs(is_working=True):
    """ Бүх хэрэглэгчдээс багш төлөвтэй хэрэглэгчийг л авах хэсэг
        is_working - Зөвхөн ажиллаж байгаа ажилтны жагсаалт авах эсэх
        return querysets
    """

    Teacher = apps.get_model('core', 'Teachers')
    Employee = apps.get_model('core', 'Employee')
    TimeTable = apps.get_model('lms', 'TimeTable')

    queryset = Teacher.objects.all().filter(action_status=Teacher.APPROVED)

    teacher_queryset = queryset.values_list('user', flat=True)
    qs_employee_user = Employee.objects.filter(user_id__in=list(teacher_queryset), org_position__is_teacher=True)

    if is_working:
        qs_employee_user = qs_employee_user.filter(state=Employee.STATE_WORKING)

    qs_employee_user = qs_employee_user.values_list('user', flat=True)

    if len(qs_employee_user) > 0:
        queryset = queryset.filter(user_id__in = list(qs_employee_user))

    return queryset


def get_weekday_kurats_date(kurats_start_date, kurats_end_date, lesson_year='', lesson_season=''):
    """ Курац хуваарийн эхлэх өдрөөс 7 хоногийн хэд дэх өдрийг авах
        хичээлийн хэд дэх 7 хоног гэдгийг буцаана
        return list
    """

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    # Тухайн хичээлийн жилийн 16 7 хоног
    weeks = get_16week_start_date(lesson_year, lesson_season)

    ksdatetime = datetime.strptime(kurats_start_date, '%Y-%m-%d') if isinstance(kurats_start_date, str) else kurats_start_date
    kedatetime = datetime.strptime(kurats_end_date, '%Y-%m-%d') if isinstance(kurats_end_date, str) else kurats_end_date
    is_before = False
    filters = dict()

    if lesson_year and lesson_season:
        filters["active_lesson_year"] = lesson_year
        filters["active_lesson_season"] = lesson_season

    if not lesson_year:
        filters["season_type"] = SystemSettings.ACTIVE

    qs_activeyear = SystemSettings.objects.filter(**filters).first()

    c_date = ksdatetime

    if isinstance(c_date, datetime):
        c_date = c_date.date()

    # Хичээлийн эхдэх хугацаанаас өмнөх хуваарь бол
    if qs_activeyear and qs_activeyear.start_date > c_date:
        is_before = True

    # Курацын эхлэх дуусах өдрүүдийн хооронд дох өдрүүд
    kdelta = kedatetime - ksdatetime
    kurats_day_list = []

    if not is_before:
        for week in weeks:
            start_date = datetime.strptime(week.get('start_date'), '%Y-%m-%d')
            end_date = datetime.strptime(week.get('end_date'), '%Y-%m-%d')

            delta = end_date - start_date

            for i in range(delta.days + 1):
                day = start_date + timedelta(days=i)

                for j in range(kdelta.days + 1):
                    kweek_kurats = {}
                    kday = ksdatetime + timedelta(days=j)
                    weekday = kday.weekday() + 1

                    # Амралтын өдрийн алгасаж хуваарь үүсгэх
                    if weekday in [6, 7]:
                        continue
                    if day == kday:
                        kweek_kurats['weekNum'] = week.get('id')
                        kweek_kurats['weekday'] = weekday
                        kweek_kurats['begin_date'] = kday.date()
                        kurats_day_list.append(kweek_kurats)
    else:
        for j in range(kdelta.days + 1):
            kweek_kurats = {}
            kday = ksdatetime + timedelta(days=j)
            weekday = kday.weekday() + 1

            # Амралтын өдрийн алгасаж хуваарь үүсгэх
            if weekday in [6, 7]:
                continue

            kweek_kurats['weekNum'] = 1
            kweek_kurats['weekday'] = weekday
            kweek_kurats['begin_date'] = kday
            kurats_day_list.append(kweek_kurats)

    return kurats_day_list


def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)

    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))


def isLightOrDark(color):
    rgbColor = list(hex_to_rgb(color))

    [r, g, b] = rgbColor
    hsp = math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

    if hsp > 127.5:
        return 'black'
    else:
        return 'white'


def get_student_score_register(student_id, season='', lesson_year = '',):
    """ student_id өгч сурагчийн голч дүн хэдэн кридэт үзсэнийг буцаана
    """

    total_kr = 0
    total_skr = 0
    total_score = 0
    average = 0

    ScoreRegister = apps.get_model('lms', 'ScoreRegister')
    Score = apps.get_model('lms', 'Score')

    filter = {
        'student__id': student_id,
    }

    if lesson_year:
        filter['lesson_year__contains'] = lesson_year

    if season:
        filter['lesson_season__season_code'] = season

    stud_score_info = ScoreRegister.objects.filter(
        **filter
    )

    if stud_score_info:

        for score_data in stud_score_info:
            score = score_data.score_total
            score_qs = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()
            total_kr = total_kr + score_data.lesson.kredit
            total_score = total_score + (score_qs.gpa * score_data.lesson.kredit)
            if score_data.grade_letter and score_data.grade_letter.letter == 'S':
                total_skr = total_skr + score_data.lesson.kredit

        if total_score != 0.0:
            estimate_kr = total_kr - total_skr
            average = round((total_score / estimate_kr), 2)

    return (
    {
        'total_kr': total_kr,
        'total_score': total_score,
        'gpa': average
    })


def get_position(user):
    """ Хэрэглэгчийн албан тушаал буцаана """

    position_id = ''
    User = apps.get_model('core', 'User')
    Employee = apps.get_model('core', 'Employee')

    get_object_or_404(User, id=user)

    org = Employee.objects.filter(user=user, state=Employee.STATE_WORKING).first()

    if org and org.org_position:
        position_id = org.org_position.id

    return position_id


def truncate_down(number, decimals=1):
    factor = 10 ** decimals
    return math.floor(number * factor) / factor


def get_menu_unit(menu_id):
    ''' Тухайн цэсний шийдвэрлэх нэгжүүдийг буцаана '''

    c_menu_list = []
    Complaint_unit = apps.get_model('lms', 'Complaint_unit')

    c_queryset = Complaint_unit.objects.all().annotate(my_season=Cast('unit', PositiveIntegerField())).order_by('unit')
    all_values = c_queryset.values('menus', 'id', 'unit')

    for jvalues in all_values:
        jmenus = json_load(jvalues.get('menus'))
        c_unit_id = jvalues.get('unit')
        j_id = jvalues.get('id')

        c_obj = c_queryset.filter(id=j_id).first()
        unit_name = c_obj.get_unit_display()

        for jmenus_dict in jmenus if jmenus else []:
            for key in jmenus_dict:
                if jmenus_dict[key] == menu_id:
                    c_menu_data = {}

                    c_menu_data['id'] = c_unit_id
                    c_menu_data['name'] = unit_name

                    c_menu_list.append(c_menu_data)

    return c_menu_list


def get_unit_user(user):
    """ Хэрэглэгчийн албан тушаалд хамаарагдах шийдвэрлэх нэгжийг буцаана """

    c_units =[]
    Complaint_unit = apps.get_model('lms', 'Complaint_unit')

    c_queryset = Complaint_unit.objects.all()

    position_id = get_position(user)

    if not position_id:
        return c_units

    units = c_queryset.filter(position=position_id).values('unit', 'id')

    for unit in units:
        c_data = {}
        c_id = unit.get('id')
        unit_id = unit.get('unit')

        c_obj = c_queryset.filter(id=c_id).first()
        unit_name = c_obj.get_unit_display()

        c_data['unit_id'] = unit_id
        c_data['unit_name'] = unit_name

        c_units.append(c_data)

    return c_units


def get_16week_start_date(lesson_year='', lesson_season=''):
    ''' Хичээл эхлэх өдрөөс 16н 7 хоногийг тооцоолох
        return list
    '''
    week_list = []
    SystemSettings = apps.get_model('lms', 'SystemSettings')

    filters = dict()

    if lesson_year and lesson_season:
        filters["active_lesson_year"] = lesson_year
        filters["active_lesson_season"] = lesson_season

    if not lesson_year:
        filters["season_type"] = SystemSettings.ACTIVE

    qs_activeyear = SystemSettings.objects.filter(**filters).last()

    if not qs_activeyear:
        qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).last()

    if qs_activeyear:
        end_date = qs_activeyear.start_date

        weekday = end_date.weekday() + 1

        if weekday <= 2:
            end_date = end_date - timedelta(days=end_date.weekday())
        else:
            end_date = end_date + timedelta(days=(7-end_date.weekday()))

        for x in range(25):
            obj_datas = {}
            start_date = end_date

            end_date = start_date + timedelta(days=7)
            enddate = end_date - timedelta(days=1)
            obj_datas['id'] = x + 1
            obj_datas['start_date'] = start_date.strftime('%Y-%m-%d')
            obj_datas['end_date'] = enddate.strftime('%Y-%m-%d')

            week_list.append(obj_datas)

    return week_list


def get_week_num_from_date(current_date=None, lesson_year=None, lesson_season=None):
    """ Хэддэх 7 хоног вэ гэдгийг буцаана
        return int
    """

    if not current_date:
        current_date = datetime.today().strftime('%Y-%m-%d')

    weeks = get_16week_start_date(lesson_year, lesson_season)
    if not weeks:
        return 0

    parsed_current_date = datetime.strptime(current_date, '%Y-%m-%d').date()
    first_week_start_date = datetime.strptime(weeks[0]['start_date'], '%Y-%m-%d').date()

    if parsed_current_date < first_week_start_date:
        return 0

    raw_days_passed = (parsed_current_date - first_week_start_date).days
    if raw_days_passed < 0:
        return 0

    # Амралтын хоногийг тооцох
    year, season = get_active_year_season()
    RestPeriod = apps.get_model('lms', 'RestPeriod')
    check_rest = RestPeriod.objects.filter(lesson_season=season, lesson_year=year).first()

    if check_rest and check_rest.start_date and check_rest.end_date:
        rest_start = check_rest.start_date
        rest_end = check_rest.end_date
        rest_duration_days = (rest_end - rest_start).days + 1

        # Амралтаас өмнө
        if parsed_current_date < rest_start:
            base_week_num = (raw_days_passed // 7) + 1

        # Амралтын үеэр
        elif rest_start <= parsed_current_date <= rest_end:
            last_active_date = rest_start - timedelta(days=1)
            days_before_rest = (last_active_date - first_week_start_date).days
            base_week_num = max(1, (days_before_rest // 7) + 1)

        # Амралтын дараа
        else:
            adjusted_days_passed = raw_days_passed - rest_duration_days
            base_week_num = max(1, (adjusted_days_passed // 7) + 1)

    # Амралтгүй бол
    else:
        base_week_num = (raw_days_passed // 7) + 1

    return min(base_week_num, len(weeks))


def get_dates_from_week(lesson_year=None, lesson_season=None):
    week = get_week_num_from_date(lesson_year, lesson_season)
    weeks = get_16week_start_date(lesson_year, lesson_season)

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = None

    if lesson_year:
        qs_activeyear = SystemSettings.objects.filter(active_lesson_year=lesson_year, active_lesson_season=lesson_season).first()
    else:
        qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).first()

    if week == 0 and qs_activeyear:
        start_date = qs_activeyear.start_date
        return {
            'id': 0,
            'start_date': start_date,
            'end_date': start_date + timedelta(days=7)
        }
    else:
        for day_week in weeks:
            if day_week.get('id') == week:
                return day_week

    return {
        'id': 0,
        'start_date': date.today().strftime('%Y-%m-%d'),
        'end_date': date.today() + timedelta(days=7)
    }


def get_active_year_season(include_odd_even=False):
    """ Идэвхтэй хичээлийн жил
        include_odd_even: True байвал odd_even утгыг буцаана (default: False)
    """

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).first()

    year = qs_activeyear.active_lesson_year.strip() if qs_activeyear else None
    season = qs_activeyear.active_lesson_season.id if qs_activeyear else None
    system_odd_even = qs_activeyear.odd_even if qs_activeyear else None

    if include_odd_even:
        return year, season, system_odd_even
    return year, season


def get_lesson_year_season():
    """
        Идэвхтэй хичээлийн жилийн дараа ямар нэгэн
        улирал хичээлийн жил байвал түүнийг авна
    """

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = SystemSettings.objects.filter(season_type=1).last()

    year = qs_activeyear.active_lesson_year if qs_activeyear else None
    season = qs_activeyear.active_lesson_season.id if qs_activeyear and qs_activeyear.active_lesson_season else None

    check_lesson_seasons = SystemSettings.objects.filter(prev_lesson_year=year, prev_lesson_season=season).order_by("active_lesson_year", "active_lesson_season__season_code").first()

    if check_lesson_seasons:
        year = check_lesson_seasons.active_lesson_year
        season = check_lesson_seasons.active_lesson_season.id

    return year, season


def magicFunction(a, b):
    """ two "lists of dictionaries substract """

    a = [tuple(sorted(d.items())) for d in a]
    b = [tuple(sorted(d.items())) for d in b]

    return [dict(kvs) for kvs in set(a).difference(b)]

# service_url дуудах функц
def get_service_url(request, request_url):

    url = reverse(request_url)
    absolute_url = request.build_absolute_uri(url)

    # NOTE production server байх үед protocol нь http байвал https рүү replace хийнэ SSL тохируулсны дараа
    # if not settings.DEBUG:
    #     absolute_url = absolute_url.replace('http', 'https')

    return absolute_url

def add_crontab(command, minute, hour, day, month, week):
    """ Crontab нэмэх
        command: ажиллуулах функц URL
    """

    cron = CronTab(user=True)
    job = cron.new(command=command)

    if minute:
        job.minute.on(minute)
    if hour:
        job.hour.on(hour)
    if day:
        job.dom.on(day)
    if month:
        job.month.on(month)
    if week:
        job.dow.on(week)

    save_sting = str(job)
    cron.write()

    return save_sting


def remove_cron(request, obj):
    """ Crontab устгах """

    function = obj.command

    command = 'curl ' + get_service_url(request, function)
    my_cron = CronTab(user=True)

    for job in my_cron:
        if command in str(job.command):
            my_cron.remove(job)
            my_cron.write()


def get_system_odd_even_only(lesson_year=None, lesson_season=None):
    """Зөвхөн odd_even утга авах"""
    SystemSettings = apps.get_model('lms', 'SystemSettings')
    filters = dict()

    if lesson_year and lesson_season:
        filters["active_lesson_year"] = lesson_year
        filters["active_lesson_season"] = lesson_season

    if not lesson_year:
        filters["season_type"] = SystemSettings.ACTIVE

    qs = SystemSettings.objects.filter(**filters).first()
    return qs.odd_even if qs else None


def get_weeks(odd_even_type, begin_week=1, end_week=20):
    """ Тэгш / сондгой тогтмол төрлөөс хамаарч 7 хоног олох """
    if not begin_week or not end_week:
        return []

    end_week = int(end_week) or 1
    begin_week = int(begin_week) or 20

    system_odd_even = get_system_odd_even_only()

    # Хэрвээ сургуулийн эхлэх 7 хоног буюу 1р 7 хоногийг тэгш гэж үзвэл
    if system_odd_even == 2:
        if odd_even_type == 1: # Сондгой
            return [w for w in range(begin_week, end_week + 1) if w % 2 == 0]
        elif odd_even_type == 2: # Тэгш
            return [w for w in range(begin_week, end_week + 1) if w % 2 == 1]
        return list(range(begin_week, end_week + 1))

    if odd_even_type == 1: # Сондгой
        return [w for w in range(begin_week, end_week + 1) if w % 2 == 1]
    elif odd_even_type == 2: # Тэгш
        return [w for w in range(begin_week, end_week + 1) if w % 2 == 0]
    else: # Дандаа (ALL)
        return list(range(begin_week, end_week + 1))


def get_active_student():
    """ Суралцаж буй статустай оюутны авах """

    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')

    st_state = StudentRegister.objects.filter(name__icontains='Суралцаж буй').first()

    qs_students = Student.objects.filter(status=st_state)

    return qs_students

def calculate_birthday(register):
    """ Регистрийн дугаараас төрсөн огноо, хүйс тодорхойлох function
        return birth_date, gender
    """
    gender = ''
    try:
        # РД-аас төрсөн өдөр бодох
        if register[4] in ['2', '3']:
            year = int('20' + register[2:4])
            month = int(register[4:6]) - 20
        else:
            year = int('19' + register[2:4])
            month = int(register[4:6])

        day = int(register[6:8])

        # РД-аас хүйс бодох
        Student = apps.get_model("lms", 'Student')
        last_number = int(register[-2])
        if (last_number % 2) == 0:
            gender = Student.GENDER_FEMALE
        else:
            gender = Student.GENDER_MALE

        return date(year, month, day), gender

    except Exception as e:
        return None, gender


def find_gender(register):
    """ Регистрийн дугаараас хүйс тодорхойлох function
        return gender
    """
    gender = ''
    try:
        last_number = int(register[-2])
        if (last_number % 2) == 0:
            gender = 2
        else:
            gender = 1
        return gender
    except Exception as e:
        print(e)
        return None, gender

def bytes_image_encode(image):
    """ Base64 зургийг image болгох
    """

    img = Image.open(BytesIO(image))

    return img


def split_text_number(string):
    """ string-с үсэг тоо ялгах """

    letters = ''
    numbers = ''

    for char in string:
        if char.isalpha():
            letters += char
        elif char.isdigit():
            numbers += char

    return letters, numbers

def get_position_ids(names=[]):
    """
        албан тушаалын
        return: id
    """
    OrgPosition = apps.get_model('core', 'OrgPosition')

    query = reduce(or_, (Q(name__iexact=name) for name in names))
    pos_obj = OrgPosition.objects.filter(query).first()
    pos_ids = pos_obj.id
    return pos_ids


def start_time():
    return time.time()


def end_time(start_time, text=""):
    _time = time.time() - start_time
    print(text, time.time() - start_time)
    return _time

def dict_fetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description if col]
    for row in cursor.fetchall():
        yield dict(zip(columns, row))


def student__full_name(last_name, first_name):

    ovog = f"{last_name[0].upper()}." if last_name else ""
    name = first_name.capitalize()

    if ovog and name:
        return f"{ovog}{name}"

    if name:
        return name

    return ""


def lesson_standart__code_name(code, name):
    return code + "-" + name


def score_register__score_total(teach_score, exam_score, add_score=0):
    full = 0

    if teach_score:
        full += teach_score

    if exam_score:
        full += exam_score

    if add_score:
        full += add_score

    return full


def make_connection(from_email, config):
    connection = get_connection(
        username = from_email,
        password = config["email_password"],
        port = config["email_port"],
        host = config["email_host"],
        use_tls = config["email_use_tsl"],
        use_ssl = False,
        fail_silently = False
    )

    return connection


def get_domain_url_link():
    """ domain url авах """

    if settings.DEBUG is False:
        domain_url = 'https://sis.uia.gov.mn'
    else:
        domain_url = 'http://192.168.1.18:3000'

    return domain_url


def get_domain_url():
    """ domain url авах """

    if settings.DEBUG is False:
        domain_url = 'https://sis.uia.gov.mn'
    else:
        domain_url = 'http://localhost:8000'

    return domain_url


def cyrillic_name_to_latin(first_name, last_name):
    """ Cyrill нэрийг Latin болгон хөрвүүлнэ """

    # Ямар хэлээс хөрвүүлэхээ заана
    convert_language = "mn"

    # Сан ашиглаж кириллээс латин руу хөрвүүлнэ
    latin_first_name = cyrtranslit.to_latin(first_name, convert_language)
    latin_last_name = cyrtranslit.to_latin(last_name, convert_language)

    # Шаардлаггүй тэмдэгтүүд
    replacements = {
        'ü': 'u',
        'ö': 'u',
        'Ü': 'U',
        'Ö': 'U',
        'Yuu': 'Yu',
        'Yaa': 'Ya',
        'yuu': 'yu',
        'yaa': 'ya'
    }

    # Хөрвүүлсэн нэрнүүдэд шаардлагагүй тэмдэгтүүд байвал replace хийнэ
    for cyr, lat in replacements.items():
        latin_first_name = latin_first_name.replace(cyr, lat)
        latin_last_name = latin_last_name.replace(cyr, lat)

    # capitalize() нь зөвхөн эхний үсгийг томоор бусдын lowercase болгоно
    latin_first_name = latin_first_name.capitalize()
    latin_last_name = latin_last_name.capitalize()

    return latin_first_name, latin_last_name


def add_student_eng_name(group):
    """ Суралцагчдийн англи нэрийг хадгалана """

    # Ашиглах модел
    Student = apps.get_model('lms', 'Student')

    # Бүх суралцагчдаа орж авна
    students = Student.objects.filter(group=group).exclude(first_name_eng__isnull=False, last_name_eng__isnull=False)

    # Нийт bulk_create хийх өөрчлөлтүүдийг хадгалах list
    updated_students = []

    for student in students:
        print('---Ok------')
        # Кирилл нэрнүүдээ хөрвүүлээд нэмнэ
        eng_first_name, eng_last_name = cyrillic_name_to_latin(student.first_name, student.last_name)
        student.first_name_eng = eng_first_name
        student.last_name_eng = eng_last_name
        updated_students.append(student)

    # Бүх өөрчлөлтүүдээ ганц query-гээр бааздаа хадгална
    Student.objects.bulk_update(updated_students, ['first_name_eng', 'last_name_eng'])

    return len(updated_students)

def send_message_skytel(phone_numbers, message):
    """ phone_numbers: Илгээх утасны дугаарууд
        message: Илгээх мессеж
        Скайтелийн дугаартай элсэгчид рүү мессеж илгээх
    """

    success_count = 0
    not_found_numbers = []

    # Утасны дугаараар гүйлгэх
    for phone_number in phone_numbers:
        send_url = 'https://smsgw.skytel.mn/SMSGW-war/unicode?id=1000132&src=135038&dest={phone_number}&text={text}'.format(phone_number=phone_number, text=message)

        rsp = requests.get(send_url)

        # Хүсэлт амжилттай илгээгдсэн байвал
        if rsp.status_code == 200:
            success_count += 1

        print(rsp._content)
        # хүлээн авагчийн дугаар буруу
        if rsp.status_code == 103:
            not_found_numbers.append(phone_number)

        if rsp.status_code == 202:
            return False, 'IP хаяг эсвэл id буруу', success_count, not_found_numbers

        if rsp.status_code == 203:
            return False, 'Бүртгэл хаагдсан байна. Скайтел ХХК холбогдоно уу', success_count, not_found_numbers

        if rsp.status_code == 206:
            return False, 'Бусад оператор руу sms явуулах эрх алга', success_count, not_found_numbers

    return True, 'Амжилттай илгээлээ', success_count, not_found_numbers


def create_backup(
    db_pass,
    db_user_name,
    data_base,
    host='localhost',
    port='5432'
):
    """
        backup авах crontab
    """

    today = date.today()
    now = datetime.now()
    now_hour = str(now.time().hour)

    year = str(today.year)
    month = str(today.month)
    today = str(today)

    home_directory = os.path.expanduser('~')

    folder = os.path.join(home_directory, 'common')
    backup_path = os.path.join(folder, 'files/dxis')
    yearFolderYear = os.path.join(backup_path, year)
    yearFolderMonth = os.path.join(yearFolderYear, month)

    create_folder(backup_path)
    create_folder(yearFolderYear)
    create_folder(yearFolderMonth)

    filename = "{full_path}/{today}-{now_hour}.backup".format(
        full_path=yearFolderMonth,
        today=today.replace('\n', ''),
        now_hour=now_hour,
    )

    cmd = [
        '/usr/bin/pg_dump',
        '--host', host,
        '--port', port,
        '--username', db_user_name,
        '--no-password',
        '--format=c',
        '--file', filename,
        '--blobs',
        data_base,
    ]

    try:
        subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            env={'PGPASSWORD': str(db_pass)},
        )

        print("\x1b[6;30;42m 'backup үүсгэлээ!' \x1b[0m", )

    except Exception as e:
        print(e)

def check_phone_number(phone_numbers):
    """Утасны дугаарын үүрэн телефон шалгах
       phone_numbers: Шалгаж буй утасны дугаарууд (list)
    """

    #үүрэн телефон
    categorized_numbers = {
        'mobicom': [],
        'skytel': [],
        'unitel': [],
        'gmobile': [],
        'other': []
    }

    for phone_number in phone_numbers:

        # Эхний 2 орон
        two_digits = phone_number[:2]

        if two_digits in ["99", "85", "95", "94"]:
            categorized_numbers['mobicom'].append(phone_number)
        elif two_digits in ["90", "91", "96"]:
            categorized_numbers['skytel'].append(phone_number)
        elif two_digits in ["80", "86", "88", "89"]:
            categorized_numbers['unitel'].append(phone_number)
        elif two_digits in ["93", "97", "98"]:
            categorized_numbers['gmobile'].append(phone_number)
        else:
            categorized_numbers['other'].append(phone_number)

    # Хоосон массив хаях
    categorized_numbers = {k: v for k, v in categorized_numbers.items() if v}

    return categorized_numbers


def send_message_unitel(phone_numbers, message):
    """ phone_numbers: Илгээх утасны дугаарууд
        message: Илгээх мессеж
        Unitel дугаартай элсэгчид рүү мессеж илгээх
    """

    success_count = 0
    not_found_numbers = []

    try:

        # Утасны дугаараар гүйлгэх
        for phone_number in phone_numbers:
            headers = {
                'Content-Type':'application/json'
            }

            send_url = "https://pn.unitel.mn/api/message/send/sms?enc=A73Il7chnQ1P5O7lytIfGGhR8wHXxXv_azt3p6_jDoKCYfJy5a5w0YNmW5gq-8U3t-2cZwWzaZKW-c6KppGJMBkAiGbbtaJh7gd5dspvtF8vxG5PWQ390X9Ft0s6eXse"

            post_data_name = {
                'to': phone_number,
                'message': message
            }

            rsp = requests.post(send_url, headers=headers, json=post_data_name)

            # Хүсэлт амжилттай илгээгдсэн байвал
            if rsp.status_code == 200:
                success_count += 1
            else:
                print(rsp.status_code, rsp.text)
    except Exception as e:
        print('e', e)

    return True, 'Амжилттай илгээлээ', success_count, not_found_numbers


def send_message_gmobile(phone_numbers, message):
    """ phone_numbers: Илгээх утасны дугаарууд
        message: Илгээх мессеж
        GMobile дугаартай элсэгчид рүү мессеж илгээх
    """

    success_count = 0
    not_found_numbers = []

    # Утасны дугаараар гүйлгэх
    for phone_number in phone_numbers:
        send_url = 'http://sms-special.gmobile.mn/cgi-bin/sendsms?username=dt_school38&password=dtdi*0319&from=135038&to={phone_number}&text={text}'.format(phone_number=phone_number, text=message)

        rsp = requests.get(send_url)

        # Хүсэлт амжилттай илгээгдсэн байвал
        if rsp.status_code == 200:
            success_count += 1

    return True, 'Амжилттай илгээлээ', success_count, not_found_numbers


def send_message_mobicom(phone_numbers, message):
    """ phone_numbers: Илгээх утасны дугаарууд
        message: Илгээх мессеж
        Mobicom дугаартай элсэгчид рүү мессеж илгээх
    """

    success_count = 0
    not_found_numbers = []

    # Утасны дугаараар гүйлгэх
    for phone_number in phone_numbers:
        send_url = 'http://27.123.214.168/smsmt/mt?servicename=Dotood&username=Hereg&from=135038&to=976{phone_number}&msg={text}'.format(phone_number=phone_number, text=message)

        rsp = requests.get(send_url)

        # Хүсэлт амжилттай илгээгдсэн байвал
        if rsp.status_code == 200:
            success_count += 1

    return True, 'Амжилттай илгээлээ', success_count, not_found_numbers

def calculate_age(birthdate):
    today = datetime.today()
    age = today.year - birthdate.year

    # Сар өдөрөөр бодож хэрэв сар өдөр нь хүрээгүй бол 1 ийг хасна
    # NOTE ДХИС элсэлтийн системдээ зөвхөн оноор нь насыг шалгах хүсэлт тавьсан
    # if (today.month,today.day) < (birthdate.month , birthdate.day):
    #     age -=1

    return age


def get_cdn_url(endpoint):
    """
        Орчиноос шалтгаалж cdn-server-ийн url буцаан.

        :param endpoint: method заах url.
        :return: The full CDN URL.
    """

    # Орчиноос шалтгаалж url авах
    if settings.DEBUG is True:
        cdn_urls = 'http://192.168.1.37:8008/cdn/'
    else:
        #NOTE cdn-server domain-тай болох үед url тавих
        cdn_urls = settings.CDN_MAIN_DOMAIN

    if not endpoint.endswith('/'):
        endpoint = endpoint + '/'

    full_url = urljoin(cdn_urls, endpoint)

    return full_url


# ------------------------------------------------- CDN рүү файл хадгалах function ----------------------------------------------------------------------------


def get_cdn_urls():
    path = settings.CDN_MAIN_DOMAIN

    # Орчиноос шалтгаалж url авах
    if settings.DEBUG:
        path = 'http://192.168.1.37:8008/cdn/'

    return path


def create_file_to_cdn(filepath, file):
    """ Production орчинд cdn folder луу файл хадгалах
        file_path: Өгөгдлийн санд хадгалагдах folder Жишээлбэл шилжилт хөдөлгөөний файл хадгалах гэж байгаа бол "movement" гэх мэт
        file: Хадгалах файл
        return {
            "file_name": "viber_image_2024-08-07_16-43-51-283.png",
            "full_path": "movement/viber_image_2024-08-07_16-43-51-283.png"
        }
    """

    path = get_cdn_urls()

    cdn_save_path = path + 'save-file/'
    cdn_root_folder = settings.CDN_MAIN_FOLDER

    saved_path = os.path.join(cdn_root_folder, filepath)

    cdn_data = {
        'path': saved_path
    }

    # to avoid 0 size files if pointer at EOF after previous request.post()
    file.seek(0)

    files = {'file': file}

    try:
        # HEAD хүсэлт нь GET-ээс хамаагүй хурдан, бага дата ашигладаг
        response = requests.post(cdn_save_path, data=cdn_data, files=files)
        # CDN server дээр файлаа хадгалах post method
        if response.status_code != 200:
            print(f'Файл хадгалахад алдаа гарсан байна. {response.text}')
            print(f'URL алдаатай байна. Статус код: {response.status_code}')
            return {}
        else:
            # Амжилттай хадгалвал
            return response.json().get('data')
    except requests.exceptions.RequestException as e:
        print(f'Холбогдож чадсангүй. {e.__str__()}')
        return {}

    # # CDN server дээр файлаа хадгалах post method
    # response = requests.post(cdn_save_path, data=cdn_data, files=files)

    # # Амжилттай хадгалвал
    # if response.status_code == 200:
    #     return response.json().get('data')
    # else:
    #     raise Exception('Файл хадгалахад алдаа гарсан байна. \n')


def remove_file_from_cdn(path, is_file=True):
    """
        CDN серверээс файл устгах нь,
        path: заавал дэд folder  path агуулсан байх Example: movement/image.png
        is_file: True байвал Зөвхөн файл устгах Үгүй байвал folder устгах
    """

    # cdn дээрх зам биш бол cdn ий замыг үүсгэж авах нь

    body = {
        "path": path,
        'is_file': is_file
    }

    cdn_path = get_cdn_urls()

    cdn_delete_path = cdn_path + 'delete-file/'
    rsp = requests.delete(cdn_delete_path, json=body)
    print(rsp.status_code)
    if rsp.status_code != 200:
        # raise Exception('Файл утсгахад алдаа гарсан байна. \n' + rsp.text)
        return False
    else:
        return True


def get_file_from_cdn(path):
    """
        CDN серверээс файл унших нь,
        path: заавал дэд folder  path агуулсан байх Example: movement/image.png

        returns examples from 2026-01-04:
            Fail case: {'success': False, 'data': '', 'error': 'Файл үүсээгүй байна!'}
            Success case: {'success': True, 'data': {'message': 'Файл үүсэн байна!', 'full_path': 'https://sis.uia.gov.mn/files/dxis/feedback/R.jpg'}, 'error': ''}
                However returned url in result is dead: "full_path': 'https://sis.uia.gov.mn/files/dxis/feedback/R.jpg"
                    The really alive url is: "https://sis.uia.gov.mn/cdn/files/feedback/R.jpg"
    """

    # cdn дээрх зам биш бол cdn ий замыг үүсгэж авах нь

    cdn_root_folder = settings.CDN_MAIN_FOLDER
    path = path.replace(cdn_root_folder, '')
    cdn_full_path = os.path.join(cdn_root_folder, path)
    body = {
        "path": cdn_full_path,
    }

    cdn_path = get_cdn_urls()

    cdn_check_path = cdn_path + 'check-file/'

    try:
        # HEAD хүсэлт нь GET-ээс хамаагүй хурдан, бага дата ашигладаг
        response = requests.get(cdn_check_path, json=body, timeout=3)

        if response.status_code != 200:
            print(f'Файл уншихад алдаа гарсан байна. {response.text}')
            return {}
        else:
            data = response.json()
            return data
    except requests.exceptions.RequestException as e:
        print(f'Холбогдож чадсангүй. {e.__str__()}')
        return {}


# Define the static mapping
def unit_static_datas():
    datas = {
        'А': 'Архангай',
        'Б': 'Баян-Өлгий',
        'В': 'Баянхонгор',
        'Г': 'Булган',
        'Д': 'Говь-Алтай',
        'Е': 'Дорноговь',
        'Ж': 'Дорнод',
        'З': 'Дундговь',
        'И': 'Завхан',
        'Й': 'Өвөрхангай',
        'К': 'Өмнөговь',
        'Л': 'Сүхбаатар',
        'М': 'Сэлэнгэ',
        'Н': 'Төв',
        'О': 'Увс',
        'П': 'Ховд',
        'Р': 'Хөвсгөл',
        'С': 'Хэнтий',
        'Т': 'Дархан-Уул',
        'Ф': 'Орхон',
        'Х': 'Говьсүмбэр',
        'У': 'Улаанбаатар',
        'Щ': 'Улаанбаатар',
    }

    return datas


def save_data_with_signals(
        model_class: Model,
        custom_serializer: Optional[serializers.Serializer]=None,
        silent=False,
        trusted_data: Optional[Dict]=None,
        **serializer_kwargs: dict
    ):
    """
    ver. 20241205-2
    if id provided in trusted_data or in data then it will update else create

    Supports (extended serializer.save):
    1. mass-creating or mass-updating
    2. signals
    3. serializer level validation
    4. serializer autogeneration
    5. id instead of instance
    6. exceptions handling
    7. transaction rollback
    8. saving without serializer validation
    9. silent mode switching

    example calls:
    1. save_data_with_signals(MyModel, MySerializer, None, data=request.data)
    2. save_data_with_signals(MyModel, None, None, data=request.data)

    :param model_class: model where objects will be created or updated
    :param custom_serializer: not required. serializer
    :param silent: silent mode or raise exception
    :param trusted_data: data to save without serializer validation. If it is list then indexes should be same as in data
    :param serializer_kwargs: standart serializer arguments

    returns: tuple of:
    1. standart return from serializer.save()
    2. exception string
    3. serializer.errors
    """

    instances = None
    exception = None
    serializer_errors = None

    if custom_serializer:
        SerializerClass = custom_serializer

    else:
        class MyModelSerializer(serializers.ModelSerializer):
            class Meta:
                model = model_class
                fields = '__all__'

        SerializerClass = MyModelSerializer

    try:
        serializer_validated_data = []

        if serializer_kwargs:
            serializer = SerializerClass(**serializer_kwargs)

            if serializer.is_valid(raise_exception=not silent):
                if not isinstance(serializer.validated_data, list):
                    serializer_validated_data = [serializer_kwargs['data']]

            else:
                serializer_errors = serializer.errors

        if not serializer_errors:
            if not isinstance(trusted_data, list):
                trusted_data = [trusted_data]

            any_data = serializer_validated_data if serializer_validated_data else trusted_data if trusted_data else None

            if any_data:
                instances = []

                with transaction.atomic():
                    for index, record in enumerate(any_data):
                        if serializer_validated_data:
                            if trusted_data[0] != None:
                                united_data = {**record, **trusted_data[index]}

                            else:
                                united_data = record

                        else:
                            united_data = record

                        obj_id = united_data.get('id')

                        if obj_id:
                            record_obj = model_class.objects.get(id=obj_id)

                            for attr, value in united_data.items():
                                if hasattr(record_obj, attr) and isinstance(model_class._meta.get_field(attr), ForeignKey):
                                    setattr(record_obj, f"{attr}_id", value)
                                else:
                                    setattr(record_obj, attr, value)

                        else:
                            united_data_suffixied = united_data.copy()

                            for attr, value in united_data.items():
                                if isinstance(model_class._meta.get_field(attr), ForeignKey):
                                    united_data_suffixied[f"{attr}_id"] = value
                                    del united_data_suffixied[attr]

                            record_obj = model_class(**united_data_suffixied)

                        record_obj.save()
                        instances.append(record_obj)

    except Exception as e:
        if silent:
            traceback.print_exc()
            exception = e.__str__()
        else:

            raise

    return instances, exception, serializer_errors


def delete_objects_with_signals(model_class: Model, ids: list, **delete_kwargs: dict):
    """
    ver. 20241205
    Supports (extended model.delete()):
    1. mass-removing
    2. signals
    3. exceptions handling
    4. transaction rollback

    :param model_class: model from where objects will be deleted
    :param ids: id list of objects
    :param delete_kwargs: standart model.delete() arguments

    returns: tuple of:
    1. standart returns from model.delete() method in list
    2. exception string
    """

    result = []
    exception = None

    try:
        objects_to_delete = model_class.objects.filter(id__in=ids)

        with transaction.atomic():
            for obj in objects_to_delete:
                result.append(obj.delete(**delete_kwargs))

    except Exception as e:
        traceback.print_exc()
        exception = e.__str__()

    return result, exception


def get_file_full_cdn_url(url_parts):
    """
    ver. 20241205
    builds cdn path that appended with given string list. Uses get_cdn_urls() and settings.MEDIA_URL

    :param url_parts: string list to add at the end, after CDN schema, domain and other static url parts of CDN (e.g. https://example.com/files)

    returns:
    1. string: combined url
    """

    file_full_cdn_url = ''

    if url_parts:
        file_full_cdn_url = urlparse(get_cdn_urls())
        file_full_cdn_url = f"{file_full_cdn_url.scheme}://{file_full_cdn_url.netloc}"
        file_full_cdn_url = urljoin(file_full_cdn_url, settings.MEDIA_URL)

        for url_part in url_parts:
            cleaned_url_part = url_part.lstrip('/')
            file_full_cdn_url = urljoin(file_full_cdn_url + '/', cleaned_url_part)

    return file_full_cdn_url


def create_file_in_cdn_silently(relative_path, file):
    """
    ver. 20241205
    Supports:
    - full path returning
    - exceptions handling

    :param relative_path: path without schema, domain and other static parts
    :param file: file like type object

    returns: tuple of:
    1. string: relative path - standart return from create_file_to_cdn()['full_path'] method
    2. string: full path
    3. string: failure message
    """

    cdn_response = None
    error = None

    try:
        cdn_response = create_file_to_cdn(relative_path, file)

    except Exception as e:
        error = e.__str__()

    cdn_relative_path = None

    """
    NOTE: full_path from create_file_to_cdn() is not full. e.g. it not contains schema, domain
    NOTE: column have limit 100 chars so real full path (e.g. with schema and domain) impossible to save. e.g. error: django.db.utils.DataError: value too long for type character varying(100)
    """
    if cdn_response and cdn_response.get('full_path'):
        cdn_relative_path = cdn_response.get('full_path')

    failure = None
    cdn_full_path = None

    if not cdn_relative_path:
        failure = (f'File: {file.name}. Path: {relative_path}. Create error: {error}. CDN response: {cdn_response}')

    else:
        cdn_full_path = get_file_full_cdn_url([relative_path, file.name])

    return cdn_relative_path, cdn_full_path, failure


def undefined_to_none(datas=[]):
    """ str undefined утгыг None руу хөрвүүлэх """
    for idx, value in enumerate(datas):
        if value == 'undefined':
            datas[idx] = None
    return datas

def find_linear_regression_line(sum_y, sum_x, s_y, s_x, r, x):

    b = r * (s_y / s_x)
    a = sum_y - b * sum_x
    y = a + b * x

    return x, y

def pearson_corel(x, y):

    min_x = min(x)
    max_x = max(x)

    len_x = len(x)
    len_y = len(y)

    sum_x = sum(x) / len_x
    sum_y = sum(y) / len_y

    all_x = 0
    all_y = 0

    all_x_y = 0
    r = 0
    s_x = 0
    s_y = 0

    for item_x in x:
        all_x = all_x + (abs(item_x - sum_x)) ** 2

    for item_y in y:
        all_y = all_y + (abs(item_y - sum_y)) ** 2

    for idx in range(0, len_x):
        item_x = x[idx]
        item_y = y[idx]

        all_x_y = all_x_y + (item_x - sum_x) * (item_y - sum_y)

    if all_x != 0 and all_y != 0:
        s_x = math.sqrt((all_x) / (len_x - 1))
        s_y = math.sqrt((all_y) / (len_y - 1))

        r = all_x_y / math.sqrt((all_x * all_y))

    start_x, start_y = find_linear_regression_line(sum_y, sum_x, s_y, s_x, r, min_x)
    end_x, end_y = find_linear_regression_line(sum_y, sum_x, s_y, s_x, r, max_x)

    return r, [
        [start_x, start_y],
        [end_x, end_y],
    ]


def dynamic_serializer(c_model, c_fields, c_depth=0):
    c_depth = int(c_depth)
    assert c_depth >= 0

    class CustomSerializer(serializers.ModelSerializer):
        class Meta:
            model = c_model
            fields = c_fields
            depth= c_depth
    return CustomSerializer

def convert_stringified_querydict_to_dict(post_data,keep_list=[],is_keep_only_not_singles=True):
    """
        to get "POST" data in "json-parsed" types and keep all list items of QueryDict/formData for their specified keys in 2nd argument (keep_list)
        Required to use JSON.stringify() first for all "not file fields" on frontend to pass formData
    """
    if keep_list:
        post_data_dict = post_data.dict()

        for keep_item in keep_list:
            post_data_list = post_data.getlist(keep_item)

            if is_keep_only_not_singles and len(post_data_list) == 1:
                post_data_dict[keep_item] = post_data_list[0]
            else:
                post_data_dict[keep_item] = post_data_list

        post_data = post_data_dict
    result = {}

    for key in post_data.keys():
        if isinstance(post_data[key], list):
            if not isinstance(result.get(key), list):
                result[key]= []

            values = []

            if keep_list:
                values = post_data[key]
            else:
                values = post_data.getlist(key)

            for value in values:
                if key in keep_list:
                    result[key].append(value)
                else:
                    result[key].append(json.loads(value))
        else:
            if key in keep_list:
                result[key] = post_data[key]
            else:
                if post_data[key] == 'undefined':
                    post_data[key] = 'null'

                result[key] = json.loads(post_data[key])

    return result


def ltrim(source_str, trimming_str):
    """
    Remove substring from start of string until it no longer exists at the start.
    """

    if not isinstance(source_str, str) or not isinstance(trimming_str, str):
        return None

    trimming_str_length = len(trimming_str)

    while source_str.startswith(trimming_str):
        source_str = source_str[trimming_str_length:]

    return source_str


def rtrim(source_str, trimming_str):
    """
    to remove substring from end of the string until it stops to exist at the end of string
    """

    if not isinstance(source_str, str) or not isinstance(trimming_str, str):
        return None

    trimming_str_length = len(trimming_str)

    while source_str.endswith(trimming_str):
        source_str = source_str[:-trimming_str_length]

    return source_str


def is_url(string):
    """
    to check string for URL syntax
    """

    try:
        result = urlparse(string)
        return all([result.scheme, result.netloc])
    except:
        return False


def get_relative_url(url):
    """
    to get path from url.

    e.g.:
        get_relative_url('https://google.com/test/path/) -> /test/path/
        get_relative_url('https://google.com/test/path) -> /test/path
        get_relative_url('https://google.com/test) -> /test
        get_relative_url('https://google.com/) -> /
        get_relative_url('https://google.com) -> ''
    """

    if hasattr(url, 'name'):
        url = url.name

    if not isinstance(url, str):
        return None

    url = urlparse(url)
    url = unquote(url.path)
    return url


def get_cdn_file_urls():
    path = settings.CDN_FILE_URL

    # Орчиноос шалтгаалж url авах
    if settings.DEBUG:
        path = 'http://192.168.1.37:8008/files/dxis/'

    return path


def url_clean_join(url_parts: List[str]):
    """
    to join url strings because os.path.join() can use different slash on different OS
    """

    result = ''

    if isinstance(url_parts, list):
        index = 0

        for url_part in url_parts:
            if isinstance(url_part, str):
                cleaned_url_part = url_part.lstrip('/')
                result = urljoin(result + '/', cleaned_url_part) if index > 0 else cleaned_url_part
                index += 1

    return result


def build_url(url, use_cdn=True):
    """
    to change url to cdn url if url is not full url if CDN is used.
    For example if url is url from other public sources then url should not be changed to cdn url
    """

    if hasattr(url, 'name'):
        url = url.name

    if (
        not url or
        not isinstance(url, str) or
        is_url(url)
    ):
        return url

    url = filepath_to_uri(url)

    if use_cdn:
        file_server = get_cdn_file_urls()
        url = url_clean_join([file_server, url])
        return url

    # non-CDN case
    file_server = get_domain_url()
    media_folder = settings.MEDIA_URL

    # NOTE use this for example, if in nginx config: "... location /imagefiles { ..."
    # if not settings.DEBUG:
    #     media_folder = 'imagefiles'

    url = url_clean_join([file_server, media_folder, url])
    return url


def remove_from_cdn_ignore_not_found_error(pathes, is_file=True, is_silent=False):
    """
    CDN серверээс файл устгах нь and ignore exception if it already does not exist
    TODO maybe need to make "impossible to remove file" log to clean garbage files from CDN later

    :param pathes: (list of string or string) заавал дэд folder  path агуулсан байх Example: movement/image.png
    :param is_file: True байвал Зөвхөн файл устгах Үгүй байвал folder устгах
    """

    if hasattr(pathes, 'name'):
        pathes = pathes.name

    def start_to_remove(pathes, is_file=True):
        if not pathes:
            return False

        cdn_path = get_cdn_urls()
        cdn_delete_path = cdn_path + 'delete-file/'

        if (
            not (
                isinstance(pathes, str) or
                (
                    isinstance(pathes, list) and
                    isinstance(pathes[0], str)
                )
            )
        ):
            raise Exception('Wrong argument')

        if isinstance(pathes, str):
            pathes = [pathes]

        for path in pathes:
            path = ltrim(path, settings.CDN_FILE_URL)

            # cdn үү илгээхдээ CDN_MAIN_FOLDER нэмж авч байгаа учир орж ирвэл устгана
            path = ltrim(path, settings.CDN_MAIN_FOLDER)

            body = {
                "path": settings.CDN_MAIN_FOLDER + path,
                'is_file': is_file
            }

            rsp = requests.delete(cdn_delete_path, json=body)

            if rsp.status_code not in [200, 404]:
                raise Exception('Файл утсгахад алдаа гарсан байна. \n' + rsp.text)

        return True

    if is_silent:
        try:
            return start_to_remove(pathes, is_file)

        except:
            pass

        # to return False if exception was occurred but suppressed
        return False

    return start_to_remove(pathes, is_file)


def create_via_serializer(data, **kwargs):
    """
    To save through serializer using validation and get instance of serializer.
    At least one of 'Keyword Args' is required.

    Args:
        data (dict): dict data to save.
        model_class (keyword arg, subclass of Model class): class of model.
        serializer_class (keyword arg, subclass of ModelSerializer class): class of serializer.

    Returns:
        object: instance of serializer_class.
    """

    if (
        'model_class' not in kwargs
        and 'serializer_class' not in kwargs
    ):
            raise TypeError("At least one of keyword argument is required ('model_class' or 'serializer_class')")

    model_class = kwargs.get('model_class')
    serializer_class = kwargs.get('serializer_class')

    if not serializer_class:
        serializer_class = dynamic_serializer(model_class,'__all__',0)

    if not model_class:
        model_class = serializer_class.Meta.model

    serializer = serializer_class(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer


def update_via_serializer(data, **kwargs):
    """
    To save through serializer using validation and get instance of serializer.
    At least one of 'Keyword Args' is required.

    Args:
        data (dict): dict data to save. ID required to get updating instance
        model_class ('keyword arg', subclass of Model class): class of model.
        serializer_class ('keyword arg', subclass of ModelSerializer class): class of serializer.
        partial ('keyword arg', bool): partial argument of serializer. Default: False

    Returns:
        object: instance of serializer_class.
    """

    if (
        'model_class' not in kwargs
        and 'serializer_class' not in kwargs
    ):
            raise TypeError("At least one of keyword argument is required ('model_class' or 'serializer_class')")

    model_class = kwargs.get('model_class')
    serializer_class = kwargs.get('serializer_class')

    if not serializer_class:
        serializer_class = dynamic_serializer(model_class,'__all__',0)

    if not model_class:
        model_class = serializer_class.Meta.model

    partial = kwargs.pop('partial', False)
    instance = model_class.objects.get(id=data['id'])
    serializer = serializer_class(instance,data=data,partial=partial)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer


def get_before_year_season():
    """
        Идэвхгүй өмнөх хичээлийн жил
    """

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).first()

    year = qs_activeyear.prev_lesson_year.strip() if qs_activeyear else None
    season = qs_activeyear.prev_lesson_season.id if qs_activeyear else None

    return year, season


def safe_get(obj, default_value=None, *attrs):
    """
    to reduce many "if-else" code. For example when accessing attributes that are nullable

    example:
        safe_get(user_obj, '', 'employee_set', 'register_code')
    """

    try:
        return reduce(getattr, attrs, obj)

    except AttributeError:
        return default_value

    except TypeError:
        return default_value


def build_filters_dict(fields, request_filters):
    """
    to add simple filters to queryset from request_filters

    :param fields: list of string (field names)
    :param request_filters: dict
    :return: queryset
    """

    filters_dict = {}

    for field in fields:
        if request_filters.get(field):
            filters_dict[field] = request_filters.get(field)

    return filters_dict


def qs_simple_filter(qs, qs_field, value):
    """
    to filter queryset if value is not falsy

    :param qs (queryset): queryset
    :param qs_field (str): queryset field
    :param value: filter value for queryset field

    :return: queryset
    """

    if value:
        filter_dict = {qs_field: value}
        qs = qs.filter(**filter_dict)

    return qs


def is_file_url_alive(url: str, timeout: int = 5) -> bool:
    try:
        response = requests.head(url, allow_redirects=True, timeout=timeout)

        if response.status_code != 200:
            return False

        # NOTE if it is dummy page then code maybe 200 but it may be not file
        content_type = (response.headers.get("Content-Type") or "").lower()
        return not content_type.startswith("text/html")

    except requests.RequestException:
        return False


def url_clean_join(url_parts: List[str]):
    """
    to join url strings because os.path.join() can use different slash on different OS
    """

    result = ''

    if isinstance(url_parts, list):
        index = 0

        for url_part in url_parts:
            if isinstance(url_part, str):
                cleaned_url_part = url_part.lstrip('/')
                result = urljoin(result + '/', cleaned_url_part) if index > 0 else cleaned_url_part
                index += 1

    return result


def get_translated_serializer_errors(serializer_errors):
    """
    to translate serializer.errors to mongolian
    """

    is_many = True

    if not isinstance(serializer_errors, list):
        is_many = False
        serializer_errors = [serializer_errors]

    translated_serializer_errors = []

    for errors_dict in serializer_errors:
        translated_errors_dict = {}

        for field, msgs in errors_dict.items():
            if not isinstance(msgs, list):
                msgs = [msgs]

            translated_msg = []

            for msg in msgs:
                try:
                    msg = async_to_sync(translator.translate)(msg, dest='mn').text

                except Exception:
                    pass

                translated_msg.append(msg)

            translated_errors_dict[field] = translated_msg

        if not is_many:
            return translated_errors_dict

        translated_serializer_errors.append(translated_errors_dict)

    return translated_serializer_errors


def remove_files(relative_pathes, use_cdn=True, is_silent=True):
    """
    to remove files with single/multi, cdn/non-cdn, silent/non-silent ways

    :return: False if all files are not removed successfully else True
    """

    if use_cdn:
        return remove_from_cdn_ignore_not_found_error(relative_pathes, True, is_silent)

    if hasattr(relative_pathes, 'name'):
        relative_pathes = relative_pathes.name

    if not isinstance(relative_pathes, list):
        relative_pathes = [relative_pathes]

    result = True

    for relative_path in relative_pathes:
        if relative_path:
            try:
                error = remove_folder(relative_path)

                if error:
                    result = False

                    if not is_silent:
                        raise Exception('Файл устгахад алдаа гарсан байна')

            except Exception as e:
                if not is_silent:
                    raise

                print(f'Remove file ({relative_path}) silent error: {e}')
                result = False

    return result


def link_soul_survey(survey_id, soul_type, lesson_year, lesson_season_id, is_soul_all, soul_teachers):
    """
    to link/unlink Survey to SoulSurvey model
    NOTE Pollee has CASCADE delete option so to prevent losing data, the records are never removed from SoulSurvey except if soul_teachers are selected or on delete of related Survey self

    :param survey_id: lms_Survey.id
    :param soul_type: lms_Survey.soul_type
    :param lesson_year: desired lesson_year
    :param lesson_season_id: desired lesson_season_id
    :param is_soul_all: True - to add all related timetable teachers-lessons
    :param soul_teachers: to add only specified teachers-lessons
    """

    Survey = apps.get_model('lms', 'Survey')
    SoulSurvey = apps.get_model('lms', 'SoulSurvey')

    if soul_type == Survey.SOUL_TYPE_TEACHERS_LESSONS:
        if is_soul_all or soul_teachers:
            TimeTable = apps.get_model('lms', 'TimeTable')

            # region to get new records
            lessons_teachers = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season_id, teacher__isnull=False)

            if not is_soul_all and soul_teachers:
                lessons_teachers = lessons_teachers.filter(teacher__in=soul_teachers.split(','))

            lessons_teachers = (
                lessons_teachers
                .distinct('lesson', 'teacher')
                .values_list('lesson', 'teacher')
            )

            new_items_set = set((lesson_year, lesson_season_id, survey_id, lesson_id, teacher_id) for lesson_id, teacher_id in lessons_teachers)
            # endregion

            # region to get existing records
            existing_items = (
                SoulSurvey.objects
                .filter(lesson_year=lesson_year, lesson_season_id=lesson_season_id, survey_id=survey_id)
                .values_list('lesson_year', 'lesson_season_id', 'survey_id', 'lesson_id', 'teacher_id')
            )

            existing_items_set = set(existing_items)
            # endregion

            # to delete not included (in request) records
            if not is_soul_all and soul_teachers:
                to_delete = existing_items_set - new_items_set
                query = Q()

                for _, _, _, lesson_id, teacher_id in to_delete:
                    soul_survey_data = {
                        'lesson_year': lesson_year,
                        'lesson_season_id': lesson_season_id,
                        'survey_id': survey_id,
                        'lesson_id': lesson_id,
                        'teacher_id': teacher_id,
                    }

                    query |= Q(**soul_survey_data)

                if query:
                    SoulSurvey.objects.filter(query).delete()

            # region to add new records
            instances = []
            to_add = new_items_set - existing_items_set

            for _, _, _, lesson_id, teacher_id in to_add:
                soul_survey_data = {
                    'lesson_year': lesson_year,
                    'lesson_season_id': lesson_season_id,
                    'survey_id': survey_id,
                    'lesson_id': lesson_id,
                    'teacher_id': teacher_id,
                }

                instances.append(SoulSurvey(**soul_survey_data))

            SoulSurvey.objects.bulk_create(instances)
            # endregion


def survey_notification(is_required, scope_kind, scope_ids, title, end_date, request):
    """
    to notify scope people about survey
    """

    if not scope_ids or not request or not scope_kind:
        return None

    Notification = apps.get_model('core', 'Notification')
    Teachers = apps.get_model('core', 'Teachers')
    Employee = apps.get_model('core', 'Employee')

    if scope_kind == Notification.SCOPE_KIND_OYUTAN:
        scope_ids = [int(item) for item in scope_ids if isinstance(item, str) and item.isnumeric()]

    elif scope_kind == Notification.SCOPE_KIND_EMPLOYEE:
        user_ids = Teachers.objects.filter(id__in=scope_ids).values_list('user', flat=True)
        employees_ids = Employee.objects.filter(user__in=user_ids).values_list('id', flat=True)
        scope_ids = employees_ids

    else:
        scope_ids = []

    # TODO үсрэх url оруулах
    # Notification илгээх~
    create_notif(
        request,
        scope_ids,
        "{title} судалгааны мэдээллийг хүргэж байна.".format(title=title),
        "Судалгаа {end_date} дуусахыг анхаарна уу".format(end_date=end_date),
        Notification.FROM_KIND_USER,
        scope_kind,
        'important' if is_required else 'normal'
    )


def get_scope_kind_and_people(is_all, is_all_students, is_all_teachers, is_teacher, scope_ids):
    """
    to get scope_kind, array_key and selected ids of Survey scope

    :return: Tuple containing scope_kind, array_key ('oyutans'/'teachers') and selected_ids
    :rtype: tuple[int, str, list[int]]
    """

    Notification = apps.get_model('core', 'Notification')
    Teachers = apps.get_model('core', 'Teachers')
    Employee = apps.get_model('core', 'Employee')

    # Хамрах хүрээний сонгогдсон ids
    array_key = None
    scope_kind = None

    # Судалгааны хамрах хүрээний төлөв
    # Бүх суралцаж буй багшууд + оюутнууд
    if is_all:
        scope_kind = Notification.SCOPE_KIND_ALL

    elif scope_ids or is_all_teachers or is_all_students:
        # Бүх суралцаж буй багшууд
        if is_teacher or is_all_teachers:
            scope_kind = Notification.SCOPE_KIND_EMPLOYEE
            array_key = 'teachers'

            if is_all_teachers:
                scope_ids = Teachers.objects.filter(
                    action_status=Teachers.APPROVED,
                    action_status_type=Teachers.ACTION_TYPE_ALL,
                    user__employee__state=Employee.STATE_WORKING,
                    user__employee__org_position__is_teacher=True
                ).values_list('id', flat=True).distinct()

        # Бүх суралцаж буй оюутнууд
        else:
            scope_kind = Notification.SCOPE_KIND_OYUTAN
            array_key = 'oyutans'

            if is_all_students:
                scope_ids = get_active_student().values_list('id', flat=True).distinct()

    else:
        return None, None, None

    return scope_kind, array_key, scope_ids


def get_fixed_club_file_path(file_path):
    """
    To fix CDN saving path of "Add" button of "/request/club" page.
    Because only file name was saved before commit: 6bdece5154bc9eb0923991cac28348660994aed0 commit date (not PR merge date): 2025-08-21
    """

    full_path = file_path

    if os.path.basename(file_path) == file_path:
        full_path = url_clean_join(['club', file_path])

    return full_path


def suborg_and_rank_type_calculate(name, rank_type, ratio):
    """
        Доорх сургуулиудын зэрэглэлээр хамаарч доорх тооцогдоно.
            жишээ:
                1. Биеийн тамир, албаны бэлтгэлийн институт (БТАБИС)
                    ажлын заавал биелүүлэх ногдол 25% -с хэтрэхгүй учраас:
                    - Ахлах багш    16 цаг    4     гэж тооцно.
                    - Багш          18 цаг    4.5   гэж тооцно.

                2. Ахлагч мэргэжлийн боловсролын сургууль (АМБС) багц цагийн ноогдол доорхоор бодогдоно.
                    - Эрхлэгч       16
                    - Ахлах багш    18
                    - Багш          20

        sub_org: сур id
        name: сур нэр
        rank_type: тухайн албан хаагчийн зэрэглэл
        ratio: цагийн тооцооны тохиргоо (тогтмол тоо)
        time_type цагийн тооцооны төрөл А цаг

        return тооцоолол
    """
    total = 0

    name = name.strip()
    rank_type = rank_type.strip()
    if name == 'Биеийн тамир, албаны бэлтгэлийн институт':
        if rank_type == 'Багш':
            total = round((ratio * 0.25 ), 2)

        elif rank_type == 'Ахлах багш' :
            total = round((ratio * 0.25) , 2)

    elif name == 'Ахлагч мэргэжлийн боловсролын сургууль':
        if  rank_type == 'Эрхлэгч':
            total = 16
        elif rank_type == 'Ахлах багш':
            total = 18
        elif rank_type == 'Багш':
            total = 20
    else:
        total = ratio
    return total


def round_half_up(x, digits=1):
    """
    school standart simple rounding
    """

    q = Decimal("1." + "0"*digits)
    return float(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP))


def save_quill_images_and_get_body(images, imageKeys, source_html_body):
    """
    to save images from QUILL editor html body to CDN and add CDN file urls in html body instead of dummy-key urls
    """

    if images:
        quill_images = []

        for question_quill_image_i, question_quill_image in enumerate(images):
            quill_images.append({ 'file': question_quill_image, 'key': imageKeys[question_quill_image_i] })

        def save_quill_images(files):
            """
            to save images from quill html body to CDN
            """

            url_map = {}
            relative_urls = []

            for file in files:
                url_map[file['key']] = create_file_to_cdn('challenge', file['file'])['full_path']
                relative_urls.append(url_map[file['key']])
                url_map[file['key']] = build_url(url_map[file['key']])

            return url_map, relative_urls

        url_map, relative_urls = save_quill_images(quill_images)

        def replace_quill_images(replace_map, text):
            """
            to replace dummy key-blob-urls to CDN urls
            """

            if not replace_map:
                return text

            pattern = re.compile("|".join(map(re.escape, replace_map.keys())))
            return pattern.sub(lambda m: replace_map[m.group(0)], text)

        updated_html_body = replace_quill_images(url_map, source_html_body)
        return updated_html_body, relative_urls

    return source_html_body, []


def remove_file_from_cdn_by_urls(urls, is_unquote=True):
    """
    to remove files from CDN by list of full urls
    """

    cdn_prefix = get_cdn_file_urls()

    try:
        for url in urls:
            url = unquote_plus(url) if is_unquote else url
            url = url.replace(cdn_prefix, '')
            remove_file_from_cdn(url)

    except:
        pass


def extract_imgs(html):
    """
    to extract set of img tags
    """

    class ImgSrcParser(HTMLParser):
        """
        to extract set of img tags using extract_imgs() function
        """

        def __init__(self):
            super().__init__()
            self.images = []

        def handle_starttag(self, tag, attrs):
            if tag == "img":
                for attr, value in attrs:
                    if attr == "src" and value:
                        self.images.append(value)

    parser = ImgSrcParser()
    parser.feed(html or "")
    return set(parser.images)


def delete_challenge_question_group(challenge_question_group_obj):
    """
    to remove ChallengeQuestionGroup object with it's files from CDN/other file storage
    use inside transaction.atomic() block
    """

    old_body = challenge_question_group_obj.description
    old_file = challenge_question_group_obj.file.name if challenge_question_group_obj.file else None
    challenge_question_group_obj.delete()

    # to delete images from CDN
    removed_quill_images = extract_imgs(old_body)
    remove_file_from_cdn_by_urls(removed_quill_images)

    if old_file:
        remove_file_from_cdn(old_file)
