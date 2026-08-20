

from core.models import Employee
from lms.models import Feedback
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import has_permission
from rest_framework import generics, mixins
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from django.db.models import Prefetch, F, Subquery, OuterRef

from .serializers import FeedbackDetailSerializer, FeedbackExcelSerializer, FeedbackSerializer


@permission_classes([IsAuthenticated])
class FeedbackAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Системийн хөгжүүлэлттэй холбоотой санал хүсэлт '''

    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title', 'description', 'teacher__first_name']

    @has_permission(must_permissions=['lms-login'])
    def get(self, request, pk=None):
        ctype = request.query_params.get("type")
        sub_org = request.query_params.get("sub_org")
        sorting = request.query_params.get("sorting")
        created_at_end = request.query_params.get("created_at_end")
        created_at_start = request.query_params.get("created_at_start")

        # to firstly check pk to avoid heavy further execution if pk is defined
        if pk:
            self.serializer_class = FeedbackDetailSerializer
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        # to sort by register code in react-datatable-component
        teacher_register_code_sq = (
            Subquery(
                Employee.objects
                .filter(
                    user=OuterRef('teacher__user'),
                    state=Employee.STATE_WORKING,
                ).values('register_code')[:1]
            )
        )

        # to sort by register code in react-datatable-component
        self.queryset = (
            self.queryset.annotate(
                teacher_register_code=teacher_register_code_sq,
            )
        )

        # to reduce database stress when using serializer
        self.queryset = (
            self.queryset
            .prefetch_related(
                Prefetch(
                    'teacher__user__employee_set',
                    queryset=Employee.objects.filter(state=Employee.STATE_WORKING)
                )
            )
            .select_related(
                'teacher__sub_org'
            )
        )

        # filters
        filters = {}

        if created_at_start:
            filters['created_at__gte'] = created_at_start

        if created_at_end:
            filters['created_at__lte'] = created_at_end

        if sub_org:
            filters['teacher__sub_org'] = sub_org

        if ctype:
            filters['type'] = ctype

        self.queryset = self.queryset.filter(**filters)

        # sorting
        if sorting:
            self.queryset = self.queryset.order_by(sorting)

        # to return for excel data
        if request.GET.get('mode') == 'excel':
            self.serializer_class = FeedbackExcelSerializer

        # output
        return_datas = self.list(request).data
        return request.send_data(return_datas)
