import React, { useState } from 'react';
import { createEmployee } from '../services/api';

const zeroLength = 0;
const firstIndex = 0;
const defaultArrivalTime = '09:00';
const customDeptCode = 'OTHER';

const getTodayIsoString = () => {
  const now = new Date();
  const rawIso = now.toISOString();
  const splitted = rawIso.split('T');
  const dateStr = splitted[firstIndex];
  return dateStr;
};

export default function AddEmployeeModal({
  isOpen,
  departments = [],
  onClose,
  onSuccess,
  showToast,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [hireDate, setHireDate] = useState(getTodayIsoString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    const emptyElement = null;
    return emptyElement;
  }

  const isCustomSelected = department === customDeptCode;
  const effectiveDept = isCustomSelected ? customDepartment : department;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedDept = effectiveDept.trim();
    const trimmedDesig = designation.trim();
    const trimmedHireDate = hireDate.trim();

    if (!trimmedName || !trimmedEmail || !trimmedDept || !trimmedDesig || !trimmedHireDate) {
      if (showToast) {
        showToast('Please fill in all required fields');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDept,
        designation: trimmedDesig,
        hire_date: trimmedHireDate,
        default_time: defaultArrivalTime,
      };
      const created = await createEmployee(payload);
      if (showToast) {
        showToast(`Staff member ${created.name} added successfully`);
      }
      setName('');
      setEmail('');
      setDepartment('');
      setCustomDepartment('');
      setDesignation('');
      setHireDate(getTodayIsoString());
      onClose();
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err) {
      if (showToast) {
        showToast(err.message || 'Failed to add employee');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const element = (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Add New Staff Member
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Register a new employee into the attendance system
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sophia Vance"
              className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Work Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sophia.vance@acme.inc"
              className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department *
              </label>
              <select
                required
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (e.target.value !== customDeptCode) {
                    setCustomDepartment('');
                  }
                }}
                className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value={customDeptCode}>+ Enter New Department</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Systems Engineer"
                className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          </div>

          {isCustomSelected && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Custom Department Name *
              </label>
              <input
                type="text"
                required
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="e.g. Product Design"
                className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Date of Joining *
            </label>
            <input
              type="date"
              required
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="w-full border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 font-sans focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Adding...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return element;
}
