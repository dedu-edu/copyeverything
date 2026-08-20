from lms.models import Feedback
from rest_framework import serializers

from main.utils.function.utils import build_url, safe_get


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        exclude = ["description"]

    type = serializers.SerializerMethodField()
    teacher = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    teacher_register_code = serializers.CharField()

    def get_type(self, obj):
        return {
            'id': obj.type,
            'name': obj.get_type_display(),
        }

    def get_teacher(self, obj):
        employee = obj.teacher.user.employee_set.first()

        def get_sub_org(teacher, employee):
            result = (
                teacher.sub_org or
                safe_get(teacher, None, 'salbar', 'sub_orgs') or
                employee.sub_org or
                safe_get(employee, None, 'salbar', 'sub_orgs')
            )

            if not result:
                return None

            result = {
                'id': result.id,
                'name': result.name,
            }

            return result

        sub_org = get_sub_org(obj.teacher, employee)

        return {
            'id': obj.teacher_id,
            'first_name': safe_get(obj, 'teacher', None, 'first_name'),
            'last_name': safe_get(obj, 'teacher', None, 'last_name'),
            'sub_org': sub_org,
        }

    def get_file(self, obj):
        file_url = build_url(safe_get(obj.file, None, 'name'))
        file_url = file_url.replace("dxis", "") if file_url else None
        return file_url


class FeedbackDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "description"]


class FeedbackExcelSerializer(FeedbackSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
