from django.urls import path
from .views import (
    EmployeeListView,
    EmployeeDetailView,
    AttendanceDashboardView,
    MarkAttendanceView,
    BulkMarkPresentView,
    ResetDateAttendanceView,
    EmployeeAttendanceHistoryView,
)

urlpatterns = [
    path("employees/", EmployeeListView.as_view(), name="employee-list"),
    path("employees/<str:employee_id>/", EmployeeDetailView.as_view(), name="employee-detail"),
    path("attendance/", AttendanceDashboardView.as_view(), name="attendance-dashboard"),
    path("attendance/mark/", MarkAttendanceView.as_view(), name="attendance-mark"),
    path("attendance/mark-all-present/", BulkMarkPresentView.as_view(), name="attendance-mark-all-present"),
    path("attendance/reset-date/", ResetDateAttendanceView.as_view(), name="attendance-reset-date"),
    path("attendance/employee/<str:employee_id>/history/", EmployeeAttendanceHistoryView.as_view(), name="employee-attendance-history"),
]
