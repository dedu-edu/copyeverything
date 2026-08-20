from django.db.models import Sum, F
from rest_framework import serializers

from lms.models import Lesson_teacher_scoretype, ScoreRegister, TeacherScore
from lms.models import Student
from lms.models import Teachers
from lms.models import Score
from lms.models import Exam_repeat
from lms.models import LessonStandart
from lms.models import Group, AddScoreRegister
from core.models import SubOrgs

from surgalt.serializers import LessonStandartSerialzier
from settings.serializers import ScoreSerailizer
from student.serializers import StudentListSerializer
from main.utils.function.utils import fix_format_date



# ---------------- Дүйцүүлсэн дүн ----------------

class CorrespondSerailizer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        fields = "__all__"

# Улирлын дүн
class ScoreRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        fields = "__all__"


# Дүнгийн бүртгэлийн жагсаалт
class ScoreRegisterListSerializer(serializers.ModelSerializer):

    student = StudentListSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = ScoreRegister
        fields = "__all__"

    def get_total_score(self, obj):
        return obj.score_total


# Дүйцүүлсэн дүнгийн жагсаалт
class CorrespondListSerailizer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    lesson = LessonStandartSerialzier(many=False)

    class Meta:
        model = ScoreRegister
        fields = "id", "student","lesson", "teach_score", "exam_score", "assessment", "status", "lesson_year", "lesson_season", "school"


# Дахин шалгалтын дүн
class ReScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        # fields = "__all__"
        fields = "id", "student"

# Дахин шалгалтын дүнгийн жагсаалт
class ReScoreListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    lesson = LessonStandartSerialzier(many=False)
    score = serializers.SerializerMethodField(read_only=True)
    before_score = serializers.SerializerMethodField(read_only=True)
    status_name = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Exam_repeat
        fields = "id", "student", "lesson", "status", "lesson_year", "lesson_season", "school", "score", "before_score", "status_name"

    def get_score(self, obj):

        obj_status=int(obj.status) + 4
        score_list = ScoreRegister.objects.filter(status=obj_status, lesson=obj.lesson, student=obj.student,lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values().last()
        teach_score = 0
        exam_score = 0
        add_score = 0
        if score_list:
            if score_list['teach_score']:
                teach_score = score_list['teach_score']
            if score_list['exam_score']:
                exam_score = score_list['exam_score']
            if score_list['add_score']:
                add_score = score_list['add_score']
            score_list['total_score'] = teach_score + exam_score + add_score
            total_score = round((teach_score + exam_score + add_score), 2)
            assess = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).values('assesment').first()
            if assess:
                score_list['assessment'] = assess['assesment']

        return score_list

    def get_before_score(self, obj):

        score_list = ScoreRegister.objects.filter(lesson=obj.lesson, student=obj.student).exclude(lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values().last()

        return score_list
    def get_status_name(self, obj):

        name = obj.get_status_display()

        return name


class StudentScoreListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    teach_score = serializers.SerializerMethodField()
    exam_score = serializers.SerializerMethodField()
    lesson = serializers.SerializerMethodField()
    assessment = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = 'id', "code", 'full_name', 'teach_score', 'lesson_name', 'lesson', 'exam_score', 'assessment'

    def get_full_name(self, obj):

        return obj.full_name

    def get_lesson_name(self, obj):

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        lesson_obj = LessonStandart.objects.filter(id=lesson).first()

        lesson_name = lesson_obj.code_name if lesson_obj else ''

        return lesson_name

    def get_lesson(self, obj):

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        if lesson:
            lesson = int(lesson)

        return lesson

    def get_teach_score(self, obj):
        student = obj.id
        score = ''

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        teacher = request.query_params.get('teacher')

        if teacher:
            teacher = Teachers.objects.filter(id=teacher).first()

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson, teacher=teacher).last()

        if score_obj:
            score = score_obj.teach_score

        return score

    def get_exam_score(self, obj):

        score = ''
        student = obj.id

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson).last()

        if score_obj:
            score = score_obj.exam_score

        return score

    def get_assessment(self, obj):
        student = obj.id

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson).last()

        assessment = score_obj.assessment.assesment if score_obj else ''

        return assessment

" ---------------------- Дүн хэвлэх ---------------------------"
class StudentSerializer(serializers.ModelSerializer):
    " Оюутан "
    stud_group_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "code", "register_num", "last_name", "first_name", "group","stud_group_info"]

    def get_stud_group_info(self, obj):
        "анги, мэргэжил, цол"

        data =[]
        group_id = obj.group.id
        group_obj = Group.objects.filter(id=group_id).first()
        prof_name = group_obj.profession.name
        level = group_obj.level
        degree_name = group_obj.degree.degree_name
        data ={
            'prof_name':prof_name,
            'degree_name':degree_name,
            'level':level
        }
        return data



class LessonStandartSerializer(serializers.ModelSerializer):
    "Хичээл"

    class Meta:
        model = LessonStandart
        fields =[ "id", "code", "name", "kredit"]

class SubSchoolsSerializer(serializers.ModelSerializer):
    "Сургууль"

    class Meta:
        model = SubOrgs
        fields = ["name"]

class TeachersSerializer(serializers.ModelSerializer):
    "Багш"

    class Meta:
        model = Teachers
        fields = ["full_name"]

class ScoreSerializer(serializers.ModelSerializer):
    "Дүн"

    class Meta:
        model = Score
        fields = "__all__"

# дүн хэвлэх
class ScoreRegisterPrintSerializer(serializers.ModelSerializer):
    student = StudentSerializer(many=False)
    lesson = LessonStandartSerializer(many=False)
    teacher = TeachersSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    # school = serializers.CharField(source='subschools__name', default='')

    class Meta:
        model = ScoreRegister
        fields = "__all__"


class TeacherScoreSerializer(serializers.ModelSerializer):
    student_code = serializers.CharField(read_only=True)
    group_name = serializers.CharField(read_only=True)

    class Meta:
        model = TeacherScore
        fields = "student_code", "group_name", 'updated_at'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        assessment = None

        teacher_score_qs = TeacherScore.objects.filter(student=instance.student, score_type__lesson_teacher__lesson=instance.score_type.lesson_teacher.lesson)

        teacher_score = teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.BUSAD).aggregate(total=Sum('score')).get('total') or 0
        exam_score = teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        total_score = teacher_score + exam_score
        if not exam_score:
            assessment = 'W'
        if teacher_score < 42:
            assessment = 'WF'
        elif exam_score < 18:
            assessment = 'W'
        else:
            assess = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).values('assesment').first()
            assessment = assess['assesment'] if assess else ''

        data['assessment'] = assessment
        data['total_score'] = round(total_score)
        data['student_full_name'] = instance.student.full_name
        data['teach_score'] = round(teacher_score, 1)
        data['exam_score'] = round(exam_score, 1)
        data['teacher_name'] = instance.score_type.lesson_teacher.teacher.full_name

        return data


class TeacherScoreListPrintSerializer(serializers.ModelSerializer):
    lesson_kredit = serializers.FloatField(read_only=True)
    teacher_name = serializers.CharField(read_only=True)
    teacher_org_position = serializers.CharField(read_only=True)
    teacher_score_updated_at = serializers.DateTimeField(read_only=True)
    group = serializers.CharField(source="student.group_id", default="", read_only=True)

    class Meta:
        model = TeacherScore
        fields = 'id', 'student', 'score', 'lesson_year', 'teacher_name', 'teacher_org_position', 'teacher_score_updated_at', 'group', "lesson_kredit"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        teacher_score_qs = TeacherScore.objects.filter(
            student=instance.student,
            lesson_year=instance.lesson_year,
            lesson_season=instance.lesson_season,
            score_type__lesson_teacher__lesson=instance.score_type.lesson_teacher.lesson,
        )
        other_teacher_score_obj = teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.BUSAD).order_by(F('score').desc(nulls_last=True)).first()
        exam_teacher_score_obj = teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).order_by(F('score').desc(nulls_last=True)).first()

        teacher_score = other_teacher_score_obj.score or 0 if other_teacher_score_obj else 0
        teacher_name = other_teacher_score_obj.score_type.lesson_teacher.teacher.full_name or 0 if other_teacher_score_obj and other_teacher_score_obj.score_type_id else 0
        exam_score = exam_teacher_score_obj.score or 0 if exam_teacher_score_obj else 0
        total_score = teacher_score + exam_score

        if not exam_score:
            grade_letter = 'W'
        else:
            # Үсгэн үнэлгээ авсан бол
            if other_teacher_score_obj and other_teacher_score_obj.grade_letter and teacher_score < 60:
                grade_letter = other_teacher_score_obj.grade_letter.letter or ''
            else:
                if teacher_score < 42:
                    grade_letter = 'WF'
                elif exam_score < 18:
                    grade_letter = 'W'
                else:
                    assess = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).values('assesment').first()
                    grade_letter = assess['assesment'] if assess else ''

        lesson_obj = instance.score_type.lesson_teacher.lesson if instance.score_type and instance.score_type.lesson_teacher else None

        if teacher_score and teacher_score < 42:
            total_score = 0
        elif exam_score and exam_score < 18:
            total_score = 0

        confirm_score_qs = TeacherScore.objects.filter(
            student=instance.student,
            score_type__lesson_teacher__lesson=instance.score_type.lesson_teacher.lesson,
            lesson_year=instance.lesson_year,
            lesson_season=instance.lesson_season,
            score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
        )

        confirm_quiz_score_qs = TeacherScore.objects.filter(
            student=instance.student,
            score_type__lesson_teacher__lesson=instance.score_type.lesson_teacher.lesson,
            lesson_year=instance.lesson_year,
            lesson_season=instance.lesson_season,
            score_type__score_type=Lesson_teacher_scoretype.BUSAD,
        )

        student_confirm_qs = TeacherScore.objects.filter(
            student=instance.student,
            score_type__lesson_teacher__lesson=instance.score_type.lesson_teacher.lesson,
            lesson_year=instance.lesson_year,
            lesson_season=instance.lesson_season,
            score_type__score_type__in=[
                Lesson_teacher_scoretype.BUSAD,
                Lesson_teacher_scoretype.SHALGALT_ONOO,
            ],
            score__isnull=False,
        )

        student_confirm_date = None
        teacher_quiz_score_confirm_date = None
        teacher_exam_score_confirm_date = None

        if student_confirm_qs.exists() and not student_confirm_qs.exclude(is_confirm_student=True).exists():
            confirm_score_obj = student_confirm_qs.order_by('-confirm_date_student').first()
            student_confirm_date = confirm_score_obj.confirm_date_student if confirm_score_obj else None

        if confirm_quiz_score_qs.exists() and not confirm_quiz_score_qs.exclude(is_confirm_teacher=True).exists():
            confirm_quiz_score_obj = confirm_quiz_score_qs.order_by('-confirm_date_teacher').first()
            teacher_quiz_score_confirm_date = confirm_quiz_score_obj.confirm_date_teacher if confirm_quiz_score_obj else None

        if confirm_score_qs.exists() and not confirm_score_qs.exclude(is_confirm_teacher=True).exists():
            confirm_score_obj = confirm_score_qs.order_by('-confirm_date_teacher').first()
            teacher_exam_score_confirm_date = confirm_score_obj.confirm_date_teacher if confirm_score_obj else None

        data['code'] = instance.student.code
        data['total'] = round(total_score, 2)
        data['lesson_name'] = lesson_obj.code_name if lesson_obj else None
        data['exam_committee'] = self.context.get('exam_committee', [])
        data['score_type'] = instance.score_type.score_type
        data['lesson_season'] = instance.lesson_season.season_name
        data['is_exam'] = teacher_score_qs.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).exists()
        data['full_name'] = instance.student.full_name
        data['teacher_score'] = round(teacher_score, 2)
        data['exam_score'] = round(exam_score, 2)
        data['grade_letter'] = grade_letter
        data['teacher_name'] = teacher_name
        data['student_confirm_date'] = student_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if student_confirm_date else None
        data['teacher_quiz_score_confirm_date'] = teacher_quiz_score_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if teacher_quiz_score_confirm_date else None
        data['teacher_exam_score_confirm_date'] = teacher_exam_score_confirm_date.strftime('%Y-%m-%d %H:%M:%S') if teacher_exam_score_confirm_date else None
        return data


class AddScoreRegisterSerializer(serializers.ModelSerializer):
    updated_at = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    createuser_name = serializers.SerializerMethodField()
    # updateuser_name = serializers.SerializerMethodField()
    lesson = LessonStandartSerialzier(many=False)
    student_code = serializers.CharField(source="student.code", default="")
    season_name = serializers.CharField(source="lesson_season.season_name", default="")

    class Meta:
        model = AddScoreRegister
        fields = "__all__"

    def get_updated_at(self, obj):

        fixed_date = fix_format_date(obj.updated_at, format='%Y-%m-%d')
        return fixed_date

    def get_student_name(self, obj):

        return obj.student.full_name

    def get_createuser_name(self, obj):
        return obj.created_user.full_name

    # def get_updateuser_name(self, obj):
    #     return obj.updated_user.full_name
class AddScoreRegisterPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddScoreRegister
        fields = "__all__"
