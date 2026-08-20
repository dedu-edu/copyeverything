from datetime import datetime
import json
import traceback
from django.conf import settings
from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db import transaction

from django.db.models import F, Func, Value, CharField, Count, Prefetch, Q, prefetch_related_objects, Subquery, OuterRef
from django.db.models.functions import TruncDay, Lower

from lms.models import (
    SurveyQuestionTitle,
    SurveyQuestions,
    QuestionChoices,
    Employee,
    Survey,
    Pollee,
    Student,
    SubOrgs,
    Salbars,
    ProfessionDefinition,
    Group,
    Notification,
    SurveyChoices,
    SoulSurvey,
)

from core.models import (
    Teachers
)

from .serializers import (
    SoulSurveySerializer,
    SurveyDetailsSerializer,
    SurveyEditCommonSerializer,
    SurveyEditGeneralSerializer,
    SurveyEditSoulSerializer,
    SurveyQuestionTitleSerializer,
    SurveyQuestionsLightEditCommonSerializer,
    SurveyQuestionsLightEditGeneralSerializer,
    SurveyQuestionsLightSerializer,
    SurveyQuestionsListSerializer,
    SurveyListSerializer,
    PolleeSerializer,
    DepartmentSerializer,
    SurveyQuestionsSerializer,
    SurveySchoolSerializer,
    SurveySchoolStudentSerializer,
    DepartmentStudentSerializer,
    ProfessionDefinitionStudentSerializer,
    GroupStudentSerializer,
    StudentSurveySerializer,
    TeacherSerializer,
    SurveySerializer,
    SurveyOroltsogchidNerSerializer,
    SurveyPolleeSerializer,
    SurveyTeacherSerializer,
    SurveyStudentSerializer,
)

from lms.models import get_choice_survey_image_path
from lms.models import get_image_survey_path

from main.utils.function.utils import get_relative_url, get_scope_kind_and_people, get_translated_serializer_errors, link_soul_survey, ltrim, remove_files, remove_key_from_dict, json_load, null_to_none, has_permission, get_active_student, str2bool, get_active_year_season, survey_notification
from main.utils.function.pagination import CustomPagination

from main.utils.file import save_file_question, remove_folder

@permission_classes([IsAuthenticated])
class SurveyQuestionsAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Сургалтын алба судалгааны асуултууд """
    queryset = SurveyQuestions.objects.all().order_by('-created_at')
    serializer_class = SurveyQuestionsListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['question']

    @has_permission(must_permissions=['lms-survey-question-read'])
    def get(self, request, pk=None):

        self.queryset = self.queryset.filter(is_rate_teacher=True)
        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    @has_permission(must_permissions=['lms-survey-question-create'])
    def post(self, request, pk=None):
        """ Асуулт шинээр үүсгэх """

        # DICTIONARY -ээс value авахдаа get ашиглана
        user = request.user

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        created_by = Employee.objects.get(user_id=user)
        teacher = Teachers.objects.filter(user=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    question['created_by'] = created_by
                    question['is_rate_teacher'] = True

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = SurveyQuestions.objects.create(
                        **question
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:

                        for choice in choices:

                            # choice['created_by'] = teacher

                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = SurveyChoices.objects.create(
                                **choice
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)

                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-survey-question-update'])
    def put(self, request, pk=None):

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        user = request.user
        created_by = Employee.objects.get(user_id=user)

        teacher = Teachers.objects.filter(user=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    question['created_by'] = created_by

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if 'kind_name' in question:
                        del question['kind_name']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj, created = SurveyQuestions.objects.update_or_create(
                        id=pk,
                        defaults={
                            **question
                        }
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()
                    else:
                        old_image = question_obj.image

                        # Хуучин зураг засах үедээ устгасан бол файл устгана.
                        if old_image and not image_name:
                            remove_folder(str(old_image))

                            question_obj.image = None
                            question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:

                        for choice in choices:
                            choice['created_by'] = teacher
                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj, created = QuestionChoices.objects.update_or_create(
                                id=choice.get('id'),
                                defaults={
                                    **choice
                                }
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)

                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()
                            else:
                                choice_old_image = choice_obj.image

                                # Хуучин зураг засах үедээ устгасан бол файл устгана.
                                if choice_old_image and not img_name:
                                    remove_folder(str(choice_old_image))

                                    choice_obj.image = None
                                    choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info('INF_002')

    @has_permission(must_permissions=['lms-survey-question-delete'])
    def delete(self, request, pk=None):

        question = self.queryset.filter(id=pk).first()
        try:
            question_img = question.image

            if question_img:
                remove_folder(str(question_img))

                if question:
                    choices = question.choices.all()

                    for choice in choices:
                        img = choice.image

                        # Хэрвээ хариултын хэсэгт зураг байвал устгана
                        if img:
                            remove_folder(str(img))

                        choice.delete()

                    # Хариултын хэсгийг устгах хэсэг
                    question.choices.clear()

            question.delete()

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class PolleeApiView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Судалгааны асуултанд хариулах
    """

    queryset = Pollee.objects.all().order_by('created_at')
    serializer_class = PolleeSerializer

    def school_filter(self, survey, pollee_qs):
        request = self.request
        school = request.query_params.get('school')

        if school:
            school_q = Q(student__school=school)

            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                school_q = Q(teacher__sub_org=school)

            pollee_qs = pollee_qs.filter(school_q)

        return pollee_qs

    def gender_filter(self, survey, pollee_qs):
        request = self.request
        gender = request.query_params.get('gender')

        if gender:
            gender_q = Q(student__gender=gender)

            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                gender_q = Q(teacher__gender=gender)

            pollee_qs = pollee_qs.filter(gender_q)

        return pollee_qs

    def profession_filter(self, survey, pollee_qs):
        request = self.request
        profession = request.query_params.get('profession')

        if profession:
            profession_q = Q(student__group__profession=profession)

            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                profession_q = Q(teacher__salbar=Subquery(ProfessionDefinition.objects.filter(id=profession).values('department')))

            pollee_qs = pollee_qs.filter(profession_q)

        return pollee_qs

    def lesson_filter(self, pollee_qs):
        request = self.request
        lesson = request.query_params.get('lesson')

        if lesson:
            pollee_qs = pollee_qs.filter(survey__in=Subquery(SoulSurvey.objects.filter(
                survey=OuterRef('survey'),
                lesson=lesson,
            ).values('survey')))

        return pollee_qs

    def group_filter(self, survey, pollee_qs):
        request = self.request
        group = request.query_params.get('group')

        if group:
            group_q = Q(student__group=group)

            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                group_q = Q(teacher__salbar=Subquery(Group.objects.filter(id=group).values('profession__department')))

            pollee_qs = pollee_qs.filter(group_q)

        return pollee_qs

    def get(self, request, pk):
        survey = Survey.objects.get(id=pk)

        # region filters
        pollee_qs = Pollee.objects.all()
        pollee_qs = self.school_filter(survey, pollee_qs)
        pollee_qs = self.gender_filter(survey, pollee_qs)
        pollee_qs = self.profession_filter(survey, pollee_qs)
        pollee_qs = self.lesson_filter(pollee_qs)
        pollee_qs = self.group_filter(survey, pollee_qs)

        prefetch_related_objects(
            [survey],
            Prefetch(
                'questions',
                queryset=SurveyQuestions.objects.prefetch_related(
                    Prefetch(
                        'choices',
                        queryset=SurveyChoices.objects.prefetch_related(
                            Prefetch(
                                'pollee_set',
                                queryset=pollee_qs
                            )
                        )
                    ),
                    Prefetch(
                        'pollee_set',
                        queryset=pollee_qs
                    ),
                )
            ),
            Prefetch(
                'pollee_set',
                queryset=pollee_qs
            ),
        )
        # endregion

        datas = SurveyPolleeSerializer(survey, many=False).data

        pollees = survey.pollee_set \
                .values('created_at') \
                .annotate(name=Func(
                    TruncDay('created_at'),
                    Value('yyyy-MM-dd'),
                    function='to_char',
                    output_field=CharField()
                )) \
                .values("name") \
                .annotate(count=Count("name")) \
                .order_by("name")

        poll_users = list()

        if not survey.is_hide_employees:
            group_field = "student"

            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                group_field = "teacher"

            qs = survey.pollee_set \
                .values(group_field) \
                .annotate(count=Count(group_field)) \
                .values("count", name=F(group_field)) \
                .order_by("-count")

            poll_users = SurveyOroltsogchidNerSerializer(qs, many=True, context={ "group_field": group_field }).data

        return request.send_data(
            {
                "questions": datas,
                "pollees": list(pollees),
                "poll_users": poll_users
            }
        )


@permission_classes([IsAuthenticated])
class SurveyRangeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    # queryset = Teachers.objects.all()
    # serializer_class = SurveyRangeSerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    def get(self, request, pk=None):

        types = request.query_params.get('types')
        selected_value = request.query_params.get('selected_value')

        if not types or not selected_value:

            return request.send_data(None)

        c_queryset = None
        c_serializer = None

        # Багш үед
        if types == 'teacher':
            # Салбарын жагсаалт
            if selected_value == 'is_org':
                c_queryset = SubOrgs.objects.filter(is_school=True)
                c_serializer = SurveySchoolSerializer

            # Тэнхимийн жагсаалт
            if selected_value == 'is_dep':
                c_queryset = Salbars.objects.all()
                c_serializer = DepartmentSerializer

            # Багш нарын жагсаалт
            if selected_value == 'is_teacher':
                c_queryset = Teachers.objects.all()
                c_serializer = TeacherSerializer

        # Оюутан үед
        if types == 'student':

            # Салбарын жагсаалт
            if selected_value == 'is_org':
                c_queryset = SubOrgs.objects.filter(is_school=True)
                c_serializer = SurveySchoolStudentSerializer

            # Тэнхимийн жагсаалт
            if selected_value == 'is_dep':
                c_queryset = Salbars.objects.all()
                c_serializer = DepartmentStudentSerializer

            # Мэргэжлүүдийн жагсаалт
            if selected_value == 'is_pro':
                c_queryset = ProfessionDefinition.objects.all()
                c_serializer = ProfessionDefinitionStudentSerializer

            # Ангиудын жагсаалт
            if selected_value == 'is_group':
                c_queryset = Group.objects.all().filter(is_finish=False)
                c_serializer = GroupStudentSerializer

            # Оюутнуудын жагсаалт
            if selected_value == 'is_student':
                c_queryset = Student.objects.all().filter(status__code=1)
                c_serializer = StudentSurveySerializer

        с_search_fields = []

        if selected_value in ['is_org', 'is_dep', 'is_pro', 'is_group']:
            с_search_fields.append('name')

        if selected_value in ['is_pro']:
            с_search_fields.extend(['code', 'profession_code'])

        self.queryset = c_queryset
        self.serializer_class = c_serializer
        self.search_fields = с_search_fields

        get_result = self.list(request).data

        return request.send_data(get_result)


@permission_classes([IsAuthenticated])
class SurveyAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Судалгаа үүсгэх """

    queryset = Survey.objects.all().order_by('-created_at')
    serializer_class = SurveySerializer

    filter_backends = [SearchFilter]
    search_fields = ['start_date','end_date', 'title']

    pagination_class = CustomPagination

    @staticmethod
    def set_if_has_key(dict_var, field, new_dict):
        """
        to avoid repeating if else code
        """

        if field in dict_var:
            new_dict[field] = dict_var[field]

    @staticmethod
    def process_new_question(question, question_img, uploaded_file_pathes, is_soul, qkind, uploaded_question_file_pathes=None, unchanged_question_file_pathes=None):
        # Сэтгэл ханамжийн судалгаа properties
        if is_soul:
            question['is_required'] = True

        else:
            question_old_img = get_relative_url(question.get('image'))
            question_old_img = ltrim(question_old_img, settings.MEDIA_URL)

            if question_img:
                question_img_path = get_image_survey_path(SurveyQuestions())
                file_path = save_file_question(question_img, question_img_path)[0]
                question['image'] = file_path
                uploaded_file_pathes.append(file_path)

                if uploaded_question_file_pathes is not None:
                    uploaded_question_file_pathes.append(file_path)

            elif question_old_img:
                question['image'] = question_old_img

                if unchanged_question_file_pathes is not None:
                    unchanged_question_file_pathes.append(question_old_img)

        if qkind != SurveyQuestions.KIND_MULTI_CHOICE:
            question = remove_key_from_dict(question, ['max_choice_count'])

        if qkind != SurveyQuestions.KIND_RATING:
            question = remove_key_from_dict(question, ['rating_max_count', 'low_rating_word', 'high_rating_word', 'rating_words'])

    @staticmethod
    def process_new_choice(choice, choice_img, uploaded_file_pathes, uploaded_choice_file_pathes=None, unchanged_choice_file_pathes=None):
        """
        to prepare in POST and PUT methods these arguuments: choice, uploaded_file_pathes, uploaded_choice_file_pathes, unchanged_choice_file_pathes
        """

        choice_old_img = get_relative_url(choice.get('image'))
        choice_old_img = ltrim(choice_old_img, settings.MEDIA_URL)

        if choice_img:
            choice_img_path = get_choice_survey_image_path(SurveyChoices())
            file_path = save_file_question(choice_img, choice_img_path)[0]
            choice['image'] = file_path
            uploaded_file_pathes.append(file_path)

            if uploaded_choice_file_pathes is not None:
                uploaded_choice_file_pathes.append(file_path)

        elif choice_old_img:
            choice['image'] = choice_old_img

            if unchanged_choice_file_pathes is not None:
                unchanged_choice_file_pathes.append(choice_old_img)

    @staticmethod
    def get_general_data(queryset, pk=None):
        """
        to display survey fields that used only in "Detail modal"
        for optimization: to make one loop instead of many loops inside serializer
        """

        queryset = queryset.prefetch_related('questions__title', 'questions__created_by__user', 'questions__choices')

        if pk:
            queryset = queryset.filter(id=pk)

        result = {}

        for survey in queryset:
            titles = []
            titles_has_seen = {}

            for question in survey.questions.all().order_by('title', 'id'):
                if question.title_id not in titles_has_seen:
                    titles_has_seen[question.title_id] = len(titles)
                    titles.append({'id': question.title_id})

                current_title = titles[titles_has_seen[question.title_id]]

                if 'questions' not in current_title:
                    current_title['questions'] = []

                current_title['questions'].append(SurveyQuestionsLightSerializer(question).data)

            if survey.id not in result:
                result[survey.id] = SurveyDetailsSerializer(survey).data

            if titles:
                if 'question_titles' not in result[survey.id]:
                    result[survey.id]['question_titles'] = []

                result[survey.id]['question_titles'] = titles

        return result

    @staticmethod
    def get_general_data_to_edit(queryset, pk):
        """
        to edit survey fields that same in all survey types.
        """

        queryset = queryset.filter(id=pk).prefetch_related('questions__title', 'questions__created_by__user', 'questions__choices')
        result = {}

        for survey in queryset:
            titles = []
            titles_has_seen = {}

            for question in survey.questions.all():
                if question.title_id not in titles_has_seen:
                    titles_has_seen[question.title_id] = len(titles)
                    titles.append({'id': question.title_id, **SurveyQuestionTitleSerializer(question.title).data})

                current_title = titles[titles_has_seen[question.title_id]]

                if 'questions' not in current_title:
                    current_title['questions'] = []

                current_title['questions'].append(SurveyQuestionsLightEditGeneralSerializer(question).data)

            if survey.id not in result:
                result[survey.id] = SurveyEditGeneralSerializer(survey).data

            if titles:
                if 'question_titles' not in result[survey.id]:
                    result[survey.id]['question_titles'] = []

                result[survey.id]['question_titles'] = titles

        return result

    @staticmethod
    def get_soul_data_to_edit(queryset, pk):
        """
        to edit survey fields that used only in "Сэтгэл ханамжийн" survey type
        """

        queryset = queryset.filter(id=pk).prefetch_related('soulsurvey_set__teacher', 'soulsurvey_set__lesson')
        result = {}

        for survey in queryset:
            if survey.id not in result:
                result[survey.id] = SurveyEditSoulSerializer(survey).data

        return result

    @staticmethod
    def get_common_data_to_edit(queryset, pk):
        """
        to edit survey fields that used only in "Энгийн" survey type
        """

        queryset = queryset.filter(id=pk).prefetch_related('questions__title', 'questions__created_by__user', 'questions__choices')
        result = {}

        for survey in queryset:
            titles = []
            titles_has_seen = {}

            for question in survey.questions.all():
                if question.title_id not in titles_has_seen:
                    titles_has_seen[question.title_id] = len(titles)
                    titles.append({'id': question.title_id})

                current_title = titles[titles_has_seen[question.title_id]]

                if 'questions' not in current_title:
                    current_title['questions'] = []

                current_title['questions'].append(SurveyQuestionsLightEditCommonSerializer(question).data)

            if survey.id not in result:
                result[survey.id] = SurveyEditCommonSerializer(survey).data

            if titles:
                if 'question_titles' not in result[survey.id]:
                    result[survey.id]['question_titles'] = []

                result[survey.id]['question_titles'] = titles

        return result

    def get(self, request, pk=None):
        if pk:
            # to edit survey fields that same in all survey types
            EDIT_GENERAL = 1

            # to edit survey fields that used only in "Энгийн" survey type
            EDIT_COMMON = 2

            # to edit survey fields that used only in "Сэтгэл ханамжийн" survey type
            EDIT_SOUL = 3

            mode = int(request.GET.get('mode')) if request.GET.get('mode') else None

            # for edit modal
            if mode == EDIT_GENERAL:
                result = self.get_general_data_to_edit(self.queryset, pk)[pk]

            elif mode == EDIT_COMMON:
                result = self.get_common_data_to_edit(self.queryset, pk)[pk]

            elif mode == EDIT_SOUL:
                result = self.get_soul_data_to_edit(self.queryset, pk)[pk]

            # for detail modal
            else:
                result = self.get_general_data(self.queryset, pk)[pk]

            return request.send_data(result)

        self.queryset = self.queryset.select_related('created_by__user')
        self.serializer_class = SurveyListSerializer
        time_type = request.query_params.get('time_type')
        survey_type = request.query_params.get('surveyType')
        scope_kind = request.query_params.get('scopeKind')

        if time_type:
            state_filters = Survey.get_state_filter(time_type)
            self.queryset = self.queryset.filter(**state_filters)

        if survey_type == '1':
            self.queryset = self.queryset.filter(is_soul=False)

        elif survey_type == '2':
            self.queryset = self.queryset.filter(is_soul=True, soul_type=Survey.SOUL_TYPE_GENERAL)

        elif survey_type == '3':
            self.queryset = self.queryset.filter(is_soul=True, soul_type=Survey.SOUL_TYPE_TEACHERS_LESSONS)

        self.queryset = self.queryset.filter(scope_kind=scope_kind) if scope_kind else self.queryset

        # NOTE яагаад үүсгэсэн хэрэглэгчийг Employee холбосонг сайн мэдэхгүй байна.
        if not request.user.is_superuser:
            self.queryset = self.queryset.filter(created_by__user=request.user)

        all_list = self.list(request).data
        return request.send_data(all_list)

    def post(self, request):
        request_data = request.data.dict()
        datas = json.loads(request_data['data'])
        question_titles = json.loads(request_data['questionTitles'])

        now = datetime.now()
        worker = request.user.employee

        # for notification
        lesson_year, lesson_season_id = get_active_year_season()
        title = datas.get('title')
        end_date = datas.get('end_date').split('T')[0]

        # region Сэтгэл ханамжийн судалгаа properties
        is_soul = datas.get('is_soul')
        soul_type = datas.get('soul_type')
        is_soul_all = datas.get('is_soul_all')
        soul_teachers = datas.get('soul_teacher')

        if is_soul:
            datas['is_required'] = True
        # endregion

        # to define scope vars
        is_all = datas.get('is_all')
        selected_ids = datas.get('selected_ids')
        isAllStudent = datas.get('isAllStudent')
        isAllTeacher = datas.get('isAllTeacher')
        is_teacher = datas.get('is_teacher')
        scope_kind, array_key, selected_ids = get_scope_kind_and_people(is_all, isAllStudent, isAllTeacher, is_teacher, selected_ids)

        # to change scope people only if they are received
        if not is_all and selected_ids:
            datas[array_key] = selected_ids

        # NOTE Сэтгэл ханамжийн does not use files
        uploaded_file_pathes = []

        with transaction.atomic():
            try:
                # to bulk_create
                title_objs = []
                question_objs = []
                choice_objs = []

                # to link choices to questions after their bulk create
                question_choice_links = []
                question_title_links = []

                for tidx, question_title in enumerate(question_titles):
                    questions = question_title['questions']

                    new_datas = {}
                    self.set_if_has_key(question_title, 'name', new_datas)
                    new_datas['created_at'] = now
                    title_obj = SurveyQuestionTitle(**new_datas)

                    for qidx, question in enumerate(questions):
                        qkind = question.get('kind')
                        self.process_new_question(question, request.FILES.get(f'questionImg{tidx}_{qidx}'), uploaded_file_pathes, is_soul, qkind)
                        new_datas = {}
                        self.set_if_has_key(question, 'kind', new_datas)
                        self.set_if_has_key(question, 'question', new_datas)
                        self.set_if_has_key(question, 'title_id', new_datas)
                        self.set_if_has_key(question, 'is_required', new_datas)
                        self.set_if_has_key(question, 'is_rate_teacher', new_datas)
                        self.set_if_has_key(question, 'image', new_datas)
                        self.set_if_has_key(question, 'rating_max_count', new_datas)
                        self.set_if_has_key(question, 'low_rating_word', new_datas)
                        self.set_if_has_key(question, 'high_rating_word', new_datas)
                        self.set_if_has_key(question, 'rating_words', new_datas)
                        self.set_if_has_key(question, 'max_choice_count', new_datas)
                        new_datas['created_by'] = worker
                        new_datas['created_at'] = now
                        question_obj = SurveyQuestions(**new_datas)

                        current_choice_objs = []

                        if qkind in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:
                            choices = question.get('choices')

                            for cidx, choice in enumerate(choices):
                                self.process_new_choice(choice, request.FILES.get(f'choiceImg{tidx}_{qidx}_{cidx}'), uploaded_file_pathes)
                                new_datas = {}
                                self.set_if_has_key(choice, 'choices', new_datas)
                                self.set_if_has_key(choice, 'image', new_datas)
                                new_datas['created_at'] = now
                                choice_obj = SurveyChoices(**new_datas)

                                current_choice_objs.append(choice_obj)
                                choice_objs.append(choice_obj)

                        # NOTE this lists should be with same indexes to connect them
                        question_objs.append(question_obj)
                        question_choice_links.append(current_choice_objs)
                        question_title_links.append(title_obj)

                    title_objs.append(title_obj)

                new_datas = {}
                self.set_if_has_key(datas, array_key, new_datas)
                self.set_if_has_key(datas, 'title', new_datas)
                self.set_if_has_key(datas, 'description', new_datas)
                self.set_if_has_key(datas, 'start_date', new_datas)
                self.set_if_has_key(datas, 'end_date', new_datas)
                self.set_if_has_key(datas, 'is_soul', new_datas)
                self.set_if_has_key(datas, 'is_all', new_datas)
                self.set_if_has_key(datas, 'is_required', new_datas)
                self.set_if_has_key(datas, 'is_hide_employees', new_datas)
                self.set_if_has_key(datas, 'soul_type', new_datas)
                new_datas['scope_kind'] = scope_kind
                new_datas['created_at'] = now
                new_datas['created_by'] = worker.id

                serializer = self.get_serializer(data=new_datas, partial=True)

                if not serializer.is_valid(raise_exception=False):
                    print(serializer.errors)
                    serializer_errors_mn = get_translated_serializer_errors(serializer.errors)
                    transaction.set_rollback(True)
                    remove_files(uploaded_file_pathes, False)
                    return request.send_error_valid(serializer_errors_mn)

                # region to create by single SQL e.g. to avoid database spam in for-loops
                survey_obj = serializer.save()

                # to create titles and it's dependencies
                SurveyQuestionTitle.objects.bulk_create(title_objs)

                for index, question_obj in enumerate(question_objs):
                    question_obj.title = question_title_links[index]
                # endregion

                # to create questions and it's dependencies
                SurveyQuestions.objects.bulk_create(question_objs)
                survey_obj.questions.set(question_objs)
                SurveyChoices.objects.bulk_create(choice_objs)

                for index, question_obj in enumerate(question_objs):
                    question_obj.choices.set(question_choice_links[index])
                # endregion

                # for notification
                survey_notification(survey_obj.is_required, scope_kind, selected_ids, title, end_date, request)

                # to link/unlink Survey to SoulSurvey model
                if is_soul:
                    link_soul_survey(survey_obj.id, soul_type, lesson_year, lesson_season_id, is_soul_all, soul_teachers)

            except Exception:
                traceback.print_exc()
                transaction.set_rollback(True)
                remove_files(uploaded_file_pathes, False)
                return request.send_error('ERR_002')

        return request.send_info('INF_002')

    def put(self, request, pk):
        def copy_shared_titles(question_titles, created_at, survey_id):
            """
            to copy survey question titles for current survey if another survey has same survey question title ids. Because before SurveyQuestionTitle model had wrong config:
                "...models.UniqueConstraint(
                    Lower('name'),
                    name='unique_name_ci'
                )..."
            """

            question_title_ids = [item['id'] for item in question_titles if item.get('id')]
            question_shared_title_dict = dict(SurveyQuestionTitle.objects.filter(id__in=question_title_ids).exclude(surveyquestions__survey=survey_id).values_list('surveyquestions', 'id').distinct())

            titles_to_create = []
            question_new_title_dict = {}
            titles_to_copy = {}

            for question_title in question_titles:
                if 'id' not in question_title:
                    continue

                for question in question_title['questions']:
                    if 'id' not in question:
                        continue

                    if question['id'] in question_shared_title_dict:
                        if question_title['id'] not in titles_to_copy:
                            titles_to_copy[question_title['id']] = SurveyQuestionTitle(
                                name=question_title['name'],
                                created_at=created_at
                            )

                            titles_to_create.append(titles_to_copy[question_title['id']])

                        question_new_title_dict[question['id']] = titles_to_copy[question_title['id']]

            SurveyQuestionTitle.objects.bulk_create(titles_to_create)

            questions_to_update = []

            for qid, title in question_new_title_dict.items():
                questions_to_update.append(
                    SurveyQuestions(id=qid, title_id=title.id)
                )

            for question_title in question_titles:
                if 'id' not in question_title:
                    continue

                for question in question_title['questions']:
                    if 'id' not in question:
                        continue

                    if question['id'] in question_new_title_dict:
                        question_title['id'] = question_new_title_dict[question['id']].id

            SurveyQuestions.objects.bulk_update(questions_to_update, ['title_id'])
            return question_titles

        request_data = request.data.dict()
        datas = json.loads(request_data['data'])
        question_titles = json.loads(request_data['questionTitles'])

        now = datetime.now()
        worker = request.user.employee

        # for notification
        lesson_year, lesson_season_id = get_active_year_season()
        title = datas.get('title')
        end_date = datas.get('end_date').split('T')[0]

        # region Сэтгэл ханамжийн судалгаа properties
        is_soul = datas.get('is_soul')
        soul_type = datas.get('soul_type')
        is_soul_all = datas.get('is_soul_all')
        soul_teachers = datas.get('soul_teacher')

        if is_soul:
            datas['is_required'] = True
        # endregion

        # to define scope vars
        is_all = datas.get('is_all')
        selected_ids = datas.get('selected_ids')
        isAllStudent = datas.get('isAllStudent')
        isAllTeacher = datas.get('isAllTeacher')
        is_teacher = datas.get('is_teacher')
        scope_kind, array_key, selected_ids = get_scope_kind_and_people(is_all, isAllStudent, isAllTeacher, is_teacher, selected_ids)

        # to change scope people only if they are received
        if not is_all and selected_ids:
            datas[array_key] = selected_ids

        # NOTE Сэтгэл ханамжийн does not use files
        uploaded_file_pathes = []
        uploaded_question_file_pathes = []
        uploaded_choice_file_pathes = []
        unchanged_question_file_pathes = []
        unchanged_choice_file_pathes = []

        with transaction.atomic():
            try:
                # to bulk_create
                title_objs_to_create = []
                question_objs_to_create = []
                choice_objs_to_create = []

                # to bulk_update
                title_objs_to_update = []
                question_objs_to_update = []
                choice_objs_to_update = []

                # to link choices to questions after their bulk create
                question_objs_to_link = []
                question_choice_links = []
                question_title_links = []

                """
                NOTE this is to handle temporary migration post-effect:
                    "...migrations.RemoveConstraint(
                        model_name='surveyquestiontitle',
                        name='unique_name_ci',
                    ),...".
                lms migration file: 0385_remove_surveyquestiontitle_unique_name_ci_and_more.py
                """
                question_titles = copy_shared_titles(question_titles, now, pk)

                for tidx, question_title in enumerate(question_titles):
                    questions = question_title['questions']

                    new_datas = {}
                    new_datas['name'] = question_title.get('name')
                    new_datas['created_at'] = now
                    title_obj = SurveyQuestionTitle(**new_datas)

                    if question_title.get('id'):
                        title_obj.id = question_title['id']
                        title_objs_to_update.append(title_obj)
                    else:
                        title_objs_to_create.append(title_obj)

                    for qidx, question in enumerate(questions):
                        qkind = question.get('kind')
                        self.process_new_question(question, request.FILES.get(f'questionImg{tidx}_{qidx}'), uploaded_file_pathes, is_soul, qkind, uploaded_question_file_pathes, unchanged_question_file_pathes)
                        new_datas = {}
                        new_datas['kind'] = question.get('kind')
                        new_datas['question'] = question.get('question')
                        new_datas['title_id'] = question.get('title_id')
                        new_datas['is_required'] = question.get('is_required', SurveyQuestions._meta.get_field("is_required").get_default())
                        new_datas['is_rate_teacher'] = question.get('is_rate_teacher', SurveyQuestions._meta.get_field("is_rate_teacher").get_default())
                        new_datas['image'] = question.get('image')
                        new_datas['rating_max_count'] = question.get('rating_max_count')
                        new_datas['low_rating_word'] = question.get('low_rating_word', 0)
                        new_datas['high_rating_word'] = question.get('high_rating_word', 0)
                        new_datas['rating_words'] = question.get('rating_words')
                        new_datas['max_choice_count'] = question.get('max_choice_count')
                        new_datas['created_by'] = worker
                        new_datas['created_at'] = now
                        question_obj = SurveyQuestions(**new_datas)

                        if question.get('id'):
                            question_obj.id = question['id']
                            question_objs_to_update.append(question_obj)
                        else:
                            question_objs_to_create.append(question_obj)

                        current_choice_objs = []

                        if qkind in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:
                            choices = question.get('choices')

                            for cidx, choice in enumerate(choices):
                                self.process_new_choice(choice, request.FILES.get(f'choiceImg{tidx}_{qidx}_{cidx}'), uploaded_file_pathes, uploaded_choice_file_pathes, unchanged_choice_file_pathes)
                                new_datas = {}
                                new_datas['choices'] = choice.get('choices')
                                new_datas['image'] = choice.get('image')
                                new_datas['created_at'] = now
                                choice_obj = SurveyChoices(**new_datas)
                                current_choice_objs.append(choice_obj)

                                if choice.get('id'):
                                    choice_obj.id = choice['id']
                                    choice_objs_to_update.append(choice_obj)
                                else:
                                    choice_objs_to_create.append(choice_obj)

                        # to connect objects by indexes
                        question_objs_to_link.append(question_obj)
                        question_choice_links.append(current_choice_objs)
                        question_title_links.append(title_obj)

                new_datas = {}
                self.set_if_has_key(datas, array_key, new_datas)
                new_datas['title'] = datas.get('title')
                new_datas['description'] = datas.get('description')
                new_datas['start_date'] = datas.get('start_date')
                new_datas['end_date'] = datas.get('end_date')
                new_datas['is_soul'] = datas.get('is_soul', Survey._meta.get_field("is_soul").get_default())
                new_datas['is_all'] = datas.get('is_all', Survey._meta.get_field("is_all").get_default())
                new_datas['is_required'] = datas.get('is_required', Survey._meta.get_field("is_required").get_default())
                new_datas['is_hide_employees'] = datas.get('is_hide_employees', Survey._meta.get_field("is_hide_employees").get_default())
                new_datas['soul_type'] = datas.get('soul_type')

                if scope_kind:
                    new_datas['scope_kind'] = scope_kind

                new_datas['updated_at'] = now
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=new_datas, partial=True)

                if not serializer.is_valid(raise_exception=False):
                    print(serializer.errors)
                    serializer_errors_mn = get_translated_serializer_errors(serializer.errors)
                    transaction.set_rollback(True)
                    remove_files(uploaded_file_pathes, False)
                    return request.send_error_valid(serializer_errors_mn)

                # region to create by single SQL e.g. to avoid database spam in for-loops
                survey_obj = serializer.save()

                # to update existing SurveyQuestionTitle
                SurveyQuestionTitle.objects.bulk_update(title_objs_to_update, ['name', 'created_at'])

                # to update existing SurveyChoices
                SurveyChoices.objects.bulk_update(choice_objs_to_update, ['choices', 'image', 'created_at'])

                # to create titles
                SurveyQuestionTitle.objects.bulk_create(title_objs_to_create)

                # to link titles to questions
                for index, question_obj in enumerate(question_objs_to_link):
                    question_obj.title_id = question_title_links[index].id

                # to update existing SurveyQuestions
                SurveyQuestions.objects.bulk_update(question_objs_to_update, [
                    'kind',
                    'question',
                    'title_id',
                    'is_required',
                    'is_rate_teacher',
                    'image',
                    'rating_max_count',
                    'low_rating_word',
                    'high_rating_word',
                    'rating_words',
                    'max_choice_count',
                    'created_by',
                    'created_at',
                ])

                # to create questions
                SurveyQuestions.objects.bulk_create(question_objs_to_create)

                # to link questions to survey
                ids = [item.id for item in question_objs_to_link]
                survey_obj.questions.set(ids)

                # to create choices
                SurveyChoices.objects.bulk_create(choice_objs_to_create)

                # to link choices to questions
                for index, question_obj in enumerate(question_objs_to_link):
                    ids = [item.id for item in question_choice_links[index]]
                    question_obj.choices.set(ids)
                # endregion

                # NOTE to clean orphan questions, choices, titles. Because after survey edit all questions and all choices are being recreated
                # NOTE firstly need to remove parent models because filter will be changed after parents removals
                # region to remove orphaned SurveyQuestions entries
                orphan_questions_qs = SurveyQuestions.objects.filter(survey__isnull=True)

                # to remove only if files are not same as in not orphan records
                remove_files(list(orphan_questions_qs.exclude(image__in=[*uploaded_question_file_pathes, *unchanged_question_file_pathes]).values_list('image', flat=True).distinct()), False)

                # NOTE delete() need to be called only after set file fields to None to prevent automatic removing by "django_cleanup.apps.CleanupConfig" app of unchanged files. Because model instances are always being recreated that causes autoremoval effect
                orphan_questions_qs.update(image=None)
                orphan_questions_qs.delete()
                # endregion

                # to remove orphaned SurveyChoices entries
                orphan_choices_qs = SurveyChoices.objects.filter(surveyquestions__isnull=True)
                remove_files(list(orphan_choices_qs.exclude(image__in=[*uploaded_choice_file_pathes, *unchanged_choice_file_pathes]).values_list('image', flat=True).distinct()), False)
                orphan_choices_qs.update(image=None)
                orphan_choices_qs.delete()

                # to remove orphaned SurveyQuestionTitle entries
                SurveyQuestionTitle.objects.filter(surveyquestions__isnull=True).delete()

                # for notification
                survey_notification(survey_obj.is_required, scope_kind, selected_ids, title, end_date, request)

                # to link Survey to SoulSurvey model
                if is_soul:
                    link_soul_survey(survey_obj.id, soul_type, lesson_year, lesson_season_id, is_soul_all, soul_teachers)

            except Exception:
                traceback.print_exc()
                transaction.set_rollback(True)
                remove_files(uploaded_file_pathes, False)
                return request.send_error('ERR_002')

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        survey = self.get_object()
        questions = survey.questions.all()
        use_cdn = True if survey.is_soul else False

        try:
            with transaction.atomic():
                for question in questions:
                    # Хэрвээ асуултанд зураг байвал устгана
                    question_img = question.image

                    if question_img:
                        remove_files(question_img.name, use_cdn, False)

                        if question:
                            choices = question.choices.all()

                            for choice in choices:
                                img = choice.image

                                # Хэрвээ хариултын хэсэгт зураг байвал устгана
                                if img:
                                    remove_files(img.name, use_cdn, False)

                                choice.delete()

                            # Хариултын хэсгийг устгах хэсэг
                            question.choices.clear()

                    question.delete()

                survey.questions.clear()
                SoulSurvey.objects.filter(survey=pk).delete()

                if survey.image:
                    remove_files(survey.image.name, use_cdn, False)

                self.destroy(request, pk)

        except Exception:
            traceback.print_exc()
            return request.send_error("ERR_002")

        return request.send_info("INF_003")


class SurveyAllListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Бүх лист авах """

    queryset = Survey.objects.all().order_by('-created_at')
    serializer_class = SurveySerializer
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description']

    def get(self, request):

        bogloson_sudalgaa_ids = Pollee.objects.values_list('survey', flat=True)

        self.queryset = self.queryset.filter(id__in=bogloson_sudalgaa_ids)

        all_data = self.list(request).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class SurveyTeachersAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin
):
    """ Судалгаа details modal/teachers """

    queryset = Teachers.objects.all()
    serializer_class = SurveyTeacherSerializer

    filter_backends = [SearchFilter]
    search_fields = ['first_name','code']

    pagination_class = CustomPagination

    def get(self, request, survey_id):
        survey_qs = Survey.objects.all()

        if not request.user.is_superuser:
            # NOTE яагаад үүсгэсэн хэрэглэгчийг Employee холбосонг сайн мэдэхгүй байна.
            survey_qs = survey_qs.filter(created_by=request.user.employee)

        teachers_ids = survey_qs.filter(id=survey_id).values_list('teachers', flat=True).first()

        if not teachers_ids:
            return request.send_data([])

        self.queryset = self.queryset.filter(id__in=teachers_ids)
        result = self.list(request).data
        return request.send_data(result)


@permission_classes([IsAuthenticated])
class SurveyStudentsAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin
):
    """ Судалгаа details modal/students """

    queryset = Student.objects.all()
    serializer_class = SurveyStudentSerializer

    filter_backends = [SearchFilter]
    search_fields = ['first_name','code']

    pagination_class = CustomPagination

    def get(self, request, survey_id):
        survey_qs = Survey.objects.all()

        if not request.user.is_superuser:
            # NOTE яагаад үүсгэсэн хэрэглэгчийг Employee холбосонг сайн мэдэхгүй байна.
            survey_qs = survey_qs.filter(created_by=request.user.employee)

        students_ids = survey_qs.filter(id=survey_id).values_list('oyutans', flat=True).first()

        if not students_ids:
            return request.send_data([])

        self.queryset = self.queryset.filter(id__in=students_ids)
        result = self.list(request).data
        return request.send_data(result)
