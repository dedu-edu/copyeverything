from django.db import migrations


def seed_physical_test_categories(apps, schema_editor):
    PhysicalTestCategory = apps.get_model('lms', 'PhysicalTestCategory')
    PhysicalTestSubCategory = apps.get_model('lms', 'PhysicalTestSubCategory')
    StudentPhysicalTestResult = apps.get_model('lms', 'StudentPhysicalTestResult')

    # Байгаа өгөгдлүүдийг устгах
    StudentPhysicalTestResult.objects.all().delete()
    PhysicalTestSubCategory.objects.all().delete()
    PhysicalTestCategory.objects.all().delete()

    # ──────────────────────────────────────────────
    # 1. Биеийн өндөр, жингийн харьцаа
    # ──────────────────────────────────────────────
    cat1 = PhysicalTestCategory.objects.create(
        name='Биеийн өндөр, жингийн харьцаа',
        order=1,
        self_physicaltestcategory=None,
    )
    for i, name in enumerate([
        'Биеийн жин',
        'Цээжний тойрог',
        'Бүсэлхийн тойрог',
        'Ташааны тойрог',
        'Гарын тойргийн хэмжээ',
    ], start=1):
        PhysicalTestSubCategory.objects.create(
            physicaltestcategory=cat1,
            name=name,
            order=i,
            is_active=True,
        )

    # ──────────────────────────────────────────────
    # 2. Бие бялдрын шалгалт
    # ──────────────────────────────────────────────
    cat2 = PhysicalTestCategory.objects.create(
        name='Бие бялдрын шалгалт',
        order=2,
        self_physicaltestcategory=None,
    )

    subcategory_groups = [
        {
            'name': 'Хурд',
            'order': 1,
            'items': [
                '60 м гүйлт',
                '100 м гүйлт',
                '10 x 10 гүйлт',
            ],
        },
        {
            'name': 'Хүч',
            'order': 2,
            'items': [
                'Гар дээр суниалт',
                'Гэдэсний таталт',
                'Сууж босох',
                'Дүүжинд суниах',
                'Савлуулт суниах',
                'Туухай өргөлт /24, 16 кг/',
            ],
        },
        {
            'name': 'Тэсвэр',
            'order': 3,
            'items': [
                '1000м гүйлт',
                '3000м гүйлт',
            ],
        },
        {
            'name': 'Авхаалж самбаа',
            'order': 4,
            'items': [
                'І цогцолбор дасгал',
                'Сандал дээгүүр харайх',
                'Модон ямаан дээгүүр давтаж харайх',
            ],
        },
        {
            'name': 'Уян хатан',
            'order': 5,
            'items': [
                'Бөхийж гараар газар тулах',
                'Сууж урагш бөхийх',
            ],
        },
    ]

    for group in subcategory_groups:
        child_cat = PhysicalTestCategory.objects.create(
            name=group['name'],
            order=group['order'],
            self_physicaltestcategory=cat2,
        )
        for i, item_name in enumerate(group['items'], start=1):
            PhysicalTestSubCategory.objects.create(
                physicaltestcategory=child_cat,
                name=item_name,
                order=i,
                is_active=True,
            )


def reverse_seed(apps, schema_editor):
    PhysicalTestCategory = apps.get_model('lms', 'PhysicalTestCategory')
    PhysicalTestSubCategory = apps.get_model('lms', 'PhysicalTestSubCategory')
    PhysicalTestSubCategory.objects.all().delete()
    PhysicalTestCategory.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('lms', '0405_alter_studentphysicaltest_session'),
    ]

    operations = [
        migrations.RunPython(seed_physical_test_categories, reverse_code=reverse_seed),
    ]