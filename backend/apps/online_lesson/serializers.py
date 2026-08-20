import os
import traceback
import requests
from django.conf import settings
from rest_framework import serializers

from django.db.models import Prefetch, Count, Q

from student.serializers import StudentSimpleListSerializer
from core.serializers import TeachersSerializer
from lms.models import OnlineInfo, OnlineLesson,Challenge, LessonMaterial, OnlineSubInfo, OnlineWeek , Announcement, HomeWork,  HomeWorkStudent, OnlineWeekStudent, QuezChoices, QuezQuestions, Student, WeekMaterialViewers, WeekMaterials, ELearn, ChallengeStudents
from core.models import Teachers, SubOrgs, User

from main.utils.file import split_root_path
from main.utils.function.utils import build_url, get_file_from_cdn, ltrim, safe_get, url_clean_join


class StudentInfoSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', default='')
    online_lesson_review = serializers.SerializerMethodField()
    online_week_datas = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = 'first_name', 'last_name', 'code', 'email', 'group_name', 'register_num', 'id', 'online_lesson_review', 'online_week_datas'

    def get_online_lesson_review(self, obj):
        count_homework = self.context.get('count_homework', 0)
        count_challenge = self.context.get('count_challenge', 0)

        # to_attr-аар авна — list тул len() ашиглана
        study_homework_count = len(obj.filtered_homeworks)
        study_challenge_count = len(obj.filtered_challenges)

        return {
            "count_homework": count_homework,
            "count_challenge": count_challenge,
            "study_homework_count": study_homework_count,
            "study_challenge_count": study_challenge_count,
        }

    def get_online_week_datas(self, obj):
        weeks = self.context.get('weeks', [])
        week_data = WeekMaterials.objects.filter(
            onlineweek__in=weeks
        ).aggregate(
            total_count=Count('id', distinct=True),
            view_count=Count(
                'id',
                distinct=True,
                filter=Q(weekmaterialviewers__student=obj)
            )
        )

        total_count = week_data.get("total_count") or 0
        view_count = week_data.get("view_count") or 0

        return {
            **week_data,
            'percent': round((view_count / total_count * 100), 1) if total_count > 0 else 0,
        }


class StudentSerializer(serializers.ModelSerializer):
	group_name = serializers.CharField(source='group.name', default='')
	class Meta:
		model = Student
		fields = 'first_name', 'last_name', 'image', 'code', 'email', 'group_name', 'register_num', 'id'


class UserRemoteLessonSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = 'first_name', 'last_name', 'code', 'email', 'salbar', 'register_num', 'id'

	code = serializers.SerializerMethodField()
	first_name = serializers.SerializerMethodField()
	last_name = serializers.SerializerMethodField()
	register_num = serializers.SerializerMethodField()
	salbar = serializers.SerializerMethodField()

	def get_code(self, obj):
		return safe_get(obj.employee_set.all().last(), None, 'register_code')

	def get_first_name(self, obj):
		return safe_get(obj.teachers_set.all().last(), None, 'first_name')

	def get_last_name(self, obj):
		return safe_get(obj.teachers_set.all().last(), None, 'last_name')

	def get_register_num(self, obj):
		return safe_get(obj.teachers_set.all().last(), None, 'register')

	def get_salbar(self, obj):
		result = safe_get(obj.employee_set.all().last(), None, 'salbar_id')

		if result:
			return result

		result = safe_get(obj.teachers_set.all().last(), None, 'salbar_id')
		return result


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'


class LectureMaterialSerializer(serializers.ModelSerializer):

    class Meta:
        model = OnlineWeekStudent
        fields = '__all__'


class StudentOnlineWeekSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer()
    viewed = serializers.SerializerMethodField()
    lekts_material = serializers.SerializerMethodField()

    class Meta:
        model = OnlineWeek
        fields = "__all__"

    # Хичээлийг амжилттай үзсэн эсэх
    def get_viewed(self, obj):
        student_id = self.context.get('student_id')

        result = obj.materials.aggregate(
            total_count=Count('id', distinct=True),
            view_count=Count(
                'id',
                distinct=True,
                filter=Q(weekmaterialviewers__student_id=student_id)
            )
        )

        return result


    def get_lekts_material(self, obj):
        student_id = self.context.get('student_id')
        week_obj = OnlineWeekStudent.objects.filter(week=obj, student=student_id).first()

        data = LectureMaterialSerializer(week_obj, many=False).data
        return data


class OnlineLessonStudentSerializer(serializers.ModelSerializer):
    online_week_datas = serializers.SerializerMethodField()
    online_lesson_review = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "id", "online_week_datas", "online_lesson_review"

    def get_online_lesson_review(self, obj):
        online_lesson_id = self.context.get('online_lesson_id')
        queryset = OnlineLesson.objects.get(id=online_lesson_id)
        weeks = queryset.weeks.all()

        # Нийт даалгаврын тоо
        count_homework = HomeWork.objects.filter(onlineweek__in=weeks).distinct().count()

        # Нийт шалгалтын тоо
        count_challenge = Challenge.objects.filter(onlineweek__in=weeks).distinct().count()

        # Оюутны хийсэн даалгаврын тоо
        study_homework_count = HomeWorkStudent.objects.filter(homework__onlineweek__in=weeks, student=obj).distinct().count()

        # Оюутны өгсөн шалгалтын тоо
        study_challenge_count = ChallengeStudents.objects.filter(challenge__onlineweek__in=weeks, student=obj).distinct().count()

        return {
            "count_homework": count_homework,
            "count_challenge": count_challenge,
            "study_homework_count": study_homework_count,
            "study_challenge_count": study_challenge_count,
        }

    def get_online_week_datas(self, obj):
        """ Хичээл үүссэн 7 хоног """
        online_lesson_id = self.context.get('online_lesson_id')

        queryset = OnlineLesson.objects.prefetch_related(
            Prefetch('weeks', queryset=OnlineWeek.objects.prefetch_related(
                Prefetch('materials', queryset=WeekMaterials.objects.prefetch_related(
                    Prefetch('weekmaterialviewers_set', queryset=WeekMaterialViewers.objects.filter(
                        student=obj.id
                    ))
                ))
            ).order_by('week_number'))
        ).get(id=online_lesson_id)

        weeks = queryset.weeks.all()
        serializer = StudentOnlineWeekSerializer(weeks, many=True, context={'student_id': obj.id})

        return serializer.data


class OnlineLessonSerializer(serializers.ModelSerializer):
    lesson_name = serializers.SerializerMethodField()
    lesson_code = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    total_homeworks_and_exams = serializers.SerializerMethodField()
    student_data = StudentSerializer(source='students', many=True, read_only=True)
    teacher = TeachersSerializer(read_only=True)

    class Meta:
        model = OnlineLesson
        fields = '__all__'

    def get_lesson_name(self, obj):
        return obj.lesson.name if obj.lesson_id else ''

    def get_lesson_code(self, obj):
        return obj.lesson.code  if obj.lesson_id else ''

    def get_student_count(self, obj):
        return obj.students.count()

    def get_total_homeworks_and_exams(self, obj):
        homework_count = 0
        challenge_count = 0
        week_count = obj.weeks.count()
        for week in obj.weeks.all():
            if week.homework:
                homework_count += 1
            if week.challenge:
                challenge_count += 1

        return {
            'homework_count': homework_count,
            'challenge_count': challenge_count,
            'week_count': week_count
        }



class LessonMaterialDataSerializer(serializers.ModelSerializer):
    file_path = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = '__all__'

    def get_file_path(self, obj):
        full_path = ''

        if obj.path:
            # if prefix already exists remove it to avoid duplicated prefixes
            path = obj.path.name
            path = ltrim(path, settings.CDN_MAIN_FOLDER)
            path = ltrim(path, settings.HOMEWORK)

            full_path = settings.CDN_MAIN_FOLDER + settings.ASSIGNMENT + obj.path.name

        return build_url(full_path)


class WeekMaterialsSerializer(serializers.ModelSerializer):
    material = LessonMaterialDataSerializer(read_only=True)

    class Meta:
        model = WeekMaterials
        fields = '__all__'


class OnlineWeekSerializer(serializers.ModelSerializer):
    # lekts_path = serializers.SerializerMethodField()
    material_data = WeekMaterialsSerializer(source='materials', many=True, read_only=True)
    class Meta:
        model = OnlineWeek
        fields = '__all__'

    # def get_lekts_path(self, obj):
    #     full_path = ''
    #     path = obj.lekts_file

    #     if path:
    #         full_path = settings.ASSIGNMENT + str(path)
    #         cdn_data = {}
    #         try:
    #             cdn_data = get_file_from_cdn(full_path)
    #         except Exception as e:
    #             print(e)

    #         if cdn_data.get('success'):
    #             full_path = settings.CDN_FILE_URL + full_path

    #     return full_path

class LessonMaterialSerializer(serializers.ModelSerializer):
    school_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    salbar = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = ["id","user","school_name","salbar","full_name","file"]

    def get_school_name(self, obj):
        if obj.user:
            school_name = Teachers.objects.filter(user=obj.user.id).first()
            if school_name and school_name.sub_org:
                return school_name.sub_org.name
        return None

    def get_salbar(self,obj):
        if obj.user:
            salbar = Teachers.objects.filter(user=obj.user.id).first()
            if salbar and salbar.salbar:
                return salbar.salbar.name
        return None

    def get_full_name(self, obj):
        if obj.user.full_name:
            return obj.user.full_name
        return None

    def get_file(self, obj):
        data = []
        request = self.context.get('request')
        material_type = request.query_params.get('type')

        cdn_connection_alive = self.context.get('cdn_connection_alive', True)
        skip_cdn = self.context.get('skip_cdn', False)

        if material_type:
            queryset = LessonMaterial.objects.filter(user=obj.user, material_type=material_type).values('id', 'path', 'created_at')

            if skip_cdn:
                return {
                    'material_type': material_type,
                    'count': queryset.count(),
                    'files': []
                }

            files_info = []
            for item in queryset:
                file_path = item['path']
                full_path = settings.ASSIGNMENT + str(file_path)
                cdn_data = {}

                if cdn_connection_alive:
                    try:
                        cdn_data = get_file_from_cdn(full_path)
                    except Exception as e:
                        print(e)
                        cdn_connection_alive = False
                        self.context['cdn_connection_alive'] = False

                if cdn_data.get('success'):
                    file_path = settings.CDN_FILE_URL + full_path

                    try:

                        # File-ийн хэмжээ авах requests
                        response = requests.head(file_path, timeout=3)
                        if response.status_code == 200:
                            file_size = response.headers.get('content-length')

                            item_data = {
                                'id': item['id'],
                                'path': file_path,
                                'created_at': item['created_at'],
                                'size': file_size
                            }
                            files_info.append(item_data)
                        else:

                            files_info.append({
                                'id': item['id'],
                                'path': file_path,
                                'created_at': item['created_at'],
                                'size': None
                            })
                    except requests.exceptions.RequestException as e:
                        # Handle request exception
                        files_info.append({
                            'id': item['id'],
                            'path': file_path,
                            'created_at': item['created_at'],
                            'size': None
                        })
                else:
                    files_info.append({
                        'id': item['id'],
                        'path': file_path,
                        'created_at': item['created_at'],
                        'size': None
                    })

            return {
                'material_type': material_type,
                'count': len(files_info),
                'files': files_info
            }
        else:
            for material_type in range(1, 5):
                queryset = LessonMaterial.objects.filter(user=obj.user, material_type=material_type).values('id', 'path', 'created_at')

                if skip_cdn:
                    data.append({
                        'material_type': material_type,
                        'count': queryset.count(),
                        'files': []
                    })
                    continue

                files_info = []
                for item in queryset:
                    file_path = item['path']
                    full_path = settings.ASSIGNMENT + str(file_path)
                    cdn_data = {}

                    if cdn_connection_alive:
                        try:
                            cdn_data = get_file_from_cdn(full_path)
                        except Exception as e:
                            print(e)
                            cdn_connection_alive = False

                    if cdn_data.get('success'):
                        success_data = cdn_data.get('data')
                        full_path = settings.ASSIGNMENT + str(file_path)

                        try:

                            # File-ийн хэмжээ авах requests
                            response = requests.head(file_path, timeout=3)
                            if response.status_code == 200:
                                file_size = response.headers.get('content-length')

                                item_data = {
                                    'id': item['id'],
                                    'path': file_path,
                                    'created_at': item['created_at'],
                                    'size': file_size
                                }
                                files_info.append(item_data)
                            else:

                                files_info.append({
                                    'id': item['id'],
                                    'path': file_path,
                                    'created_at': item['created_at'],
                                    'size': None
                                })
                        except requests.exceptions.RequestException as e:
                            # Handle request exception
                            files_info.append({
                                'id': item['id'],
                                'path': file_path,
                                'created_at': item['created_at'],
                                'size': None
                            })
                    else:
                        files_info.append({
                            'id': item['id'],
                            'path': file_path,
                            'created_at': item['created_at'],
                            'size': None
                        })

                data.append({
                    'material_type': material_type,
                    'count': len(files_info),
                    'files': files_info
                })

        return data


class LessonMaterialPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonMaterial
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = '__all__'

    def get_full_name(self, obj):

        if obj.created_user:
            return obj.created_user.full_name
        return None


class HomeWorkSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = HomeWork
        fields = '__all__'

    def get_file(self, obj):
        full_path = None

        if obj.file:
            path = split_root_path(obj.file.path)
            path = os.path.join(settings.HOMEWORK, path)

            cdn_data = get_file_from_cdn(path)

            if cdn_data.get('success'):
                full_path = settings.CDN_FILE_URL + path


        return full_path


class StudentDataSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'

    def get_fullName(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class HomeWorkStudentSerializer(serializers.ModelSerializer):
    homework = HomeWorkSerializer()
    send_file = serializers.SerializerMethodField()
    student = StudentDataSerializer()

    class Meta:
        model = HomeWorkStudent
        fields = ['id','homework','status', 'score', 'score_comment', 'send_file', 'description', 'student']

    def get_send_file(self,obj):
        return settings.CDN_FILE_URL+str(obj.send_file)


class LectureStudentSerializer(serializers.ModelSerializer):
    student = StudentSimpleListSerializer()
    week = OnlineWeekSerializer()
    send_file = serializers.SerializerMethodField()
    class Meta:
        model = OnlineWeekStudent
        fields = '__all__'

    def get_send_file(self,obj):
        return settings.CDN_FILE_URL + str(obj.lekts_file)


class SubOrgSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = ['name']

class TeacherSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    sub_org = SubOrgSerializer(read_only=True)

    class Meta:
        model = Teachers
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.full_name

class ELearnSerializer(serializers.ModelSerializer):

    teacher_info = TeacherSerializer(source='teacher', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ELearn
        fields = "__all__"

    def get_image(self, obj):
        url = obj.image.name if obj.image else None
        return build_url(url)


class OnlineInfoSerializer(serializers.ModelSerializer):

    related_info_name = serializers.CharField(source='related_info.title', default='')

    class Meta:
        model = OnlineInfo
        fields = "__all__"


class OnlineSubInfoSerializer(serializers.ModelSerializer):

    quezquestions_count = serializers.SerializerMethodField()
    file_type_name = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    class Meta:
        model = OnlineSubInfo
        fields = "__all__"

    def get_quezquestions_count(self, obj):
        result = obj.quiz.count()
        return result

    def get_file_type_name(self, obj):
        file_type_name = obj.get_file_type_display()
        return file_type_name

    def get_file(self, obj):
        url = obj.file.name if obj.file else None
        return build_url(url)


class QuezQuestionsSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()
    kind_name = serializers.SerializerMethodField()

    class Meta:
        model = QuezQuestions
        fields = "__all__"

    def get_image(self, obj):
        url = obj.image.name if obj.image else None
        return build_url(url)

    def get_kind_name(self, obj):
        kind_name = obj.get_kind_display()
        return kind_name


class QuezChoicesSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()
    quez_question_id = serializers.IntegerField(required=False)

    class Meta:
        model = QuezChoices
        fields = "__all__"

    def get_image(self, obj):
        url = obj.image.name if obj.image else None
        return build_url(url)


class GroupLessonProgressSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'code', 'lessons']

    def get_lessons(self, student):
        result = []

        for lesson in getattr(student, 'enrolled_lessons', []):
            # Тухайн хичээлийн бүх материалын ID-г цуглуул
            lesson_material_ids = set()
            for week in getattr(lesson, 'all_weeks', []):
                for mat in getattr(week, 'all_materials', []):
                    lesson_material_ids.add(mat.id)

            # Оюутны үзсэн материалуудаас тухайн хичээлийнхийг шүүх
            viewed_ids = {
                v.week_material_id
                for v in getattr(student, 'filtered_views', [])
                if v.week_material_id in lesson_material_ids
            }

            total = len(lesson_material_ids)
            viewed = len(viewed_ids)

            result.append({
                'lesson_id': lesson.id,
                'lesson_name': lesson.lesson.name if hasattr(lesson, 'lesson') else '',
                'lesson_code': lesson.lesson.code if hasattr(lesson, 'lesson') else '',
                'kredit': lesson.lesson.kredit if hasattr(lesson, 'lesson') else 0,
                'total_count': total,
                'view_count': viewed,
                'percent': round((viewed / total * 100), 1) if total > 0 else 0,
            })

        return result
