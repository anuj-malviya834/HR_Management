import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import SummaryMetrics from './components/SummaryMetrics';
import AttendanceControls from './components/AttendanceControls';
import AttendanceTable from './components/AttendanceTable';
import EmployeeProfile from './components/EmployeeProfile';
import ConfirmModal from './components/ConfirmModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import Toast from './components/Toast';
import {
  fetchAttendanceDashboard,
  markEmployeeAttendance,
  bulkMarkAllPresent,
  resetAttendanceForDate,
  deleteEmployee,
} from './services/api';

const zeroCount = 0;
const singleIncrement = 1;
const notFoundIndex = -1;
const toastDurationMs = 2800;
const padLength = 2;
const padChar = '0';
const themeModeDark = 'dark';
const themeModeLight = 'light';
const themeStorageKey = 'hrm_theme_mode';

function getTodayIsoString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + singleIncrement).padStart(padLength, padChar);
  const day = String(now.getDate()).padStart(padLength, padChar);
  const isoStr = `${year}-${month}-${day}`;
  return isoStr;
}

function getCurrentTimeFormatted() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(padLength, padChar);
  const minutes = String(now.getMinutes()).padStart(padLength, padChar);
  const timeStr = `${hours}:${minutes}`;
  return timeStr;
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('EMP-1001');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === themeModeDark || savedTheme === themeModeLight) {
      return savedTheme;
    }
    return themeModeLight;
  });

  const [selectedDate, setSelectedDate] = useState(getTodayIsoString);
  const [readableDate, setReadableDate] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: '',
  });

  useEffect(() => {
    if (theme === themeModeDark) {
      document.documentElement.classList.add(themeModeDark);
    } else {
      document.documentElement.classList.remove(themeModeDark);
    }
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const showToast = useCallback((msg) => {
    setToastConfig({
      isVisible: true,
      message: msg,
    });
    setTimeout(() => {
      setToastConfig((prev) => {
        const nextState = { ...prev, isVisible: false };
        return nextState;
      });
    }, toastDurationMs);
  }, []);

  const loadData = useCallback(async (dateToLoad) => {
    setIsLoading(true);
    try {
      const data = await fetchAttendanceDashboard(dateToLoad);
      setReadableDate(data.readable_date);
      setMetrics(data.metrics);
      setEmployees(data.employees);
      setDepartments(data.departments);
    } catch (err) {
      showToast('Error loading attendance records');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');
    if (viewParam === 'profile') {
      setCurrentView('profile');
    }
    if (idParam) {
      setSelectedEmployeeId(idParam);
    }
  }, []);

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId);
    setCurrentView('profile');
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('view', 'profile');
    nextUrl.searchParams.set('id', empId);
    window.history.replaceState({}, '', nextUrl);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    const nextUrl = new URL(window.location.href);
    if (view === 'dashboard') {
      nextUrl.searchParams.delete('view');
      nextUrl.searchParams.delete('id');
    } else {
      nextUrl.searchParams.set('view', 'profile');
      nextUrl.searchParams.set('id', selectedEmployeeId);
    }
    window.history.replaceState({}, '', nextUrl);
  };

  const handleDateChange = (newDate) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleTodayClick = () => {
    const today = getTodayIsoString();
    setSelectedDate(today);
  };

  const handleMarkAttendance = async (employeeId, desiredStatus) => {
    const currentRecord = employees.find((e) => e.employee_id === employeeId);
    let nextStatus = desiredStatus;
    let nextTime = currentRecord ? currentRecord.check_in_time : '';

    if (currentRecord && currentRecord.status === desiredStatus) {
      nextStatus = 'NOT_MARKED';
      nextTime = '';
    } else {
      if (desiredStatus === 'PRESENT') {
        if (!nextTime || nextTime.length === zeroCount) {
          nextTime = (currentRecord && currentRecord.default_time) ? currentRecord.default_time : getCurrentTimeFormatted();
        }
      } else if (desiredStatus === 'ABSENT') {
        nextTime = '';
      }
    }

    setEmployees((prev) => {
      const updatedList = prev.map((emp) => {
        if (emp.employee_id === employeeId) {
          const updatedEmp = {
            ...emp,
            status: nextStatus,
            check_in_time: nextTime,
          };
          return updatedEmp;
        }
        return emp;
      });
      return updatedList;
    });

    try {
      await markEmployeeAttendance(employeeId, selectedDate, nextStatus, nextTime);
      const empName = currentRecord ? currentRecord.name : employeeId;
      if (nextStatus === 'PRESENT') {
        showToast(`Marked ${empName} as Present (${nextTime})`);
      } else if (nextStatus === 'ABSENT') {
        showToast(`Marked ${empName} as Absent`);
      } else {
        showToast(`Cleared status for ${empName}`);
      }
      loadData(selectedDate);
    } catch (err) {
      showToast('Failed to save attendance change');
      loadData(selectedDate);
    }
  };

  const handleTimeChange = async (employeeId, newTime) => {
    setEmployees((prev) => {
      const updatedList = prev.map((emp) => {
        if (emp.employee_id === employeeId) {
          const updatedEmp = { ...emp, check_in_time: newTime };
          return updatedEmp;
        }
        return emp;
      });
      return updatedList;
    });

    try {
      await markEmployeeAttendance(employeeId, selectedDate, 'PRESENT', newTime);
      showToast(`Updated check-in time to ${newTime}`);
      loadData(selectedDate);
    } catch (err) {
      showToast('Failed to update check-in time');
      loadData(selectedDate);
    }
  };

  const handleOpenMarkAllPresentModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Mark All Staff Present?',
      message: `This will mark all employees as Present for ${readableDate}. Existing check-in times will be preserved, and unmarked staff will default to their standard arrival time.`,
      confirmText: 'Mark All Present',
      isDestructive: false,
      onConfirm: async () => {
        setModalConfig((prev) => {
          const closed = { ...prev, isOpen: false };
          return closed;
        });
        try {
          await bulkMarkAllPresent(selectedDate);
          showToast('All staff members marked Present');
          loadData(selectedDate);
        } catch (err) {
          showToast('Failed to mark all present');
        }
      },
    });
  };

  const handleOpenResetModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reset Attendance Records?',
      message: `Are you sure you want to reset all attendance records for ${readableDate}? All employee statuses will be cleared to Not Marked.`,
      confirmText: 'Reset Day',
      isDestructive: true,
      onConfirm: async () => {
        setModalConfig((prev) => {
          const closed = { ...prev, isOpen: false };
          return closed;
        });
        try {
          await resetAttendanceForDate(selectedDate);
          showToast('Attendance records reset to Not Marked');
          loadData(selectedDate);
        } catch (err) {
          showToast('Failed to reset attendance records');
        }
      },
    });
  };

  const handlePromptDeleteEmployee = (emp) => {
    if (!emp) {
      return;
    }
    const empId = emp.employee_id;
    const empName = emp.name;
    setModalConfig({
      isOpen: true,
      title: `Delete Employee ${empName}?`,
      message: `Are you sure you want to permanently delete ${empName} (${empId})? All of their personal profile data and attendance records will be permanently removed. This action cannot be undone.`,
      confirmText: 'Delete Employee',
      isDestructive: true,
      onConfirm: async () => {
        setModalConfig((prev) => {
          const closed = { ...prev, isOpen: false };
          return closed;
        });
        try {
          await deleteEmployee(empId);
          showToast(`Staff member ${empName} was deleted successfully`);
          if (currentView === 'profile' && selectedEmployeeId === empId) {
            handleNavigate('dashboard');
          }
          loadData(selectedDate);
        } catch (err) {
          const errMsg = err.message || 'Failed to delete employee';
          showToast(errMsg);
        }
      },
    });
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => {
      const closed = { ...prev, isOpen: false };
      return closed;
    });
  };

  const handleOpenEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setIsEditEmployeeModalOpen(true);
  };

  const handleCloseEditEmployeeModal = () => {
    setIsEditEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleEditSuccess = () => {
    loadData(selectedDate);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    showToast('Filters cleared');
  };

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const result = employees.filter((emp) => {
      const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;
      let matchesSearch = true;
      if (query.length > zeroCount) {
        const nameMatch = emp.name.toLowerCase().indexOf(query) !== notFoundIndex;
        const idMatch = emp.employee_id.toLowerCase().indexOf(query) !== notFoundIndex;
        const desigMatch = emp.designation.toLowerCase().indexOf(query) !== notFoundIndex;
        matchesSearch = nameMatch || idMatch || desigMatch;
      }
      const isMatch = matchesDept && matchesStatus && matchesSearch;
      return isMatch;
    });
    return result;
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);

  const activeEmployee = useMemo(() => {
    const found = employees.find((e) => e.employee_id === selectedEmployeeId);
    if (found) {
      return found;
    }
    const fallback = employees[zeroCount] || null;
    return fallback;
  }, [employees, selectedEmployeeId]);

  const completionBadge = useMemo(() => {
    const total = metrics?.total ?? zeroCount;
    const present = metrics?.present ?? zeroCount;
    const absent = metrics?.absent ?? zeroCount;
    const marked = present + absent;
    if (total > zeroCount && marked === total) {
      const badge = (
        <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          All Marked (Complete)
        </span>
      );
      return badge;
    }
    if (marked === zeroCount) {
      const badge = (
        <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          Not Started
        </span>
      );
      return badge;
    }
    const badge = (
      <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
        {marked} of {total} Marked • In Progress
      </span>
    );
    return badge;
  }, [metrics]);

  const element = (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 min-h-screen flex flex-col transition-colors duration-150">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={handleSelectEmployee}
        theme={theme}
        onToggleTheme={setTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {currentView === 'profile' ? (
          <EmployeeProfile
            employee={activeEmployee}
            onBack={() => handleNavigate('dashboard')}
            showToast={showToast}
            onSaveAttendanceRecord={async (empId, dateStr, statusVal, timeVal, checkOutVal, remarksVal) => {
              try {
                await markEmployeeAttendance(empId, dateStr, statusVal, timeVal, checkOutVal, remarksVal);
                loadData(selectedDate);
              } catch (err) {
                showToast('Failed to save attendance record to server');
              }
            }}
            onDeleteEmployee={handlePromptDeleteEmployee}
            onEditEmployee={handleOpenEditEmployee}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  Daily Office Attendance
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{readableDate}</p>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  {completionBadge}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Employee</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenMarkAllPresentModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium transition shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset Day</span>
                </button>
              </div>
            </div>

            <SummaryMetrics metrics={metrics} />

            <AttendanceControls
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onTodayClick={handleTodayClick}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={() => setSearchTerm('')}
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />

            <AttendanceTable
              employees={filteredEmployees}
              totalCount={employees.length}
              onMarkAttendance={handleMarkAttendance}
              onTimeChange={handleTimeChange}
              onResetFilters={handleResetFilters}
              onSelectEmployee={handleSelectEmployee}
              onDeleteEmployee={handlePromptDeleteEmployee}
              onAddEmployee={() => setIsAddEmployeeModalOpen(true)}
              onEditEmployee={handleOpenEditEmployee}
            />
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-3 mt-auto transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-2">
          <div>HR Management System &bull; Full-Stack React + Django Attendance Suite</div>
          <div>Acme Corporation Operations &bull; Staff Registry v2.4 (SQLite)</div>
        </div>
      </footer>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isDestructive={modalConfig.isDestructive}
        onConfirm={modalConfig.onConfirm}
        onCancel={handleCloseModal}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        departments={departments}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={() => loadData(selectedDate)}
        showToast={showToast}
      />

      <EditEmployeeModal
        isOpen={isEditEmployeeModalOpen}
        employee={editingEmployee}
        departments={departments}
        onClose={handleCloseEditEmployeeModal}
        onSuccess={handleEditSuccess}
        onDelete={handlePromptDeleteEmployee}
        showToast={showToast}
      />

      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} />
    </div>
  );

  return element;
}
