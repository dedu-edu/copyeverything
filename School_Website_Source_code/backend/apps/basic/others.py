from rest_framework.filters import OrderingFilter
from rest_framework.pagination import PageNumberPagination

from apps.basic.utils import get_allowed_fields, parse_model_name


class BasicPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'limit'
    page_size = 10
    max_page_size = 100


class DynamicOrderingFilter(OrderingFilter):
    ordering_param = 'sort'

    def get_ordering_fields(self, view, request):
        app_name, model_name = parse_model_name(self, view.whitelist)
        fields = self.request.query_params.get('sort', '').replace('-', '').split(',')
        fields = get_allowed_fields(fields, 'ordering_fields', app_name, model_name, view.whitelist)

        if fields:
            return fields

        return super().get_ordering_fields(view, request)
