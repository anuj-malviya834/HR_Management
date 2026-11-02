from django.contrib import admin
from .models import Employee, AttendanceRecord

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "name", "department", "designation", "is_active")
    search_fields = ("employee_id", "name", "email", "department")
    list_filter = ("department", "is_active")

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "status", "check_in_time", "updated_at")
    list_filter = ("status", "date", "employee__department")
    search_fields = ("employee__employee_id", "employee__name")
