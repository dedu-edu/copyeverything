import json
import os
import traceback
from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from main.utils.function.pagination import CustomPagination
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import F, Q, Exists, OuterRef, Prefetch, Count

from lms.models import (
    Group, LessonStandart, OnlineInfo, OnlineLesson, LessonMaterial, OnlineWeek, Announcement, HomeWork ,
    HomeWorkStudent, Challenge, Student, OnlineWeekStudent, ELearn, OnlineSubInfo, QuezQuestions, QuezChoices,
    WeekMaterials, ChallengeStudents, WeekMaterialViewers,
)
from .serializers import (
    UserRemoteLessonSerializer,
    OnlineInfoSerializer,
    OnlineLessonSerializer,
    LessonMaterialSerializer,
    OnlineSubInfoSerializer,
    OnlineWeekSerializer,
    AnnouncementSerializer,
    HomeWorkSerializer,
    HomeWorkStudentSerializer,
    LectureStudentSerializer,
    QuezChoicesSerializer,
    QuezQuestionsSerializer,
    StudentSerializer,
    ELearnSerializer,
    StudentInfoSerializer,
    GroupLessonProgressSerializer,
    OnlineLessonStudentSerializer,
)

from core.models import (
    Employee,
    Teachers,
    User
)

from main.utils.file import split_root_path
from main.utils.function.utils import create_file_to_cdn, has_permission, is_url, remove_file_from_cdn, get_file_from_cdn, remove_from_cdn_ignore_not_found_error, str2bool

@permission_classes([IsAuthenticated])
class OnlineLessonListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing and creating online lessons '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name']


    def get(self, request, *args, **kwargs):
        school = request.GET.get('school')
        dep_id = request.GET.get('dep_id')
        teacher_id = request.GET.get('teacher_id')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if start_date:
            self.queryset = self.queryset.filter(created_at__gte=start_date)

        if end_date:
            self.queryset = self.queryset.filter(created_at__lte=end_date+' 23:59:59')

        if school:
            self.queryset = self.queryset.filter(
                Q(teacher__salbar__isnull=False,teacher__salbar__sub_orgs=school) |
                Q(teacher__salbar__isnull=True,teacher__sub_org=school)
            )

        if dep_id:
            self.queryset = self.queryset.filter(teacher__salbar=dep_id)

        if teacher_id:
            self.queryset = self.queryset.filter(teacher=teacher_id)

        datas = self.list(request).data

        return request.send_data(datas)

    def post(self, request, *args, **kwargs):
        """ Цахим хичээл бүртгэх """

        teach_qs = Teachers.objects.filter(user__email=request.user).first()
        students_data = []
        lesson_qs = None
        data = request.data
        lesson=data.get('lesson')               # хичээл id
        group = data.get('group')               # анги
        plan = data.get('plan')
        total_score = data.get('total_score')   # оноо

        if lesson:
            lesson_qs = LessonStandart.objects.get(id=lesson)

        for i in group:
            students_id = Student.objects.filter(group_id=i).values_list('id', flat=True)
            students_data.extend(list(students_id))

        with transaction.atomic():
            if OnlineLesson.objects.filter(lesson=lesson_qs, teacher=teach_qs).exists():
                return request.send_error('ERR_001', 'Тухайн хичээл үүссэн байна')

            online_qs = OnlineLesson.objects.create(
                total_score=total_score,
                create_type=OnlineLesson.WEEK,
                lesson=lesson_qs,
                teacher=teach_qs,
                plan = plan
            )
            online_qs.students.add(*list(students_data))

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class AnnouncementAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing, creating, and deleting announcements '''

    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get(self, request, pk=None):
        if pk:
            self.queryset = self.queryset.filter(online_lesson=pk)
        data = self.list(request).data
        return request.send_data(data)

    def post(self, request, *args, **kwargs):
        request.data['created_user'] = request.user.id
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': 'INF_013'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if not pk:
            return Response({'error': 'Method PUT not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        try:
            instance = self.get_queryset().get(pk=pk)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({'message': 'INF_013'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        self.destroy(request, pk)
        return request.send_info("INF_003")


class GlobalAnnouncementAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    def post(self, request, *args, **kwargs):
        data = request.data
        group_ids = data.get('group', [])

        if isinstance(group_ids, int):
            group_ids = [group_ids]

        online_lessons = OnlineLesson.objects.filter(students__id__in=group_ids).distinct()

        title = data.get('title')
        body = data.get('body')

        announcement_qs = Announcement.objects.create(
            title=title,
            body=body,
            is_online=True,
            created_user=request.user,
        )
        announcement_qs.online_lesson.set(online_lessons)

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class OnlineWeekAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    '''Хичээлийн 7 хоног'''

    queryset = OnlineWeek.objects.all().order_by('week_number')
    serializer_class = OnlineWeekSerializer

    def get(self, request, pk=None):
        week = request.query_params.get('week')
        lesson = request.query_params.get('lesson')

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        self.queryset = self.queryset.distinct("week_number")

        if lesson:
            self.queryset = self.queryset.filter(onlinelesson=lesson)

        if week:
            week = int(week)
            self.queryset = self.queryset.filter(week_number__lt=week)

        all_data = self.list(request).data

        return request.send_data(all_data)

    def post(self, request, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                new_week = serializer.save()

                lesson_id = kwargs.get('id')

                if lesson_id:
                    instance = OnlineLesson.objects.get(id=lesson_id)
                    instance.weeks.add(new_week)

                    instance.save()

                return request.send_info('INF_001')
            else:
                return request.send_error_valid(serializer.errors)

        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):

        try:
            if pk:
                instance = self.queryset.filter(id=pk).first()
            datas = request.data

            # NOTE хэрэггүй датануудаа update хийх гээд байна
            if 'lekts_file' in datas:
                del datas['lekts_file']

            if 'description' in datas:
                del datas['description']

            serializer = self.serializer_class(instance, data=datas, partial=True)
            if serializer.is_valid(raise_exception=False):
                serializer.save()
            else:
                return request.send_error_valid(serializer.errors)

            return request.send_info("INF_002")
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002', e.__str__())

    def delete(self, request, pk=None):
        try:
            self.destroy(request, pk)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002', e.__str__())

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class HomeWorkAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
):
    '''Хичээлийн 7 хоног'''
    queryset = HomeWork.objects.all()
    serializer_class = HomeWorkSerializer

    def get(self, request, pk):
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        serializer = self.list(request).data
        return Response(serializer)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        file = request.data.get('file')
        week_id = request.data.get('week_id')

        try:
            file_name = None

            if serializer.is_valid(raise_exception=False):
                if file:
                    data = create_file_to_cdn(settings.HOMEWORK, file)

                    file_name = data.get('file_name')
                new_homework = serializer.save()

                if file_name:
                    new_homework.file = file_name
                    new_homework.save()

                if week_id:
                    instance = OnlineWeek.objects.get(id=week_id)
                    instance.homework = new_homework
                    instance.save()

                return request.send_info('INF_001')
            else:
                return request.send_error_valid(serializer.errors)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

    def put(self, request, pk):

        request_data = request.data.copy()
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data, partial=True)

        file = request_data.get('file')
        week_id = request_data.get('week_id')
        changeFile = request_data.get('changeFile')

        if changeFile:
            changeFile = str2bool(changeFile)

        try:
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            file_name = None

            if serializer.is_valid(raise_exception=False):
                if file and changeFile:
                    # Файлыг засах үед хуучин файлыг устгадаг болсон
                    if instance.file:
                        path = split_root_path(instance.file.path)
                        remove_file = os.path.join(settings.CDN_MAIN_FOLDER, settings.HOMEWORK, path)

                        cdn_data = get_file_from_cdn(remove_file)
                        success = cdn_data.get('success')

                        if success:
                            # Хэрвээ cdn дээр тухайн файл үүссэн байвал устгана
                            remove_file_from_cdn(remove_file)

                    data = create_file_to_cdn(settings.HOMEWORK, file)

                    file_name = data.get('file_name')

                new_homework = serializer.save()

                if file_name:
                    new_homework.file = file_name
                    new_homework.save()

                if week_id:
                    instance = OnlineWeek.objects.get(id=week_id)
                    instance.homework = new_homework
                    instance.save()

                return request.send_info('INF_001')
            else:
                return request.send_error_valid(serializer.errors)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class SentHomeWorkAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн гэрийн даалгавар'''
    queryset = HomeWorkStudent.objects.all()
    serializer_class = HomeWorkStudentSerializer

    def get(self, request, *args, **kwargs):
        homework_id = kwargs.get('pk')
        if homework_id:
            try:
                instance = HomeWorkStudent.objects.filter(homework_id=homework_id)
                return_datas = self.get_serializer(instance, many=True).data
                return request.send_data(return_datas)
            except OnlineWeek.DoesNotExist:
                return Response({'error': 'OnlineWeek not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.list(request).data
        return request.send_data(serializer)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        homework_id = pk
        data = request.data
        student_id = data.get('studentId')
        score = data.get('score')
        description = data.get('description')

        with transaction.atomic():
            obj = HomeWorkStudent.objects.get(homework_id=homework_id, student_id=student_id)
            obj.score = score
            obj.description = description
            obj.status = HomeWorkStudent.CHECKED
            obj.save()

        return request.send_info("INF_002")

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class OnlineLessonDetailAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Handles retrieving, updating, and deleting a specific online lesson '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer

    def get(self, request, pk=None):
        if pk:
            data = self.retrieve(request, pk).data
        else:
            data = self.list(request).data

        return request.send_data(data)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, pk=None):
        with transaction.atomic():
            online_lesson = self.queryset.get(pk=pk)
            online_lesson.weeks.clear()
            online_lesson.delete()

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class LessonMaterialDetailAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Online хичээлийн API"""

    queryset = LessonMaterial.objects.all()
    serializer_class = LessonMaterialSerializer
    pagination_class = CustomPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()

        context['skip_cdn'] = getattr(self, 'skip_cdn', False)
        return context

    def get(self, request, pk=None):
        if not request.user.is_superuser:
            self.queryset = self.queryset.filter(user_id=request.user.id)

        if pk:
            # Тухайн нэг багшийн материалыг дэлгэрэнгүй харах хүсэлт
            self.queryset = self.queryset.filter(user_id=pk).distinct('user')
            self.skip_cdn = False

            datas = self.list(request).data

            return request.send_data(datas)

        full_name = request.query_params.get('full_name', '')
        salbar = request.query_params.get('salbar', '')
        school_name = request.query_params.get('school_name', '')

        if full_name:
            self.queryset = self.queryset.filter(
                Q(user__teachers__first_name__icontains=full_name) |
                Q(user__teachers__last_name__icontains=full_name)
            )

        if salbar:
            self.queryset = self.queryset.filter(
                user__teachers__salbar__name__icontains=salbar
            )

        if school_name:
            self.queryset = self.queryset.filter(
                Q(user__teachers__sub_org__name__icontains=school_name) |
                Q(user__teachers__org__name__icontains=school_name)
            )

        self.queryset = self.queryset.distinct('user')
        self.skip_cdn = True

        datas = self.list(request).data

        return request.send_data(datas)

    @parser_classes([MultiPartParser])
    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            file = request.FILES.get('path')

            # CDN server дээр файлаа хадгалах post method
            data = create_file_to_cdn(settings.ASSIGNMENT, file)
            full_path = data.get('file_name')

            serializer.validated_data['material_type'] = request.data.get('material_type')
            serializer.validated_data['path'] = full_path
            serializer.validated_data['created_at'] = timezone.now()
            self.perform_create(serializer)

        return request.send_info("INF_001")

    def delete(self, request, pk=None):

        try:
            file = get_object_or_404(LessonMaterial,id=pk)

            # Base аас path ийн авах
            file_path = str(file.path)
            path = split_root_path(file_path)
            remove_file = os.path.join(settings.CDN_MAIN_FOLDER, settings.ASSIGNMENT, path)

            cdn_data = get_file_from_cdn(remove_file)
            success = cdn_data.get('success')

            if success:
                # Хэрвээ cdn дээр тухайн файл үүссэн байвал устгана
                remove_file_from_cdn(remove_file)

            # Хэрэв тухайн файл server-ээс устсан бол True буцаан тэр үед base-аас устган
            self.destroy(request, pk)
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Устгах боломжгүй')

        return request.send_info("INF_003")

class OnlineLessonTestAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    def get(self,request,pk=None):
        online_obj = OnlineLesson.objects.get(id=pk)
        lesson_id = online_obj.lesson
        challange = Challenge.objects.filter(lesson=lesson_id).values()
        return request.send_data(list(challange))

    def post(self,request,pk=None):
        weekid = request.data
        obj = OnlineWeek.objects.get(id=weekid)
        challenge_obj = Challenge.objects.get(id=pk)
        obj.challenge = challenge_obj
        obj.save()
        return request.send_info("INF_002")

    def delete(self,request,pk=None):
        obj = OnlineWeek.objects.get(id=pk)
        if obj:
            obj.challenge = None
            obj.save()
            return request.send_info("INF_003")
        else:
            return request.send_error("ERR_003")


class LessonListAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    def get(self, request):
        user_id = request.query_params.get('teacher_id')
        teacher = Teachers.objects.filter(user=user_id).first()
        if teacher:
            department = teacher.salbar
            lessons = LessonStandart.objects.values('id', 'code', 'name')
            return request.send_data(list(lessons))
        else:
            return request.send_data([])

    def post(self, request):
        return request.send_info("INF_003")

    def delete(self, request, pk=None):
        return request.send_info("INF_003")


class getAllGroups(mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    def get(self, request):
        group = Group.objects.filter(is_finish=False).annotate(profession_name=F('profession__name')).values(
            'id',
            'name',
            'profession_name'
        )

        return request.send_data(list(group))


@permission_classes([IsAuthenticated])
class OnlineWeekLektsAPIView(
    generics.GenericAPIView
):
    """ 7 хоногт лекцийн материал оруулах """

    queryset = OnlineWeek.objects.all()

    def post(self, request):
        cdata = {}
        data = request.data.dict()
        is_new = data.get('is_new')
        lekts_file = data.get('lekts_file')
        description = data.get('description')
        is_lekts = data.get('is_lekts')
        cdata['description'] = description
        week_material = None

        if str2bool(is_new):
            cdn_data = create_file_to_cdn(settings.ASSIGNMENT, lekts_file)
            file_name = cdn_data.get('file_name')

            lesson_material = LessonMaterial.objects.create(
                material_type=data.get('material_type'),
                user=request.user,
                path=file_name,
                created_at=timezone.now()
            )
        else:
            lesson_material = LessonMaterial.objects.filter(id=lekts_file).first()

        # Хичээлийн материал үүсгэх хэсэг
        week_material = WeekMaterials.objects.create(
            is_leks=str2bool(is_lekts),
            description=description,
            material=lesson_material
        )

        with transaction.atomic():
            online_week = self.queryset.filter(pk=data.get('id')).first()

            # Хичээлийн материалыг 7 хогног руу нэмэх хэсэг
            if week_material:
                online_week.materials.add(week_material)

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        with transaction.atomic():
            self.queryset.filter(pk=pk).update(
                description='',
                lekts_file=None
            )

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class OnlineLessonPlanAPIView(
    generics.GenericAPIView
):
    """ Төлөвлөгөө устгах """

    def delete(self, request, pk=None):
        with transaction.atomic():
            OnlineLesson.objects.filter(pk=pk).update(
                plan=None
            )

        return request.send_info('INF_003')

    def put(self, request, pk=None):
        with transaction.atomic():
            OnlineLesson.objects.filter(pk=pk).update(
                plan=request.data
            )

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class LessonStudentsAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    queryset = OnlineLesson.objects.all()
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['students__last_name', 'students__first_name', 'students__code', 'students__register_num']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        lesson_id = self.request.query_params.get('lesson_id')
        weeks = OnlineWeek.objects.filter(onlinelesson=lesson_id)

        # Нэг aggregate-д бүх статистик
        counts = weeks.aggregate(
            count_homework=Count('homework', distinct=True),
            count_challenge=Count('challenge', distinct=True),
        )

        # # Weeks-ийг prefetch-тэй нэг удаа татна
        # online_lesson = OnlineLesson.objects.prefetch_related(
        #     Prefetch('weeks', queryset=OnlineWeek.objects.prefetch_related(
        #         Prefetch('materials', queryset=WeekMaterials.objects.prefetch_related(
        #             'weekmaterialviewers_set'
        #         ))
        #     ).order_by('week_number'))
        # ).get(id=lesson_id)

        context['online_lesson_id'] = lesson_id
        context['count_homework'] = counts['count_homework']
        context['count_challenge'] = counts['count_challenge']
        # context['weeks'] = online_lesson.weeks.all()  # Cache болсон
        context['weeks'] = weeks  # Cache болсон

        return context

    def get_queryset(self, lesson_id):
        weeks = OnlineWeek.objects.filter(onlinelesson=lesson_id)

        return Student.objects.prefetch_related(
            Prefetch(
                'homeworkstudent_set',
                queryset=HomeWorkStudent.objects.filter(
                    homework__onlineweek__in=weeks
                ),
                to_attr='filtered_homeworks'
            ),
            Prefetch(
                'challengestudents_set',
                queryset=ChallengeStudents.objects.filter(
                    challenge__onlineweek__in=weeks
                ),
                to_attr='filtered_challenges'
            )
        )

    def get(self, request, pk=None):
        group_id = request.query_params.get('group')
        lesson_id = request.query_params.get('lesson_id')

        online_lesson = self.queryset.filter(id=lesson_id).first()
        if not online_lesson:
            return request.send_error("Хичээл олдсонгүй")

        # get_queryset-аас авна — prefetch агуулна
        students = self.get_queryset(lesson_id).filter(
            id__in=online_lesson.students.values_list('id', flat=True)
        )

        group_data = Group.objects.filter(
            id__in=online_lesson.students.values_list('group', flat=True).distinct()
        ).values('id', 'name')

        if group_id:
            students = students.filter(group=group_id)

        datas = StudentInfoSerializer(
            students,
            many=True,
            context=self.get_serializer_context()
        ).data

        return request.send_data({
            'datas': datas,
            'groups': list(group_data)
        })

    def put(self, request, pk=None):
        online_lesson = self.queryset.filter(id=pk).first()
        datas = request.data
        group_ids = [data.get('id') for data in datas]
        students = Student.objects.filter(group__in=group_ids).values_list('id', flat=True)
        old_students = online_lesson.students.all().values_list('id', flat=True)

        removed_students = set(old_students) - set(students)
        added_students = set(students) - set(old_students)

        removed_students = list(removed_students)
        added_students = list(added_students)

        with transaction.atomic():
            # Хасагдагсан оюутнуудыг хасах
            for student in removed_students:
                online_lesson.students.remove(student)

            # Нэмэгдэж байгаа оюутнуудыг нэмэх
            if len(added_students) > 0:
                online_lesson.students.add(*added_students)

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        online_lesson = self.queryset.filter(id=pk).first()
        student = request.query_params.get('student')

        with transaction.atomic():
            # Хасагдагсан оюутнуудыг хасах
            online_lesson.students.remove(student)

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class LessonStudentAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    queryset = OnlineLesson.objects.all()
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['students__last_name', 'students__first_name', 'students__code', 'students__register_num']

    def get(self, request, student_id=None):
        online_lesson_id = self.request.query_params.get('lesson_id')

        online_lesson = self.queryset.filter(id=online_lesson_id).first()
        students = online_lesson.students.all()
        students = students.filter(id=student_id).first()

        datas = OnlineLessonStudentSerializer(students, many=False, context={ "online_lesson_id": online_lesson_id }).data

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class SentLectureAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн лекц материал харах нэг нэгээр нь дүгнэх'''

    queryset = OnlineWeekStudent.objects.all()
    serializer_class = LectureStudentSerializer

    def get(self, request, *args, **kwargs):
        week_id = kwargs.get('pk')
        if week_id:
            try:
                instance = OnlineWeekStudent.objects.filter(week_id=week_id)
                return_datas = self.get_serializer(instance, many=True).data
                return request.send_data(return_datas)
            except OnlineWeek.DoesNotExist:
                return Response({'error': 'OnlineWeek not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.list(request).data
        return request.send_data(serializer)

    def put(self,request,pk=None):
        obj = OnlineWeekStudent.objects.get(id=pk)
        if obj:
            obj.status = OnlineWeekStudent.CHECKED
            obj.save()
            return request.send_info("INF_002")


class SummarizeLessonMaterialAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн лекц материал дүгнэх'''

    queryset = OnlineWeekStudent.objects.all()
    serializer_class = LectureStudentSerializer


    def put(self,request,pk=None):
        user_ids = request.data
        with transaction.atomic:
            OnlineWeekStudent.objects.filter(week_id=pk,student_id__in=user_ids).update(status=OnlineWeekStudent.CHECKED)

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class RemoteLessonAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api'''

    queryset = ELearn.objects.all()
    serializer_class = ELearnSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name', 'title']

    # region to override mixins' methods to take instance and save cdn file path
    def create(self, data):
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return serializer

    def update(self, data, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return serializer
    # endregion

    # region custom methods
    @staticmethod
    def rollbackCDN(relative_path):
        if relative_path:
            remove_from_cdn_ignore_not_found_error(relative_path)

    def post_put(self):
        request = self.request
        relative_path = None

        if request.method == 'POST':
            result = request.send_info("INF_001")

        elif request.method == 'PUT':
            result = request.send_info("INF_002")

        try:
            upload_to = self.queryset.model._meta.get_field('image').upload_to
            data = {}

            for key, value in request.POST.items():
                if isinstance(value, str):
                    data[key] = json.loads(value)

            # to require fields
            if not data.get('title'):
                raise ValidationError({ 'title': ['Хоосон байна'] })

            teacher_instance = request.user.info

            if request.method == 'POST':
                data['created_user'] = teacher_instance.id

            data['teacher'] = teacher_instance.id
            file_path = None
            file = request.FILES.get('image')

            if file:
                relative_path = create_file_to_cdn(upload_to, file).get('full_path')
                file_path = relative_path

            elif data['image']:
                # to save existinig URL of file or new URL if URL was used instead of file itself
                file_path = data['image']

            # to clear field value if key exists and value is null and to keep it using removing for serializer and setting using instance.save()
            if "image" in data:
                # to remove from dict because serializer requires file in filefield, but it is always string of CDN path or user URL
                del data['image']

            with transaction.atomic():
                elearn_instance = None

                if request.method == 'POST':
                    elearn_instance = self.create(data).instance

                elif request.method == 'PUT':
                    elearn_instance = self.update(data).instance

                if file_path:
                    old_file = elearn_instance.image
                    elearn_instance.image = file_path
                    elearn_instance.save()

                    if old_file:
                        if not old_file.name.startswith('http://') and not old_file.name.startswith('https://'):
                            RemoteLessonAPIView.rollbackCDN(old_file.name)

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)
            RemoteLessonAPIView.rollbackCDN(relative_path)

        except Exception as e:
            traceback.print_exc()
            cdn_error_msg = 'Файл хадгалахад алдаа гарсан байна (CDN).'

            if e.__str__() == cdn_error_msg:
                result = request.send_error('CDN_error', cdn_error_msg)

            else:
                result = request.send_error("ERR_002")

            RemoteLessonAPIView.rollbackCDN(relative_path)

        return result
    # endregion

    @has_permission(must_permissions=['lms-elearn-list-read'])
    def get(self,request,pk=None):
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-elearn-list-create'])
    def post(self, request):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-elearn-list-update'])
    def put(self,request,pk=None):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-elearn-list-delete'])
    def delete(self, request, pk=None):
        instance = self.get_object()
        relative_path = instance.image.name if instance.image else None

        with transaction.atomic():
            instance.delete()
            RemoteLessonAPIView.rollbackCDN(relative_path)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonStudentsAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/students'''

    queryset = Student.objects
    serializer_class = StudentSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name']

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        elearn_id = request.query_params.get('elearnId')
        self.queryset = self.queryset.filter(elearn__id=elearn_id)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self, request):
        data = request.data
        groups_ids = data.get('groups')
        student_ids = data.get('students')

        if groups_ids:
            # NOTE Student status always stay Суралцаж буй
            student_ids = list(Student.objects.filter(group__in=groups_ids).filter(status__code=1).values_list('id',flat=True))

        if isinstance(student_ids, list) and len(student_ids):
            elearn_id = data.get('elearnId')
            instance = ELearn.objects.get(id=elearn_id)

            with transaction.atomic():
                instance.students.add(*student_ids)
                instance.scope = ELearn.STUDENT
                instance.save()

        return request.send_info("INF_002")

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk):
        elearn_id = request.query_params.get('elearnId')

        with transaction.atomic():
            instance = ELearn.objects.get(id=elearn_id)
            instance.students.remove(pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonUsersAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/employees'''

    queryset = User.objects
    serializer_class = UserRemoteLessonSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['employee__register_code', 'teachers__first_name', 'teachers__register']

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        elearn_id = request.query_params.get('elearnId')
        self.queryset = self.queryset.filter(elearn__id=elearn_id)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self, request):
        data = request.data
        users_ids = data.get('usersIds')

        if users_ids:
            elearn_id = data.get('elearnId')
            instance = ELearn.objects.get(id=elearn_id)

            with transaction.atomic():
                instance.users.add(*users_ids)
                instance.scope = ELearn.EMPLOYEE
                instance.save()

        return request.send_info("INF_002")

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk):
        elearn_id = request.query_params.get('elearnId')

        with transaction.atomic():
            instance = ELearn.objects.get(id=elearn_id)
            instance.users.remove(pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonUsersListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн жагсаалт (copy from core/views.py but changed to return User model data) """

    queryset = User.objects.all()
    serializer_class = UserRemoteLessonSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['teachers__first_name', 'teachers__register', 'email', 'phone_number', 'employee__register_code']

    def get_queryset(self):
        "Багшийн мэдээллийг сургууль, Хөтөлбөрийн багаар харуулах "

        # queryset = get_teacher_queryset(is_teacher)

        teachers_qs = Teachers.objects.filter(action_status=Teachers.APPROVED)

        # Бүх төвөвтэй багшийн жагсаалт
        state = self.request.query_params.get('state')
        sub_org = self.request.query_params.get('sub_org')
        salbar = self.request.query_params.get('salbar')
        position = self.request.query_params.get('position')
        sorting = self.request.query_params.get('sorting')
        is_teacher = self.request.query_params.get('is_teacher')

        # Бүрэлдэхүүн сургууль
        if sub_org:
            teachers_qs = teachers_qs.filter(sub_org=sub_org)

        # салбар, тэнхим
        if salbar:
            teachers_qs = teachers_qs.filter(salbar=salbar)

        teacher_queryset = teachers_qs.values_list('user', flat=True)
        qs_employee_user = Employee.objects.filter(user__in=list(teacher_queryset), state=Employee.STATE_WORKING)

        # Төлвөөр хайх
        if state:
            state = int(state)
            qs_employee_user = qs_employee_user.filter(state=state)

        if is_teacher:
            is_teacher = str2bool(is_teacher)

            qs_employee_user = qs_employee_user.filter(org_position__is_teacher=is_teacher)

        # Албан тушаалаар хайх
        if position:
            qs_employee_user = qs_employee_user.filter(org_position=position)

        if (state or is_teacher or position) or qs_employee_user.exists():
            user_ids = qs_employee_user.values_list('user', flat=True)
            teachers_qs = teachers_qs.filter(user__in=user_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            teachers_qs = teachers_qs.order_by(sorting)

        # if search:
        #     queryset = filter_queries(queryset.model, search)
        queryset = super().get_queryset().annotate(is_in_qs=Exists(teachers_qs.filter(user=OuterRef('pk')))).filter(is_in_qs=True)

        queryset = queryset.prefetch_related(
            Prefetch('teachers_set', queryset=teachers_qs),
            Prefetch('employee_set', queryset=qs_employee_user)
        )

        return queryset

    def get(self, request):
        " нийт багшийн жагсаалт"

        teach_info = self.list(request).data

        return request.send_data(teach_info)


@permission_classes([IsAuthenticated])
class RemoteLessonOnlineInfoAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/OnlineInfo'''

    queryset = OnlineInfo.objects
    serializer_class = OnlineInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    # region custom methods
    def post_put(self):
        request = self.request

        if request.method == 'POST':
            result = request.send_info("INF_001")

        elif request.method == 'PUT':
            result = request.send_info("INF_002")

        try:
            # to require fields
            if not request.data.get('title'):
                raise ValidationError({ 'title': ['Хоосон байна'] })

            with transaction.atomic():
                if request.method == 'POST':
                    self.create(request)

                elif request.method == 'PUT':
                    self.update(request)

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)

        except Exception:
            traceback.print_exc()
            result = request.send_error("ERR_002")

        return result
    # endregion

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        elearn_id = request.query_params.get('elearnId')
        self.queryset = self.queryset.filter(elearn__id=elearn_id)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self, request):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self,request,pk=None):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        with transaction.atomic():
            self.destroy(request)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonOnlineSubInfoAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/OnlineSubInfo'''

    queryset = OnlineSubInfo.objects
    serializer_class = OnlineSubInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    # region to override mixins' methods to take instance and save cdn file path
    def create(self, data):
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return serializer

    def update(self, data, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return serializer
    # endregion

    # region custom methods
    def post_put(self):
        request = self.request
        relative_path = None

        if request.method == 'POST':
            result = request.send_info("INF_001")

        elif request.method == 'PUT':
            result = request.send_info("INF_002")

        try:
            upload_to = ELearn._meta.get_field('image').upload_to
            stringified_data = json.loads(request.POST['json_data'])

            # region to collect only fields that are necessary for serializer
            cleaned_data = {
                'title': stringified_data['title'],
                'parent_title': stringified_data['parent_title'],
                'file_type': stringified_data['file_type'],
            }

            if stringified_data['file_type'] == OnlineSubInfo.TEXT:
                cleaned_data['text'] = stringified_data['text']

            if cleaned_data['file_type'] in [OnlineSubInfo.VIDEO, OnlineSubInfo.PDF]:
                cleaned_data['file'] = request.data.get('file')
            # endregion

            # region to require fields
            if not cleaned_data.get('title'):
                raise ValidationError({ 'title': ['Хоосон байна'] })

            if cleaned_data['file_type'] == OnlineSubInfo.TEXT:
                # to check for emptiness of QUILL lib. editor value
                if not cleaned_data.get('text') or cleaned_data.get('text') == '<p><br></p>':
                    raise ValidationError({ 'text': ['Хоосон байна'] })
            # endregion

            file_path = None

            if cleaned_data['file_type'] in [OnlineSubInfo.VIDEO, OnlineSubInfo.PDF]:
                # to require field
                # to check for emptiness using 'null' because file fields are not stringified
                if not cleaned_data.get('file') or cleaned_data.get('file') == 'null':
                    raise ValidationError({ 'file': ['Хоосон байна'] })

                if request.FILES.keys():
                    file = request.FILES.getlist('file')[0]
                    relative_path = create_file_to_cdn(upload_to, file).get('full_path')
                    file_path = relative_path

                # to save URL of file
                elif is_url(cleaned_data['file']):
                    file_path = cleaned_data['file']

                else:
                    raise ValidationError({ 'file': ['Файл хадгалахад алдаа гарсан байна'] })

                # to remove from dict because serializer requires file in filefield, but it is always string of CDN path or user URL
                del cleaned_data['file']

            with transaction.atomic():
                instance = None

                if request.method == 'POST':
                    instance = self.create(cleaned_data).instance

                elif request.method == 'PUT':
                    instance = self.update(cleaned_data, partial=True).instance

                if file_path:
                    old_file = instance.file
                    instance.file = file_path
                    instance.save()

                    if old_file:
                        if not old_file.name.startswith('http://') and not old_file.name.startswith('https://'):
                            RemoteLessonAPIView.rollbackCDN(old_file.name)

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)
            RemoteLessonAPIView.rollbackCDN(relative_path)

        except Exception as e:
            traceback.print_exc()
            cdn_error_msg = 'Файл хадгалахад алдаа гарсан байна (CDN).'

            if e.__str__() == cdn_error_msg:
                result = request.send_error('CDN_error', cdn_error_msg)
            else:
                result = request.send_error("ERR_002")
            RemoteLessonAPIView.rollbackCDN(relative_path)

        return result

    @staticmethod
    def remove_related_models(questions):
        for question in questions:
            RemoteLessonQuezQuestionsAPIView.remove_instance(question)

    @staticmethod
    def remove_instance(instance):
        relative_path = instance.file.name if instance.file else None
        questions = list(instance.quiz.all())

        with transaction.atomic():
            instance.delete()
            RemoteLessonOnlineSubInfoAPIView.remove_related_models(questions)
            RemoteLessonAPIView.rollbackCDN(relative_path)
    # endregion

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        elearn_id = request.query_params.get('elearnId')
        self.queryset = self.queryset.filter(parent_title__elearn__id=elearn_id)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self, request):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self,request,pk=None):
        return self.post_put()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        instance = self.get_object()

        with transaction.atomic():
            RemoteLessonOnlineSubInfoAPIView.remove_instance(instance)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonQuezQuestionsAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/QuezQuestions'''

    queryset = QuezQuestions.objects
    serializer_class = QuezQuestionsSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['question']

    # region custom methods
    @staticmethod
    def create(data, serializer_class):
        serializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer

    @staticmethod
    def update(data, id, serializer_class, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = serializer_class.Meta.model.objects.get(id=id)
        serializer = serializer_class(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer

    @staticmethod
    def post_put(
            request,
            request_method,
            id=None,
            is_called_from_outside=False,
            parsed_stringified_data=None,
            question_index=None
    ):
        relative_path = None
        instance = None

        if request_method == 'POST':
            result = request.send_info("INF_001")

        elif request_method == 'PUT':
            result = request.send_info("INF_002")

        try:
            upload_to = ELearn._meta.get_field('image').upload_to
            image_key = f'question[{question_index}].image'

            if not is_called_from_outside:
                image_key = 'image'
                parsed_stringified_data = json.loads(request.data['json_data'])

            image = request.data.get(image_key)
            is_file_attached = False
            file_list = request.data.getlist(image_key)

            if file_list:
                if is_called_from_outside:
                    if file_list and not isinstance(file_list[0], str):
                        image = file_list[0]
                        is_file_attached = True

                # if called for single record (not from outside) then there is always only 1 item
                else:
                    if request.FILES.get(image_key):
                        image = request.FILES.get(image_key)
                        is_file_attached = True

            # region to collect only fields that are necessary for serializer
            cleaned_data = {
                'question': parsed_stringified_data['question'],
                'kind': parsed_stringified_data['kind'],
                'image': image,
                'score': parsed_stringified_data['score'],
                'rating_max_count': parsed_stringified_data['rating_max_count'],
                'low_rating_word': parsed_stringified_data['low_rating_word'],
                'high_rating_word': parsed_stringified_data['high_rating_word'],
                'max_choice_count': parsed_stringified_data['max_choice_count'],
                'yes_or_no': parsed_stringified_data['yes_or_no'],
            }

            if request_method == 'POST':
                teacher_instance = request.user.info
                cleaned_data['created_by'] = teacher_instance.id
            # endregion

            file_path = None

            if is_file_attached:
                relative_path = create_file_to_cdn(upload_to, cleaned_data['image']).get('full_path')
                file_path = relative_path

            elif cleaned_data['image']:
                # to save existinig URL of file or new URL if URL was used instead of file itself
                file_path = cleaned_data['image']

            # to clear field value if key exists and value is null and to keep it using removing for serializer and setting using instance.save()
            if "image" in cleaned_data:
                # to remove from dict because serializer requires file in filefield, but it is always string of CDN path or user URL
                del cleaned_data['image']

            with transaction.atomic():
                if request_method == 'POST':
                    instance = RemoteLessonQuezQuestionsAPIView.create(cleaned_data,QuezQuestionsSerializer).instance
                    online_sub_info_instance = OnlineSubInfo.objects.get(id=parsed_stringified_data['onlineSubInfoId'])
                    online_sub_info_instance.quiz.add(instance)

                elif request_method == 'PUT':
                    # to skip if "no key" and override if "key exists, so if it is null then it will be cleared". That is reason why partal=True is used
                    if is_called_from_outside:
                        if id:
                            instance = RemoteLessonQuezQuestionsAPIView.update(cleaned_data, id, QuezQuestionsSerializer, partial=True).instance

                        else:
                            instance = RemoteLessonQuezQuestionsAPIView.post_put(request, 'POST', id, True, parsed_stringified_data, question_index)

                    else:
                        instance = RemoteLessonQuezQuestionsAPIView.update(cleaned_data, id, QuezQuestionsSerializer, partial=True).instance

                if file_path:
                    old_file = instance.image
                    instance.image = file_path
                    instance.save()

                    if old_file:
                        if not old_file.name.startswith('http://') and not old_file.name.startswith('https://'):
                            RemoteLessonAPIView.rollbackCDN(old_file.name)

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)
            RemoteLessonAPIView.rollbackCDN(relative_path)

            if is_called_from_outside:
                raise

        except Exception as e:
            traceback.print_exc()
            cdn_error_msg = 'Файл хадгалахад алдаа гарсан байна (CDN).'

            if e.__str__() == cdn_error_msg:
                result = request.send_error('CDN_error', cdn_error_msg)

            else:
                result = request.send_error("ERR_002")

            RemoteLessonAPIView.rollbackCDN(relative_path)

            if is_called_from_outside:
                raise

        if is_called_from_outside:
            result = instance

        return result

    def post_put_many(self):
        request = self.request
        result = None

        if request.method == 'POST':
            result = request.send_info("INF_001")

        elif request.method == 'PUT':
            result = request.send_info("INF_002")

        parsed_stringified_data = json.loads(request.POST['json_data'])

        try:
            with transaction.atomic():
                for question_index, question in enumerate(parsed_stringified_data):
                    self.serializer_class = QuezQuestionsSerializer
                    quez_question_id = question['id'] if 'id' in question else None
                    quez_question_instance = RemoteLessonQuezQuestionsAPIView.post_put(request, request.method, quez_question_id, True, question, question_index)
                    quez_question_id = quez_question_instance.id

                    # region processing of answers
                    answers = question.get('answers')

                    if answers:
                        if question['kind'] in [
                            QuezQuestions.KIND_ONE_CHOICE,
                            QuezQuestions.KIND_MULTI_CHOICE,
                        ]:
                            for answer_index, answer in enumerate(answers):
                                self.serializer_class = QuezChoicesSerializer
                                quez_choices_id = answer['id'] if 'id' in answer else None
                                RemoteLessonQuezChoicesAPIView.post_put(request, request.method, quez_choices_id, True, answer, answer_index, quez_question_id, question_index)
                    # endregion

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)

        except Exception as e:
            traceback.print_exc()
            cdn_error_msg = 'Файл хадгалахад алдаа гарсан байна (CDN).'

            if e.__str__() == cdn_error_msg:
                result = request.send_error('CDN_error', cdn_error_msg)

            else:
                result = request.send_error("ERR_002")

        return result

    @staticmethod
    def remove_related_models(choices):
        for choice in choices:
            RemoteLessonQuezChoicesAPIView.remove_instance(choice)

    @staticmethod
    def remove_instance(instance):
        relative_path = instance.image.name if instance.image else None
        choices = list(instance.choices.all())

        with transaction.atomic():
            instance.delete()
            RemoteLessonQuezQuestionsAPIView.remove_related_models(choices)
            RemoteLessonAPIView.rollbackCDN(relative_path)
    # endregion

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        online_sub_info_id = request.query_params.get('onlineSubInfoId')
        self.queryset = self.queryset.filter(onlinesubinfo__id=online_sub_info_id)

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        serializer = self.list(request).data
        return request.send_data(serializer)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self,request):
        return self.post_put_many()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self,request,pk=None):
        return self.post_put_many()

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        instance = self.get_object()

        with transaction.atomic():
            RemoteLessonQuezQuestionsAPIView.remove_instance(instance)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RemoteLessonQuezChoicesAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api/QuezChoices'''

    queryset = QuezChoices.objects
    serializer_class = QuezChoicesSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['choices']

    # region custom methods
    @staticmethod
    def post_put(request, request_method, id=None, is_called_from_outside=False, parsed_stringified_data=None, quez_choices_index=None, quez_question_id=None, quez_question_index=None):
        relative_path = None
        instance = None

        if request_method == 'POST':
            result = request.send_info("INF_001")

        elif request_method == 'PUT':
            result = request.send_info("INF_002")

        try:
            image_model_key = 'image'
            image_request_key = 'image'
            upload_to = ELearn._meta.get_field('image').upload_to

            if is_called_from_outside:
                image_request_key = f'question[{quez_question_index}].choice[{quez_choices_index}].image'

            if not is_called_from_outside:
                parsed_stringified_data = json.loads(request.POST['json_data'])

            image = parsed_stringified_data[image_model_key]
            is_file_attached = False

            if request.FILES.get(image_request_key):
                image = request.FILES.get(image_request_key)
                is_file_attached = True

            # region to collect only fields that are necessary for serializer
            cleaned_data = {
                'choices': parsed_stringified_data['choices'],
                image_model_key: image,
                'score': parsed_stringified_data['score'],
            }

            if request_method == 'POST':
                teacher_instance = request.user.info
                cleaned_data['created_by'] = teacher_instance.id
            # endregion

            file_path = None

            if is_file_attached:
                relative_path = create_file_to_cdn(upload_to, cleaned_data[image_model_key]).get('full_path')
                file_path = relative_path

            elif cleaned_data[image_model_key]:
                # to save existinig URL of file or new URL if URL was used instead of file itself
                file_path = cleaned_data[image_model_key]

            # to clear field value if key exists and value is null and to keep it using removing for serializer and setting using instance.save()
            if image_model_key in cleaned_data:
                # to remove from dict because serializer requires file in filefield, but it is always string of CDN path or user URL
                del cleaned_data[image_model_key]

            with transaction.atomic():
                if request_method == 'POST':
                    instance = RemoteLessonQuezQuestionsAPIView.create(cleaned_data,QuezChoicesSerializer).instance
                    quez_questions_instance = None

                    if is_called_from_outside:
                        quez_questions_instance = QuezQuestions.objects.get(id=quez_question_id)

                    else:
                        quez_questions_instance = QuezQuestions.objects.get(id=parsed_stringified_data['quezQuestionsId'])

                    quez_questions_instance.choices.add(instance)

                elif request_method == 'PUT':
                    if is_called_from_outside:
                        if id:
                            instance = RemoteLessonQuezQuestionsAPIView.update(cleaned_data,id,QuezChoicesSerializer,partial=True).instance

                        else:
                            instance = RemoteLessonQuezChoicesAPIView.post_put(request,'POST',id,True,parsed_stringified_data,quez_choices_index,quez_question_id,quez_question_index)

                    else:
                        instance = RemoteLessonQuezQuestionsAPIView.update(cleaned_data,id,QuezChoicesSerializer,partial=True).instance

                if file_path:
                    old_file = instance.image
                    instance.image = file_path
                    instance.save()

                    if old_file:
                        if not old_file.name.startswith('http://') and not old_file.name.startswith('https://'):
                            RemoteLessonAPIView.rollbackCDN(old_file.name)

        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)
            RemoteLessonAPIView.rollbackCDN(relative_path)

            if is_called_from_outside:
                raise

        except Exception as e:
            traceback.print_exc()
            cdn_error_msg = 'Файл хадгалахад алдаа гарсан байна (CDN).'

            if e.__str__() == cdn_error_msg:
                result = request.send_error('CDN_error', cdn_error_msg)

            else:
                result = request.send_error("ERR_002")

            RemoteLessonAPIView.rollbackCDN(relative_path)

            if is_called_from_outside:
                raise

        if is_called_from_outside:
            result = instance

        return result

    @staticmethod
    def remove_instance(instance):
        relative_path = instance.image.name if instance.image else None

        with transaction.atomic():
            instance.delete()
            RemoteLessonAPIView.rollbackCDN(relative_path)
    # endregion

    @has_permission(must_permissions=['"lms-elearn-list-read"'])
    def get(self,request,pk=None):
        online_sub_info_id = request.query_params.get('onlineSubInfoId')
        self.queryset = self.queryset.filter(quezquestions__onlinesubinfo__id=online_sub_info_id)
        self.queryset = self.queryset.annotate(quez_question_id=F('quezquestions__id'))

        # region to sort by one or multiple fields
        sorting = self.request.GET.get('sorting', '')

        if sorting:
            self.queryset = self.queryset.order_by(*sorting.split(','))
        # endregion

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)
 
        serializer = self.list(request).data
        return request.send_data(serializer)
 
    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self, request):
        return self.post_put(request,request.method)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self,request,pk=None):
        return self.post_put(request,request.method,pk)

    # NOTE: there are no 'remote lesson' permissions, so i used atleast somehow related permissions
    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        instance = self.get_object()

        with transaction.atomic():
            RemoteLessonQuezChoicesAPIView.remove_instance(instance)

        return request.send_info("INF_003")


class GroupLessonProgressAPIView(generics.GenericAPIView):

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'code', 'register_num']

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        lesson_id = self.request.query_params.get('lesson_id')

        # Тухайн группийн онлайн хичээлүүдийн week материалууд
        week_materials = WeekMaterials.objects.filter(
            onlineweek__onlinelesson__students__group_id=group_id
        )

        if lesson_id:
            week_materials = week_materials.filter(onlineweek__onlinelesson__lesson_id=lesson_id)

        week_materials = week_materials.distinct()

        return Student.objects.filter(
            group_id=group_id,
            status__code=1
        ).prefetch_related(
            Prefetch(
                'weekmaterialviewers_set',
                queryset=WeekMaterialViewers.objects.filter(
                    week_material__in=week_materials
                ),
                to_attr='filtered_views'
            ),
            Prefetch(
                'onlinelesson_set',
                queryset=OnlineLesson.objects.prefetch_related(
                    Prefetch(
                        'weeks',
                        queryset=OnlineWeek.objects.prefetch_related(
                            Prefetch(
                                'materials',
                                queryset=week_materials,
                                to_attr='all_materials'
                            )
                        ),
                        to_attr='all_weeks'
                    )
                ).annotate(
                    total_materials=Count(
                        'weeks__materials',
                        distinct=True
                    )
                ),
                to_attr='enrolled_lessons'
            )
        ).distinct()

    def get(self, request):
        group_id = request.query_params.get('group_id')
        if not group_id:
            return request.send_error("ERR_002", "Анги сонгоно уу")

        students = self.get_queryset()
        students = self.filter_queryset(students)

        data = GroupLessonProgressSerializer(
            students,
            many=True,
            context={'request': request}
        ).data

        return request.send_data(data)


class OnlineLessonSummaryAPIView(generics.GenericAPIView):
    """ Цахим хичээлийн тоо мэдээлэл """

    @permission_classes([IsAuthenticated])
    def get(self, request):
        school_id = request.GET.get('school')

        online_lessons = OnlineLesson.objects.all()

        if school_id:
            online_lessons = online_lessons.filter(
                Q(teacher__salbar__isnull=False, teacher__salbar__sub_orgs=school_id) |
                Q(teacher__salbar__isnull=True, teacher__sub_org=school_id)
            )

        total_online_lessons = online_lessons.count()

        total_week_materials = (
            WeekMaterials.objects
            .filter(onlineweek__onlinelesson__in=online_lessons)
            .distinct()
            .count()
        )

        total_homeworks = (
            HomeWork.objects
            .filter(onlineweek__onlinelesson__in=online_lessons)
            .distinct()
            .count()
        )
        return request.send_data({
            'total_online_lessons': total_online_lessons,
            'total_week_materials': total_week_materials,
            'total_homeworks': total_homeworks,
        })
