from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lms', '0377_gmaincategory_gsubcategory_wmaincategory_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GMainCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=1000, verbose_name='Үндсэн категорын нэр')),
                ('order_no', models.IntegerField(null=True, verbose_name='Дараалал')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GSubCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=1000, verbose_name='Sub категорын нэр')),
                ('score', models.FloatField(verbose_name='Оноо')),
                ('order_no', models.IntegerField(null=True, verbose_name='Дараалал')),
                ('value', models.TextField(null=True, verbose_name='Хэмжих нэгж')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lms.gmaincategory', verbose_name='Үндсэн категор')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WMainCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=1000, verbose_name='Үндсэн категорын нэр')),
                ('order_no', models.IntegerField(null=True, verbose_name='Дараалал')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WSubCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=1000, verbose_name='Sub категорын нэр')),
                ('score', models.FloatField(verbose_name='Оноо')),
                ('order_no', models.IntegerField(null=True, verbose_name='Дараалал')),
                ('value', models.TextField(null=True, verbose_name='Хэмжих нэгж')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lms.wmaincategory', verbose_name='Үндсэн категор')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='faqgroup',
            name='type',
            field=models.PositiveIntegerField(choices=[(1, 'Багш'), (2, 'Оюутан'), (3, 'Элсэгч')], db_index=True, default=1, verbose_name='Хэнд харагдах төрөл'),
        ),
        migrations.AlterField(
            model_name='paymentbalance',
            name='payment_type',
            field=models.PositiveBigIntegerField(choices=[(1, 'Сургалтын төлбөр'), (2, 'Хичээл нөхөлт'), (3, 'Дотуур байр'), (4, 'Элсэлтийн хураамж'), (5, 'Хичээл нөхөлт буцаалт'), (6, 'Систем ашигласны төлбөр')], null=True, verbose_name='Төлбөрийн зориулалт'),
        ),
        migrations.AlterField(
            model_name='profession_songonkredit',
            name='lesson_level',
            field=models.PositiveIntegerField(choices=[(1, 'Дээд боловсролын суурь хичээл'), (2, 'Мэргэжлийн суурь хичээл'), (3, 'Мэргэжлийн хичээл'), (5, 'Мэргэших хичээл'), (4, 'Диплом'), (11, 'Мэргэжлийн суурь хичээл'), (12, 'Мэргэжлийн хичээл'), (13, 'Туршилт, сорил, мэргэжлийн шалгалт'), (21, 'Мэргэжлийн суурь хичээл'), (22, 'Мэргэжлийн хичээл'), (23, 'Эрдэм шинжилгээ, судалгааны ажил')], db_index=True, default=1, verbose_name='Хичээлийн түвшин'),
        ),
        migrations.CreateModel(
            name='WTeacherFiles',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(max_length=500, upload_to='science', verbose_name='Файл')),
                ('send_type', models.BooleanField(default=False, verbose_name='Шалгуулах хүсэлт илгээсэн эсэх')),
                ('score', models.FloatField(null=True, verbose_name='Хуримтлагдсан оноо')),
                ('minus_score', models.FloatField(null=True, verbose_name='Хорогдол оноо')),
                ('approve_score', models.FloatField(null=True, verbose_name='Батлагдсан оноо')),
                ('lesson_year', models.CharField(default='2024-2025', max_length=50, null=True, verbose_name='Хичээл жил')),
                ('check_department', models.BooleanField(default=False, verbose_name='Арга зүйч бүрэлдэхүүн сургууль, институт, төвийн багшийн тайланг хянасан байдал')),
                ('check_dep_description', models.TextField(null=True, verbose_name='Арга зүйч бүрэлдэхүүн сургууль, институт, төвийн багшийн тайланг хянасан тайлбар')),
                ('check_dep_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='Төлөв')),
                ('check_senior', models.BooleanField(default=False, verbose_name='шалгасан эсэх')),
                ('check_senior_description', models.TextField(null=True, verbose_name='шалгасан тайлбар')),
                ('check_senior_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name=' шийдвэрийн төрөл')),
                ('check_intro', models.BooleanField(default=False, verbose_name='Зөвлөлд танилуулах эсэх')),
                ('check_intro_description', models.TextField(null=True, verbose_name='Зөвлөлд танилуулах тайлбар')),
                ('check_intro_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='Зөвлөлд танилуулах төлөв')),
                ('check_conference', models.BooleanField(default=False, verbose_name='хуралдаан зохион байгуулах эсэх')),
                ('check_conference_description', models.TextField(null=True, verbose_name='хуралдаан зохион байгуулах тайлбар')),
                ('check_conference_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='хуралдаан зохион байгуулах төлөв')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approved_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lms.wsubcategory', verbose_name='Дэд категор')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.teachers', verbose_name='Багш')),
            ],
        ),
        migrations.CreateModel(
            name='GTeacherFiles',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(max_length=500, upload_to='science', verbose_name='Файл')),
                ('send_type', models.BooleanField(default=False, verbose_name='Шалгуулах хүсэлт илгээсэн эсэх')),
                ('score', models.FloatField(null=True, verbose_name='Хуримтлагдсан оноо')),
                ('minus_score', models.FloatField(null=True, verbose_name='Хорогдол оноо')),
                ('approve_score', models.FloatField(null=True, verbose_name='Батлагдсан оноо')),
                ('lesson_year', models.CharField(default='2024-2025', max_length=50, null=True, verbose_name='Хичээл жил')),
                ('check_department', models.BooleanField(default=False, verbose_name='Арга зүйч бүрэлдэхүүн сургууль, институт, төвийн багшийн тайланг хянасан байдал')),
                ('check_dep_description', models.TextField(null=True, verbose_name='Арга зүйч бүрэлдэхүүн сургууль, институт, төвийн багшийн тайланг хянасан тайлбар')),
                ('check_dep_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='Төлөв')),
                ('check_senior', models.BooleanField(default=False, verbose_name='шалгасан эсэх')),
                ('check_senior_description', models.TextField(null=True, verbose_name='шалгасан тайлбар')),
                ('check_senior_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name=' шийдвэрийн төрөл')),
                ('check_intro', models.BooleanField(default=False, verbose_name='Зөвлөлд танилуулах эсэх')),
                ('check_intro_description', models.TextField(null=True, verbose_name='Зөвлөлд танилуулах тайлбар')),
                ('check_intro_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='Зөвлөлд танилуулах төлөв')),
                ('check_conference', models.BooleanField(default=False, verbose_name='хуралдаан зохион байгуулах эсэх')),
                ('check_conference_description', models.TextField(null=True, verbose_name='хуралдаан зохион байгуулах тайлбар')),
                ('check_conference_state', models.IntegerField(choices=[(1, 'Баталгаажуулсан'), (2, 'Буцаасан'), (3, 'Илгээсэн')], default=3, verbose_name='хуралдаан зохион байгуулах төлөв')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approved_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lms.gsubcategory', verbose_name='Дэд категор')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.teachers', verbose_name='Багш')),
            ],
        ),
        migrations.AlterField(
            model_name='timeestimatesettings',
            name='teacher_rank_type',
            field=models.PositiveIntegerField(blank=True, choices=[(1, ' Проффессор'), (2, 'Дэд проффессор'), (3, 'Дамжааны захирагч багш'), (4, 'Эрхлэгч'), (5, 'Ахлах багш'), (6, 'Багш'), (7, 'Дадлагажигч багш')], db_index=True, default=None, null=True, verbose_name='Албан тушаал'),
        ),
    ]
