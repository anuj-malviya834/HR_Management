import React from 'react';

const emptyLength = 0;

export default function Header({
  currentView = 'dashboard',
  onNavigate,
  employees = [],
  selectedEmployeeId = '',
  onSelectEmployee,
  theme = 'light',
  onToggleTheme,
}) {
  const isProfileView = currentView === 'profile';
  const isDark = theme === 'dark';

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      const nextTheme = isDark ? 'light' : 'dark';
      onToggleTheme(nextTheme);
    }
  };

  const element = (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-neutral-900 dark:bg-neutral-800 border border-transparent dark:border-neutral-700 rounded flex items-center justify-center text-white font-bold text-xs tracking-wider">
              HR
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDashboardClick}
                className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight hover:text-neutral-600 dark:hover:text-neutral-300 transition"
              >
                HR Management
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <button
                type="button"
                onClick={handleDashboardClick}
                className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
              >
                Employee Attendance
              </button>
              {isProfileView && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-700">/</span>
                  <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    Attendance Profile
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isProfileView && employees.length > emptyLength && (
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-800 px-2 py-1">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mr-1.5">Switch Staff:</span>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => onSelectEmployee && onSelectEmployee(e.target.value)}
                  className="text-xs text-neutral-800 dark:text-neutral-200 font-medium bg-transparent focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-semibold">
                SJ
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 leading-none">Sarah Jenkins</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">HR Administrator</div>
              </div>
            </div>

            <button
              id="themeToggleBtn"
              type="button"
              title="Toggle Dark / Light Mode"
              aria-label="Toggle Theme"
              onClick={handleToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-amber-300 transition shadow-2xs cursor-pointer"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  return element;
}
