
import os
from rest_framework import serializers

from main.utils.function.utils import build_url
from lms.models import LearnerGuide, Structure
from lms.models import StudentDevelop
from lms.models import Library
from lms.models import Health, StudentRules
from lms.models import StudentPsycholocal
from lms.models import StudentTime
from lms.models import PsycholocalHelp
from lms.models import HealthHelp

class StructureSerializer(serializers.ModelSerializer):
    " Их сургуулийн бүтэц зохион байгуулалт"
    class Meta:
        model = Structure
        fields = "__all__"


class StudentDevelopSerializer(serializers.ModelSerializer):
    " Суралцагчийн хөгжил "
    class Meta:
        model = StudentDevelop
        fields = "__all__"


class LibrarySerializer(serializers.ModelSerializer):
    " Номын сан танилуулга "
    class Meta:
        model = Library
        fields = "__all__"


class StudentPsycholocalSerializer(serializers.ModelSerializer):
    "  Сэтгэл зүйн булан "
    class Meta:
        model = StudentPsycholocal
        fields = "__all__"

class HealthSerializer(serializers.ModelSerializer):
    "  Эрүүл мэнд "
    class Meta:
        model = Health
        fields = "__all__"


class StudentRulesSerializer(serializers.ModelSerializer):
    "  Номын сангийн журам "
    class Meta:
        model = StudentRules
        fields = "__all__"


class StudentTimeSerializer(serializers.ModelSerializer):
    "  Номын сангийн цагийн хуваарь"
    class Meta:
        model = StudentTime
        fields = "__all__"
    

class PsycholocalHelpSerializer(serializers.ModelSerializer):
    " Сэтгэл зүйн зөвлөмж "

    class Meta:
        model = PsycholocalHelp
        fields = "__all__"

class HealthHelpSerializer (serializers.ModelSerializer):
    " Эрүүл мэнд зөвлөмж  "

    class Meta:
        model = HealthHelp
        fields = "__all__"


class LearnerGuideSerializer(serializers.ModelSerializer):
    "Суралцагчийн гарын авлага"

    class Meta:
        model = LearnerGuide
        fields = "__all__"

    profession = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    def get_profession(self, obj):
        return {
            'id': obj.profession.id,
            'code': obj.profession.code,
            'name': obj.profession.name,
            'degree': {'degree_code': obj.profession.degree.degree_code},
            'confirm_year': obj.profession.confirm_year,
        }

    def get_file(self, obj):
        return build_url(obj.file.name) if obj.file else ''


class LearnerGuideSaveSerializer(serializers.ModelSerializer):
    "Суралцагчийн гарын авлага. To save"

    class Meta:
        model = LearnerGuide
        fields = "__all__"

    file = serializers.CharField(allow_null=True, allow_blank=True)
