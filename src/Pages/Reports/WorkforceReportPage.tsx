import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Phone,
  Wrench,
  DollarSign,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  UserX
} from 'lucide-react';
import {
  workforceReportApi,
  type WorkforceEmployeeItem,
  type WorkforceKPIs
} from '../../api/workforceReportApi';
import { ReportNavTabs } from './Components/ReportNavTabs';
import './Styles/WorkforceReport.css';

export const WorkforceReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [kpis, setKpis] = useState<WorkforceKPIs>({
    total_roster: 0,
    present_count: 0,
    absent_count: 0,
    today_labor_cost: 0,
    absent_deductions: 0,
  });
  const [workers, setWorkers] = useState<WorkforceEmployeeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Quick Mark Absent Modal State
  const [absentModalWorker, setAbsentModalWorker] = useState<WorkforceEmployeeItem | null>(null);
  const [absentReason, setAbsentReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workforceReportApi.getSummary(selectedDate);
      if (res.status) {
        setKpis(res.kpis);
        setWorkers(res.workers || []);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load workforce attendance report.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Fast 1-Tap Toggle: Mark Present (Remove Absence)
  const handleMarkPresent = async (worker: WorkforceEmployeeItem) => {
    try {
      await workforceReportApi.removeAbsent(worker.id, {
        attendance_date: selectedDate,
        reason: 'Restored to Present from Quick Workforce Dashboard',
      });
      setFeedback({
        type: 'success',
        message: `'${worker.name}' restored to Present. Daily wage marked as payable.`,
      });
      loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update attendance status.',
      });
    }
  };

  // Submit Mark Absent Modal
  const handleSubmitMarkAbsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absentModalWorker) return;

    setSubmittingAction(true);
    try {
      await workforceReportApi.markAbsent(absentModalWorker.id, {
        start_date: selectedDate,
        end_date: selectedDate,
        reason: absentReason.trim() || 'Marked absent from Quick Workforce Operations Report',
      });
      setFeedback({
        type: 'success',
        message: `'${absentModalWorker.name}' marked Absent for ${selectedDate}.`,
      });
      setAbsentModalWorker(null);
      setAbsentReason('');
      loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to mark absence.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    if (selectedStatus === 'present') return w.status === 'present';
    if (selectedStatus === 'absent') return w.status === 'absent';
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="workforce-report-container">
      {/* Ambient Atmospheric Top Glow */}
      <div className="workforce-top-ambient" />

      {/* QUICK REPORT SWITCHER NAV TABS */}
      <ReportNavTabs />

      {/* HEADER ROW */}
      <div className="workforce-header-row">
        <div className="workforce-title-wrap">
          <div className="workforce-icon-wrap">
            <Users size={20} />
          </div>
          <div>
            <h1 className="workforce-title">Workforce & Attendance — Operations</h1>
            <p className="workforce-subtitle">
              Live daily site labor tracking, active roster, and daily wage liability
            </p>
          </div>
        </div>
      </div>

      {/* DATE NAVIGATOR BAR */}
      <div className="workforce-date-nav">
        <button onClick={handlePrevDay} className="date-nav-btn" title="Previous Day">
          <ChevronLeft size={15} />
          <span>Prev</span>
        </button>

        <div className="date-display-badge">
          <Calendar size={14} color="#7c3aed" />
          <span>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          {!isToday && (
            <button onClick={handleToday} className="btn-today-pill">
              Jump to Today
            </button>
          )}
        </div>

        <button onClick={handleNextDay} className="date-nav-btn" title="Next Day">
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`workforce-alert ${feedback.type === 'success' ? 'workforce-alert-success' : 'workforce-alert-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2x2 MOBILE KPI GRID */}
      <div className="workforce-kpi-grid">
        {/* KPI 1: Present Today */}
        <div
          className={`workforce-kpi-card ${selectedStatus === 'present' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'present' ? 'all' : 'present')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill green">
              <CheckCircle2 size={13} />
            </div>
            <span className="kpi-card-label">Present Today</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="workforce-kpi-value green">{kpis.present_count}</div>
          <div className="kpi-card-sub">Active on site</div>
        </div>

        {/* KPI 2: Absent / Leave */}
        <div
          className={`workforce-kpi-card ${selectedStatus === 'absent' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'absent' ? 'all' : 'absent')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill red">
              <XCircle size={13} />
            </div>
            <span className="kpi-card-label">Absent / Leave</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="workforce-kpi-value rose">{kpis.absent_count}</div>
          <div className="kpi-card-sub">Requires follow-up</div>
        </div>

        {/* KPI 3: Today's Labor Cost */}
        <div className="workforce-kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-pill purple">
              <DollarSign size={13} />
            </div>
            <span className="kpi-card-label">Labor Cost</span>
          </div>
          <div className="workforce-kpi-value violet">
            ₹{kpis.today_labor_cost.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div className="kpi-card-sub">Daily wage committed</div>
        </div>

        {/* KPI 4: Total Roster */}
        <div
          className={`workforce-kpi-card ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill blue">
              <Users size={13} />
            </div>
            <span className="kpi-card-label">Total Roster</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="workforce-kpi-value">{kpis.total_roster}</div>
          <div className="kpi-card-sub">Technicians & staff</div>
        </div>
      </div>

      {/* SEGMENTED FILTER PILL TABS */}
      <div className="workforce-tab-pills">
        <button
          className={`workforce-tab-pill ${selectedStatus === 'present' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('present')}
        >
          <span>Present</span>
          <span className="workforce-tab-pill-count">{kpis.present_count}</span>
        </button>

        <button
          className={`workforce-tab-pill ${selectedStatus === 'absent' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('absent')}
        >
          <span>Absent</span>
          <span className="workforce-tab-pill-count">{kpis.absent_count}</span>
        </button>

        <button
          className={`workforce-tab-pill ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <span>All Staff</span>
          <span className="workforce-tab-pill-count">{kpis.total_roster}</span>
        </button>
      </div>

      {/* OPERATIONS INSIGHT BANNER */}
      <div className="workforce-insight-banner">
        <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
        <span>
          <strong>Insight:</strong> {kpis.present_count} of {kpis.total_roster} technicians active on
          site today. Total daily wage liability is ₹
          {kpis.today_labor_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
        </span>
      </div>

      {/* DATA DISPLAY: LOADING / EMPTY / MOBILE CARDS / DESKTOP TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
          <div>Loading workforce attendance...</div>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <Users size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            No Workers in This View
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
            No team members matched the current filter ({selectedStatus}).
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================
             1. MOBILE-FIRST CARDS VIEW (< 768px)
             ======================================================== */}
          <div className="mobile-workforce-cards-list">
            {filteredWorkers.map((w) => {
              const isAbsent = w.status === 'absent';
              return (
                <div key={w.id} className="mobile-workforce-card">
                  {/* Top: Avatar, Name, Role & Status Pill */}
                  <div className="worker-card-header">
                    <div className="worker-profile-wrap">
                      <div className="worker-avatar">{getInitials(w.name)}</div>
                      <div>
                        <h4 className="worker-name">{w.name}</h4>
                        <span className="worker-role-tag">{w.role}</span>
                      </div>
                    </div>

                    <span className={`worker-status-pill ${w.status}`}>
                      {isAbsent ? '✕ Absent' : '✓ Present'}
                    </span>
                  </div>

                  {/* Contact Row (1-Tap Call) */}
                  {w.phone && (
                    <a href={`tel:${w.phone}`} className="worker-phone-pill">
                      <Phone size={12} />
                      <span>{w.phone}</span>
                    </a>
                  )}

                  {/* Wage Rate & Tools in Field */}
                  <div className="worker-meta-bar">
                    <div className="meta-chip">
                      <span>Rate:</span>
                      <strong className="meta-chip-bold">
                        ₹{Number(w.salary.daily_salary).toLocaleString('en-IN', { minimumFractionDigits: 0 })} / day
                      </strong>
                    </div>

                    <div className="meta-chip">
                      <Wrench size={13} color="#64748b" />
                      <span>{w.assigned_tools_count} Tools in Field</span>
                    </div>
                  </div>

                  {/* Absence Reason (if absent) */}
                  {isAbsent && w.absence_record && (
                    <div className="worker-absence-bubble">
                      <strong>Reason:</strong> {w.absence_record.reason || 'Absence recorded by management'}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="worker-actions-row">
                    {isAbsent ? (
                      <button
                        onClick={() => handleMarkPresent(w)}
                        className="btn-worker-toggle mark-present"
                        title="Remove absence and mark present"
                      >
                        <Check size={14} />
                        <span>Mark Present ✓</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setAbsentModalWorker(w)}
                        className="btn-worker-toggle mark-absent"
                        title="Mark employee absent today"
                      >
                        <UserX size={14} />
                        <span>Mark Absent ✕</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
             2. DESKTOP-ONLY TABLE VIEW (≥ 768px)
             ======================================================== */}
          <div className="desktop-workforce-table-card">
            <table className="workforce-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Daily Wage</th>
                  <th>Tools in Field</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => {
                  const isAbsent = w.status === 'absent';
                  return (
                    <tr key={w.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="worker-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                            {getInitials(w.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 750, color: '#0f172a' }}>{w.name}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>{w.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="worker-role-tag">{w.role}</span>
                      </td>

                      <td>
                        {w.phone ? (
                          <a href={`tel:${w.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12.5, fontWeight: 600 }}>
                            {w.phone}
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      <td>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>
                          ₹{Number(w.salary.daily_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#475569' }}>
                          <Wrench size={13} color="#64748b" />
                          <span>{w.assigned_tools_count}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`worker-status-pill ${w.status}`}>
                          {isAbsent ? '✕ Absent' : '✓ Present'}
                        </span>
                        {isAbsent && w.absence_record?.reason && (
                          <div style={{ fontSize: 11, color: '#9f1239', marginTop: 2 }}>
                            {w.absence_record.reason}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isAbsent ? (
                          <button
                            onClick={() => handleMarkPresent(w)}
                            style={{
                              padding: '6px 12px',
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Mark Present ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => setAbsentModalWorker(w)}
                            style={{
                              padding: '6px 12px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Mark Absent ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* QUICK MARK ABSENT MODAL / BOTTOM SHEET DRAWER */}
      {absentModalWorker && (
        <div className="workforce-modal-overlay" onClick={() => setAbsentModalWorker(null)}>
          <div className="workforce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="workforce-drag-bar" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserX size={18} color="#e11d48" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Mark {absentModalWorker.name} Absent
                </h3>
              </div>
              <button
                onClick={() => setAbsentModalWorker(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitMarkAbsent}>
              <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 12 }}>
                Confirming absence for date: <strong>{selectedDate}</strong>. Daily salary deduction of{' '}
                <strong>₹{Number(absentModalWorker.salary.daily_salary).toLocaleString('en-IN')}</strong> will apply.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  Reason for Absence (Optional):
                </label>
                <textarea
                  placeholder="e.g. Sick leave, doctor appointment, personal emergency..."
                  value={absentReason}
                  onChange={(e) => setAbsentReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAbsentModalWorker(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  disabled={submittingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#e11d48',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={submittingAction}
                >
                  {submittingAction ? 'Marking...' : 'Confirm Absent ✕'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceReportPage;
