from rest_framework import serializers

from lms.models import Student
from lms.models import TimeTable
from lms.models import LessonStandart
from lms.models import Lesson_to_teacher
from lms.models import PermissionsTeacherScore
from lms.models import PermissionsOtherInterval
from lms.models import PermissionsStudentChoice
from lms.models import Lesson_teacher_scoretype
from lms.models import Crontab

from request.serializers import TeacherSerializer
from request.serializers import StudentSerializer
from main.utils.function.utils import fix_format_date, json_load

# --------------- Зөвхөн 1 багшийн дүн оруулах хандах эрх -----------------------

class PermissionsTeacherScoreSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах эрх шинээр үүсгэх serializer"

    def validate(self, attrs):
        teacher_scoretype = attrs.get(
            "teacher_scoretype",
            getattr(self.instance, "teacher_scoretype", None),
        )
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        finish_date = attrs.get("finish_date", getattr(self.instance, "finish_date", None))

        if not teacher_scoretype:
            raise serializers.ValidationError({"teacher_scoretype": "Дүгнэх хэлбэр сонгоно уу."})

        # Багшийн эрхийг зөвхөн үндсэн хоёр дүнгийн төрөл дээр нээнэ.
        # Явцын доторх жижиг задаргаанууд нь Явцын оноо (6)-ны эрхийг дагаж ажиллана.
        allowed_score_types = (
            Lesson_teacher_scoretype.BUSAD,
            Lesson_teacher_scoretype.SHALGALT_ONOO,
        )
        if teacher_scoretype.score_type not in allowed_score_types:
            raise serializers.ValidationError({
                "teacher_scoretype": "Зөвхөн Явцын оноо эсвэл Шалгалтын онооны эрх нээх боломжтой."
            })

        # Дүнгийн задаргаанд оноо тохируулаагүй төрлөөр эрх нээж болохгүй. Дүнгийн задаргаанд оноо тохируулаагүй бол багшийн дүн оруулах эрх нээх боломжгүй.
        if teacher_scoretype.score is None or teacher_scoretype.score <= 0:
            raise serializers.ValidationError({
                "teacher_scoretype": "Багш эхлээд хичээлийн дүнгийн задаргааны оноог тохируулсан байна."
            })

        if not start_date or not finish_date:
            raise serializers.ValidationError({"start_date": "Эхлэх болон дуусах хугацаа оруулна уу."})

        if start_date == finish_date:
            raise serializers.ValidationError({
                "finish_date": "Эхлэх болон дуусах хугацаа ижил байж болохгүй."
            })

        if start_date > finish_date:
            raise serializers.ValidationError({
                "finish_date": "Дуусах хугацаа эхлэх хугацаанаас хойш байх ёстой."
            })

        return attrs

    class Meta:
        model = PermissionsTeacherScore
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):
    " Хичээлийн жагсаалт "

    class Meta:
        model = LessonStandart
        fields = ["id", "code", "name"]

class Lesson_to_teacherSerializer(serializers.ModelSerializer):
    " Хичээл , багш жагсаалт"

    teacher = TeacherSerializer(many=False)
    lesson = LessonSerializer(many=False)

    class Meta:
        model = Lesson_to_teacher
        fields = "__all__"


class Lesson_to_TeacherSerializer(serializers.ModelSerializer):
    "Тухайн хичээлийн хуваарьт байгаа багш ,хичээл хамаарах дүгнэх хэлбэрүүдийг авах жагсаалт "

    lesson_teacher = Lesson_to_teacherSerializer(many=False)
    score_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Lesson_teacher_scoretype
        fields = "__all__"

    def get_score_type_name(self, obj):
        """ Багшийн дүгнэх хэлбэрийн нэр авах """

        score_type_name = obj.get_score_type_display()
        return score_type_name


class PermissionsTeacherScoreListSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах хандах эрхийг харуулах жагсаалт "

    teacher_scoretype = Lesson_to_TeacherSerializer(many=False)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsTeacherScore
        fields = "__all__"


    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


class TimetableSerializer(serializers.ModelSerializer):
    " Хичээлийн хуваарьт байгаа багшийн жагсаалт "
    teacher = TeacherSerializer(many=False)

    class Meta:
        model = TimeTable
        fields = "__all__"


class LessonStandartSerializer(serializers.ModelSerializer):
    " Хичээлийн хуваарьт байгаа багшийн заах хичээлийн жагсаалт "

    class Meta:
        model = LessonStandart
        fields = "id", "code_name"


class Lesson_teacher_scoretypeSerializer(serializers.ModelSerializer):
    " Багшийн заах хичээлүүдээс хамаарч зөвхөн дүгнэх хэлбэрийг харуулах жагсаалт "

    score_type_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson_teacher_scoretype
        fields = "__all__"

    def get_score_type_name(self, obj):
        """ Багшийн дүгнэх хэлбэрийн нэр авах """

        score_type_name = obj.get_score_type_display()
        return score_type_name


# --------------------- Бусад хандах эрх -----------------

class PermissionsOtherIntervalSerializer(serializers.ModelSerializer):
    "Бусад хандах эрх post put үйлдэл ашиглах serializer "


    class Meta:
        model = PermissionsOtherInterval
        fields = "__all__"

    def validate(self, attrs):
        """Системийн хугацаа бодитоор ашиглагдах зөв дараалалтай эсэхийг шалгана."""
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        finish_date = attrs.get("finish_date", getattr(self.instance, "finish_date", None))
        if start_date and finish_date and finish_date <= start_date:
            raise serializers.ValidationError({
                "finish_date": "Дуусах хугацаа эхлэх хугацаанаас хойш байх ёстой."
            })
        return attrs


class PermissionsOtherIntervaTypeSerializer(serializers.ModelSerializer):
    " хандах эрхийн нэр авах "

    class Meta:
        model = PermissionsOtherInterval
        fields = ["id", "permission_type", "lesson_year", "lesson_season"]


class PermissionsOtherIntervalListSerializer(serializers.ModelSerializer):
    " Бусад хандах эрх жагсаалт "

    permission_type_name = serializers.SerializerMethodField(read_only=True)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsOtherInterval
        fields = "id", "permission_type", "lesson_year", "lesson_season","start_date", "finish_date", "permission_type_name"

    def get_permission_type_name(self, obj):
        """ хандах эрхийн нэр авах """

        permission_type_names = obj.get_permission_type_display()
        return permission_type_names

    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


#-----------------------Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх------------------

class PermissionsStudentChoiceSerializer(serializers.ModelSerializer):
    " Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх жагсаалт "
    # student = StudentSerializer(many=False)


    class Meta:
        model = PermissionsStudentChoice
        fields = "__all__"


class PermissionsStudentChoiceListSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах хандах эрхийг харуулах жагсаалт "

    student = StudentSerializer(many=False)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsStudentChoice
        fields = "__all__"

    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


class PermissionsStudentSerializer(serializers.ModelSerializer):
    " Оюутны жагсаалт "

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "code", "full_name"]

    def get_full_name(self, obj):
        " Оюутны нэр хамт "
        code_and_name = ""

        full_name = obj.full_name
        code = obj.code
        code_and_name = code + " " + full_name

        return code_and_name


class CrontabSerializer(serializers.ModelSerializer):
    ctiming = serializers.SerializerMethodField()

    class Meta:
        model = Crontab
        fields = '__all__'

    def get_ctiming(self, obj):

        timing = json_load(obj.timing)

        return timing
