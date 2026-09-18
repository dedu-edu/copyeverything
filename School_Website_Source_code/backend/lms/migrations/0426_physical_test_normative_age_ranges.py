from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lms', '0425_alter_lesson_teacher_scoretype_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='physicaltestnormativerule',
            name='min_age',
            field=models.PositiveSmallIntegerField(
                blank=True,
                null=True,
                verbose_name='Насны доод хязгаар',
            ),
        ),
        migrations.AddField(
            model_name='physicaltestnormativerule',
            name='max_age',
            field=models.PositiveSmallIntegerField(
                blank=True,
                null=True,
                verbose_name='Насны дээд хязгаар',
            ),
        ),
        migrations.AddIndex(
            model_name='physicaltestnormativerule',
            index=models.Index(
                fields=['document', 'item', 'gender', 'min_age', 'max_age'],
                name='lms_physnorm_age_idx',
            ),
        ),
    ]
