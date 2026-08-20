from lms.models import FAQ, FAQGroup
from rest_framework import serializers


class FAQSerializer(serializers.ModelSerializer):
    """Нийтлэг асуулт хариулт"""

    class Meta:
        model = FAQ
        fields = "__all__"

    group_type_name = serializers.CharField()
    group_name = serializers.CharField()


class FAQGroupSerializer(serializers.ModelSerializer):
    """Нийтлэг асуултын бүлэг"""

    class Meta:
        model = FAQGroup
        fields = "__all__"

    type_name = serializers.CharField()
