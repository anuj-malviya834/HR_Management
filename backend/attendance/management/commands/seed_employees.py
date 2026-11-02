from datetime import date
import calendar
from django.core.management.base import BaseCommand
from attendance.models import (
    Employee,
    AttendanceRecord,
    STATUS_PRESENT,
    STATUS_ABSENT,
    STATUS_HALF_DAY,
    STATUS_HOLIDAY,
    STATUS_NOT_MARKED,
)

zero_val = 0
one_val = 1
two_val = 2
mod_trio = 3
mod_septet = 7
saturday_idx = 5
sunday_idx = 6
default_year_val = 2026
columbus_day_val = 12
columbus_month_val = 10
seed_threshold_max = 20
seed_day_factor = 7
seed_month_factor = 13
fallback_code = 49
october_month_val = 10
september_month_val = 9
august_month_val = 8

default_checkout_str = "17:35"
half_checkout_str = "13:00"
on_time_remark = "On-time attendance"
weekend_remark = "Weekend"
columbus_remark = "Columbus Day / Indigenous Day"
absence_remark = "Unplanned absence"
half_day_remark = "Medical half-day"
empty_str = ""

sample_employees = [
    {
        "employee_id": "EMP-1001",
        "name": "Sarah Chen",
        "email": "sarah.chen@acme.inc",
        "department": "Engineering",
        "designation": "Staff Backend Engineer",
        "initials": "SC",
        "default_time": "08:45",
        "hire_date": date(2022, 3, 15),
    },
    {
        "employee_id": "EMP-1002",
        "name": "Marcus Vance",
        "email": "marcus.vance@acme.inc",
        "department": "Engineering",
        "designation": "Senior DevOps Specialist",
        "initials": "MV",
        "default_time": "09:02",
        "hire_date": date(2021, 8, 1),
    },
    {
        "employee_id": "EMP-1003",
        "name": "Elena Rostova",
        "email": "elena.rostova@acme.inc",
        "department": "Engineering",
        "designation": "Frontend Engineer",
        "initials": "ER",
        "default_time": "09:15",
        "hire_date": date(2022, 11, 10),
    },
    {
        "employee_id": "EMP-1004",
        "name": "David Kim",
        "email": "david.kim@acme.inc",
        "department": "Marketing",
        "designation": "Growth Marketing Manager",
        "initials": "DK",
        "default_time": "08:55",
        "hire_date": date(2023, 1, 5),
    },
    {
        "employee_id": "EMP-1005",
        "name": "Rachel Green",
        "email": "rachel.green@acme.inc",
        "department": "Marketing",
        "designation": "Content Strategist",
        "initials": "RG",
        "default_time": "09:10",
        "hire_date": date(2023, 4, 18),
    },
    {
        "employee_id": "EMP-1006",
        "name": "James Wilson",
        "email": "james.wilson@acme.inc",
        "department": "Sales",
        "designation": "Enterprise Account Exec",
        "initials": "JW",
        "default_time": "09:20",
        "hire_date": date(2021, 6, 20),
    },
    {
        "employee_id": "EMP-1007",
        "name": "Priya Patel",
        "email": "priya.patel@acme.inc",
        "department": "Sales",
        "designation": "Senior Sales Representative",
        "initials": "PP",
        "default_time": "08:50",
        "hire_date": date(2022, 9, 12),
    },
    {
        "employee_id": "EMP-1008",
        "name": "Michael Torres",
        "email": "michael.torres@acme.inc",
        "department": "HR",
        "designation": "Talent Acquisition Lead",
        "initials": "MT",
        "default_time": "09:05",
        "hire_date": date(2020, 2, 14),
    },
    {
        "employee_id": "EMP-1009",
        "name": "Amanda Brooks",
        "email": "amanda.brooks@acme.inc",
        "department": "HR",
        "designation": "People Operations Partner",
        "initials": "AB",
        "default_time": "08:40",
        "hire_date": date(2021, 10, 5),
    },
    {
        "employee_id": "EMP-1010",
        "name": "Thomas Clark",
        "email": "thomas.clark@acme.inc",
        "department": "Operations",
        "designation": "Senior Supply Chain Analyst",
        "initials": "TC",
        "default_time": "09:12",
        "hire_date": date(2023, 2, 1),
    },
    {
        "employee_id": "EMP-1011",
        "name": "Jessica Taylor",
        "email": "jessica.taylor@acme.inc",
        "department": "Operations",
        "designation": "Facilities Coordinator",
        "initials": "JT",
        "default_time": "08:35",
        "hire_date": date(2022, 7, 25),
    },
    {
        "employee_id": "EMP-1012",
        "name": "Robert Martinez",
        "email": "robert.martinez@acme.inc",
        "department": "Engineering",
        "designation": "QA Automation Engineer",
        "initials": "RM",
        "default_time": "09:25",
        "hire_date": date(2023, 8, 15),
    },
]

target_months = [august_month_val, september_month_val, october_month_val]

class Command(BaseCommand):
    help = "Seed database with realistic enterprise employee records and complete historical attendance"

    def handle(self, *args, **options):
        total_seeded_records = zero_val
        created_employees = zero_val

        for item in sample_employees:
            emp, created = Employee.objects.get_or_create(
                employee_id=item["employee_id"],
                defaults=item,
            )
            if created:
                created_employees += one_val

            emp_code = ord(emp.employee_id[-one_val]) if emp.employee_id else fallback_code
            today_date = date.today()

            for target_m in target_months:
                days_range = calendar.monthrange(default_year_val, target_m)[one_val]
                for day_num in range(one_val, days_range + one_val):
                    date_obj = date(default_year_val, target_m, day_num)
                    if date_obj >= today_date:
                        continue

                    day_of_week = date_obj.weekday()

                    status_val = STATUS_PRESENT
                    check_in_val = emp.default_time
                    check_out_val = default_checkout_str
                    remarks_val = on_time_remark

                    if day_of_week == saturday_idx or day_of_week == sunday_idx:
                        status_val = STATUS_HOLIDAY
                        check_in_val = empty_str
                        check_out_val = empty_str
                        remarks_val = weekend_remark
                    elif target_m == columbus_month_val and day_num == columbus_day_val:
                        status_val = STATUS_HOLIDAY
                        check_in_val = empty_str
                        check_out_val = empty_str
                        remarks_val = columbus_remark
                    else:
                        seed_val = (day_num * seed_day_factor + target_m * seed_month_factor + emp_code) % seed_threshold_max
                        if seed_val == zero_val or seed_val == one_val:
                            status_val = STATUS_ABSENT
                            check_in_val = empty_str
                            check_out_val = empty_str
                            remarks_val = absence_remark
                        elif seed_val == two_val:
                            status_val = STATUS_HALF_DAY
                            check_in_val = emp.default_time
                            check_out_val = half_checkout_str
                            remarks_val = half_day_remark
                        else:
                            status_val = STATUS_PRESENT
                            check_in_val = emp.default_time
                            check_out_val = default_checkout_str
                            remarks_val = on_time_remark

                    record, rec_created = AttendanceRecord.objects.get_or_create(
                        employee=emp,
                        date=date_obj,
                        defaults={
                            "status": status_val,
                            "check_in_time": check_in_val,
                            "check_out_time": check_out_val,
                            "remarks": remarks_val,
                        },
                    )
                    if not rec_created:
                        record.status = status_val
                        record.check_in_time = check_in_val
                        record.check_out_time = check_out_val
                        record.remarks = remarks_val
                        record.save()

                    total_seeded_records += one_val

        msg = f"Successfully seeded {len(sample_employees)} employees and {total_seeded_records} attendance records."
        self.stdout.write(self.style.SUCCESS(msg))
        return msg
