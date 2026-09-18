from rest_framework import serializers

from apps.timetable.serializers import RoomListSerializer
from core.models import Teachers
from lms.models import IrtsQr, Lesson_title_plan, LessonStandart, RegisterIrts, TimeTable


class LessonStandartSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = '__all__'


class TimetableSerializer(serializers.ModelSerializer):
    room = RoomListSerializer(many=False)
    event_id = serializers.CharField(source='id', default='')
    lesson = LessonStandartSerializer(many=False)
    type = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable
        fields = "__all__"

    def get_type(self, obj):

        type_name = obj.get_type_display()

        return type_name


class TimeTableLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeTable
        fields = ['id', 'name', 'code', 'kredit']

    id = serializers.IntegerField(source='lesson_id', read_only=True)
    name = serializers.CharField(source='lesson.name', read_only=True)
    code = serializers.CharField(source='lesson.code', read_only=True)
    kredit = serializers.FloatField(source='lesson.kredit', read_only=True)


class LessonTitlePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson_title_plan
        fields = ['title', 'lesson_type', 'week', 'lesson', 'id', 'content']


class RegisterIrtsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisterIrts
        fields = ['state', 'student', 'id', 'qr', 'week']

    week = serializers.IntegerField(source='qr.week', read_only=True)


class IrtsQrSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrtsQr
        fields = ['week', 'generate_date', 'lesson', 'season', 'id', 'timetable_time', 'timetable', 'lesson_type']

    lesson = serializers.IntegerField(source='timetable.lesson_id', read_only=True)
    season = serializers.IntegerField(source='timetable.lesson_season_id', read_only=True)
    timetable_time = serializers.IntegerField(source='timetable.time', read_only=True)
    lesson_type = serializers.IntegerField(source='timetable.type', read_only=True)


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teachers
        fields = ['id', 'full_name', 'register_code', 'register']

    register_code = serializers.CharField(source='user.employee.register_code', read_only=True)
