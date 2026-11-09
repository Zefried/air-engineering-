import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CalendarX,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar as CalendarIcon
} from 'lucide-react';
import { usersApi, type UserItem } from '../../api/usersApi';
import { attendanceApi, type EmployeeAttendanceData } from '../../api/attendanceApi';
import { SalaryConfigModal } from './Components/SalaryConfigModal';
import { MarkAbsentModal } from './Components/MarkAbsentModal';
import './Styles/Attendance.css';

export const AttendancePage: React.FC = () => {
  const [employees, setEmployees] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState<EmployeeAttendanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Range Selection for Absent Marking
  const [selectedRangeStart, setSelectedRangeStart] = useState<string | null>(null);
  const [selectedRangeEnd, setSelectedRangeEnd] = useState<string | null>(null);

  // Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState<boolean>(false);
  const [isMarkAbsentModalOpen, setIsMarkAbsentModalOpen] = useState<boolean>(false);

  // Load employee list on mount
  useEffect(() => {
    usersApi.getAll({ per_page: 100 }).then((res) => {
      const list = res?.data?.data || [];
      const eligible = list.filter((u: UserItem) =>
        ['worker', 'technician', 'manager'].includes(u.role)
      );
      setEmployees(eligible);
      if (eligible.length > 0 && !selectedUserId) {
        setSelectedUserId(String(eligible[0].id));
      }
    }).catch(() => {});
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setSelectedRangeStart(null);
    setSelectedRangeEnd(null);

    try {
      const res = await attendanceApi.getEmployeeAttendance(selectedUserId, currentMonth);
      if (res.status) {
        setData(res.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load employee attendance.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, currentMonth]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const selectedEmployee = employees.find((e) => String(e.id) === String(selectedUserId));

  // Calendar Day Click Handler
  const handleDayClick = async (dateStr: string, isAbsent: boolean, isDisabled: boolean) => {
    if (isDisabled) return;

    // If day is already absent, offer to remove/correct it
    if (isAbsent) {
      if (window.confirm(`Remove absent mark for ${dateStr}?\nThis day will become payable again.`)) {
        try {
          await attendanceApi.removeAbsent(selectedUserId, {
            attendance_date: dateStr,
            reason: 'Removed by manager in calendar',
          });
          setFeedback({
            type: 'success',
            message: `Absence on ${dateStr} removed. Day is now payable.`,
          });
          loadAttendance();
        } catch (err: any) {
          setFeedback({
            type: 'error',
            message: err?.response?.data?.message || 'Failed to remove absence.',
          });
        }
      }
      return;
    }

    // Range selection logic
    if (!selectedRangeStart || (selectedRangeStart && selectedRangeEnd)) {
      setSelectedRangeStart(dateStr);
      setSelectedRangeEnd(null);
    } else {
      // Second click finishes range
      if (dateStr >= selectedRangeStart) {
        setSelectedRangeEnd(dateStr);
      } else {
        setSelectedRangeEnd(selectedRangeStart);
        setSelectedRangeStart(dateStr);
      }
    }
  };

  // Helper to construct Month Calendar Grid
  const renderCalendarDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
    // Convert to Monday = 0: (day + 6) % 7
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const tiles = [];
    const joiningDate = data?.user?.joining_date || '2026-01-01';
    const absentSet = new Set(data?.absent_dates || []);
    const todayStr = new Date().toISOString().split('T')[0];

    // Padding for days before the 1st
    for (let i = 0; i < adjustedFirstDay; i++) {
      tiles.push(<div key={`pad-${i}`} className="calendar-day-tile disabled" />);
    }

    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBeforeJoining = dayStr < joiningDate;
      const isAbsent = absentSet.has(dayStr);
      const isToday = dayStr === todayStr;

      const isSelected =
        (selectedRangeStart === dayStr && !selectedRangeEnd) ||
        (selectedRangeStart && selectedRangeEnd && dayStr >= selectedRangeStart && dayStr <= selectedRangeEnd);

      const absentRecord = data?.absent_records?.find((r) => r.attendance_date.startsWith(dayStr));

      tiles.push(
        <div
          key={dayStr}
          onClick={() => handleDayClick(dayStr, isAbsent, isBeforeJoining)}
          className={`calendar-day-tile ${isBeforeJoining ? 'disabled' : ''} ${isAbsent ? 'is-absent' : ''} ${
            isSelected ? 'is-selected' : ''
          } ${isToday ? 'today' : ''}`}
          title={
            isBeforeJoining
              ? `Joined later on ${joiningDate}`
              : isAbsent
              ? `Absent: ${absentRecord?.reason || 'No reason specified'} (Click to remove)`
              : `Payable Day (Click to select for Absent marking)`
          }
        >
          <div className="calendar-day-top">
            <span className="calendar-day-num">{day}</span>
            {isBeforeJoining ? (
              <span className="calendar-day-status-pill" style={{ color: '#94a3b8' }}>
                Not Joined
              </span>
            ) : isAbsent ? (
              <span className="calendar-day-status-pill status-pill-absent">Absent</span>
            ) : (
              <span className="calendar-day-status-pill status-pill-payable">Payable</span>
            )}
          </div>

          {isAbsent && absentRecord?.reason && (
            <div className="calendar-day-reason" title={absentRecord.reason}>
              {absentRecord.reason}
            </div>
          )}

          {isToday && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', marginTop: 'auto' }}>
              TODAY
            </div>
          )}
        </div>
      );
    }

    return tiles;
  };

  const monthLabel = new Date(
    parseInt(currentMonth.split('-')[0]),
    parseInt(currentMonth.split('-')[1]) - 1,
    1
  ).toLocaleString('default', { month: 'long', year: 'numeric' });

  const summary = data?.salary_summary;

  return (
    <div className="attendance-page-container">
      {/* HEADER */}
      <div className="attendance-header-row">
        <div className="attendance-title-wrap">
          <div className="attendance-icon-wrap">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h1 className="attendance-title">Attendance & Salary Management</h1>
            <p className="attendance-subtitle">
              Admin-controlled absenteeism calendar with automatic salary deduction
            </p>
          </div>
        </div>

        <div className="attendance-header-actions">
          <button
            onClick={() => setIsSalaryModalOpen(true)}
            className="attendance-btn-primary"
            disabled={!selectedUserId}
          >
            <DollarSign size={15} />
            <span>Configure Monthly Salary</span>
          </button>

          <button onClick={loadAttendance} className="attendance-btn-outline" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`attendance-alert ${feedback.type === 'success' ? 'attendance-alert-success' : 'attendance-alert-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="worker-feedback-dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* CONTROLS BAR: Employee Selector + Month Navigator */}
      <div className="attendance-controls-bar">
        <div className="attendance-selector-group">
          <label className="attendance-label">Select Employee:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="attendance-select"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role.toUpperCase()}) &bull; #{emp.id}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="attendance-month-nav">
          <button onClick={handlePrevMonth} className="attendance-month-btn" title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <span className="attendance-month-title">{monthLabel}</span>
          <button onClick={handleNextMonth} className="attendance-month-btn" title="Next Month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="attendance-kpi-grid">
        <div className="attendance-kpi-card">
          <div className="attendance-kpi-label">Monthly Salary</div>
          <div className="attendance-kpi-val">
            ₹{summary?.configured ? summary.monthly_salary.toLocaleString('en-IN') : '0.00'}
          </div>
          <div className="attendance-kpi-sub">
            {summary?.configured
              ? `Effective: ${summary.effective_from}`
              : 'Salary not configured'}
          </div>
        </div>

        <div className="attendance-kpi-card">
          <div className="attendance-kpi-label">Daily Salary Rate</div>
          <div className="attendance-kpi-val">
            ₹{summary?.configured ? summary.daily_salary.toFixed(2) : '0.00'}
          </div>
          <div className="attendance-kpi-sub">Monthly / 30 rule</div>
        </div>

        <div className="attendance-kpi-card">
          <div className="attendance-kpi-label">Absent Days</div>
          <div className="attendance-kpi-val" style={{ color: (summary?.absent_days_count || 0) > 0 ? '#dc2626' : '#0f172a' }}>
            {summary?.absent_days_count || 0} {summary?.absent_days_count === 1 ? 'Day' : 'Days'}
          </div>
          <div className="attendance-kpi-sub">Explicitly marked absent</div>
        </div>

        <div className="attendance-kpi-card">
          <div className="attendance-kpi-label">Absent Deduction</div>
          <div className="attendance-kpi-val negative">
            -₹{summary?.configured ? summary.absent_deduction.toFixed(2) : '0.00'}
          </div>
          <div className="attendance-kpi-sub">Absent Days &times; Daily Rate</div>
        </div>

        <div className="attendance-kpi-card highlight">
          <div className="attendance-kpi-label">Net Payable Salary</div>
          <div className="attendance-kpi-val positive">
            ₹{summary?.configured ? summary.payable_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="attendance-kpi-sub">
            {summary?.is_mid_month_join ? 'Mid-Month Joinee Pro-Rated' : 'Monthly - Absent Deduction'}
          </div>
        </div>
      </div>

      {/* RANGE SELECTION ACTION STRIP */}
      {selectedRangeStart && (
        <div className="attendance-action-strip">
          <div className="attendance-action-text">
            Selected Date Range: <strong>{selectedRangeStart}</strong>
            {selectedRangeEnd && selectedRangeStart !== selectedRangeEnd && (
              <> &rarr; <strong>{selectedRangeEnd}</strong></>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => {
                setSelectedRangeStart(null);
                setSelectedRangeEnd(null);
              }}
              className="attendance-btn-outline"
            >
              Cancel Selection
            </button>

            <button
              onClick={() => setIsMarkAbsentModalOpen(true)}
              className="attendance-btn-primary"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
            >
              <CalendarX size={15} />
              <span>Mark Selected as Absent</span>
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE CALENDAR */}
      <div className="attendance-calendar-card">
        <div className="attendance-calendar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarIcon size={18} color="#0f172a" />
            <h2 style={{ fontSize: 16, fontWeight: 750, margin: 0 }}>
              {selectedEmployee?.name}&rsquo;s Attendance &bull; {monthLabel}
            </h2>
          </div>

          <div className="attendance-calendar-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot-payable" />
              <span>Payable (Unmarked)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot-absent" />
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot-disabled" />
              <span>Pre-Joining / Inactive</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
          &bull; <strong>Click any date</strong> to start selecting a date or date range to mark Absent.
          <br />
          &bull; <strong>Click an already marked Absent date</strong> to remove/correct it and make it payable.
        </div>

        {/* Weekday headers */}
        <div className="calendar-weekdays-row">
          <div className="calendar-weekday">Mon</div>
          <div className="calendar-weekday">Tue</div>
          <div className="calendar-weekday">Wed</div>
          <div className="calendar-weekday">Thu</div>
          <div className="calendar-weekday">Fri</div>
          <div className="calendar-weekday">Sat</div>
          <div className="calendar-weekday">Sun</div>
        </div>

        {/* Days grid */}
        <div className="calendar-days-grid">
          {renderCalendarDays()}
        </div>
      </div>

      {/* SALARY CONFIG MODAL */}
      {isSalaryModalOpen && selectedEmployee && (
        <SalaryConfigModal
          isOpen={isSalaryModalOpen}
          onClose={() => setIsSalaryModalOpen(false)}
          userId={selectedEmployee.id}
          userName={selectedEmployee.name}
          currentSalary={summary?.monthly_salary}
          onSaved={() => {
            setFeedback({ type: 'success', message: 'Salary configuration updated successfully.' });
            loadAttendance();
          }}
        />
      )}

      {/* MARK ABSENT MODAL */}
      {isMarkAbsentModalOpen && selectedEmployee && selectedRangeStart && (
        <MarkAbsentModal
          isOpen={isMarkAbsentModalOpen}
          onClose={() => {
            setIsMarkAbsentModalOpen(false);
            setSelectedRangeStart(null);
            setSelectedRangeEnd(null);
          }}
          userId={selectedEmployee.id}
          userName={selectedEmployee.name}
          startDate={selectedRangeStart}
          endDate={selectedRangeEnd || selectedRangeStart}
          joiningDate={data?.user?.joining_date}
          onMarked={() => {
            setFeedback({ type: 'success', message: 'Absent days recorded successfully.' });
            loadAttendance();
          }}
        />
      )}
    </div>
  );
};

export default AttendancePage;
