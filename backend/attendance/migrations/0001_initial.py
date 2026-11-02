import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Employee",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("employee_id", models.CharField(max_length=32, unique=True)),
                ("name", models.CharField(max_length=128)),
                ("email", models.EmailField(max_length=128, unique=True)),
                ("department", models.CharField(max_length=64)),
                ("designation", models.CharField(max_length=128)),
                ("initials", models.CharField(max_length=8)),
                ("default_time", models.CharField(default="09:00", max_length=16)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["employee_id"],
            },
        ),
        migrations.CreateModel(
            name="AttendanceRecord",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PRESENT", "Present"),
                            ("ABSENT", "Absent"),
                            ("NOT_MARKED", "Not Marked"),
                        ],
                        default="NOT_MARKED",
                        max_length=24,
                    ),
                ),
                (
                    "check_in_time",
                    models.CharField(blank=True, default="", max_length=16),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attendance_records",
                        to="attendance.employee",
                    ),
                ),
            ],
            options={
                "ordering": ["employee__employee_id"],
                "unique_together": {("employee", "date")},
            },
        ),
    ]
