from datetime import datetime
import traceback
from rest_framework.response import Response
from rest_framework import status

from django.db.models.functions import Trim, Concat

from django.db import transaction
from django.db.models import (
    Q, F, Exists, OuterRef, Subquery, Case, When, Value, Count,Sum, Max,
    BooleanField,CharField, Prefetch, ExpressionWrapper, DateField, Count, OuterRef, Case, When, IntegerField, BooleanField, IntegerField, ExpressionWrapper
)
from django.db.models.functions import Cast, NullIf, Substr
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.aggregates import StringAgg, ArrayAgg
from core.fns import WithChoices


from rest_framework import mixins, generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import ValidationError

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import (
    delete_objects_with_signals,
    has_permission,
    get_active_year_season,
    get_teacher_queryset,
    get_teacher_qs,
    save_data_with_signals,
)
from core.models import *
from lms.models import *
from .serializers import *

# settings
class CreditSettingsAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Цагийн тооцоо тохиргоо """

    queryset = TimeEstimateSettings.objects.all().order_by('created_at')
    serializer_class = TimeEstimateSettingsSerializer

    def get_queryset(self):
        # queryset = super().get_queryset()
        school = self.request.query_params.get('school')
        if school:
            self.queryset = self.queryset.filter(sub_org=school)
            return self.queryset


    @has_permission(must_permissions=['lms-credit-settings-read'])
    def get(self, request, pk=None):
        self.serializer_class = TimeEstimateSettingsListSerializer
        response = self.list(request)
        return request.send_data(response.data)

    @has_permission(must_permissions=['lms-credit-settings-update'])
    @transaction.atomic
    def put(self, request):
        data = request.data
        teacher_rank_type = data.get("teacher_rank_type")
        type_ = data.get("type")
        sub_org = data.get("sub_org")
        ratio = data.get("ratio")

        if not teacher_rank_type or not type_:
            return request.send_error("ERR_001", "teacher_rank_type болон type талбарыг оруулна уу.")

        instance = TimeEstimateSettings.objects.filter(
            teacher_rank_type=teacher_rank_type,
            type=type_,
            sub_org_id=sub_org if sub_org else None
        ).first()

        if ratio is None or ratio == "":
            if instance:
                instance.delete()
                return request.send_info("INF_003", "Амжилттай устгагдлаа.")
            else:
                return request.send_info("INF_004", "Устгах зүйл олдсонгүй.")

        if instance:
            serializer = self.get_serializer(instance, data=data, partial=True)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)
            serializer.save()
            return request.send_info("INF_002", "Амжилттай шинэчлэгдлээ.")
        else:
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)
            serializer.save()
            return request.send_info("INF_001", "Амжилттай бүртгэгдлээ.")

class SubOrgOption(generics.GenericAPIView):
    def get(self, request):
        suborgs = SubOrgs.objects.annotate(
            name_trim=Trim('name')
        ).order_by('name_trim')

        options = []
        for sub in suborgs:
            exists = TimeEstimateSettings.objects.filter(sub_org=sub).exists()
            name_suffix = "Өөрийн дүрмээр" if exists else "Ерөнхий дүрмээр"
            options.append({
                "id": sub.id,
                "name": f"{sub.name} ({name_suffix})"
            })

        return request.send_data(options)

from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter

@permission_classes([IsAuthenticated])
class BSubCategoryApiView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """Б цагийн тооцоо шалгуур категори"""

    queryset = BSubCategory.objects.all().order_by('-order_no')
    serializer_class = BSubCategorySerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get(self, request, pk=None):
        queryset = self.queryset

        selected_ids = request.query_params.get('selected_ids')
        if selected_ids:
            id_list = [int(x) for x in selected_ids.split(',') if x.isdigit()]
            queryset = queryset.filter(category_id__in=id_list)

        sorting = request.query_params.get('sorting')
        if sorting:
            queryset = queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return request.send_data(serializer.data)

    def post(self, request):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score:

            return request.send_error('ERR_002')

        data = {
            'category': category.get('id'),
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'category': category,
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class EstimateAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Б цагийн бүртгэл — ажиллаж байгаа багш нарын жагсаалт """

    serializer_class = TeacherProfSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register', 'user__email']
    def get_queryset(self):

        queryset = get_teacher_qs(is_working=False)

        school_id = self.request.query_params.get('school')
        if school_id:
            queryset = queryset.filter(sub_org=school_id)

        salbar = self.request.query_params.get('salbar')
        if salbar:
            queryset = queryset.filter(salbar=salbar)

        return queryset

    def get(self, request, pk=None):
        if pk:
            instance = self.get_queryset().filter(id=pk).first()
            serializer = self.get_serializer(instance)
            return request.send_data(serializer.data)

        datas = self.list(request).data
        return request.send_data(datas)


RECORD_MODEL_MAP = {
    'W': ('lms', 'WTeacherFiles'),
    'B': ('lms', 'BTeacherFiles'),
    'G': ('lms', 'GTeacherFiles'),
}
@permission_classes([IsAuthenticated])
class MainEstimateAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    serializer_class = TeacherMainSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register']

    def get_queryset(self):
        queryset = get_teacher_qs(True)
        department = self.request.query_params.get('department')
        school_id = self.request.query_params.get('school_id')
        queryset = get_teacher_qs(True)
        department = self.request.query_params.get('department')
        school_id = self.request.query_params.get('school_id')
        record_type = self.request.query_params.get('record_type', 'B')
        if school_id:
            queryset = queryset.filter(sub_org=school_id)

        if department:
            queryset = queryset.filter(salbar=department)

        record_model_info = RECORD_MODEL_MAP.get(record_type)
        if record_model_info:
            app_label, model_name = record_model_info
            RecordModel = apps.get_model(app_label, model_name)
            relation_name = f'{RecordModel._meta.model_name}_set'

            queryset = queryset.prefetch_related(
                Prefetch(
                    relation_name,
                    queryset=RecordModel.objects.all(),
                    to_attr='recorded_files'
                )
            )

        return queryset.annotate(
            sub_org_name=F('salbar__sub_orgs__name'),
            org_position=Subquery(
                Employee.objects.filter(
                    user=OuterRef('user'),
                    state=Employee.STATE_WORKING
                ).values('org_position__name')[:1]
            ),
            c_rank_name=Subquery(
                Employee.objects.filter(
                    user=OuterRef('user'),
                    state=Employee.STATE_WORKING
                ).values('teacher_rank_type')[:1]
            ),
            position_count=Case(
                When(org_position__icontains='Тэнхимийн эрхлэгч', then=Value(1)),
                default=0,
                output_field=IntegerField()
            )
        ).order_by(
            'first_name',
            '-position_count',
            'sub_org_name',
            '-c_rank_name',
        )

    def get(self, request, pk=None):
        record_type = request.query_params.get('record_type', 'B').upper()

        SubCategoryModel = None
        MainCategoryModel = None
        if record_type == 'B':
            SubCategoryModel = apps.get_model('lms', 'BSubCategory')
            MainCategoryModel = apps.get_model('lms', 'BMainCategory')
        elif record_type == 'W':
            SubCategoryModel = apps.get_model('lms', 'WSubCategory')
            MainCategoryModel = apps.get_model('lms', 'WMainCategory')
        elif record_type == 'G':
            SubCategoryModel = apps.get_model('lms', 'GSubCategory')
            MainCategoryModel = apps.get_model('lms', 'GMainCategory')

        requirements = []
        if SubCategoryModel and MainCategoryModel:
            main_categories = MainCategoryModel.objects.all()
            subcategories = SubCategoryModel.objects.all()

            sub_map = {}
            for sub in subcategories:
                sub_map.setdefault(sub.category_id, []).append({
                    'id': sub.id,
                    'name': sub.name,
                    'score': sub.score,
                    'order_no': sub.order_no,
                    'value': sub.value,
                })

            for main in main_categories:
                requirements.append({
                    'id': main.id,
                    'name': main.name,
                    'order_no': main.order_no,
                    'subcategories': sub_map.get(main.id, [])
                })

        teachers_data = self.list(request).data

        return request.send_data({
            'teachers': teachers_data,
            'requirements': requirements
        })

@permission_classes([IsAuthenticated])
class ATeacherAPIView(generics.GenericAPIView, mixins.ListModelMixin):
    """А цагийн мэдээлэл"""

    def get(self, request, pk=None):
        if not pk:
            return request.send_error('ERR_002', "Хичээлийн хуваарийн мэдээлэл олдсонгүй")

        school = self.request.query_params.get('school')
        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')

        lesson_type = {
            1: 'Лаборатор',
            2: 'Лекц',
            3: 'Семинар',
            # 4: 'Бусад',
            5: 'Практик',
            6: 'Бие даалт',
        }
        data = []
        for t_id, t_name in lesson_type.items():

            timetable = TimeTable.objects.filter(
                lesson_year=year,
                lesson_season=season,
                teacher_id=pk,
                type=t_id,
                # study_type__in=[1,2,3],
                # study_type=1,
                school=school
            ).values(
                'lesson__code',
                'lesson__name',
                'timetable_to_group__group__profession__degree__degree_code',
            ).annotate(
                total_weeks=ExpressionWrapper(
                    F('end_week') - F('begin_week') + 1,
                    output_field=IntegerField()
                ),
                # долоо хоногийг тодорхойлох
                base_weeks=Case(
                    When(type=2, then=Value(8)), # Лекц бол 8
                    default=Value(16),           # Семинар, Лаб бол 16
                    output_field=IntegerField(),
                ),

                # Тэгш/Сондгой бол 2-т хувааж долоо хоногийг олох
                real_weeks=Case(
                    When(odd_even=3, then=F('total_weeks')),
                    default=ExpressionWrapper(F('total_weeks') / 2, output_field=IntegerField()),
                ),

                # (Пар бүр 2 цаг)
                row_total_tsag=ExpressionWrapper(F('real_weeks') * 2, output_field=IntegerField()),

                # анги болон өрөө, зэрэг
                group_names=StringAgg('timetable_to_group__group__name', delimiter=', ', distinct=True),
                degree_names=StringAgg('timetable_to_group__group__profession__degree__degree_name', delimiter=', ', distinct=True),
                room_names=StringAgg('room__code', delimiter=', ', distinct=True),
                study_type_display=Case(
                    When(study_type=1, then=Value('Танхим')),
                    When(study_type=2, then=Value('Онлайн')),
                    When(study_type=3, then=Value('Хосолсон')),
                    default=Value('Тодорхойгүй'),
                    output_field=CharField(),
                ),
                # тэгш, сондгой, дандаа эсэх
                odd_even_display=Case(
                    When(odd_even=1, study_type=1, then=Value('Сондгой')),
                    When(odd_even=2, study_type=1, then=Value('Тэгш')),
                    When(odd_even=3, study_type=1, then=Value('Дандаа')),
                    default=Value('Тодорхойгүй'),
                    output_field=CharField(),
                ),
            )

            if timetable.exists():
                total_time = timetable.aggregate(total=Sum('row_total_tsag'))
                data.append({
                    'lesson_type_id': t_id,
                    'lesson_type': t_name,
                    'type_total_tsag': total_time, # багшийн нийт орох цаг
                    'count': timetable.count(),
                    'timetable': list(timetable)
                })

        return request.send_data(data)

@permission_classes([IsAuthenticated])
class BMainCategoryAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    queryset = BMainCategory.objects.all().order_by('-order_no')
    serializer_class = BMainCategorySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get(self, request, pk=None):
        sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data

            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name:

            return request.send_error('ERR_002')

        # to define data from request
        data = {
            'name': name,
            'order_no': order_no if order_no else None
        }

        # to define data not from request
        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'name': name,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class BTeacherAPIView(generics.GenericAPIView):
    queryset = BTeacherFiles.objects.all()
    serializer_class = BTeacherFilesReadSerializer

    @has_permission(must_permissions=['lms-b-tootsoo-read'])
    def get(self, request, pk=None):
        lesson_year = request.query_params.get('lesson_year')

        qs = self.get_queryset()
        if pk:
            qs = qs.filter(teacher_id=pk)
        serializer = self.get_serializer(qs, many=True)
        return request.send_data(serializer.data)

    def post(self, request):
        serializer = BTeacherFilesSaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return request.send_data(self.get_serializer(instance).data)

    @has_permission(must_permissions=['lms-b-tootsoo-update'])
    def put(self, request, pk):
        try:
            instance = self.get_queryset().get(pk=pk)
        except BTeacherFiles.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        decision = int(request.data.get('check_senior_state', 0))

        base_score = instance.category.score if instance.category else 0
        minus_score = round(float(request.data.get('minus_score', 0)), 2)
        check_senior_description = request.data.get('check_senior_description', None)

        data = {
            'approved_user': request.user.id,
            'check_senior_state': decision,
            'check_senior': decision == 1,
        }

        if check_senior_description is not None:
            data['check_senior_description'] = check_senior_description

        if decision == 1:
            approve_score = round(max(0, base_score - minus_score), 2)
            data.update({
                'score': base_score,
                'minus_score': minus_score,
                'approve_score': approve_score,
            })

        elif decision == 2:
            data.update({
                'score': 0,
                'minus_score': 0,
                'approve_score': 0,
            })

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return request.send_data(serializer.data)


class WTeacherAPIView(generics.GenericAPIView):
    queryset = WTeacherFiles.objects.all()
    serializer_class = WTeacherFilesSerializer

    def get(self, request, pk):
        lesson_year = request.query_params.get('lesson_year')
        qs = self.get_queryset()
        qs = qs.filter(teacher_id=pk)
        serializer = self.get_serializer(qs, many=True)
        return request.send_data(serializer.data)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return request.send_data(self.get_serializer(instance).data)

    def put(self, request, pk):
        try:
            instance = self.get_queryset().get(pk=pk)
        except WTeacherFiles.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        decision = int(request.data.get('check_senior_state', 0))

        base_score = instance.category.score if instance.category else 0
        minus_score = round(float(request.data.get('minus_score', 0)), 2)
        check_senior_description = request.data.get('check_senior_description', None)

        data = {
            'approved_user': request.user.id,
            'check_senior_state': decision,
            'check_senior': decision == 1,
        }

        if check_senior_description is not None:
            data['check_senior_description'] = check_senior_description

        if decision == 1:
            approve_score = round(max(0, base_score - minus_score), 2)
            data.update({
                'score': base_score,
                'minus_score': minus_score,
                'approve_score': approve_score,
            })

        elif decision == 2:
            data.update({
                'score': 0,
                'minus_score': 0,
                'approve_score': 0,
            })

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return request.send_data(serializer.data)


@permission_classes([IsAuthenticated])
class WMainCategoryAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    queryset = WMainCategory.objects.all().order_by('-order_no')
    serializer_class = WMainCategorySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get(self, request, pk=None):
        sorting = self.request.query_params.get('sorting')
        # sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data

            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name:

            return request.send_error('ERR_002')

        # to define data from request
        data = {
            'name': name,
            'order_no': order_no if order_no else None
        }

        # to define data not from request
        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'name': name,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class WSubCategoryApiView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """ Тохиргооны хэсэг авах """

    queryset = WSubCategory.objects.all().order_by('-order_no')
    serializer_class = WSubCategorySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name']


    def get(self, request, pk=None):
        queryset = self.queryset

        selected_ids = request.query_params.get('selected_ids')
        if selected_ids:
            id_list = [int(x) for x in selected_ids.split(',') if x.isdigit()]
            queryset = queryset.filter(category_id__in=id_list)

        sorting = request.query_params.get('sorting')
        if sorting:
            queryset = queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return request.send_data(serializer.data)


    def post(self, request):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score:

            return request.send_error('ERR_002')

        data = {
            'category': category.get('id'),
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'category': category,
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class WEstimateAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Б цагийн бүртгэл — ажиллаж байгаа багш нарын жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherProfSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register']

    def get_queryset(self):
        queryset = get_teacher_queryset(True)
        teacher_user_ids = queryset.values_list('user', flat=True)

        active_employee_qs = Employee.objects.filter(
            user_id__in=list(teacher_user_ids),
            state=Employee.STATE_WORKING,
            worker_type=Employee.WORKER_TYPE_EMPLOYEE,
            sub_org__isnull=False
        )

        valid_user_ids = []
        for employee in active_employee_qs:
            old_rank = employee.teacher_rank_type

            new_rank_map = {
                1: TimeEstimateSettings.PRO,                            # профессор
                2: TimeEstimateSettings.SUB_PRO,                        # Дэд профессор
                3: TimeEstimateSettings.COURSE_LEAD,                    # Дамжааны захирагч багш
                4: TimeEstimateSettings.MANAGER,                        # Эрхлэгч
                5: TimeEstimateSettings.SENIOR_TEACHER,                 # Ахлах багш
                6: TimeEstimateSettings.TEACHER,                        # Багш
                7: TimeEstimateSettings.TRAINEE_TEACHER,                # Дадлагажигч багш
            }

            new_rank = new_rank_map.get(old_rank)
            if not new_rank:
                continue

            valid_user_ids.append(employee.user.id)


        queryset = queryset.filter(user_id__in=list(valid_user_ids)).annotate(
            sub_org_name=F('salbar__sub_orgs__name'),
            org_position=Subquery(Employee.objects.filter(
                user=OuterRef('user'),
                state=Employee.STATE_WORKING
            ).values('org_position__name')[:1]),
            c_rank_name=Subquery(Employee.objects.filter(
                user=OuterRef('user'),
                state=Employee.STATE_WORKING
            ).values('teacher_rank_type')[:1])
        ).annotate(
            position_count=Case(
                When(org_position__icontains='Тэнхимийн эрхлэгч', then=Value(1)),
                default=0, output_field=IntegerField()
            )
        ).order_by(
            '-position_count', 'sub_org_name', '-c_rank_name', 'first_name'
        )

        return queryset

    def get(self, request, pk=None):
        if pk:
            queryset = self.get_queryset().filter(id=pk)
            serializer = self.get_serializer(queryset.first())
            return request.send_data(serializer.data)

        datas = self.list(request).data
        return request.send_data(datas)


class GTeacherAPIView(generics.GenericAPIView):
    queryset = GTeacherFiles.objects.all()
    serializer_class = GTeacherFilesSerializer

    def get(self, request, pk):
        lesson_year = request.query_params.get('lesson_year')
        qs = self.get_queryset()
        qs = qs.filter(teacher_id=pk)
        serializer = self.get_serializer(qs, many=True)
        return request.send_data(serializer.data)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return request.send_data(self.get_serializer(instance).data)

    def put(self, request, pk):
        try:
            instance = self.get_queryset().get(pk=pk)
        except GTeacherFiles.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        decision = int(request.data.get('check_senior_state', 0))

        base_score = instance.category.score if instance.category else 0
        minus_score = round(float(request.data.get('minus_score', 0)), 2)
        check_senior_description = request.data.get('check_senior_description', None)

        data = {
            'approved_user': request.user.id,
            'check_senior_state': decision,
            'check_senior': decision == 1,
        }

        if check_senior_description is not None:
            data['check_senior_description'] = check_senior_description

        if decision == 1:
            approve_score = round(max(0, base_score - minus_score), 2)
            data.update({
                'score': base_score,
                'minus_score': minus_score,
                'approve_score': approve_score,
            })

        elif decision == 2:
            data.update({
                'score': 0,
                'minus_score': 0,
                'approve_score': 0,
            })

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return request.send_data(serializer.data)


@permission_classes([IsAuthenticated])
class GMainCategoryAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    queryset = GMainCategory.objects.all().order_by('-order_no')
    serializer_class = GMainCategorySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get(self, request, pk=None):
        sorting = self.request.query_params.get('sorting')
        # sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data

            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name:

            return request.send_error('ERR_002')

        # to define data from request
        data = {
            'name': name,
            'order_no': order_no if order_no else None
        }

        # to define data not from request
        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        name = request.data.get('name')
        order_no = request.data.get('order_no')

        if not name or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'name': name,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class GSubCategoryApiView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """ Тохиргооны хэсэг авах """

    queryset = GSubCategory.objects.all().order_by('-order_no')
    serializer_class = GSubCategorySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name']


    def get(self, request, pk=None):
        queryset = self.queryset

        selected_ids = request.query_params.get('selected_ids')
        if selected_ids:
            id_list = [int(x) for x in selected_ids.split(',') if x.isdigit()]
            queryset = queryset.filter(category_id__in=id_list)

        sorting = request.query_params.get('sorting')
        if sorting:
            queryset = queryset.order_by(sorting)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return request.send_data(serializer.data)


    def post(self, request):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score:

            return request.send_error('ERR_002')

        data = {
            'category': category.get('id'),
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        data['created_by'] = request.user.id

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        category = request.data.get('category')
        name = request.data.get('name')
        score = request.data.get('score')
        order_no = request.data.get('order_no')
        value = request.data.get('value')

        if not category or not name or not score or not pk:

            return request.send_error('ERR_002')

        data = {
            'id': pk,
            'category': category,
            'name': name,
            'score': score,
            'value': value,
            'order_no': order_no if order_no else None
        }

        result = save_data_with_signals(self.queryset.model, None, True, None, data=data)

        if not result[0]:
            print(result)

            if result[2]:
                error_obj = []

                for key in result[2]:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    error_obj.append(return_error)

                if len(error_obj) > 0:

                    return request.send_error("ERR_003", error_obj)

            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print(error)

            return request.send_error("ERR_002")

        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class GEstimateAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Б цагийн бүртгэл — ажиллаж байгаа багш нарын жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherProfSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register']

    def get_queryset(self):
        queryset = get_teacher_queryset(True)
        teacher_user_ids = queryset.values_list('user', flat=True)

        active_employee_qs = Employee.objects.filter(
            user_id__in=list(teacher_user_ids),
            state=Employee.STATE_WORKING,
            worker_type=Employee.WORKER_TYPE_EMPLOYEE,
            sub_org__isnull=False
        )

        valid_user_ids = []
        for employee in active_employee_qs:
            old_rank = employee.teacher_rank_type
            new_rank_map = {
                1: TimeEstimateSettings.TRAINEE_TEACHER,
                2: TimeEstimateSettings.TEACHER,
                3: TimeEstimateSettings.SENIOR_TEACHER,
                4: TimeEstimateSettings.MANAGER,
                5: TimeEstimateSettings.PRO,
            }

            new_rank = new_rank_map.get(old_rank)
            if not new_rank:
                continue

            valid_user_ids.append(employee.user_id)


        queryset = queryset.filter(user_id__in=list(valid_user_ids)).annotate(
            sub_org_name=F('salbar__sub_orgs__name'),
            org_position=Subquery(Employee.objects.filter(
                user=OuterRef('user'),
                state=Employee.STATE_WORKING
            ).values('org_position__name')[:1]),
            c_rank_name=Subquery(Employee.objects.filter(
                user=OuterRef('user'),
                state=Employee.STATE_WORKING
            ).values('teacher_rank_type')[:1])
        ).annotate(
            position_count=Case(
                When(org_position__icontains='Тэнхимийн эрхлэгч', then=Value(1)),
                default=0, output_field=IntegerField()
            )
        ).order_by(
            '-position_count', 'sub_org_name', '-c_rank_name', 'first_name'
        )

        return queryset

    def get(self, request, pk=None):
        if pk:
            queryset = self.get_queryset().filter(id=pk)
            serializer = self.get_serializer(queryset.first())
            return request.send_data(serializer.data)

        datas = self.list(request).data
        return request.send_data(datas)


class AExcelAPIView(generics.GenericAPIView):

    def get(self, request):
        return []
class BExcelAPIView(generics.GenericAPIView):

    def get(self, request):
        return []
class WExcelAPIView(generics.GenericAPIView):

    def get(self, request):
        return []
class GExcelAPIView(generics.GenericAPIView):

    def get(self, request):
        return []


class ItgeltsuurAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
):
    """ Цагийн тооцооны итгэлцүүр """

    queryset = Itgeltsuur.objects.all().order_by('-created_at')
    serializer_class = ItgeltsuurGetSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name', 'desc']

    def get(self, request, pk=None):
        school = self.request.query_params.get('school')
        lesson_type = self.request.query_params.get('lesson_type')
        degree_type = self.request.query_params.get('degree_type')
        student_num_type = self.request.query_params.get('student_num_type')
        hutul_student_type = self.request.query_params.get('hutul_student_type')
        # search = self.request.query_params.get('search')

        if school:
            self.queryset = self.queryset.filter(sub_org=school)

        if lesson_type:
            self.queryset = self.queryset.filter(lesson_type=lesson_type)

        if degree_type:
            self.queryset = self.queryset.filter(degree_type=degree_type)

        if student_num_type:
            self.queryset = self.queryset.filter(student_type=student_num_type)

        if hutul_student_type:
            self.queryset = self.queryset.filter(hutul_student_type=hutul_student_type)

        if pk:
            self.serializer_class = ItgeltsuurGetOneListSerializer
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        response = self.list(request).data
        return request.send_data(response)


    def post(self, request):
        self.serializer_class = ItgeltsuurPostSerializer
        request.data['create_user']= request.user.id

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=False):

            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002", "Амжилттай бүртгэгдлээ.")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)


    def put(self, request, pk=None):
        self.serializer_class = ItgeltsuurPostSerializer
        request.data['update_user']= request.user.id

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request.data)

        if serializer.is_valid(raise_exception=False):

            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)


class ATootsooAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ А Цагийн тооцоо нэгтгэл бүх сургуулийн """


    # queryset = Teachers.objects.all()
    # serializer_class = TeachersSerializer
    # pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['teacher__last_name', 'teacher__first_name']

    def get(self, request):

        depId = self.request.query_params.get('depId')
        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')
        school = self.request.query_params.get('school')
        search = self.request.query_params.get('search')

        # Итгэлцүүрүүд
        i_mag = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_MAGISTER).first()
        i_doc = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_DOCTOR).first()
        s_bak = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_BAKALAWR, lesson_type=Itgeltsuur.LESSON_TYPE_SEM).first()
        l_sturday_bak = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_BAKALAWR, lesson_type=Itgeltsuur.LESSON_TYPE_LEKTS, student_type=Itgeltsuur.STUDENT_COUNT_SATURDAY).first()
        l_stud1_bak = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_BAKALAWR, lesson_type=Itgeltsuur.LESSON_TYPE_LEKTS, student_type=Itgeltsuur.STUDENT_COUNT_SEXTY).first()
        l_stud2_bak = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_BAKALAWR, lesson_type=Itgeltsuur.LESSON_TYPE_LEKTS, student_type=Itgeltsuur.STUDENT_COUNT_NINETY).first()
        l_stud3_bak = Itgeltsuur.objects.filter(degree_type=Itgeltsuur.DEGREE_TYPE_BAKALAWR, lesson_type=Itgeltsuur.LESSON_TYPE_LEKTS, student_type=Itgeltsuur.STUDENT_COUNT_NINETYONE).first()

        # Зөвхөн итгэлцүүрийн тоон утгыг авах
        E_val = i_mag.itgeltsuur if i_mag else 0  # Магистр
        F_val = i_doc.itgeltsuur if i_doc else 0  # Доктор
        D_S = s_bak.itgeltsuur if s_bak else 0  # Бакалавр лекц

        D_L_STur = l_sturday_bak.itgeltsuur if l_sturday_bak else 0  # Бакалавр лекц оюутан тоолох
        D_L_STud1= l_stud1_bak.itgeltsuur if l_stud1_bak else 0  # Бакалавр лекц 1-60 хүртэл оюутан тоолох
        D_L_STud2= l_stud2_bak.itgeltsuur if l_stud2_bak else 0  # Бакалавр лекц 61-90 хүртэл оюутан тоолох
        D_L_STud3 = l_stud3_bak.itgeltsuur if l_stud3_bak else 0  # Бакалавр лекц 91 болон түүнээс дээш оюутан тоолох


        lesson_type = {
            1: 'Лаборатор',
            2: 'Лекц',
            3: 'Семинар',
            # 4: 'Бусад',
            5: 'Практик',
            6: 'Бие даалт',
        }
        study_type = {
            1: 'Танхим',
            2: 'Онлайн',
        }
        teacher_data = []
        filters = {}
        # Багш нар мөн эсэх
        employee_user_id = Employee.objects.filter(org_position__is_teacher=True).values_list('user_id', flat=True)

        if school:
            filters = Q(sub_org_id=school)

        # Хайлт хийх
            filters &= Q(first_name__icontains=search)

        # Тэнхимээр хайх
        if depId:
            filters &= Q(salbar_id=depId)

        teacher_ids = Teachers.objects.filter(filters, user_id__in=employee_user_id).values_list('id', flat=True)

        all_timetables = TimeTable.objects.filter(
            lesson_year=year,
            lesson_season_id=season,
            school_id=school,
            teacher__in=teacher_ids,
        ).values(
            'lesson__code',
            'lesson__name',
            'timetable_to_group__group__profession__degree__degree_code',
        ).annotate(
            # Багшийн нэр
            teacher_full_name=Concat(
                Substr('teacher__last_name', 1, 1), Value('. '), F('teacher__first_name'),
                output_field=CharField()
            ),
            total_weeks=ExpressionWrapper(
                F('end_week') - F('begin_week') + 1,
                output_field=IntegerField()
            ),
            # долоо хоног
            base_weeks=Case(
                When(type=2, then=Value(8)),
                default=Value(16),
                output_field=IntegerField(),
            ),
            # Хагас сайн долоо хоног
            satur_weeks=Case(
                When(type=2, day=6,study_type=1, then=Value(16)),
                default=Value(0),
                output_field=IntegerField(),
            ),
            # D сем
            d_sem_weeks=Case(
                When(type=3, study_type=1, then=Value(16)),
                default=Value(0),
                output_field=IntegerField(),
            ),
            #  D сем
            d_sem_real_weeks=Case(
                When(odd_even=3, type=3, then=F('d_sem_weeks'),study_type=1, timetable_to_group__group__profession__degree__degree_code='D' ),
                default=ExpressionWrapper(F('d_sem_weeks') / 2, output_field=IntegerField()),
            ),
            #  хагас сайн өдөр Тэгш/Сондгой тооцоолол
            statur_real_weeks=Case(
                When(odd_even=3, then=F('satur_weeks'),study_type=1, timetable_to_group__group__profession__degree__degree_code='D'),
                default=ExpressionWrapper(F('satur_weeks') / 2, output_field=IntegerField()),
            ),
            # Тэгш/Сондгой тооцоолол
            real_weeks=Case(
                When(odd_even=3, then=F('base_weeks'), study_type=1),
                default=ExpressionWrapper(F('base_weeks') / 2, output_field=IntegerField()),
            ),
            # Нийт цаг
            row_total_tsag=ExpressionWrapper(Coalesce(F('real_weeks'), 0) * 2, output_field=IntegerField()),
            satur_total=ExpressionWrapper(Coalesce(F('statur_real_weeks'), 0) * 2, output_field=IntegerField()),
            d_sem_total=ExpressionWrapper(Coalesce(F('d_sem_real_weeks'), 0) * 2, output_field=IntegerField()),

            # Танхим, Онлайн
            study_type_display=Case(
                When(study_type=1, then=Value('Танхим')),
                When(study_type=2, then=Value('Онлайн')),
                When(study_type=3, then=Value('Хосолсон')),
                default=Value('Тодорхойгүй'),
                output_field=CharField(),
            ),
            # тэгш, сондгой, дандаа эсэх
            odd_even_display=Case(
                When(odd_even=1, study_type=1, then=Value('Сондгой')),
                When(odd_even=2, study_type=1, then=Value('Тэгш')),
                When(odd_even=3, study_type=1, then=Value('Дандаа')),
                default=Value('Тодорхойгүй'),
                output_field=CharField(),
            ),

            # танхим хэлбэрээр дараах тогтмол цагаар тооцно
            togtmol=Case(
                When(type=2, study_type=1, timetable_to_group__group__profession__degree__degree_code='D', then=Value(16)),
                When(type=2, study_type=1, timetable_to_group__group__profession__degree__degree_code__in=['E', 'F'], then=Value(12)),
                When(type=3, study_type=1, timetable_to_group__group__profession__degree__degree_code='D', then=Value(32)),
                When(type=3, study_type=1, timetable_to_group__group__profession__degree__degree_code__in=['E', 'F'], then=Value(24)),
                default=Value(0),
                output_field=IntegerField()
            ),
            degree_names=StringAgg('timetable_to_group__group__profession__degree__degree_name', delimiter=', ', distinct=True),
            department_names=StringAgg('timetable_to_group__group__profession__department__name', delimiter=', ', distinct=True),
            # хагас сайн өдөр  зөвхөн бакалавр бөгөөд лекц байх юм бол
            is_saturday_lecture=Case(
                When(day=6, type=2 ,study_type=1, then=Value('Тийм'),timetable_to_group__group__profession__degree__degree_code='D'),
                default=Value('Үгүй'),
                output_field=CharField(),
            ),
            bak_lecture_61=Sum(
                    Case(
                    When(
                        type=2,
                        study_type=1,
                        timetable_to_group__group__profession__degree__degree_code='D',
                        st_count__lte=60, # Оюутны тоо <= 60
                        then=F('st_count')
                    ),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ),

            # 2. Оюутны тоо 61-ээс 90-ийн хооронд үед
            bak_lecture_61_90=Sum(
                Case(
                    When(
                        type=2,
                        study_type=1,
                        timetable_to_group__group__profession__degree__degree_code='D',
                        st_count__range=(61, 90), # 61 <= st_count <= 90
                        then=F('st_count')
                    ),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ),

            # 3. Оюутны тоо 90-ээс их үед
            bak_lecture_90_up=Sum(
                Case(
                    When(
                        type=2,
                        study_type=1,
                        timetable_to_group__group__profession__degree__degree_code='D',
                        st_count__gt=90, # Оюутны тоо > 90
                        then=F('st_count')
                    ),
                    default=Value(0),
                    output_field=IntegerField()
                )
            )
            ).values(
            'teacher_id',
            'teacher_full_name',
            'type',
            'row_total_tsag',
            'study_type_display',
            'lesson__code',
            'lesson__name',
            'togtmol',
            'degree_names','odd_even_display',
            'st_count',
            'begin_week',
            'end_week',
            'timetable_to_group__group__profession__degree__degree_code','total_weeks','department_names','is_saturday_lecture','satur_weeks','statur_real_weeks', 'satur_total','d_sem_total', 'bak_lecture_61','bak_lecture_61_90','bak_lecture_90_up'
        ).distinct()

        teacher_data = []
        # Багш тус бүрээр
        for t_id in teacher_ids:
            if not t_id: continue
            teacher_total_hours = 0  # Тухайн багшийн нийт цаг
            t_timetables = [item for item in all_timetables if item['teacher_id'] == t_id]
            if not t_timetables: continue

            teacher_name = t_timetables[0]['teacher_full_name']
            teacher_lesson_types = []
            for type_id, type_name in lesson_type.items():
                type_data = [item for item in t_timetables if item['type'] == type_id]

                if type_data:
                    all_total_hours = 0
                    degree_summary = {}
                    for item in type_data:
                        d_code = item['timetable_to_group__group__profession__degree__degree_code']
                        tsag = item['row_total_tsag']
                        togtmol = item['togtmol']
                        # багшийн тус бүрийн цаг
                        tsag = item.get('row_total_tsag') or 0
                        all_total_hours += tsag
                        togtmol = item.get('togtmol') or 0
                        # хагас сайн өдрийн лекц эсэх
                        satur_total_tsag = item.get('satur_total') or 0
                        d_sem_totals = item.get('d_sem_total') or 0
                        bak_lecture_61 = item.get('bak_lecture_61') or 0
                        bak_lecture_61_90 = item.get('bak_lecture_61_90') or 0
                        bak_lecture_90_up = item.get('bak_lecture_90_up') or 0

                        if d_code not in degree_summary:
                            degree_summary[d_code] = {
                                'total_tsag': 0,
                                'togtmol':togtmol,
                                'd_sem_total':0,
                                'd_lekts_total':0,
                                'total_tsag': 0,
                                'd_s_guitsetgel':0,
                                'guitsetgel': 0,
                                'satur_total':0,
                                'st1_guitsetgel':0,
                                'st2_guitsetgel':0,
                                'st3_guitsetgel':0,
                                'f_guitsetgel':0,
                                'e_guitsetgel':0,
                                'sturday_guitsetgel':0,
                                'd_l_guitsetgel':0
                            }

                        if d_code == 'D':
                            if item['type'] == 2: # Лекц
                                if item.get('is_saturday_lecture') == 'Тийм':
                                    degree_summary[d_code]['satur_total'] += satur_total_tsag
                                elif bak_lecture_61 <= 60:
                                    degree_summary[d_code]['st1_guitsetgel'] += tsag
                                elif 61 <= bak_lecture_61_90 <= 90:
                                    degree_summary[d_code]['st2_guitsetgel'] += tsag
                                elif bak_lecture_90_up > 90:
                                    degree_summary[d_code]['st3_guitsetgel'] += tsag

                            elif item['type'] == 3: # Семинар
                                degree_summary[d_code]['d_s_guitsetgel'] += d_sem_totals
                        else:
                            degree_summary[d_code]['total_tsag'] += tsag

                    # Гүйцэтгэл бодох: (Нийт цаг / Тогтмол) * Тухайн зэргийн Итгэлцүүр
                    for d_code, stats in degree_summary.items():
                        if stats['togtmol'] > 0:
                            if d_code == 'D':
                                # Бакалаврын гүйцэтгэлийг төрөл бүрийн итгэлцүүрээр бодож нэмэх
                                res = 0
                                res += (stats['satur_total'] / stats['togtmol']) * D_L_STur # Бямба
                                res += (stats['st1_guitsetgel'] / stats['togtmol']) * D_L_STud1 # 1-60
                                res += (stats['st2_guitsetgel'] / stats['togtmol']) * D_L_STud2 # 61-90
                                res += (stats['st3_guitsetgel'] / stats['togtmol']) * D_L_STud3 # 91+
                                res += (stats['d_s_guitsetgel'] / stats['togtmol']) * D_S        # Семинар
                                stats['guitsetgel'] = round(res, 2)

                            elif d_code == 'E':
                                stats['e_guitsetgel'] = round((stats['total_tsag'] / stats['togtmol']) * E_val, 2)

                            elif d_code == 'F':
                                stats['f_guitsetgel'] = round((stats['total_tsag'] / stats['togtmol']) * F_val, 2)

                        else:
                            stats['satur_total'] = 0
                            stats['st1_guitsetgel'] = 0
                            stats['st2_guitsetgel'] = 0
                            stats['st3_guitsetgel'] = 0
                            stats['e_guitsetgel'] = 0
                            stats['f_guitsetgel'] = 0
                            stats['d_l_guitsetgel'] = 0
                            stats['d_s_guitsetgel'] = 0

                    teacher_lesson_types.append({
                        'lesson_type_name': type_name, # хичээлийн төрөл
                        'lesson_type_id': type_id, # хичээлийн төрлийн id
                        'total_hours': all_total_hours,
                        'degree': degree_summary,
                        'data': type_data,
                    })
                    teacher_total_hours += all_total_hours
            teacher_data.append({
                'teacher_id': t_id,
                'full_name': teacher_name,
                'lesson_types': teacher_lesson_types,
                'all_total_time':teacher_total_hours
            })

        return request.send_data(teacher_data)
