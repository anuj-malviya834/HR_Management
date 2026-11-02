import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEmployeeAttendanceHistory } from '../services/api';

const zeroVal = 0;
const singleVal = 1;
const defaultRate = 0;
const stringPadLength = 2;
const padChar = '0';
const minutesInHour = 60;
const baseTen = 10;
const emptyDash = '—';
const defaultCheckInTime = '08:45';
const defaultCheckOutTime = '17:35';
const halfDayCheckOutTime = '13:00';

const statusAll = 'ALL';
const statusPresent = 'PRESENT';
const statusAbsent = 'ABSENT';
const statusHalfDay = 'HALF_DAY';
const statusHoliday = 'HOLIDAY';
const statusNotMarked = 'NOT_MARKED';
const customSplitLength = 3;
const monthNamesFull = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatHireDate(dateStr) {
  if (!dateStr) {
    const fallbackDate = 'March 15, 2022';
    return fallbackDate;
  }
  const parts = dateStr.split('-');
  if (parts.length === customSplitLength) {
    const y = parts[zeroVal];
    const mIdx = parseInt(parts[singleVal], baseTen) - singleVal;
    const d = parseInt(parts[stringPadLength], baseTen);
    const mName = monthNamesFull[mIdx] || parts[singleVal];
    const formatted = `${mName} ${d}, ${y}`;
    return formatted;
  }
  const rawDate = dateStr;
  return rawDate;
}

function calculateWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    const emptyResult = emptyDash;
    return emptyResult;
  }
  const inParts = checkIn.split(':');
  const outParts = checkOut.split(':');
  if (inParts.length < stringPadLength || outParts.length < stringPadLength) {
    const fallbackResult = emptyDash;
    return fallbackResult;
  }
  const inMinutes = parseInt(inParts[zeroVal], baseTen) * minutesInHour + parseInt(inParts[singleVal], baseTen);
  const outMinutes = parseInt(outParts[zeroVal], baseTen) * minutesInHour + parseInt(outParts[singleVal], baseTen);
  const diff = outMinutes - inMinutes;
  if (diff <= zeroVal) {
    const zeroResult = '0h 00m';
    return zeroResult;
  }
  const h = Math.floor(diff / minutesInHour);
  const m = diff % minutesInHour;
  const padM = String(m).padStart(stringPadLength, padChar);
  const resultStr = `${h}h ${padM}m`;
  return resultStr;
}

export default function EmployeeProfile({
  employee,
  onBack,
  showToast,
  onSaveAttendanceRecord,
  onDeleteEmployee,
  onEditEmployee,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');
  const [statusFilter, setStatusFilter] = useState(statusAll);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [metrics, setMetrics] = useState({
    present: zeroVal,
    absent: zeroVal,
    halfDay: zeroVal,
    holidays: zeroVal,
    notMarked: zeroVal,
    rate: defaultRate,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [editModalConfig, setEditModalConfig] = useState({
    isOpen: false,
    isoDate: '',
    dayName: '',
    displayDate: '',
    status: statusPresent,
    checkIn: '',
    checkOut: '',
    remarks: '',
  });

  const loadHistory = useCallback(async () => {
    if (!employee || !employee.employee_id) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchEmployeeAttendanceHistory(
        employee.employee_id,
        selectedPeriod,
        customStartDate,
        customEndDate
      );
      if (data && data.records) {
        const mappedRecords = data.records.map((r) => {
          const itemIso = r.iso || r.date;
          const itemDisplay = r.displayDate || r.display_date;
          const itemDayName = r.dayName || r.day;
          const itemIsWeekend = r.isWeekend !== undefined ? r.isWeekend : (r.is_weekend || false);
          const itemStatus = r.status;
          const itemCheckIn = r.checkIn !== undefined ? r.checkIn : (r.check_in_time || '');
          const itemCheckOut = r.checkOut !== undefined ? r.checkOut : (r.check_out_time || '');
          const itemWorkingHours = r.workingHours || r.working_hours || emptyDash;
          const itemRemarks = r.remarks || '';
          const item = {
            iso: itemIso,
            displayDate: itemDisplay,
            dayName: itemDayName,
            isWeekend: itemIsWeekend,
            status: itemStatus,
            checkIn: itemCheckIn,
            checkOut: itemCheckOut,
            workingHours: itemWorkingHours,
            remarks: itemRemarks,
          };
          return item;
        });
        setHistoryRecords(mappedRecords);
      }
      if (data && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      if (showToast) {
        showToast('Error loading attendance history from server');
      }
    } finally {
      setIsLoading(false);
    }
  }, [employee, selectedPeriod, customStartDate, customEndDate, showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(() => {
    if (statusFilter === statusAll) {
      const allItems = historyRecords;
      return allItems;
    }
    const filtered = historyRecords.filter((item) => {
      const isMatched = item.status === statusFilter;
      return isMatched;
    });
    return filtered;
  }, [historyRecords, statusFilter]);

  const handleOpenEdit = (item) => {
    setEditModalConfig({
      isOpen: true,
      isoDate: item.iso,
      dayName: item.dayName,
      displayDate: item.displayDate,
      status: item.status,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      remarks: item.remarks === emptyDash ? '' : item.remarks,
    });
  };

  const handleCloseEdit = () => {
    setEditModalConfig((prev) => {
      const closed = { ...prev, isOpen: false };
      return closed;
    });
  };

  const handleSaveEdit = async () => {
    if (!employee) {
      return;
    }
    try {
      if (onSaveAttendanceRecord) {
        await onSaveAttendanceRecord(
          employee.employee_id,
          editModalConfig.isoDate,
          editModalConfig.status,
          editModalConfig.checkIn,
          editModalConfig.checkOut,
          editModalConfig.remarks
        );
      }
      await loadHistory();
      handleCloseEdit();
      if (showToast) {
        showToast(`Record for ${editModalConfig.displayDate} successfully updated`);
      }
    } catch (err) {
      if (showToast) {
        showToast('Failed to save record changes');
      }
    }
  };

  const handleExportCsv = () => {
    if (!employee) {
      return;
    }
    const csvRows = [];
    csvRows.push(['Employee ID', 'Employee Name', 'Department', 'Date', 'Day', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Remarks']);

    for (const item of historyRecords) {
      csvRows.push([
        employee.employee_id,
        `"${employee.name}"`,
        `"${employee.department}"`,
        item.iso,
        item.dayName,
        item.status,
        item.checkIn || '',
        item.checkOut || '',
        item.workingHours,
        `"${item.remarks || ''}"`,
      ]);
    }

    const rowsJoined = csvRows.map((r) => {
      const joinedRow = r.join(',');
      return joinedRow;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rowsJoined.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const sanitizedName = employee.name.replace(/\s+/g, '_');
    link.setAttribute('download', `Attendance_${employee.employee_id}_${sanitizedName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Attendance CSV exported successfully');
    }
  };

  const renderStatusPill = (status) => {
    if (status === statusPresent) {
      const pill = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Present</span>
        </span>
      );
      return pill;
    }
    if (status === statusAbsent) {
      const pill = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Absent</span>
        </span>
      );
      return pill;
    }
    if (status === statusHalfDay) {
      const pill = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Half Day</span>
        </span>
      );
      return pill;
    }
    if (status === statusHoliday) {
      const pill = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
          <span>Holiday / Off</span>
        </span>
      );
      return pill;
    }
    const pill = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
        <span>Not Marked</span>
      </span>
    );
    return pill;
  };

  const empName = employee ? employee.name : 'Sarah Chen';
  const empId = employee ? employee.employee_id : 'EMP-1001';
  const empInitials = employee ? employee.initials : 'SC';
  const empDept = employee ? employee.department : 'Engineering';
  const empDesig = employee ? employee.designation : 'Staff Backend Engineer';
  const empEmail = employee ? employee.email : 'sarah.chen@acme.inc';
  const empJoined = formatHireDate(employee ? employee.hire_date : '');

  const element = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Attendance Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="w-3 h-3 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin"></div>
              <span>Syncing database...</span>
            </div>
          )}

          {onEditEmployee && (
            <button
              type="button"
              onClick={() => onEditEmployee(employee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Details</span>
            </button>
          )}

          {onDeleteEmployee && (
            <button
              type="button"
              onClick={() => onDeleteEmployee(employee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-900/60 rounded text-xs font-medium transition shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Employee</span>
            </button>
          )}
        </div>
      </div>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-xs transition-colors duration-150">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
              {empInitials}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {empName}
                </h1>
                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-semibold">
                  {empId}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Active • Full-Time
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Designation:</span>{' '}
                  <span className="text-neutral-900 dark:text-neutral-100">{empDesig}</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Department:</span>{' '}
                  <span className="text-neutral-900 dark:text-neutral-100">{empDept}</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Joined:</span>{' '}
                  <span className="text-neutral-900 dark:text-neutral-100">{empJoined}</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Email:</span>{' '}
                  <span className="text-neutral-900 dark:text-neutral-100">{empEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100 dark:border-neutral-800 shrink-0">
            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-1.5 shadow-xs">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-2">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs text-neutral-800 dark:text-neutral-200 font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="THIS_MONTH">This Month (Oct 2026)</option>
                <option value="LAST_MONTH">Last Month (Sep 2026)</option>
                <option value="THIS_QUARTER">This Quarter (Q3-Q4 2026)</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            {selectedPeriod === 'CUSTOM' && (
              <div className="flex flex-wrap items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded border border-neutral-200 dark:border-neutral-700">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 focus:outline-none cursor-pointer"
                />
                <span className="text-xs text-neutral-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 focus:outline-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-xs transition-colors duration-150">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
          <div className="pt-2 md:pt-0">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Present Days</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {metrics.present}
              </span>
              <span className="text-xs text-neutral-400">days</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Absent Days</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {metrics.absent}
              </span>
              <span className="text-xs text-neutral-400">days</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Half Days</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {metrics.halfDay}
              </span>
              <span className="text-xs text-neutral-400">days</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
              <span>Holidays</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {metrics.holidays}
              </span>
              <span className="text-xs text-neutral-400">days</span>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              Attendance Rate
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {metrics.rate}%
              </span>
              <span className="text-xs text-neutral-400">of scheduled</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xs overflow-hidden transition-colors duration-150">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Attendance History Log
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              {filteredHistory.length} records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-1.5 shadow-xs">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-1.5">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs text-neutral-800 dark:text-neutral-200 font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                <option value={statusAll}>All Statuses</option>
                <option value={statusPresent}>Present</option>
                <option value={statusAbsent}>Absent</option>
                <option value={statusHalfDay}>Half Day</option>
                <option value={statusHoliday}>Holiday / Off</option>
                <option value={statusNotMarked}>Not Marked</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Attendance (CSV)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/80 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">Date</th>
                <th scope="col" className="py-3 px-4">Day</th>
                <th scope="col" className="py-3 px-4">Check-in</th>
                <th scope="col" className="py-3 px-4">Check-out</th>
                <th scope="col" className="py-3 px-4">Working Hours</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4">Remarks</th>
                <th scope="col" className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredHistory.map((item) => (
                <tr
                  key={item.iso}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 transition border-b border-neutral-200/80 dark:border-neutral-800"
                >
                  <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {item.displayDate}
                  </td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                    {item.dayName}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                    {item.checkIn || emptyDash}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                    {item.checkOut || emptyDash}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                    {item.workingHours}
                  </td>
                  <td className="py-3 px-4">
                    {renderStatusPill(item.status)}
                  </td>
                  <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400">
                    {item.remarks}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition shadow-2xs font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-2">
          <div>
            Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">{filteredHistory.length}</span> entries for this period
          </div>
          <div>Click Edit on any record to adjust time or status</div>
        </div>
      </section>

      {editModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Edit Attendance Record
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {editModalConfig.displayDate} ({editModalConfig.dayName}) &bull; {empName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={editModalConfig.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    let nextCheckIn = editModalConfig.checkIn;
                    let nextCheckOut = editModalConfig.checkOut;
                    if (nextStatus === statusPresent && !nextCheckIn) {
                      nextCheckIn = defaultCheckInTime;
                      nextCheckOut = defaultCheckOutTime;
                    } else if (nextStatus === statusHalfDay && !nextCheckIn) {
                      nextCheckIn = defaultCheckInTime;
                      nextCheckOut = halfDayCheckOutTime;
                    } else if (nextStatus === statusAbsent || nextStatus === statusHoliday || nextStatus === statusNotMarked) {
                      nextCheckIn = '';
                      nextCheckOut = '';
                    }
                    setEditModalConfig((prev) => {
                      const updatedConfig = {
                        ...prev,
                        status: nextStatus,
                        checkIn: nextCheckIn,
                        checkOut: nextCheckOut,
                      };
                      return updatedConfig;
                    });
                  }}
                  className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value={statusPresent}>Present</option>
                  <option value={statusAbsent}>Absent</option>
                  <option value={statusHalfDay}>Half Day</option>
                  <option value={statusHoliday}>Holiday / Off</option>
                  <option value={statusNotMarked}>Not Marked</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={editModalConfig.checkIn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditModalConfig((prev) => {
                        const updated = { ...prev, checkIn: val };
                        return updated;
                      });
                    }}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={editModalConfig.checkOut}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditModalConfig((prev) => {
                        const updated = { ...prev, checkOut: val };
                        return updated;
                      });
                    }}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={editModalConfig.remarks}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditModalConfig((prev) => {
                      const updated = { ...prev, remarks: val };
                      return updated;
                    });
                  }}
                  placeholder="e.g. On-time attendance, Medical half-day, etc."
                  className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-3.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:white text-white dark:text-neutral-900 text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return element;
}
