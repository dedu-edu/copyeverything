from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.apps import apps

from apps.basic.utils import dynamic_serializer, get_allowed_fields, parse_model_name
from apps.basic.others import BasicPagination, DynamicOrderingFilter
from apps.basic.constants import whitelist


"""
NOTE
- update whitelist for more access
"""

@permission_classes([IsAuthenticated])
class BasicViewSet(viewsets.ModelViewSet):
    pagination_class = BasicPagination
    filter_backends = [filters.SearchFilter, DynamicOrderingFilter]
    whitelist = whitelist

    def get_queryset(self):
        """
        to define queryset and to toggle pagination
        """

        # to get queryset
        app_name, model_name = parse_model_name(self, self.whitelist)
        model = apps.get_model(app_name, model_name)
        queryset = model.objects.all()

        # to toggle pagination
        if self.request.query_params.get('isAll') == 'true':
            self.pagination_class = None

        # region to apply basic filters
        filter_dict = {}

        for key, value in self.request.query_params.items():
            if key in self.whitelist[app_name][model_name]['filter_fields']:
                filter_dict[key] = value

        queryset = queryset.filter(**filter_dict)
        # endregion

        return queryset

    def get_serializer_class(self):
        """
        to define serializer
        """

        # to get model
        app_name, model_name = parse_model_name(self, self.whitelist)
        model = apps.get_model(app_name, model_name)

        # to get fields
        fields = self.request.query_params.get('fields', '').split(',')
        fields = get_allowed_fields(fields, 'serializer_fields', app_name, model_name, self.whitelist)

        serializer_class = dynamic_serializer(model, fields, 0)
        return serializer_class

    @property
    def search_fields(self):
        """
        to define search fields
        """

        app_name, model_name = parse_model_name(self, self.whitelist)
        fields = self.request.query_params.get('search_fields', '').split(',')
        fields = get_allowed_fields(fields, 'search_fields', app_name, model_name, self.whitelist)
        return fields

    def dispatch(self, request, *args, **kwargs):
        """
        to limit access to methods
        """

        app_name, model_name = parse_model_name(self, self.whitelist)

        if request.method not in self.whitelist[app_name][model_name]['methods']:
            raise Exception('access denied')

        return super().dispatch(request, *args, **kwargs)
