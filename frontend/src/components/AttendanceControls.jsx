import React from 'react';

const zeroSearchLength = 0;

export default function AttendanceControls({
  selectedDate,
  onDateChange,
  onTodayClick,
  searchTerm,
  onSearchChange,
  onClearSearch,
  departments,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
}) {
  const isSearchActive = searchTerm.length > zeroSearchLength;

  const getStatusButtonClass = (statusKey) => {
    const isSelected = selectedStatus === statusKey;
    if (isSelected) {
      const activeClass = 'status-filter-btn px-2.5 py-1 rounded text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 shadow-xs font-semibold transition';
      return activeClass;
    }
    const inactiveClass = 'status-filter-btn px-2.5 py-1 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition';
    return inactiveClass;
  };

  const element = (
    <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-3 shadow-xs space-y-3 transition-colors duration-150">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-2 py-1 shadow-xs">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-2">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs text-neutral-800 dark:text-neutral-200 font-medium focus:outline-none bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={onTodayClick}
            className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded transition"
          >
            Today
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1 hidden sm:block"></div>

          <div className="relative min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-8 pr-7 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition"
            />
            {isSearchActive && (
              <button
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-2 py-1 shadow-xs">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-1.5">Dept:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="text-xs text-neutral-800 dark:text-neutral-200 font-medium bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-1.5">Status:</span>
          <div className="inline-flex rounded-md p-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium">
            <button onClick={() => onStatusChange('ALL')} className={getStatusButtonClass('ALL')}>
              All
            </button>
            <button onClick={() => onStatusChange('PRESENT')} className={getStatusButtonClass('PRESENT')}>
              Present
            </button>
            <button onClick={() => onStatusChange('ABSENT')} className={getStatusButtonClass('ABSENT')}>
              Absent
            </button>
            <button onClick={() => onStatusChange('NOT_MARKED')} className={getStatusButtonClass('NOT_MARKED')}>
              Not Marked
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return element;
}
