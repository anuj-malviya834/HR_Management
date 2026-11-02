import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const zeroCount = 0;
const defaultMenuOffsetPx = 4;
const estimatedMenuHeightPx = 135;
const portalZIndex = 9999;

export default function AttendanceTable({
  employees,
  totalCount,
  onMarkAttendance,
  onTimeChange,
  onResetFilters,
  onSelectEmployee,
  onDeleteEmployee,
  onAddEmployee,
  onEditEmployee,
}) {
  const [activeMenuEmployee, setActiveMenuEmployee] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: zeroCount, right: zeroCount });
  const visibleCount = employees.length;
  const isListEmpty = visibleCount === zeroCount;
  const isSystemEmpty = totalCount === zeroCount;

  useEffect(() => {
    const handleDismiss = () => {
      setActiveMenuEmployee(null);
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, []);

  const handleToggleMenu = (e, emp) => {
    e.stopPropagation();
    if (activeMenuEmployee && activeMenuEmployee.employee_id === emp.employee_id) {
      setActiveMenuEmployee(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldDropUp = spaceBelow < estimatedMenuHeightPx;
    let computedTop = rect.bottom + defaultMenuOffsetPx;
    if (shouldDropUp) {
      computedTop = rect.top - estimatedMenuHeightPx - defaultMenuOffsetPx;
    }
    const computedRight = window.innerWidth - rect.right;
    setMenuCoords({
      top: Math.max(zeroCount, computedTop),
      right: Math.max(zeroCount, computedRight),
    });
    setActiveMenuEmployee(emp);
  };

  const renderStatusBadge = (status) => {
    if (status === 'PRESENT') {
      const badge = (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Present</span>
        </span>
      );
      return badge;
    }
    if (status === 'ABSENT') {
      const badge = (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Absent</span>
        </span>
      );
      return badge;
    }
    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
        <span>Not Marked</span>
      </span>
    );
    return badge;
  };

  const element = (
    <>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-xs overflow-hidden transition-colors duration-150">
      <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-800/60">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Employee Roster</h2>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
            {visibleCount} shown
          </span>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>Click employee to view attendance profile</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/80 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-4 w-28">Emp ID</th>
              <th scope="col" className="py-2.5 px-4">Employee</th>
              <th scope="col" className="py-2.5 px-4 w-36">Department</th>
              <th scope="col" className="py-2.5 px-4 w-48">Designation</th>
              <th scope="col" className="py-2.5 px-4 w-32">Status</th>
              <th scope="col" className="py-2.5 px-4 w-36">Check-in Time</th>
              <th scope="col" className="py-2.5 px-4 w-44 text-right">Attendance Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
            {!isListEmpty &&
              employees.map((emp) => {
                const isPresent = emp.status === 'PRESENT';
                const isAbsent = emp.status === 'ABSENT';

                const presentBtnClass = isPresent
                  ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                  : 'bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-600 dark:text-neutral-300 hover:text-emerald-700 dark:hover:text-emerald-300 border-neutral-200 dark:border-neutral-700';

                const absentBtnClass = isAbsent
                  ? 'bg-rose-700 text-white border-rose-700 font-semibold shadow-xs'
                  : 'bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-600 dark:text-neutral-300 hover:text-rose-700 dark:hover:text-rose-300 border-neutral-200 dark:border-neutral-700';

                return (
                  <tr key={emp.employee_id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 transition border-b border-neutral-200/80 dark:border-neutral-800">
                    <td className="py-2.5 px-4 font-mono text-neutral-600 dark:text-neutral-400 font-medium">
                      <button
                        type="button"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.employee_id)}
                        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 transition cursor-pointer"
                      >
                        {emp.employee_id}
                      </button>
                    </td>
                    <td className="py-2.5 px-4">
                      <div
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.employee_id)}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold shrink-0 transition">
                          {emp.initials}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug group-hover:underline">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal leading-none">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300 font-medium">{emp.department}</td>
                    <td className="py-2.5 px-4 text-neutral-500 dark:text-neutral-400 font-normal">{emp.designation}</td>
                    <td className="py-2.5 px-4">{renderStatusBadge(emp.status)}</td>
                    <td className="py-2.5 px-4">
                      {isPresent ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="time"
                            value={emp.check_in_time || ''}
                            onChange={(e) => onTimeChange(emp.employee_id, e.target.value)}
                            className="px-2 py-0.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded font-mono text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:outline-none focus:border-neutral-500 shadow-2xs cursor-pointer"
                          />
                        </div>
                      ) : isAbsent ? (
                        <span className="text-neutral-400 dark:text-neutral-600 font-mono text-xs pl-2">—</span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500 text-xs italic pl-1">Awaiting mark</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="inline-flex rounded shadow-2xs">
                          <button
                            onClick={() => onMarkAttendance(emp.employee_id, 'PRESENT')}
                            className={`px-2.5 py-1 text-xs border rounded-l transition ${presentBtnClass}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onMarkAttendance(emp.employee_id, 'ABSENT')}
                            className={`px-2.5 py-1 text-xs border-t border-b border-r rounded-r transition -ml-px ${absentBtnClass}`}
                          >
                            Absent
                          </button>
                        </div>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            title="Actions"
                            onClick={(e) => handleToggleMenu(e, emp)}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {isListEmpty && (
        <div className="py-12 px-4 text-center">
          {isSystemEmpty ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto text-neutral-600 dark:text-neutral-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">No employees in the directory yet</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Your company roster is currently empty. Register your first staff member to begin tracking daily attendance.
              </p>
              {onAddEmployee && (
                <button
                  type="button"
                  onClick={onAddEmployee}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 rounded text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Employee</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">No employees match your search</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                There are no staff members matching your current search query or applied department and status filters.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-3 inline-flex items-center px-3 py-1 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 gap-2">
        <div>
          Showing <span className="font-medium text-neutral-700 dark:text-neutral-300">{visibleCount}</span> of{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalCount}</span> employees
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Present</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Absent</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            <span>Not Marked</span>
          </span>
        </div>
      </div>
    </div>

    {activeMenuEmployee &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${menuCoords.top}px`,
              right: `${menuCoords.right}px`,
              zIndex: portalZIndex,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-44 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            {onEditEmployee && (
              <button
                type="button"
                onClick={() => {
                  const emp = activeMenuEmployee;
                  setActiveMenuEmployee(null);
                  onEditEmployee(emp);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Details</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const empId = activeMenuEmployee.employee_id;
                setActiveMenuEmployee(null);
                onSelectEmployee(empId);
              }}
              className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>View Profile</span>
            </button>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>

            {onDeleteEmployee && (
              <button
                type="button"
                onClick={() => {
                  const emp = activeMenuEmployee;
                  setActiveMenuEmployee(null);
                  onDeleteEmployee(emp);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Employee</span>
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );

  return element;
}
