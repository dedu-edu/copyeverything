from rest_framework import serializers
from datetime import datetime, timedelta

from django.conf import settings
from django.utils.encoding import filepath_to_uri

from lms.models import Teachers
from lms.models import TeacherCreditVolumePlan
from lms.models import TeacherCreditVolumePlan_group
from lms.models import LessonStandart
from lms.models import Group
from lms.models import TimeEstimateSettings
from lms.models import SchoolLessonLevelVolume
from lms.models import TeacherCreditEstimationA
from lms.models import TeacherCreditEstimationA_group
from lms.models import Student
from lms.models import Employee
from lms.models import LearningPlan
from lms.models import TeacherCreditNotChamberEstimationA
from lms.models import Season
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import Lesson_title_plan
from lms.models import RegisterIrts, ProfessionDefinition, TeacherCreditEstimationATitle, TeacherCreditEstimationAScore, Itgeltsuur

from settings.serializers import SeasonSerailizer
from surgalt.serializers import LessonStandartSerializer
from core.serializers import TeacherListSerializer, TeacherNameSerializer
from core.serializers import DepartmentsSerializer
from core.serializers import OrgPositionSerializer
from core.serializers import SubSchoolListSerailizer, GroupSerializer
from django.db.models import F, FloatField, Case, When, Value, Sum, IntegerField, BooleanField, Exists, OuterRef
from django.db.models.functions import Coalesce
from django.db.models import F, Sum, Q, Subquery, OuterRef, IntegerField, FloatField, ExpressionWrapper
from django.db.models import Case, When, Value, Count
from django.conf import settings

from core.models import *
from lms.models import *
from rest_framework import serializers
from main.utils.function.utils import get_active_year_season, get_domain_url, is_file_url_alive, suborg_and_rank_type_calculate, url_clean_join, get_week_num_from_date, get_lesson_choice_student
class TeacherCreditVolumePlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeacherCreditVolumePlan
        fields = "__all__"


class TeacherCreditVolumePrintSerializer(serializers.ModelSerializer):

    groups = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField()
    exec_kr = serializers.SerializerMethodField(read_only=True)
    credit = serializers.SerializerMethodField(read_only=True)

    lesson = LessonStandartSerializer(many=False)
    teacher = TeacherListSerializer(many=False)
    department = DepartmentsSerializer(many=False)
    lesson_season = SeasonSerailizer(many=False)
    lesson_level = serializers.SerializerMethodField()

    class Meta:
        model = TeacherCreditVolumePlan
        fields = "__all__"

    def get_type_name(self, obj):
        """ Хичээллэх төрлийн нэр авах """

        type_name = obj.get_type_display()
        return type_name

    def get_groups(self, obj):

        group_list = []
        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    group_list.append({'id': group_id, 'name': group_data.name})

        return group_list

    def get_group_name(self, obj):

        group_name = ""
        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    if group_name:
                        group_name = group_name  + ', '  + group_data.name
                    else:
                        group_name = group_data.name

        return group_name

    def get_exec_kr(self, obj):
        credits = TeacherCreditVolumePlan.objects.filter(lesson=obj.lesson, teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values_list('credit', flat=True)
        credit = sum(credits) if credits else 0

        credit_group = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values('exec_credit_flag')
        exec_kr_list = []
        for group in credit_group:
            if group['exec_credit_flag'] and group['exec_credit_flag'] != 0:
                exec_kr_list.append( credit/group['exec_credit_flag'])

        exec_kr = 0
        if exec_kr_list:
            exec_kr = round(sum(exec_kr_list)/len(exec_kr_list),2)

        return exec_kr

    def get_credit(self, obj):
        credits = TeacherCreditVolumePlan.objects.filter(lesson=obj.lesson, teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values_list('credit', flat=True)
        credit = sum(credits) if credits else 0

        return credit

    def get_lesson_level(self, obj):

        tcvp_group_qs = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).last()

        return tcvp_group_qs.lesson_level if tcvp_group_qs else ''


class TeacherCreditVolumeOneSerializer(serializers.ModelSerializer):

    groups = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField()
    exec_kr = serializers.SerializerMethodField(read_only=True)

    lesson = LessonStandartSerializer(many=False)
    teacher = TeacherListSerializer(many=False)
    department = DepartmentsSerializer(many=False)
    lesson_season = SeasonSerailizer(many=False)

    class Meta:
        model = TeacherCreditVolumePlan
        fields = "__all__"

    def get_type_name(self, obj):
        """ Хичээллэх төрлийн нэр авах """

        type_name = obj.get_type_display()
        return type_name

    def get_groups(self, obj):

        group_list = []
        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    group_list.append({'id': group_id, 'name': group_data.name})

        return group_list

    def get_group_name(self, obj):

        group_name = ""
        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    if group_name:
                        group_name = group_name  + ', '  + group_data.name
                    else:
                        group_name = group_data.name

        return group_name

    def get_exec_kr(self, obj):
        credit = 0
        exec_kr = 0
        lesson = LessonStandart.objects.filter(id=obj.lesson_id).first()

        if obj.type == 2 and lesson.lecture_kr:
            credit= lesson.lecture_kr
        if obj.type == 3 and lesson.seminar_kr:
            credit= lesson.seminar_kr
        if obj.type == 1 and lesson.laborator_kr:
            credit= lesson.laborator_kr
        if obj.type == 5 and lesson.practic_kr:
            credit= lesson.practic_kr
        if obj.type == 6 and lesson.biedaalt_kr:
            credit= lesson.biedaalt_kr

        credit_group = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=obj.id).values('exec_credit_flag')
        exec_kr_list = []
        for group in credit_group:
            if group['exec_credit_flag'] and group['exec_credit_flag'] != 0:
                exec_kr_list.append( credit/group['exec_credit_flag'])

        if exec_kr_list:
            exec_kr = round(sum(exec_kr_list) / len(exec_kr_list),2)

        return exec_kr




class ProfessionDefinitionJustProfessionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    degree_code = serializers.CharField(source="degree.degree_code", read_only=True)

    class Meta:
        model = ProfessionDefinition
        fields = '__all__'

    def get_full_name(self, obj):
        """ Мэргэжлийн зэргийн нэр код нэгтгэх """

        full_name = ''
        code = obj.code
        name = obj.name

        ognoo = obj.confirm_year

        degree = obj.degree
        if degree:
            degree_code = degree.degree_code

        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        if degree_code:
            full_name = full_name + '({degree_code})'.format(degree_code=degree_code)

        if ognoo:
            full_name = full_name + '({ognoo})'.format(ognoo=ognoo)

        return full_name


class TeacherCreditVolumePlanListSerializer(serializers.ModelSerializer):

    lesson = LessonStandartSerializer(many=False)
    profession = ProfessionDefinitionJustProfessionSerializer(many=False)
    department = DepartmentsSerializer(many=False)
    lesson_season = SeasonSerailizer(many=False)

    total_lekts = serializers.SerializerMethodField()
    total_practic = serializers.SerializerMethodField()
    total_seminar = serializers.SerializerMethodField()

    class Meta:
        model = TeacherCreditVolumePlan
        fields = "__all__"

    def get_total_lekts(self, obj):
        total_count = ((obj.one_lecture * 2) if obj.one_lecture else 0) * (obj.potok if obj.potok else 0)
        if obj.is_english:
            total_count = total_count * 2
        return total_count

    def get_total_practic(self, obj):
        total_count = (obj.one_practic if obj.one_practic else 0) * obj.group_count if obj.group_count else 0
        if obj.is_english:
            total_count = total_count * 2
        return total_count

    def get_total_seminar(self, obj):
        total_count = ''

        part = obj.part or 0
        seminar = obj.one_seminar or 0
        total_count = (seminar * part) * 1.5
        if obj.is_english:
            total_count = total_count * 2

        return total_count

class TeachersSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    class Meta:
        model = Teachers
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.full_name


class TimeEstimateSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeEstimateSettings
        fields = "__all__"


class TimeEstimateSettingsListSerializer(serializers.ModelSerializer):

    type_name = serializers.SerializerMethodField()
    teacher_rank_type_name = serializers.SerializerMethodField()

    class Meta:
        model = TimeEstimateSettings
        fields = "__all__"

    def get_type_name(self, obj):
        return obj.get_type_display()

    def get_teacher_rank_type_name(self, obj):
        return obj.get_teacher_rank_type_display()

class SchoolLessonLevelVolumeListSerializer(serializers.ModelSerializer):

    school = SubSchoolListSerailizer()
    lesson_level_name = serializers.SerializerMethodField()

    class Meta:
        model = SchoolLessonLevelVolume
        fields = "__all__"

    def get_lesson_level_name(self, obj):
        return obj.get_lesson_level_display()


class SchoolLessonLevelVolumeSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolLessonLevelVolume
        fields = "__all__"


class TimeEstimateSettingsSerialzier(serializers.ModelSerializer):
    class Meta:
        model = TimeEstimateSettings
        fields = "__all__"


class TeacherCreditNotChamberEstimationASerialzer(serializers.ModelSerializer):
    time_estimate_settings = TimeEstimateSettingsSerialzier()
    class Meta:
        model = TeacherCreditNotChamberEstimationA
        fields = "__all__"


class TeacherAEstimationDetailSerializer(serializers.ModelSerializer):

    lesson = LessonStandartSerializer()
    groups = serializers.SerializerMethodField()
    group_names = serializers.SerializerMethodField()
    st_count = serializers.SerializerMethodField()
    lesson_season = SeasonSerailizer()
    total_kr = serializers.SerializerMethodField()

    exec_kr = serializers.SerializerMethodField()

    not_chamber_kr = serializers.SerializerMethodField()
    not_chamber_data = serializers.SerializerMethodField()

    class Meta:
        model = TeacherCreditEstimationA
        fields = "__all__"

    def get_groups(self, obj):

        group_list = []
        group_ids = TeacherCreditEstimationA_group.objects.filter(creditestimation_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    group_list.append({'id': group_id, 'name': group_data.name})

        return group_list

    def get_group_names(self, obj):

        group_name = ""
        group_ids = TeacherCreditEstimationA_group.objects.filter(creditestimation_id=obj.id).values_list('group_id',flat=True)
        if group_ids:
            for group_id in group_ids:
                group_data = Group.objects.filter(id=group_id).first()
                if group_data:
                    if group_name:
                        group_name = group_name  + ', '  + group_data.name
                    else:
                        group_name = group_data.name

        return group_name

    def get_st_count(self, obj):

        group_ids = TeacherCreditEstimationA_group.objects.filter(creditestimation_id=obj.id).values_list('group_id', flat=True)
        total = 0

        for group_id in group_ids:
            student_count = Student.objects.filter(group_id=group_id).count()

            total += student_count

        return total

    def get_total_kr(self, obj):
        return obj.total_kr

    def get_exec_kr(self, obj):
        lesson = obj.lesson
        group_ids = TeacherCreditEstimationA_group.objects.filter(creditestimation_id=obj.id).values_list('group_id', flat=True)
        exec_kr_list = []
        exec_kr = None

        total_kr = obj.total_kr

        for group_id in group_ids:
            exec_kr_list = []
            qs_group = Group.objects.get(id=group_id)
            group_school = qs_group.school

            profession = qs_group.profession

            qs_learningplan = LearningPlan.objects.filter(profession=profession, lesson=lesson).first()
            if qs_learningplan:
                lesson_level = qs_learningplan.lesson_level

                qs_level_volume = SchoolLessonLevelVolume.objects.filter(school=group_school, lesson_level=lesson_level).first()

                # Тухайн хичээлийн гүйцэтгэлийн коэффициент
                if qs_level_volume:
                    amount = qs_level_volume.amount

                    if amount:
                        exec_kr_list.append( total_kr / amount)

                    if exec_kr_list:
                        exec_kr = round(sum(exec_kr_list) / len(exec_kr_list),2)

        return exec_kr


    def get_not_chamber_kr(self, obj):
        """ Багшийн танхимийн бус нийт кредит """

        total_exec_kr = 0

        not_chamber = TeacherCreditNotChamberEstimationA.objects.filter(timeestimatea=obj.id).values('amount', 'time_estimate_settings__ratio')

        for chamber in not_chamber:
            amount = chamber.get('amount')
            ratio  = chamber.get('time_estimate_settings__ratio')
            exec_kr = amount * ratio

            total_exec_kr += exec_kr

        total_exec_kr = round(total_exec_kr, 2)

        return total_exec_kr

    def get_not_chamber_data(self, obj):
        qs_chamber = TeacherCreditNotChamberEstimationA.objects.filter(timeestimatea=obj)
        datas = TeacherCreditNotChamberEstimationASerialzer(qs_chamber, many=True, context={'timeestimate': obj}).data
        return datas


class TeacherAEstimationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherCreditEstimationA
        fields = "__all__"



class TeacherCreditEstimationATotalSerializer(serializers.ModelSerializer):
    totals = serializers.SerializerMethodField()
    profession_name = serializers.CharField(source='profession.name', default='')
    season_name = serializers.CharField(source='lesson_season.season_name', default='')
    lesson_code = serializers.CharField(source='lesson.code', default='')
    lesson_name = serializers.CharField(source='lesson.name', default='')

    class Meta:
        model = TeacherCreditEstimationA
        fields = "__all__"

    def get_totals(self, obj):
        title_qs = (
            TeacherCreditEstimationATitle
            .objects
            .filter(estimatea=obj)
            .annotate(
                is_english=F("estimatea__is_english"),
                total=Case(
                    When(time_type=TimeTable.SEM, then=F("time") * 1.5),
                    When(
                        time_type=TimeTable.LECT,
                        then=F("time") * 2,
                    ),
                    default=F("time"),
                    output_field=FloatField()
                ),
            )
            .values("time_type")
            .annotate(
                c_total=Sum("total"),

                clekts=Case(
                    When(time_type=TimeTable.LECT, then=Sum("total")),
                    default=Value(0), output_field=FloatField()
                ),
                cseminar=Case(
                    When(time_type=TimeTable.SEM, then=Sum("total")),
                    default=Value(0), output_field=FloatField()
                ),
                cdadlaga=Case(
                    When(time_type=TimeTable.PRACTIC, then=Sum("total")),
                    default=Value(0), output_field=FloatField()
                ),
            )
            .annotate(
                sum_lekts=Case(
                    When(is_english=True, then=F("clekts") * 2),
                    default=F("clekts"), output_field=FloatField()
                ),
                sum_seminar=Case(
                    When(is_english=True, then=F("cseminar") * 2),
                    default=F("cseminar"), output_field=FloatField()
                ),
                sum_dadlaga=Case(
                    When(is_english=True, then=F("cdadlaga") * 2),
                    default=F("cdadlaga"), output_field=FloatField()
                ),
                all_total=Case(
                    When(is_english=True, then=F("c_total") * 2),
                    default=F("c_total"), output_field=FloatField()
                ),
            )
            .aggregate(
                lekts=Sum("sum_lekts"),
                seminar=Sum("sum_seminar"),
                dadlaga=Sum("sum_dadlaga"),
                total=Sum("all_total"),
            )
        )

        return title_qs

class TeacherAEstimationListSerializer(serializers.ModelSerializer):

    teacher = TeacherNameSerializer()
    teacher_norm = serializers.SerializerMethodField()
    exec_kr = serializers.SerializerMethodField()
    not_chamber_exec_kr = serializers.SerializerMethodField()
    estimations = serializers.SerializerMethodField()

    spring_kredit = serializers.SerializerMethodField()
    autumn_kredit = serializers.SerializerMethodField()

    autumn_lesson = serializers.SerializerMethodField()
    spring_lesson = serializers.SerializerMethodField()

    class Meta:
        model = TeacherCreditEstimationA
        fields = 'teacher',  'exec_kr', 'not_chamber_exec_kr', 'teacher_norm', 'id', 'estimations', 'spring_kredit', 'autumn_kredit', 'autumn_lesson', 'spring_lesson'


    def get_teacher_norm(self, obj):
        """ Багшийн албан тушаалаас хамаарах А цагийн норм """

        norm = None
        user = obj.teacher.user

        worker = Employee.objects.get(user_id=user)

        # Албан тушаал
        position = worker.org_position
        timesetting = TimeEstimateSettings.objects.filter(position=position, type=TimeEstimateSettings.TEACHER_DEGREE_KREDIT).last()

        if timesetting:
            norm = timesetting.ratio

        return norm


    def get_not_chamber_exec_kr(self, obj):
        """ Багшийн танхимийн бус нийт кредит """

        total_exec_kr = 0

        year = obj.lesson_year
        teacher = obj.teacher

        estimation_ids = TeacherCreditEstimationA.objects.filter(lesson_year=year, teacher=teacher).values_list('id', flat=True)

        for estimate_id in estimation_ids:

            not_chamber = TeacherCreditNotChamberEstimationA.objects.filter(timeestimatea=estimate_id).values('amount', 'time_estimate_settings__ratio')

            for chamber in not_chamber:
                amount = chamber.get('amount')
                ratio  = chamber.get('time_estimate_settings__ratio')
                exec_kr = amount * ratio

                total_exec_kr += exec_kr

        total_exec_kr = round(total_exec_kr, 2)

        return total_exec_kr

    def get_exec_kr(self, obj):
        """ Багшийн танхимийн гүйцэтгэлийн кредит"""

        season = obj.lesson_season
        year = obj.lesson_year
        teacher = obj.teacher

        total_exec_kr = 0

        estimation_ids = TeacherCreditEstimationA.objects.filter(lesson_season=season, lesson_year=year, teacher=teacher).values_list('id', flat=True)

        for estimate_id in estimation_ids:
            qs_estimate = TeacherCreditEstimationA.objects.all().get(id=estimate_id)
            lesson = qs_estimate.lesson

            group_ids = TeacherCreditEstimationA_group.objects.filter(creditestimation_id=estimate_id).values_list('group_id', flat=True)
            exec_kr_list = []
            exec_kr = 0

            total_kr = qs_estimate.total_kr

            for group_id in group_ids:
                exec_kr_list = []
                qs_group = Group.objects.get(id=group_id)
                group_school = qs_group.school

                profession = qs_group.profession

                qs_learningplan = LearningPlan.objects.filter(profession=profession, lesson=lesson).first()
                if qs_learningplan:
                    lesson_level = qs_learningplan.lesson_level

                    qs_level_volume = SchoolLessonLevelVolume.objects.filter(school=group_school, lesson_level=lesson_level).first()

                    # Тухайн хичээлийн гүйцэтгэлийн коэффициент
                    if qs_level_volume:
                        amount = qs_level_volume.amount

                        if amount:
                            one_exec_kr = total_kr / amount
                            exec_kr_list.append(round(one_exec_kr, 2))

            if exec_kr_list:
                exec_kr = round(sum(exec_kr_list) / len(exec_kr_list),2)
                total_exec_kr +=exec_kr

        total_exec_kr = round(total_exec_kr, 2)

        return total_exec_kr

    def get_estimations(self, obj):
        estimate_ids = TeacherCreditEstimationA.objects.filter(teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values_list('id', flat=True)

        querysets = TeacherCreditEstimationA.objects.filter(id__in=estimate_ids).order_by('lesson_season')

        datas = TeacherAEstimationDetailSerializer(querysets, many=True).data

        return datas

    def get_autumn_kredit(self, obj):
        """ Намар заасан хичээлийн цаг """

        total_time = 0

        season = Season.objects.filter(season_name__icontains='Намар').last()

        estimate_ids = TeacherCreditEstimationA.objects.filter(teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=season).values_list('id', flat=True)

        for estimate_id in estimate_ids:
            estimate = TeacherCreditEstimationA.objects.get(id=estimate_id)
            estimate_total = estimate.total_kr
            total_time += estimate_total

        return total_time

    def get_spring_kredit(self, obj):
        """ Хавар заасан хичээлийн цаг """

        total_time = 0

        season = Season.objects.filter(season_name__icontains='Хавар').last()

        estimate_ids = TeacherCreditEstimationA.objects.filter(teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=season).values_list('id', flat=True)

        for estimate_id in estimate_ids:
            estimate = TeacherCreditEstimationA.objects.get(id=estimate_id)
            estimate_total = estimate.total_kr
            total_time += estimate_total

        return total_time

    def get_autumn_lesson(self, obj):
        """ Намар заасан хичээлийн тоо """

        season = Season.objects.filter(season_name__icontains='Намар').last()
        count = TeacherCreditEstimationA.objects.filter(teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=season).count()

        return count

    def get_spring_lesson(self, obj):
        """ Хавар заасан хичээлийн тоо """

        season = Season.objects.filter(season_name__icontains='Хавар').last()
        count = TeacherCreditEstimationA.objects.filter(teacher=obj.teacher, lesson_year=obj.lesson_year, lesson_season=season).count()

        return count


class TimeEstimateSettingsListASerializer(serializers.ModelSerializer):

    amount = serializers.SerializerMethodField()
    exec_kr = serializers.SerializerMethodField()

    class Meta:
        model = TimeEstimateSettings
        exclude = ['created_at', 'updated_at']

    def get_amount(self, obj):
        amount = None

        request = self.context.get('request')

        timeestimate = request.query_params.get('timeestimate')

        if timeestimate:
            timeestimate = int(timeestimate)

            qs_chamber = TeacherCreditNotChamberEstimationA.objects.filter(time_estimate_settings=obj.id, timeestimatea=timeestimate).last()

            if qs_chamber:
                amount = qs_chamber.amount

        return amount

    def get_exec_kr(self, obj):
        exec_kr = None

        ratio = obj.ratio
        request = self.context.get('request')

        timeestimate = request.query_params.get('timeestimate')

        if timeestimate:
            timeestimate = int(timeestimate)

            qs_chamber = TeacherCreditNotChamberEstimationA.objects.filter(time_estimate_settings=obj.id, timeestimatea=timeestimate).last()

            if qs_chamber:
                amount = qs_chamber.amount

                exec_kr = amount * ratio

        return exec_kr


class TimeTableSerializer(serializers.ModelSerializer):

    teacher = TeachersSerializer()
    school = SubSchoolListSerailizer()
    datas = serializers.SerializerMethodField()
    lekts = serializers.SerializerMethodField()
    seminar = serializers.SerializerMethodField()
    lab = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable
        fields = '__all__'

    def get_datas(self, obj):
        request = self.context.get('request')
        months = request.query_params.getlist('month')

        year, season = get_active_year_season()

        return_datas = []

        # Coнгогдсон саруудын өгөгдлийг авах
        for month in months:
            prev_month = int(month) - 1
            today = datetime.today()

            this_year = today.strftime("%Y")

            start_day = settings.START_DAY
            if prev_month == 2:
                start_day = 28

            # Тооцоо хийх эхлэх дуусах хугацаа
            start_date = datetime(int(this_year), prev_month, start_day)
            end_date = datetime(int(this_year), int(month), settings.END_DAY)

            delta = end_date - start_date

            for i in range(delta.days + 1):
                between_day = start_date + timedelta(days=i)
                week_day = between_day.isoweekday()

                timetable_values = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=obj.teacher).values('day', 'type', 'lesson').distinct('day', 'type', 'lesson').order_by('day', 'type', 'lesson')

                for timetable in timetable_values:

                    tlesson = timetable.get('lesson')
                    tday = timetable.get('day')
                    ttype = timetable.get('type')

                    # Тухайн сарын өдрүүд багшийн хуваарийн өдрүүдтэй давхцаж байгаа өдрүүдийг олно
                    if tday == week_day:
                        a_tsag_tootsoo = {}

                        # Тухайн өдөр нь хэддүгээр 7 хоног гэдгийг олно
                        week = get_week_num_from_date(between_day.strftime('%Y-%m-%d'))

                        timetable_obj = TimeTable.objects.filter(day=tday, type=ttype, lesson=tlesson).first()

                        # Хичээлийн сэдвийг олно
                        if week:
                            lesson_title_qs = Lesson_title_plan.objects.filter(lesson=tlesson, lesson_type=ttype, week=week).first()

                            lesson_title = lesson_title_qs.title if lesson_title_qs else ''

                            # Тухайн хуваарьт үзэж байгаа анги
                            timetable_group_ids = TimeTable_to_group.objects.filter(timetable=timetable_obj).values_list('group', flat=True)

                            # Хичээл үзэж байгаа ангийн нэрс
                            group_names = Group.objects.filter(id__in=timetable_group_ids).values_list('name', flat=True)

                            # Тухайн хуваарийг үзэж байгаа оюутнууд
                            students_qs = get_lesson_choice_student(tlesson, obj.teacher, '', year, season)

                            # Хичээлийн хуваарьт заавал ирэх ёстой оюутнууд
                            ireh_student_count = len(students_qs)

                            register_count = RegisterIrts.objects.filter(qr__week=week, state=RegisterIrts.STATE_IRSEN, qr__timetable=timetable_obj).count()

                            # A цагийн тооцоо дата бэлдэх хэсэг
                            a_tsag_tootsoo['lesson_title'] = lesson_title
                            a_tsag_tootsoo['day'] = between_day.strftime('%Y-%m-%d')
                            a_tsag_tootsoo['day_time'] = tday
                            a_tsag_tootsoo['lesson_type'] = timetable_obj.get_type_display()
                            a_tsag_tootsoo['lesson'] = timetable_obj.lesson.name
                            a_tsag_tootsoo['time'] = timetable_obj.time
                            a_tsag_tootsoo['group_names'] = ', '.join(group_names)
                            a_tsag_tootsoo['student_count'] = '{ireh}-{irsen}'.format(ireh=ireh_student_count, irsen=register_count)

                            return_datas.append(a_tsag_tootsoo)
        return return_datas

    def get_lekts(self, obj):
        request = self.context.get('request')

        months = request.query_params.getlist('month')

        year, season = get_active_year_season()

        total_lekts = 0

        # Coнгогдсон саруудын өгөгдлийг авах
        for month in months:
            prev_month = int(month) - 1
            today = datetime.today()

            this_year = today.strftime("%Y")

            start_day = settings.START_DAY
            if prev_month == 2:
                start_day = 28

            # Тооцоо хийх эхлэх дуусах хугацаа
            start_date = datetime(int(this_year), prev_month, start_day)
            end_date = datetime(int(this_year), int(month), settings.END_DAY)

            delta = end_date - start_date

            for i in range(delta.days + 1):
                between_day = start_date + timedelta(days=i)
                week_day = between_day.isoweekday()

                ttype = TimeTable.LECT

                timetable_values = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=obj.teacher, type=ttype).values('day', 'lesson').distinct('day', 'lesson').order_by('day', 'lesson')
                days = [item.get('day') for item in timetable_values]
                lessons = [item.get('lesson') for item in timetable_values]

                timetable_obj = TimeTable.objects.filter(type=ttype, lesson__in=lessons)

                # Тухайн өдөр нь хэддүгээр 7 хоног гэдгийг олно
                week = get_week_num_from_date(between_day.strftime('%Y-%m-%d'))

                if week and week_day in days:
                    total_lekts +=1

                    # Тухайн хичээлийн хуваарийн тухайн өдрийн ирцийг авах
                    register_count = RegisterIrts.objects.filter(qr__week=week, state=RegisterIrts.STATE_IRSEN, qr__timetable__in=timetable_obj).count()

                    if register_count == 0:
                        total_lekts -= 1

        return total_lekts

    def get_seminar(self, obj):
        request = self.context.get('request')

        months = request.query_params.getlist('month')

        year, season = get_active_year_season()

        total_seminar = 0

        # Coнгогдсон саруудын өгөгдлийг авах
        for month in months:
            prev_month = int(month) - 1
            today = datetime.today()

            this_year = today.strftime("%Y")

            start_day = settings.START_DAY
            if prev_month == 2:
                start_day = 28

            # Тооцоо хийх эхлэх дуусах хугацаа
            start_date = datetime(int(this_year), prev_month, start_day)
            end_date = datetime(int(this_year), int(month), settings.END_DAY)

            delta = end_date - start_date

            for i in range(delta.days + 1):
                between_day = start_date + timedelta(days=i)
                week_day = between_day.isoweekday()

                ttype = TimeTable.SEM

                timetable_values = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=obj.teacher, type=ttype).values('day', 'lesson').distinct('day', 'lesson').order_by('day', 'lesson')
                days = [item.get('day') for item in timetable_values]
                lessons = [item.get('lesson') for item in timetable_values]

                timetable_obj = TimeTable.objects.filter(type=ttype, lesson__in=lessons)

                # Тухайн өдөр нь хэддүгээр 7 хоног гэдгийг олно
                week = get_week_num_from_date(between_day.strftime('%Y-%m-%d'))

                if week:
                    if week_day in days:
                        total_seminar +=1

                        # Тухайн хичээлийн хуваарийн тухайн өдрийн ирцийг авах
                        register_count = RegisterIrts.objects.filter(qr__week=week, state=RegisterIrts.STATE_IRSEN, qr__timetable__in=timetable_obj).count()

                        if register_count == 0:
                            total_seminar -= 1

        return total_seminar

    def get_lab(self, obj):
        request = self.context.get('request')

        months = request.query_params.getlist('month')

        year, season = get_active_year_season()

        total_lab = 0

        # Coнгогдсон саруудын өгөгдлийг авах
        for month in months:
            prev_month = int(month) - 1
            today = datetime.today()

            this_year = today.strftime("%Y")

            start_day = settings.START_DAY
            if prev_month == 2:
                start_day = 28

            # Тооцоо хийх эхлэх дуусах хугацаа
            start_date = datetime(int(this_year), prev_month, start_day)
            end_date = datetime(int(this_year), int(month), settings.END_DAY)

            delta = end_date - start_date

            for i in range(delta.days + 1):
                between_day = start_date + timedelta(days=i)
                week_day = between_day.isoweekday()

                ttype = TimeTable.LAB

                timetable_values = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=obj.teacher, type=ttype).values('day', 'lesson').distinct('day', 'lesson').order_by('day', 'lesson')
                days = [item.get('day') for item in timetable_values]
                lessons = [item.get('lesson') for item in timetable_values]

                timetable_obj = TimeTable.objects.filter(type=ttype, lesson__in=lessons)

                # Тухайн өдөр нь хэддүгээр 7 хоног гэдгийг олно
                week = get_week_num_from_date(between_day.strftime('%Y-%m-%d'))

                if week and week_day in days:
                    total_lab +=1

                    # Тухайн хичээлийн хуваарийн тухайн өдрийн ирцийг авах
                    register_count = RegisterIrts.objects.filter(qr__week=week, state=RegisterIrts.STATE_IRSEN, qr__timetable__in=timetable_obj).count()

                    # Ирц бүртгэгдээгүй байвал багш хичээлээ ороогүй гэсэн үг
                    if register_count == 0:
                        total_lab -= 1

        return total_lab

class TeacherCreditEstimationAScoreASerializer(serializers.ModelSerializer):

    last_name = serializers.CharField(source="teacher.last_name", default="", read_only=True)
    first_name = serializers.CharField(source="teacher.first_name", default="", read_only=True)
    school_name = serializers.CharField(source="teacher.user.employee.sub_org.name", default="", read_only=True)
    salbar_name = serializers.CharField(source="teacher.user.employee.salbar.name", default="", read_only=True)
    position_name = serializers.CharField(source="teacher.user.employee.org_position.name", default="", read_only=True)

    class Meta:
        model = TeacherCreditEstimationAScore
        exclude = ['created_at', 'updated_at']


class BMainCategorySerializer(serializers.ModelSerializer):

    created_by = serializers.CharField(source='created_by.full_name', default='')

    class Meta:
        model = BMainCategory
        fields = "__all__"

class WMainCategorySerializer(serializers.ModelSerializer):

    created_by = serializers.CharField(source='created_by.full_name', default='')

    class Meta:
        model = WMainCategory
        fields = "__all__"

class GMainCategorySerializer(serializers.ModelSerializer):

    created_by = serializers.CharField(source='created_by.full_name', default='')

    class Meta:
        model = GMainCategory
        fields = "__all__"



class BSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BSubCategory
        fields = "__all__"

class WSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WSubCategory
        fields = "__all__"

class GSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GSubCategory
        fields = "__all__"

class TeacherProfSerializer(serializers.ModelSerializer):
    org_position = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', default='')
    phone_number = serializers.CharField(source='user.phone_number', default='')
    school_name = serializers.CharField(source='salbar.sub_orgs.name', default='')
    school_id = serializers.CharField(source='salbar.sub_orgs.id', default='')
    salbar_name = serializers.CharField(source='salbar.name', default='')
    norm = serializers.SerializerMethodField()
    teacher_rank_type = serializers.SerializerMethodField()
    # ahisan_tuwshin = serializers.SerializerMethodField(read_only=True)

    # total_a_score =  serializers.SerializerMethodField() # Хуримтлагдсан оноо
    # total_a_minus_score = serializers.SerializerMethodField() # Хорогдол оноо
    # total_a_approve_score = serializers.SerializerMethodField() # Батлагдсан оноо

    total_b_score =  serializers.SerializerMethodField() # Хуримтлагдсан оноо
    total_b_minus_score = serializers.SerializerMethodField() # Хорогдол оноо
    total_b_approve_score = serializers.SerializerMethodField() # Батлагдсан оноо

    total_w_score =  serializers.SerializerMethodField() # Хуримтлагдсан оноо
    total_w_minus_score = serializers.SerializerMethodField() # Хорогдол оноо
    total_w_approve_score = serializers.SerializerMethodField() # Батлагдсан оноо

    total_g_score =  serializers.SerializerMethodField() # Хуримтлагдсан оноо
    total_g_minus_score = serializers.SerializerMethodField() # Хорогдол оноо
    total_g_approve_score = serializers.SerializerMethodField() # Батлагдсан оноо

    # total_score =  serializers.SerializerMethodField() # Хуримтлагдсан оноо
    # total_minus_score = serializers.SerializerMethodField() # Хорогдол оноо
    # total_approve_score = serializers.SerializerMethodField() # Батлагдсан оноо

    class Meta:
        model = Teachers
        fields= "__all__"


    def get_total_a_score(self, obj):
        return []
    def get_total_b_score(self, obj):
        result = BTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('score'))
        return result['total'] or 0

    def get_total_b_minus_score(self, obj):
        result = BTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('minus_score'))
        return result['total'] or 0

    def get_total_b_approve_score(self, obj):
        result = BTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('approve_score'))
        return result['total'] or 0

    def get_total_w_score(self, obj):
        result = WTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('score'))
        return result['total'] or 0

    def get_total_w_minus_score(self, obj):
        result = WTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('minus_score'))
        return result['total'] or 0

    def get_total_w_approve_score(self, obj):
        result = WTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('approve_score'))
        return result['total'] or 0

    def get_total_g_score(self, obj):
        result = GTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('score'))
        return result['total'] or 0

    def get_total_g_minus_score(self, obj):
        result = GTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('minus_score'))
        return result['total'] or 0

    def get_total_g_approve_score(self, obj):
        result = GTeacherFiles.objects.filter(teacher=obj.id).aggregate(total=Sum('approve_score'))
        return result['total'] or 0

    def get_teacher_rank_type(self, obj):
        employee = Employee.objects.filter(user=obj.user).first()
        if not employee:
            return None

        rank_dict = dict(Employee.TEACHER_RANK_TYPE)
        return rank_dict.get(employee.teacher_rank_type, "Бүртгэгдээгүй байна")

    def get_org_position(self, obj):
        qs_worker = Employee.objects.filter(user=obj.user, state=Employee.STATE_WORKING).first()
        return qs_worker.org_position.name if qs_worker and qs_worker.org_position else ''

    def get_full_name(self, obj):
        return obj.full_name

    def get_norm(self, obj):
        if not obj.user:
            return 0
        employee = Employee.objects.filter(
            user_id=obj.user.id,
            # state=Employee.STATE_WORKING,
            org_position__is_teacher=True
        ).first()

        teacher_rank_type = employee.teacher_rank_type
        if not employee or not employee.sub_org:
            return 0
        estimates_qs = TimeEstimateSettings.objects.filter(
            teacher_rank_type = teacher_rank_type,
            sub_org = employee.sub_org
        )
        if employee.sub_org.id == 10 or employee.sub_org.id == 21:
            name = 'Багц цагийн журмын дагуу тооцно'
        else:
            name = "Ерөнхий багц цагийн ногдлоор тооцно"

        data = {
            "A_time": 0,
            "B_time": 0,
            "W_time": 0,
            "G_time": 0,
            "total": 0,
            "teacher_rank_type": employee.get_teacher_rank_type_display(),
            "desc": name
        }

        for e in estimates_qs:
            if e.type == TimeEstimateSettings.A_time:
                data["A_time"] = suborg_and_rank_type_calculate(
                    employee.sub_org.name,
                    employee.get_teacher_rank_type_display(),
                    e.ratio
                )
            elif e.type == TimeEstimateSettings.B_time:
                data["B_time"] = e.ratio
            elif e.type == TimeEstimateSettings.W_time:
                data["W_time"] = e.ratio
            elif e.type == TimeEstimateSettings.G_time:
                data["G_time"] = e.ratio

        data["total"] = (
            data["A_time"] +
            data["B_time"] +
            data["W_time"] +
            data["G_time"]
        )

        return data

class TeacherMainSerializer(serializers.ModelSerializer):
    org_position = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', default='')
    phone_number = serializers.CharField(source='user.phone_number', default='')
    school_name = serializers.CharField(source='salbar.sub_orgs.name', default='')
    school_id = serializers.CharField(source='salbar.sub_orgs.id', default='')
    salbar_name = serializers.CharField(source='salbar.name', default='')
    teacher_rank_type = serializers.SerializerMethodField()
    records = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = [
            "org_position",
            "full_name",
            "email",
            "phone_number",
            "school_name",
            "school_id",
            "salbar_name",
            "teacher_rank_type",
            "records",
        ]

    def get_teacher_rank_type(self, obj):
        employee = Employee.objects.filter(user=obj.user).first()
        if not employee:
            return None

        rank_dict = dict(Employee.TEACHER_RANK_TYPE)
        return rank_dict.get(employee.teacher_rank_type, "Бүртгэгдээгүй байна")

    def get_org_position(self, obj):
        qs_worker = Employee.objects.filter(user=obj.user, state=Employee.STATE_WORKING).first()
        return qs_worker.org_position.name if qs_worker and qs_worker.org_position else ''

    def get_full_name(self, obj):
        return obj.full_name

    def get_records(self, obj):
        files = getattr(obj, 'recorded_files', [])

        request = self.context.get('request')
        lesson_year_filter = None
        if request:
            lesson_year_filter = request.query_params.get('lesson_year')

        unique_files = {}
        total_score = 0

        for f in files:
            score = getattr(f, 'approve_score', None)
            if score is None:
                continue

            if lesson_year_filter and getattr(f, 'lesson_year', None) != lesson_year_filter:
                continue

            if f.id in unique_files:
                unique_files[f.id]['approve_score'] += score
            else:
                unique_files[f.id] = {
                    'id': f.category.id,
                    'approve_score': score,
                    'lesson_year': getattr(f, 'lesson_year', None)
                }

            total_score += score

        return {
            'count': len(unique_files),
            'total_score': total_score,
            'items': list(unique_files.values())
        }


class BTeacherFilesSaveSerializer(serializers.ModelSerializer):
    category_data = BSubCategorySerializer(source='category', read_only=True)
    approved_user_name = serializers.SerializerMethodField()

    category = serializers.PrimaryKeyRelatedField(
        queryset=BSubCategory.objects.all(),
        write_only=True
    )

    class Meta:
        model = BTeacherFiles
        fields = "__all__"

    def get_approved_user_name(self, obj):
        return obj.approved_user.full_name if obj.approved_user else None


class BTeacherFilesReadSerializer(serializers.ModelSerializer):
    category_data = BSubCategorySerializer(source='category', read_only=True)
    approved_user_name = serializers.SerializerMethodField()

    category = serializers.PrimaryKeyRelatedField(
        queryset=BSubCategory.objects.all(),
        write_only=True
    )

    file = serializers.SerializerMethodField()

    class Meta:
        model = BTeacherFiles
        fields = "__all__"

    def get_approved_user_name(self, obj):
        return obj.approved_user.full_name if obj.approved_user else None

    def get_file(self, obj):
        if not obj.file:
            return None

        url = filepath_to_uri(obj.file.name)
        teacher_url = url_clean_join(['https://professor.uia.gov.mn/files/', url])

        # to check if file was uploaded from teachers WEB project
        if is_file_url_alive(teacher_url):
            return teacher_url

        return url_clean_join([get_domain_url(), settings.MEDIA_URL, url])


class WTeacherFilesSerializer(serializers.ModelSerializer):
    category_data = WSubCategorySerializer(source='category', read_only=True)
    approved_user_name = serializers.SerializerMethodField()

    category = serializers.PrimaryKeyRelatedField(
        queryset=WSubCategory.objects.all(),
        write_only=True
    )

    class Meta:
        model = WTeacherFiles
        fields = "__all__"

    def get_approved_user_name(self, obj):
        return obj.approved_user.full_name if obj.approved_user else None

class GTeacherFilesSerializer(serializers.ModelSerializer):
    category_data = GSubCategorySerializer(source='category', read_only=True)
    approved_user_name = serializers.SerializerMethodField()

    category = serializers.PrimaryKeyRelatedField(
        queryset=GSubCategory.objects.all(),
        write_only=True
    )

    class Meta:
        model = GTeacherFiles
        fields = "__all__"

    def get_approved_user_name(self, obj):
        return obj.approved_user.full_name if obj.approved_user else None


class TimeTableCreditSerializer(serializers.ModelSerializer):
    lesson = LessonStandartSerializer()
    day_display = serializers.SerializerMethodField()
    time_display = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    odd_even_display = serializers.SerializerMethodField()
    study_type_display = serializers.SerializerMethodField()
    lesson_season = SeasonSerailizer()
    teacher = TeachersSerializer()
    room_name = serializers.CharField(source='room.name', default='')
    room_code = serializers.CharField(source='room.code', default='')
    lesson_season = SeasonSerailizer()

    class Meta:
        model = TimeTable
        fields = "__all__"

    def get_day_display(self, obj):
        return obj.get_day_display()

    def get_time_display(self, obj):
        return obj.get_time_display()

    def get_type_display(self, obj):
        return obj.get_type_display()

    def get_study_type_display(self, obj):
        return obj.get_study_type_display()

    def get_odd_even_display(self, obj):
        return obj.get_odd_even_display()


class TimeTable_GroupCreditSerializer(serializers.ModelSerializer):
    timetable = TimeTableCreditSerializer()
    group = GroupSerializer()
    bodit_tsag = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable_to_group
        fields = "id", "group", "bodit_tsag", "timetable"

    def get_bodit_tsag(self, obj):
        """танхимийн сургалтын үндсэн багц цагийн гүйцэтгэл"""
        togtmol = 0
        # лекц
        if obj.timetable.type == 2:
            if obj.group.degree.degree_code == 'D':
                togtmol = 16
            if obj.group.degree.degree_code == 'E' or obj.group.degree.degree_code == 'F':
                togtmol = 12
        # сем
        if obj.timetable.type == 3:
            if obj.group.degree.degree_code == 'D':
                togtmol = 32
            if obj.group.degree.degree_code == 'E' or obj.group.degree.degree_code == 'F':
                togtmol = 24

        return togtmol


class ItgeltsuurGetSerializer(serializers.ModelSerializer):
    """итгэлцүүр"""

    create_user = serializers.CharField(source='user.username', default='')
    lesson_type = serializers.SerializerMethodField(read_only=True)
    update_user = serializers.CharField(source='user.username', default='')
    degree_type = serializers.SerializerMethodField()
    day_type = serializers.SerializerMethodField()
    student_type = serializers.SerializerMethodField()
    hutul_student_type = serializers.SerializerMethodField()

    class Meta:
        model = Itgeltsuur
        fields = "__all__"


    def get_lesson_type(self, obj):
        return obj.get_lesson_type_display()

    def get_degree_type(self, obj):
        return obj.get_degree_type_display()

    def get_day_type(self, obj):
        return obj.get_day_type_display()

    def get_student_type(self, obj):
        return obj.get_student_type_display()

    def get_hutul_student_type(self, obj):
        return obj.get_hutul_student_type_display()


class ItgeltsuurGetOneListSerializer(serializers.ModelSerializer):
    """итгэлцүүр """

    class Meta:
        model = Itgeltsuur
        fields = "__all__"
class ItgeltsuurPostSerializer(serializers.ModelSerializer):
    """итгэлцүүр"""

    class Meta:
        model = Itgeltsuur
        fields = "__all__"