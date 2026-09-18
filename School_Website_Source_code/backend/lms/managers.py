from django.db import models
from django.db.models.expressions import RawSQL
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.base_user import BaseUserManager


class TeacherScoreQuerySet(models.QuerySet):
    def unique_only(self):
        """
            Давхардсан бичилтүүдээс зөвхөн хамгийн сүүлийнхийг нь авч буцаана.
        """
        return self.order_by(
            'student', 'lesson_year', 'lesson_season', 'score_type', '-created_at'
        ).distinct(
            'student', 'lesson_year', 'lesson_season', 'score_type'
        )

class TeacherScoreManager(models.Manager):
    def get_queryset(self):
        return TeacherScoreQuerySet(self.model, using=self._db)

    def get_unique_scores(self):
        return self.get_queryset().unique_only()


class TimeTableManager(models.Manager):

    def generate_weeks(self):
        qs = super().get_queryset()

        subquery_sql = """
            (
                SELECT odd_even
                FROM lms_systemsettings
                WHERE active_lesson_year = lms_timetable.lesson_year
                AND active_lesson_season_id = lms_timetable.lesson_season_id
                LIMIT 1
            )
        """

        qs = qs.annotate(
            week_numbers=models.ExpressionWrapper(
                RawSQL(
                    f"""
                        SELECT ARRAY(
                            SELECT s.w
                            FROM generate_series(
                                (CASE WHEN lms_timetable.begin_week IS NULL AND lms_timetable.is_kurats = False THEN 1 ELSE lms_timetable.begin_week END),
                                (CASE WHEN lms_timetable.end_week IS NULL AND lms_timetable.is_kurats = False THEN 20 ELSE lms_timetable.end_week END)
                            ) AS s(w)
                            WHERE
                                (lms_timetable.odd_even = 3) OR
                                (
                                    {subquery_sql} = 2 AND
                                    (
                                        lms_timetable.odd_even = 1 AND s.w %% 2 = 0 OR
                                        lms_timetable.odd_even = 2 AND s.w %% 2 <> 0
                                    )
                                ) OR
                                (
                                    {subquery_sql} = 1 AND
                                    (
                                        lms_timetable.odd_even = 2 AND s.w %% 2 = 0 OR
                                        lms_timetable.odd_even = 1 AND s.w %% 2 <> 0
                                    )
                                )
                        )
                    """,
                    [],
                ),
                output_field=ArrayField(models.IntegerField()),
            )
        )

        return qs


class AdmissionUserManager(BaseUserManager):  # ✅
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username заавал шаардлагатай')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class AdmissionUserProfessionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(user__is_active=True)


class AdmissionPaymentManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(admission__is_active=True)
