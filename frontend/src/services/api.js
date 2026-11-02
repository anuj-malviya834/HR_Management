const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchAttendanceDashboard(dateStr) {
  const queryParam = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
  const url = `${API_BASE_URL}/attendance/${queryParam}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch attendance dashboard: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchEmployeeAttendanceHistory(employeeId, period, startDate, endDate) {
  const queryParams = new URLSearchParams();
  if (period) {
    queryParams.append('period', period);
  }
  if (startDate) {
    queryParams.append('start_date', startDate);
  }
  if (endDate) {
    queryParams.append('end_date', endDate);
  }
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/attendance/employee/${encodeURIComponent(employeeId)}/history/?${queryString}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch employee attendance history: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function markEmployeeAttendance(employeeId, dateStr, statusVal, checkInTimeVal, checkOutTimeVal = '', remarksVal = '') {
  const url = `${API_BASE_URL}/attendance/mark/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      employee_id: employeeId,
      date: dateStr,
      status: statusVal,
      check_in_time: checkInTimeVal || '',
      check_out_time: checkOutTimeVal || '',
      remarks: remarksVal || '',
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update attendance: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function bulkMarkAllPresent(dateStr) {
  const url = `${API_BASE_URL}/attendance/mark-all-present/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      date: dateStr,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to bulk mark present: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function resetAttendanceForDate(dateStr) {
  const url = `${API_BASE_URL}/attendance/reset-date/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      date: dateStr,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reset attendance: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function createEmployee(employeeData) {
  const url = `${API_BASE_URL}/employees/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Failed to create employee: ${response.statusText}`;
    throw new Error(message);
  }
  const data = await response.json();
  return data;
}

export async function deleteEmployee(employeeId) {
  const encodedId = encodeURIComponent(employeeId);
  const url = `${API_BASE_URL}/employees/${encodedId}/`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Failed to delete employee: ${response.statusText}`;
    throw new Error(message);
  }
  const data = await response.json();
  return data;
}

export async function updateEmployee(employeeId, employeeData) {
  const encodedId = encodeURIComponent(employeeId);
  const url = `${API_BASE_URL}/employees/${encodedId}/`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Failed to update employee: ${response.statusText}`;
    throw new Error(message);
  }
  const data = await response.json();
  return data;
}
