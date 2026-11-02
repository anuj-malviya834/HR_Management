from rest_framework import serializers
from .models import Employee, AttendanceRecord

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_id",
            "name",
            "email",
            "department",
            "designation",
            "initials",
            "default_time",
            "hire_date",
            "is_active",
            "created_at",
        ]

class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source="employee.employee_id", read_only=True)
    employee_name = serializers.CharField(source="employee.name", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "employee",
            "employee_id",
            "employee_name",
            "date",
            "status",
            "check_in_time",
            "check_out_time",
            "remarks",
            "updated_at",
        ]
