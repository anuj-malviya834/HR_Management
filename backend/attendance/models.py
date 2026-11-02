from django.db import models

emp_id_max_length = 32
name_max_length = 128
email_max_length = 128
dept_max_length = 64
desig_max_length = 128
initials_max_length = 8
time_str_max_length = 16
status_max_length = 24
remarks_max_length = 255

STATUS_PRESENT = "PRESENT"
STATUS_ABSENT = "ABSENT"
STATUS_HALF_DAY = "HALF_DAY"
STATUS_HOLIDAY = "HOLIDAY"
STATUS_NOT_MARKED = "NOT_MARKED"

ATTENDANCE_STATUS_CHOICES = (
    (STATUS_PRESENT, "Present"),
    (STATUS_ABSENT, "Absent"),
    (STATUS_HALF_DAY, "Half Day"),
    (STATUS_HOLIDAY, "Holiday / Weekend"),
    (STATUS_NOT_MARKED, "Not Marked"),
)

class Employee(models.Model):
    employee_id = models.CharField(max_length=emp_id_max_length, unique=True)
    name = models.CharField(max_length=name_max_length)
    email = models.EmailField(max_length=email_max_length, unique=True)
    department = models.CharField(max_length=dept_max_length)
    designation = models.CharField(max_length=desig_max_length)
    initials = models.CharField(max_length=initials_max_length)
    default_time = models.CharField(max_length=time_str_max_length, default="09:00")
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["employee_id"]

    def __str__(self):
        repr_val = f"{self.employee_id} - {self.name}"
        return repr_val

class AttendanceRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(max_length=status_max_length, choices=ATTENDANCE_STATUS_CHOICES, default=STATUS_NOT_MARKED)
    check_in_time = models.CharField(max_length=time_str_max_length, blank=True, default="")
    check_out_time = models.CharField(max_length=time_str_max_length, blank=True, default="")
    remarks = models.CharField(max_length=remarks_max_length, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["employee__employee_id"]

    def __str__(self):
        rec_repr = f"{self.employee.employee_id} - {self.date} - {self.status}"
        return rec_repr
