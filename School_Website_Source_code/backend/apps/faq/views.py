from django.db import transaction
from django.db.models import F
from core.fns import WithChoices
from lms.models import FAQ, FAQGroup
from main.decorators import handle_serializer_errors
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import create_via_serializer, update_via_serializer
from rest_framework import generics, mixins
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter

from .serializers import FAQSerializer, FAQGroupSerializer


@permission_classes([IsAuthenticated])
class FAQAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """Нийтлэг асуулт хариулт"""

    queryset = FAQ.objects.all().order_by('-id')
    serializer_class = FAQSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['question']

    def get_queryset(self):
        sorting = self.request.query_params.get('sorting')

        queryset = self.queryset.annotate(group_type_name=WithChoices(FAQGroup.TYPE, 'group__type'))
        queryset = queryset.annotate(group_name=F('group__name'))

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):
        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data
        return request.send_data(return_datas)

    @handle_serializer_errors
    @transaction.atomic
    def post(self, request, created_file_pathes=None):
        create_via_serializer(data=request.data, model_class=FAQ)
        return request.send_info("INF_001")

    @handle_serializer_errors
    @transaction.atomic
    def put(self, request, created_file_pathes=None, pk=None):
        instance = self.get_object()
        update_via_serializer(data=request.data, instance=instance)
        return request.send_info('INF_002')

    @transaction.atomic
    def delete(self, request, pk=None):
        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class FAQGroupAPIView(
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """Нийтлэг асуултын бүлэг"""

    queryset = FAQGroup.objects.all().order_by('-id')
    serializer_class = FAQGroupSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        sorting = self.request.query_params.get('sorting')

        queryset = self.queryset.annotate(type_name=WithChoices(FAQGroup.TYPE, 'type'))

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):
        return_datas = self.list(request).data
        return request.send_data(return_datas)

    @handle_serializer_errors
    @transaction.atomic
    def post(self, request, created_file_pathes=None):
        create_via_serializer(data=request.data, model_class=FAQGroup)
        return request.send_info("INF_001")

    @handle_serializer_errors
    @transaction.atomic
    def put(self, request, created_file_pathes=None, pk=None):
        instance = self.get_object()
        update_via_serializer(data=request.data, instance=instance)
        return request.send_info('INF_002')

    @transaction.atomic
    def delete(self, request, pk=None):
        self.destroy(request, pk)
        return request.send_info("INF_003")
