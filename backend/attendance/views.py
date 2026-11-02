import calendar
from datetime import datetime, date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from .models import (
    Employee,
    AttendanceRecord,
    STATUS_PRESENT,
    STATUS_ABSENT,
    STATUS_HALF_DAY,
    STATUS_HOLIDAY,
    STATUS_NOT_MARKED,
)
from .serializers import EmployeeSerializer

zero_count = 0
single_increment = 1
two_val = 2
percentage_base = 100
minutes_in_hour = 60
half_day_multiplier = 0.5
saturday_weekday_idx = 5
sunday_weekday_idx = 6
default_hist_year = 2026
october_num = 10
september_num = 9
august_num = 8
default_pad_width = 2
default_time_value = "09:00"
default_empty_time = "—"
zero_duration_str = "0h 00m"
weekend_remark_str = "Weekend"
empty_remark_str = "—"

def get_percentage(count_val, total_val):
    if total_val == zero_count:
        ret_zero = zero_count
        return ret_zero
    calc_percent = round((count_val / total_val) * percentage_base)
    return calc_percent

def get_parsed_date(date_str):
    if not date_str:
        today_date = date.today()
        return today_date
    try:
        parsed = datetime.strptime(date_str, "%Y-%m-%d").date()
        return parsed
    except ValueError:
        fallback = date.today()
        return fallback

def calc_working_hours(in_str, out_str):
    if not in_str or not out_str:
        ret_empty = default_empty_time
        return ret_empty
    in_parts = in_str.split(":")
    out_parts = out_str.split(":")
    if len(in_parts) < two_val or len(out_parts) < two_val:
        ret_empty = default_empty_time
        return ret_empty
    try:
        in_min = int(in_parts[zero_count]) * minutes_in_hour + int(in_parts[single_increment])
        out_min = int(out_parts[zero_count]) * minutes_in_hour + int(out_parts[single_increment])
        diff = out_min - in_min
        if diff <= zero_count:
            ret_zero = zero_duration_str
            return ret_zero
        h = diff // minutes_in_hour
        m = diff % minutes_in_hour
        pad_m = str(m).zfill(default_pad_width)
        res_str = f"{h}h {pad_m}m"
        return res_str
    except ValueError:
        ret_empty = default_empty_time
        return ret_empty

base_emp_id_num = 1000
max_initials_len = 4
fallback_initials = "EM"
id_prefix_str = "EMP-"

class EmployeeListView(APIView):
    def get(self, request):
        employees = Employee.objects.filter(is_active=True).order_by("employee_id")
        serializer = EmployeeSerializer(employees, many=True)
        dept_queryset = Employee.objects.filter(is_active=True).values_list("department", flat=True).distinct()
        dept_list = list(dept_queryset)
        response_payload = {
            "employees": serializer.data,
            "departments": dept_list,
        }
        res = Response(response_payload, status=status.HTTP_200_OK)
        return res

    def post(self, request):
        name_val = request.data.get("name", "").strip()
        email_val = request.data.get("email", "").strip()
        dept_val = request.data.get("department", "").strip()
        desig_val = request.data.get("designation", "").strip()
        time_val = request.data.get("default_time", "").strip() or default_time_value

        if not name_val or not email_val or not dept_val or not desig_val:
            err_res = Response(
                {"error": "Name, email, department, and designation are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            return err_res

        if Employee.objects.filter(email=email_val).exists():
            dup_res = Response(
                {"error": "An employee with this email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            return dup_res

        existing_ids = Employee.objects.values_list("employee_id", flat=True)
        max_id_num = base_emp_id_num
        for eid in existing_ids:
            if eid.startswith(id_prefix_str):
                num_part = eid.replace(id_prefix_str, "")
                if num_part.isdigit():
                    num_val = int(num_part)
                    if num_val > max_id_num:
                        max_id_num = num_val

        next_id_val = max_id_num + single_increment
        next_id = f"{id_prefix_str}{next_id_val}"
        name_parts = name_val.split()
        initials_val = "".join([part[zero_count].upper() for part in name_parts if part])[:max_initials_len]
        if not initials_val:
            initials_val = fallback_initials

        hire_date_val = request.data.get("hire_date")
        if hire_date_val:
            parsed_hire_date = get_parsed_date(hire_date_val)
        else:
            parsed_hire_date = date.today()

        new_emp = Employee.objects.create(
            employee_id=next_id,
            name=name_val,
            email=email_val,
            department=dept_val,
            designation=desig_val,
            initials=initials_val,
            default_time=time_val,
            hire_date=parsed_hire_date,
            is_active=True,
        )

        serializer = EmployeeSerializer(new_emp)
        created_res = Response(serializer.data, status=status.HTTP_201_CREATED)
        return created_res

class EmployeeDetailView(APIView):
    def get(self, request, employee_id):
        emp_match = Employee.objects.filter(employee_id=employee_id).first()
        if not emp_match:
            err_res = Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            return err_res
        serializer = EmployeeSerializer(emp_match)
        detail_res = Response(serializer.data, status=status.HTTP_200_OK)
        return detail_res

    def delete(self, request, employee_id):
        emp_match = Employee.objects.filter(employee_id=employee_id).first()
        if not emp_match:
            err_res = Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            return err_res
        emp_name = emp_match.name
        emp_match.delete()
        success_payload = {
            "message": f"Employee {emp_name} deleted successfully",
            "employee_id": employee_id,
        }
        del_res = Response(success_payload, status=status.HTTP_200_OK)
        return del_res

    def put(self, request, employee_id):
        emp_match = Employee.objects.filter(employee_id=employee_id).first()
        if not emp_match:
            err_res = Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            return err_res

        name_val = request.data.get("name", "").strip()
        email_val = request.data.get("email", "").strip()
        dept_val = request.data.get("department", "").strip()
        desig_val = request.data.get("designation", "").strip()
        hire_date_val = request.data.get("hire_date")

        if not name_val or not email_val or not dept_val or not desig_val:
            err_res = Response(
                {"error": "Name, email, department, and designation are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            return err_res

        email_conflict = Employee.objects.filter(email=email_val).exclude(employee_id=employee_id).exists()
        if email_conflict:
            dup_res = Response(
                {"error": "An employee with this email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            return dup_res

        name_parts = name_val.split()
        initials_val = "".join([part[zero_count].upper() for part in name_parts if part])[:max_initials_len]
        if not initials_val:
            initials_val = fallback_initials

        emp_match.name = name_val
        emp_match.email = email_val
        emp_match.department = dept_val
        emp_match.designation = desig_val
        emp_match.initials = initials_val

        if hire_date_val:
            parsed_hire_date = get_parsed_date(hire_date_val)
            emp_match.hire_date = parsed_hire_date

        emp_match.save()

        serializer = EmployeeSerializer(emp_match)
        update_res = Response(serializer.data, status=status.HTTP_200_OK)
        return update_res

class AttendanceDashboardView(APIView):
    def get(self, request):
        date_param = request.query_params.get("date", None)
        target_date = get_parsed_date(date_param)
        target_date_str = target_date.strftime("%Y-%m-%d")

        all_employees = Employee.objects.filter(is_active=True).order_by("employee_id")
        total_employees = all_employees.count()

        records_map = {}
        existing_records = AttendanceRecord.objects.filter(date=target_date)
        for rec in existing_records:
            records_map[rec.employee_id] = rec

        present_count = zero_count
        absent_count = zero_count
        unmarked_count = zero_count

        employee_rows = []
        for emp in all_employees:
            rec = records_map.get(emp.id, None)
            current_status = rec.status if rec else STATUS_NOT_MARKED
            check_in_time = rec.check_in_time if rec else ""

            if current_status == STATUS_PRESENT:
                present_count += single_increment
            elif current_status == STATUS_ABSENT:
                absent_count += single_increment
            else:
                unmarked_count += single_increment

            hire_str = emp.hire_date.strftime("%Y-%m-%d") if emp.hire_date else ""
            employee_rows.append({
                "id": emp.id,
                "employee_id": emp.employee_id,
                "name": emp.name,
                "email": emp.email,
                "department": emp.department,
                "designation": emp.designation,
                "initials": emp.initials,
                "default_time": emp.default_time,
                "hire_date": hire_str,
                "status": current_status,
                "check_in_time": check_in_time,
            })

        present_percent = get_percentage(present_count, total_employees)
        absent_percent = get_percentage(absent_count, total_employees)
        unmarked_percent = get_percentage(unmarked_count, total_employees)

        dept_list = list(all_employees.values_list("department", flat=True).distinct())
        formatted_readable_date = target_date.strftime("%A, %B %d, %Y")

        payload = {
            "date": target_date_str,
            "readable_date": formatted_readable_date,
            "metrics": {
                "total": total_employees,
                "present": present_count,
                "present_percent": present_percent,
                "absent": absent_count,
                "absent_percent": absent_percent,
                "unmarked": unmarked_count,
                "unmarked_percent": unmarked_percent,
            },
            "departments": dept_list,
            "employees": employee_rows,
        }

        res = Response(payload, status=status.HTTP_200_OK)
        return res

class MarkAttendanceView(APIView):
    def post(self, request):
        emp_id = request.data.get("employee_id")
        date_str = request.data.get("date")
        desired_status = request.data.get("status")
        check_in_time = request.data.get("check_in_time", "")
        check_out_time = request.data.get("check_out_time", "")
        remarks = request.data.get("remarks", "")

        if not emp_id or not date_str:
            bad_res = Response(
                {"error": "employee_id and date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            return bad_res

        target_date = get_parsed_date(date_str)
        try:
            employee = Employee.objects.get(employee_id=emp_id, is_active=True)
        except Employee.DoesNotExist:
            not_found_res = Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            return not_found_res

        record, created = AttendanceRecord.objects.get_or_create(
            employee=employee,
            date=target_date,
            defaults={
                "status": desired_status,
                "check_in_time": check_in_time,
                "check_out_time": check_out_time,
                "remarks": remarks,
            },
        )

        if not created:
            record.status = desired_status
            record.check_in_time = check_in_time
            if check_out_time:
                record.check_out_time = check_out_time
            if remarks:
                record.remarks = remarks
            record.save()

        success_payload = {
            "success": True,
            "employee_id": employee.employee_id,
            "date": target_date.strftime("%Y-%m-%d"),
            "status": record.status,
            "check_in_time": record.check_in_time,
            "check_out_time": record.check_out_time,
            "remarks": record.remarks,
        }
        res = Response(success_payload, status=status.HTTP_200_OK)
        return res

class BulkMarkPresentView(APIView):
    def post(self, request):
        date_str = request.data.get("date")
        target_date = get_parsed_date(date_str)

        all_employees = Employee.objects.filter(is_active=True)
        with transaction.atomic():
            for emp in all_employees:
                record, created = AttendanceRecord.objects.get_or_create(
                    employee=emp,
                    date=target_date,
                    defaults={
                        "status": STATUS_PRESENT,
                        "check_in_time": emp.default_time or default_time_value,
                    },
                )
                if not created:
                    time_to_use = record.check_in_time if record.check_in_time else (emp.default_time or default_time_value)
                    record.status = STATUS_PRESENT
                    record.check_in_time = time_to_use
                    record.save()

        success_res = Response({"success": True}, status=status.HTTP_200_OK)
        return success_res

class ResetDateAttendanceView(APIView):
    def post(self, request):
        date_str = request.data.get("date")
        target_date = get_parsed_date(date_str)

        AttendanceRecord.objects.filter(date=target_date).delete()

        success_res = Response({"success": True}, status=status.HTTP_200_OK)
        return success_res

class EmployeeAttendanceHistoryView(APIView):
    def get(self, request, employee_id):
        try:
            employee = Employee.objects.get(employee_id=employee_id, is_active=True)
        except Employee.DoesNotExist:
            not_found_res = Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            return not_found_res

        period = request.query_params.get("period", "THIS_MONTH")
        start_param = request.query_params.get("start_date", None)
        end_param = request.query_params.get("end_date", None)

        if period == "LAST_MONTH":
            start_date = date(default_hist_year, september_num, single_increment)
            days_count = calendar.monthrange(default_hist_year, september_num)[single_increment]
            end_date = date(default_hist_year, september_num, days_count)
        elif period == "THIS_QUARTER":
            start_date = date(default_hist_year, august_num, single_increment)
            days_count = calendar.monthrange(default_hist_year, october_num)[single_increment]
            end_date = date(default_hist_year, october_num, days_count)
        elif period == "CUSTOM" and start_param and end_param:
            start_date = get_parsed_date(start_param)
            end_date = get_parsed_date(end_param)
        else:
            start_date = date(default_hist_year, october_num, single_increment)
            days_count = calendar.monthrange(default_hist_year, october_num)[single_increment]
            end_date = date(default_hist_year, october_num, days_count)

        records_qs = AttendanceRecord.objects.filter(
            employee=employee,
            date__gte=start_date,
            date__lte=end_date,
        )
        records_map = {}
        for r in records_qs:
            records_map[r.date] = r

        present_count = zero_count
        absent_count = zero_count
        half_count = zero_count
        holiday_count = zero_count
        unmarked_count = zero_count

        records_list = []
        total_days = (end_date - start_date).days + single_increment
        for day_offset in range(zero_count, total_days):
            curr_date = start_date + timedelta(days=day_offset)
            is_weekend = curr_date.weekday() == saturday_weekday_idx or curr_date.weekday() == sunday_weekday_idx

            rec = records_map.get(curr_date, None)
            if rec:
                rec_status = rec.status
                check_in = rec.check_in_time
                check_out = rec.check_out_time
                remarks = rec.remarks
            else:
                if is_weekend:
                    rec_status = STATUS_HOLIDAY
                    check_in = ""
                    check_out = ""
                    remarks = weekend_remark_str
                else:
                    rec_status = STATUS_NOT_MARKED
                    check_in = ""
                    check_out = ""
                    remarks = empty_remark_str

            if rec_status == STATUS_PRESENT:
                present_count += single_increment
            elif rec_status == STATUS_ABSENT:
                absent_count += single_increment
            elif rec_status == STATUS_HALF_DAY:
                half_count += single_increment
            elif rec_status == STATUS_HOLIDAY:
                holiday_count += single_increment
            else:
                unmarked_count += single_increment

            working_hours = calc_working_hours(check_in, check_out)

            records_list.append({
                "iso": curr_date.strftime("%Y-%m-%d"),
                "displayDate": curr_date.strftime("%d %b %Y"),
                "dayName": curr_date.strftime("%A"),
                "isWeekend": is_weekend,
                "status": rec_status,
                "checkIn": check_in,
                "checkOut": check_out,
                "workingHours": working_hours,
                "remarks": remarks or empty_remark_str,
            })

        records_list.reverse()

        evaluated_work_days = present_count + absent_count + half_count
        if evaluated_work_days > zero_count:
            weighted_present = present_count + half_count * half_day_multiplier
            rate_val = round((weighted_present / evaluated_work_days) * percentage_base)
        else:
            rate_val = zero_count

        employee_data = EmployeeSerializer(employee).data

        payload = {
            "employee": employee_data,
            "period": {
                "key": period,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
            },
            "metrics": {
                "present": present_count,
                "absent": absent_count,
                "halfDay": half_count,
                "holidays": holiday_count,
                "notMarked": unmarked_count,
                "rate": rate_val,
            },
            "records": records_list,
        }
        res = Response(payload, status=status.HTTP_200_OK)
        return res
