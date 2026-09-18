from datetime import timedelta
from django.db.models import F, Q, Exists, OuterRef, Value, CharField, Case, When
from django.db.models.functions import Concat, Upper, Substr

from rest_framework import generics
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from lms.models import IrtsQr, RegisterIrts, SystemSettings, TimeTable, TimeTable_to_group, TimeTable_to_student
from main.utils.function.utils import get_active_year_season, get_week_num_from_date


@permission_classes([IsAuthenticated])
class DigitalJournalAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал
    """

    def get(self, request):
        # frontend params
        lesson = request.query_params.get('lesson')
        group = request.query_params.get('group')

        year, season = get_active_year_season()

        all_timetable_ids = set()

        def get_all_par_students(lesson, group, year, season):
            # main queryset filters
            timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
            timetable_qs = timetable_qs.filter(lesson=lesson) if lesson else timetable_qs

            # group filter
            if group:
                timetable_qs = timetable_qs.filter(
                    Q(Exists(TimeTable_to_group.objects.filter(timetable=OuterRef('id'), group=group)))|
                    Q(Exists(TimeTable_to_student.objects.filter(timetable=OuterRef('id'), student__group=group, add_flag=True)))
                )

            def get_students(timetable_qs):
                """
                to collect student info for frontend
                """

                # to get student info from TimeTable_to_student
                tts_qs = TimeTable_to_student.objects.filter(
                    timetable__in=timetable_qs,
                    student__group=group
                ).values_list(
                    'timetable',
                    'student',
                    'student__first_name',
                    'student__last_name',
                    'student__code',
                ).distinct()

                # to get student info from TimeTable_to_group
                ttg_qs = TimeTable_to_group.objects.filter(
                    timetable__in=timetable_qs,
                    group=group
                ).values_list(
                    'timetable',
                    'group__student',
                    'group__student__first_name',
                    'group__student__last_name',
                    'group__student__code',
                ).distinct()

                student_info = {}
                student_dict = {}

                def add_student(timetable, student_id, first_name, last_name, code):
                    if timetable not in student_info:
                        student_info[timetable] = []
                        student_dict[timetable] = {}

                    if student_id not in student_dict[timetable]:
                        student_dict[timetable][student_id] = {
                            'student_id': student_id,
                            'first_name': first_name,
                            'last_name': last_name,
                            'code': code,
                        }

                        student_info[timetable].append(student_dict[timetable][student_id])

                # to get student info from TimeTable_to_student
                for timetable, student_id, first_name, last_name, code in tts_qs:
                    add_student(timetable, student_id, first_name, last_name, code)

                # to get student info from TimeTable_to_group
                for timetable, student_id, first_name, last_name, code in ttg_qs:
                    add_student(timetable, student_id, first_name, last_name, code)

                return student_info

            # to collect student info for frontend
            student_info = get_students(timetable_qs)

            # to get final result
            result = []

            def get_par_students(timetable_obj, week):
                if not isinstance(week, int):
                    week = int(week)

                if timetable_obj.odd_even == TimeTable.EVEN:
                    if week % 2 != 0:
                        return None

                elif timetable_obj.odd_even == TimeTable.ODD:
                    if week % 2 == 0:
                        return None

                # to collect total id list to filter registerIrts
                all_timetable_ids.add(timetable_obj.id)

                par_students = []

                for student in student_info.get(timetable_obj.id):
                    par_students.append({'week': week, 'timetable_id': timetable_obj.id, 'student': student})

                return par_students

            # region to filter kurats pars by input date range
            def get_kurats(timetable_qs):
                """
                to get kurats timetables

                kurats timetable characteristics:
                - begin_date, end_date, week_number always are not null
                - every pair(par) are created in lms_TimeTable table
                """

                result = []

                kurats_timetable_qs = timetable_qs.filter(
                    is_kurats=True,
                )

                for timetable_obj in kurats_timetable_qs:
                    par_students = get_par_students(timetable_obj, timetable_obj.week_number)

                    if par_students:
                        result.extend(par_students)

                return result

            result.extend(get_kurats(timetable_qs))
            # endregion

            # region to filter block pars by input date range
            def get_block(timetable_qs):
                """
                to get block timetables

                block timetable characteristics:
                begin_week, end_week always are not null
                """

                result = []

                block_timetables = timetable_qs.filter(
                    is_block=True
                )

                for timetable_obj in block_timetables:
                    for current_week in range(timetable_obj.begin_week, timetable_obj.end_week + 1):
                        par_students = get_par_students(timetable_obj, current_week)

                        if par_students:
                            result.extend(par_students)

                return result

            result.extend(get_block(timetable_qs))
            # endregion

            # region to filter simple pars by input date range
            def get_simple(timetable_qs):
                """
                to get simple timetables

                simple timetable characteristics:
                sometimes begin_week, end_week are null or not null
                """

                result = []

                simple_timetables = timetable_qs.filter(
                    is_block=False,
                    is_kurats=False,
                )

                # region to process week_simple_timetables
                week_simple_timetables = simple_timetables.filter(
                    begin_week__isnull=False,
                )

                for timetable_obj in week_simple_timetables:
                    for current_week in range(timetable_obj.begin_week, timetable_obj.end_week + 1):
                        par_students = get_par_students(timetable_obj, current_week)

                        if par_students:
                            result.extend(par_students)

                # endregion

                # region to process not_week_simple_timetables
                system_settings_qs = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).order_by('id').last()
                start = system_settings_qs.start_date
                end = system_settings_qs.finish_date

                not_week_simple_timetables = simple_timetables.exclude(
                    begin_week__isnull=False,
                    end_week__isnull=False,
                )

                for timetable_obj in not_week_simple_timetables:
                    timetable_date = start

                    while timetable_date <= end:
                        if timetable_obj.day == timetable_date.weekday() + 1:
                            par_students = get_par_students(timetable_obj, get_week_num_from_date(timetable_date.strftime('%Y-%m-%d')))

                            if par_students:
                                result.extend(par_students)

                        timetable_date += timedelta(days=1)
                # endregion

                return result

            result.extend(get_simple(timetable_qs))
            # endregion

            return result

        # to get all par students
        all_par_students = get_all_par_students(lesson, group, year, season)

        # to get states
        register_irts_qs = RegisterIrts.objects.filter(qr__timetable__in=all_timetable_ids)
        register_irts_qs = register_irts_qs.filter(student__group=group) if group else register_irts_qs
        register_irts = register_irts_qs.order_by('student', 'qr__week', 'qr__timetable', '-id').distinct('student', 'qr__week', 'qr__timetable').values_list('student', 'qr__week', 'qr__timetable', 'state')
        register_irts_dict = {}

        for irts_student_id, irts_week, irts_timetable_id, state in register_irts:
            register_irts_dict[f'{irts_student_id}_{irts_week}_{irts_timetable_id}'] = state

        rows = {}
        return_datas = []
        all_par_students.sort(key=lambda x: x['student']['first_name'])

        # to build simple dataset for frontend
        for par_student in all_par_students:
            student_id = par_student['student']['student_id']

            if student_id not in rows:
                rows[student_id] = {**par_student['student'], 'weeks': {}}
                return_datas.append(rows[student_id])

            key = f"{student_id}_{par_student['week']}_{par_student['timetable_id']}"

            if key in register_irts_dict:
                if par_student['week'] not in rows[student_id]['weeks']:
                    rows[student_id]['weeks'][par_student['week']] = {}

                state = register_irts_dict[key]

                if state not in rows[student_id]['weeks'][par_student['week']]:
                    rows[student_id]['weeks'][par_student['week']][state] = 0

                rows[student_id]['weeks'][par_student['week']][state] += 1

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class DigitalJournalParAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал/Par Modal
    """

    def get(self, request):
        # frontend params
        student = request.query_params.get('student')
        lesson = request.query_params.get('lesson')
        week = request.query_params.get('week')

        year, season = get_active_year_season()

        all_timetable_ids = set()

        def get_all_pars(lesson, student, year, season, week):
            # main queryset filters
            timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson)

            # student filter
            timetable_qs = timetable_qs.filter(
                Q(Exists(TimeTable_to_group.objects.filter(timetable=OuterRef('id'), group__student=student)))|
                Q(Exists(TimeTable_to_student.objects.filter(timetable=OuterRef('id'), student=student, add_flag=True)))
            )

            # to get final result
            result = []

            def get_par(timetable_obj, week):
                """
                to get single par info
                """

                if not isinstance(week, int):
                    week = int(week)

                if timetable_obj.odd_even == TimeTable.EVEN:
                    if week % 2 != 0:
                        return None

                elif timetable_obj.odd_even == TimeTable.ODD:
                    if week % 2 == 0:
                        return None

                # to collect total id list to filter registerIrts
                all_timetable_ids.add(timetable_obj.id)

                par_students = {'timetable_id': timetable_obj.id, 'par': timetable_obj.time, 'day': timetable_obj.day}
                return par_students

            # region to filter kurats pars by input date range
            def get_kurats(timetable_qs, week):
                """
                to get kurats timetables

                kurats timetable characteristics:
                - begin_date, end_date, week_number always are not null
                - every pair(par) are created in lms_TimeTable table
                """

                result = []

                kurats_timetable_qs = timetable_qs.filter(
                    is_kurats=True,
                    week_number=week
                )

                for timetable_obj in kurats_timetable_qs:
                    par_students = get_par(timetable_obj, timetable_obj.week_number)

                    if par_students:
                        result.append(par_students)

                return result

            result.extend(get_kurats(timetable_qs, week))
            # endregion

            # region to filter block pars by input date range
            def get_block(timetable_qs, week):
                """
                to get block timetables

                block timetable characteristics:
                begin_week, end_week always are not null
                """

                result = []

                block_timetables = timetable_qs.filter(
                    is_block=True,
                    begin_week__lte=week,
                    end_week__gte=week
                )

                for timetable_obj in block_timetables:
                    par_students = get_par(timetable_obj, week)

                    if par_students:
                        result.append(par_students)

                return result

            result.extend(get_block(timetable_qs, week))
            # endregion

            # region to filter simple pars by input date range
            def get_simple(timetable_qs, week):
                """
                to get simple timetables

                simple timetable characteristics:
                sometimes begin_week, end_week are null or not null
                """

                result = []

                simple_timetables = timetable_qs.filter(
                    is_block=False,
                    is_kurats=False,
                )

                # region to process week_simple_timetables
                week_simple_timetables = simple_timetables.filter(
                    begin_week__lte=week,
                    end_week__gte=week
                )

                for timetable_obj in week_simple_timetables:
                    par_students = get_par(timetable_obj, week)

                    if par_students:
                        result.append(par_students)

                # endregion

                # region to process not_week_simple_timetables
                not_week_simple_timetables = simple_timetables.exclude(
                    begin_week__isnull=False,
                    end_week__isnull=False,
                )

                for timetable_obj in not_week_simple_timetables:
                    par_students = get_par(timetable_obj, week)

                    if par_students:
                        result.append(par_students)
                # endregion

                return result

            result.extend(get_simple(timetable_qs, week))
            # endregion

            return result

        # to get all par
        all_pars = get_all_pars(lesson, student, year, season, week)

        # to get states
        register_irts_qs = RegisterIrts.objects.filter(qr__timetable__in=all_timetable_ids, qr__week=week, student=student)
        register_irts = register_irts_qs.order_by('qr__timetable', '-id').distinct('qr__timetable').values_list('qr__timetable', 'state')
        register_irts_dict = {}

        for irts_timetable_id, state in register_irts:
            register_irts_dict[irts_timetable_id] = state

        rows = {}

        # to build simple dataset for frontend
        for par_student in all_pars:
            key = par_student['timetable_id']

            if key in register_irts_dict:
                rows[par_student['par']] = {par_student['day']: register_irts_dict[key]}

        return request.send_data(rows)


@permission_classes([IsAuthenticated])
class DigitalJournalDepartmentAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал/Department options for select input
    """

    def get(self, request):
        # frontend params
        school = request.query_params.get('school')
        has_irts = request.query_params.get('hasIrts') == 'true'

        year, season = get_active_year_season()

        timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
        timetable_qs = timetable_qs.filter(teacher__salbar__isnull=False)

        # frontend filters
        timetable_qs = timetable_qs.filter(teacher__sub_org=school) if school else timetable_qs

        # frontend filters
        if has_irts:
            timetable_qs = timetable_qs.filter(irtsqr__registerirts__isnull=False)

        timetable_qs = timetable_qs.annotate(cid=F('teacher__salbar'), name=F('teacher__salbar__name'))
        timetable_qs = timetable_qs.values('cid', 'name').distinct().order_by('teacher__salbar__name')
        return request.send_data(list(timetable_qs))


@permission_classes([IsAuthenticated])
class DigitalJournalTeacherAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал/Teacher options for select input
    """

    def get(self, request):
        # frontend params
        school = request.query_params.get('school')
        department = request.query_params.get('department')
        has_irts = request.query_params.get('hasIrts') == 'true'

        year, season = get_active_year_season()

        timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season)

        # frontend filters
        timetable_qs = timetable_qs.filter(teacher__sub_org=school) if school else timetable_qs
        timetable_qs = timetable_qs.filter(teacher__salbar=department) if department else timetable_qs

        # frontend filters
        if has_irts:
            timetable_qs = timetable_qs.filter(irtsqr__registerirts__isnull=False)

        timetable_qs = timetable_qs.annotate(cid=F('teacher'), name=Concat(
            'teacher__register',
            Value(" "),
            Case(
                When(
                    ~Q(teacher__last_name='') & Q(teacher__last_name__isnull=False),
                    then=Concat(
                        Upper(Substr("teacher__last_name", 1, 1)),
                        Value(". ")
                    )
                ),
                default=Value(""),
                output_field=CharField()
            ),
            "teacher__first_name",
            output_field=CharField()
        ))

        timetable_qs = timetable_qs.values('cid', 'name').distinct().order_by('teacher__first_name')
        return request.send_data(list(timetable_qs))


@permission_classes([IsAuthenticated])
class DigitalJournalLessonAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал/Lesson options for select input
    """

    def get(self, request):
        # frontend params
        school = request.query_params.get('school')
        department = request.query_params.get('department')
        teacher = request.query_params.get('teacher')
        has_irts = request.query_params.get('hasIrts') == 'true'

        year, season = get_active_year_season()

        timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season)

        # frontend filters
        timetable_qs = timetable_qs.filter(teacher__sub_org=school) if school else timetable_qs
        timetable_qs = timetable_qs.filter(teacher__salbar=department) if department else timetable_qs
        timetable_qs = timetable_qs.filter(teacher=teacher) if teacher else timetable_qs

        # frontend filters
        if has_irts:
            timetable_qs = timetable_qs.filter(irtsqr__registerirts__isnull=False)

        timetable_qs = timetable_qs.annotate(cid=F('lesson'), name=Concat(
            "lesson__code", Value(" "), "lesson__name", output_field=CharField()
        ))

        timetable_qs = timetable_qs.values('cid', 'name').distinct().order_by('lesson__name')
        return request.send_data(list(timetable_qs))


@permission_classes([IsAuthenticated])
class DigitalJournalGroupAPIView(
    generics.GenericAPIView,
):
    """
    Цахим журнал/Group options for select input
    """

    def get(self, request):
        # frontend params
        school = request.query_params.get('school')
        department = request.query_params.get('department')
        teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')
        has_irts = request.query_params.get('hasIrts') == 'true'

        year, season = get_active_year_season()

        timetable_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season)

        # frontend filters
        timetable_qs = timetable_qs.filter(teacher__sub_org=school) if school else timetable_qs
        timetable_qs = timetable_qs.filter(teacher__salbar=department) if department else timetable_qs
        timetable_qs = timetable_qs.filter(teacher=teacher) if teacher else timetable_qs
        timetable_qs = timetable_qs.filter(lesson=lesson) if lesson else timetable_qs

        group_ids = []

        # frontend filters
        if has_irts:
            timetable_qs = timetable_qs.filter(irtsqr__registerirts__isnull=False)
            group_ids = timetable_qs.values_list('irtsqr__registerirts__student__group', flat=True).distinct()

        # to filter by group in ttg table
        timetable_to_group_qs = TimeTable_to_group.objects.filter(timetable__in=timetable_qs)
        timetable_to_group_qs = timetable_to_group_qs.filter(group__in=group_ids) if has_irts else timetable_to_group_qs
        timetable_to_group_qs = timetable_to_group_qs.annotate(cid=F('group'), name=F("group__name"))

        # to filter by group in tts table
        timetable_to_student_qs = TimeTable_to_student.objects.filter(timetable__in=timetable_qs)
        timetable_to_student_qs = timetable_to_student_qs.filter(student__group__in=group_ids) if has_irts else timetable_to_student_qs
        timetable_to_student_qs = timetable_to_student_qs.annotate(cid=F('student__group'), name=F("student__group__name"))

        # to distinct
        group_set = set(timetable_to_group_qs.values_list('cid', 'name').distinct())
        group_set.update(timetable_to_student_qs.values_list('cid', 'name').distinct())

        group_options = []

        # to build frontend structure
        for cid, name in group_set:
            group_options.append({
                'cid': cid,
                'name': name
            })

        # to sort after set casting
        group_options.sort(key=lambda x: x['name'])
        return request.send_data(group_options)
