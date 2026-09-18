from core.models import Teachers
from lms.models import Lesson_title_plan, Season, Student, SystemSettings, TimeTable, TimeTable_to_group
from apps.basic.viewsets import BasicViewSet
from django.db.models import Q, Exists, OuterRef

from main.utils.function.utils import get_active_year_season

from .serializers import  (
    IrtsQrSerializer, LessonTitlePlanSerializer, RegisterIrtsSerializer, TeacherSerializer, TimeTableLessonSerializer, TimetableSerializer,
)


class JournalIrtsViewSet(
    BasicViewSet,
):
    def get_queryset_core_subschools(self):
        queryset = super().get_queryset()

        # backend filters
        queryset = queryset.filter(is_school=True)

        return queryset

    def get_queryset_core_teachers(self):
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related('user__employee_set')

        # region backend filters
        year = get_active_year_season()[0]

        queryset = queryset.annotate(
            has_timetable=Exists(
                TimeTable.objects.annotate(
                    has_group=Exists(
                        TimeTable_to_group.objects.filter(
                            timetable=OuterRef('pk')
                        )
                    )
                ).filter(
                    lesson_year=year,
                    has_group=True,
                    teacher=OuterRef('pk')
                )
            )
        ).filter(
            has_timetable=True
        )
        # endregion

        return queryset

    def get_queryset_lms_group(self):
        queryset = super().get_queryset()

        # backend filters
        queryset = queryset.filter(is_finish=False)

        # region frontend filters
        year = get_active_year_season()[0]

        school = self.request.query_params.get('school')

        if school:
            queryset = queryset.annotate(
                has_timetable=Exists(TimeTable_to_group.objects.filter(
                    timetable__school=school,
                    timetable__lesson_year=year,
                    group=OuterRef('pk')
                ))
            ).filter(has_timetable=True)

        teacher = self.request.query_params.get('teacher')

        if teacher:
            queryset = queryset.annotate(
                has_timetable=Exists(TimeTable_to_group.objects.filter(
                    timetable__teacher=teacher,
                    timetable__lesson_year=year,
                    group=OuterRef('pk')
                ))
            ).filter(has_timetable=True)
        # endregion

        return queryset

    def get_queryset_lms_timetable(self):
        queryset = super().get_queryset()

        # backend filters
        year = get_active_year_season()[0]
        queryset = queryset.filter(lesson_year=year)

        # region frontend filters
        school = self.request.query_params['school']
        queryset = queryset.filter(school=school)

        teacher = self.request.query_params['teacher']
        queryset = queryset.filter(teacher=teacher)

        group = self.request.query_params['group']
        ttg_qs = TimeTable_to_group.objects.filter(group=group)
        ttg_timetables_ids = ttg_qs.values_list('timetable', flat=True).distinct()

        # region TODO maybe this is not required - maybe journal only by group is required because select input filter is by group
        # tts_qs = TimeTable_to_student.objects.filter(student__group=group, add_flag=True)
        # tts_timetables_ids = tts_qs.values_list('timetable', flat=True).distinct()

        # timetables_ids = list(set(ttg_timetables_ids + tts_timetables_ids))
        # endregion TODO maybe this is not required - maybe journal only by group is required because select input filter is by group

        timetables_ids = list(ttg_timetables_ids)
        queryset = queryset.filter(id__in=timetables_ids)
        # endregion

        self._custom_field = { 'timetables_ids': timetables_ids }
        return queryset

    def get_queryset_lms_registerirts(self):
        queryset = super().get_queryset()

        # backend filters
        year = get_active_year_season()[0]
        queryset = queryset.filter(qr__timetable__lesson_year=year)

        # region frontend filters
        school = self.request.query_params['school']
        queryset = queryset.filter(qr__timetable__school=school)

        teacher = self.request.query_params['teacher']
        queryset = queryset.filter(qr__timetable__teacher=teacher)

        group = self.request.query_params['group']
        queryset = queryset.select_related('qr')
        queryset = queryset.annotate(has_group=Exists(TimeTable_to_group.objects.filter(timetable_id=OuterRef('qr__timetable_id'), group_id=group)))
        queryset = queryset.filter(has_group=True)
        # endregion

        return queryset

    def get_queryset_lms_irtsqr(self):
        queryset = super().get_queryset()

        # backend filters
        year = get_active_year_season()[0]
        queryset = queryset.filter(timetable__lesson_year=year)

        # region frontend filters
        school = self.request.query_params['school']
        queryset = queryset.filter(timetable__school=school)

        teacher = self.request.query_params['teacher']
        queryset = queryset.filter(timetable__teacher=teacher)

        group = self.request.query_params['group']
        queryset = queryset.select_related('timetable')
        queryset = queryset.annotate(has_group=Exists(TimeTable_to_group.objects.filter(timetable_id=OuterRef('timetable_id'), group_id=group)))
        queryset = queryset.filter(has_group=True)
        # endregion

        return queryset

    def list_lms_irtsqr(self, result):
        lesson_title_q = Q()
        combo_set = set()

        for item in result:
            # NOTE commented because in database lesson_season is always null
            # lesson_title_q |= Q(lesson=item['lesson'], week=item['week'], lesson_season=item['season'])

            combo = f"{item['lesson']}-{item['week']}"

            if combo not in combo_set:
                combo_set.add(combo)
                lesson_title_q |= Q(lesson=item['lesson'], week=item['week'])

        teacher = self.request.query_params['teacher']

        lesson_title_plan_qs = Lesson_title_plan.objects.filter(
            Q(teacher=teacher) &
            Q(lesson_title_q)
        )

        result = {'irtsqr': result, 'lesson_title_plan': LessonTitlePlanSerializer(lesson_title_plan_qs, many=True).data}
        return result

    def list_lms_timetable(self, result):
        lessons_qs = TimeTable.objects.filter(id__in=self._custom_field['timetables_ids']).select_related('lesson').distinct('lesson')

        group = self.request.query_params['group']

        result = {
            'timetables': result,
            'start_study_date': SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).values_list('start_date', flat=True).first(),
            'lessons': TimeTableLessonSerializer(lessons_qs, many=True).data,
            'seasons': list(Season.objects.all().values()),
            'students': list(Student.objects.filter(group=group, status__name__icontains='Суралцаж буй').values('id', 'first_name', 'last_name')),
        }

        return result

    def get_queryset(self):
        model_name = self.kwargs.get('model')
        queryset = None

        if model_name == 'core_Teachers':
            queryset = self.get_queryset_core_teachers()

        elif model_name == 'core_SubOrgs':
            queryset = self.get_queryset_core_subschools()

        elif model_name == 'lms_Group':
            queryset = self.get_queryset_lms_group()

        elif model_name == 'lms_TimeTable':
            queryset = self.get_queryset_lms_timetable()

        elif model_name == 'lms_RegisterIrts':
            queryset = self.get_queryset_lms_registerirts()

        elif model_name == 'lms_IrtsQr':
            queryset = self.get_queryset_lms_irtsqr()

        else:
            queryset = super().get_queryset()

        if not queryset.ordered:
            queryset = queryset.order_by('id')

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        result = response.data
        model_name = self.kwargs.get('model')

        if model_name == 'lms_IrtsQr':
            result = self.list_lms_irtsqr(result)

        if model_name == 'lms_TimeTable':
            result = self.list_lms_timetable(result)

        return request.send_data(result)

    def dispatch(self, request, *args, **kwargs):
        model_name = self.kwargs.get('model')

        if model_name == 'lms_TimeTable':
            self.whitelist = {
                'lms': {
                    'TimeTable': {
                        'filter_fields': [],
                        'search_fields': [],
                        'ordering_fields': [],
                        'serializer_fields': [],
                        'methods': ['GET'],
                    }
                }
            }

        if model_name == 'lms_RegisterIrts':
            self.whitelist = {
                'lms': {
                    'RegisterIrts': {
                        'filter_fields': [],
                        'search_fields': [],
                        'ordering_fields': [],
                        'serializer_fields': [],
                        'methods': ['GET'],
                    }
                }
            }

        if model_name == 'lms_IrtsQr':
            self.whitelist = {
                'lms': {
                    'IrtsQr': {
                        'filter_fields': [],
                        'search_fields': [],
                        'ordering_fields': [],
                        'serializer_fields': [],
                        'methods': ['GET'],
                    }
                }
            }

        if model_name == 'core_Teachers':
            self.whitelist = {
                'core': {
                    'Teachers': {
                        'filter_fields': ['action_status', 'action_status_type', 'sub_org'],
                        'search_fields': ['first_name', 'register', 'register_code'],
                        'ordering_fields': [],
                        'serializer_fields': [],
                        'methods': ['GET'],
                    },
                }
            }

        if model_name == 'lms_Group':
            self.whitelist = {
                'lms': {
                    'Group': {
                        'filter_fields': [],
                        'search_fields': ['name'],
                        'ordering_fields': [],
                        'serializer_fields': ['id', 'name'],
                        'methods': ['GET'],
                    },
                }
            }

        return super().dispatch(request, *args, **kwargs)

    def get_serializer_class(self):
        model_name = self.kwargs.get('model')

        if model_name == 'lms_TimeTable':
            return TimetableSerializer

        if model_name == 'lms_RegisterIrts':
            return RegisterIrtsSerializer

        if model_name == 'lms_IrtsQr':
            return IrtsQrSerializer

        if model_name == 'core_Teachers':
            return TeacherSerializer

        return super().get_serializer_class()

