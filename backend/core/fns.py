from django.db.models import (
    Case,
    CharField,
    Value,
    When,
    Func,
    IntegerField,
)


class WithChoices(Case):
    """ model ийн сонголтийг annotate дээр нөхцөл болгож өгөх нь """
    def __init__(self, choices, field):
        whens = [When(**{field: k, 'then': Value(v)}) for k, v in choices]
        return super().__init__(*whens, output_field=CharField())


class ArrayLength(Func):
    function = 'CARDINALITY'
    output_field = IntegerField()
