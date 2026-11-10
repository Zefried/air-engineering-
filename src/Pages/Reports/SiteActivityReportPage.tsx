import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Phone,
  Briefcase,
  MapPin,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import {
  siteActivityReportApi,
  type SiteActivityItem,
  type ActivityKPIs
} from '../../api/siteActivityReportApi';
import { projectsApi, type ProjectItem } from '../../api/projectsApi';
import { ReportNavTabs } from './Components/ReportNavTabs';
import './Styles/SiteActivityReport.css';

export const SiteActivityReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [kpis, setKpis] = useState<ActivityKPIs>({
    total_activities: 0,
    total_tasks: 0,
    completed_tasks: 0,
    blocker_tasks: 0,
    pending_tasks: 0,
    no_response_tasks: 0,
    active_sites_count: 0,
  });
  const [activities, setActivities] = useState<SiteActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Projects for filter
  useEffect(() => {
    projectsApi.getProjects().then((res) => {
      if (res && res.data) setProjects(res.data);
    }).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteActivityReportApi.getSummary({
        date: selectedDate,
        project_id: selectedProjectId !== 'all' ? selectedProjectId : undefined,
      });

      if (res.status) {
        setKpis(res.kpis);
        setActivities(res.activities || []);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load site activities report.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Navigation
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

  // Close / Sign-off Activity
  const handleCloseActivity = async (id: number) => {
    if (!window.confirm('Are you sure you want to sign off and close this daily site activity?')) return;
    try {
      await siteActivityReportApi.closeActivity(id);
      setFeedback({
        type: 'success',
        message: 'Site activity day closed and signed off successfully.',
      });
      loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to close site activity.',
      });
    }
  };

  // Filter activities based on tab
  const filteredActivities = activities.filter((act) => {
    if (selectedStatus === 'blockers') return act.metrics.has_blockers;
    if (selectedStatus === 'completed') return act.metrics.completed === act.metrics.total_tasks && act.metrics.total_tasks > 0;
    if (selectedStatus === 'pending') return act.metrics.pending > 0;
    return true;
  });

  return (
    <div className="activities-report-container">
      {/* Top Ambient Glow */}
      <div className="activities-top-ambient" />

      {/* QUICK REPORT SWITCHER NAV TABS */}
      <ReportNavTabs />

      {/* HEADER ROW */}
      <div className="activities-header-row">
        <div className="activities-title-wrap">
          <div className="activities-icon-wrap">
            <CalendarCheck size={20} />
          </div>
          <div>
            <h1 className="activities-title">Site Activities & Blockers</h1>
            <p className="activities-subtitle">
              Live site task execution, milestone completion, and blocker escalations
            </p>
          </div>
        </div>
      </div>

      {/* DATE NAVIGATOR BAR */}
      <div className="activities-date-nav">
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

      {/* PROJECT FILTER TRIGGER SELECTOR */}
      <div className="activities-project-selector">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Briefcase size={16} color="#64748b" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="activities-project-dropdown"
          >
            <option value="all">All Projects & Sites (Overview)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.project_code}) &bull; {p.client}
              </option>
            ))}
          </select>
        </div>
        <ChevronDown size={16} color="#94a3b8" />
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`workforce-alert ${feedback.type === 'success' ? 'workforce-alert-success' : 'workforce-alert-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
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
      <div className="activities-kpi-grid">
        {/* KPI 1: Active Blockers */}
        <div
          className={`activities-kpi-card ${selectedStatus === 'blockers' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'blockers' ? 'all' : 'blockers')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill red">
              <AlertTriangle size={13} />
            </div>
            <span className="kpi-card-label">Active Blockers</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="activities-kpi-value rose">{kpis.blocker_tasks}</div>
          <div className="kpi-card-sub">Critical field issues</div>
        </div>

        {/* KPI 2: Completed Tasks */}
        <div
          className={`activities-kpi-card ${selectedStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill green">
              <CheckCircle2 size={13} />
            </div>
            <span className="kpi-card-label">Completed</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="activities-kpi-value green">{kpis.completed_tasks}</div>
          <div className="kpi-card-sub">Finished milestones</div>
        </div>

        {/* KPI 3: In Progress / Pending */}
        <div
          className={`activities-kpi-card ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill amber">
              <Clock size={13} />
            </div>
            <span className="kpi-card-label">In Progress</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="activities-kpi-value amber">{kpis.pending_tasks}</div>
          <div className="kpi-card-sub">Ongoing on site</div>
        </div>

        {/* KPI 4: Active Sites */}
        <div
          className={`activities-kpi-card ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill purple">
              <Building2 size={13} />
            </div>
            <span className="kpi-card-label">Active Sites</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="activities-kpi-value purple">{kpis.active_sites_count}</div>
          <div className="kpi-card-sub">Running projects</div>
        </div>
      </div>

      {/* SEGMENTED FILTER PILL TABS */}
      <div className="activities-tab-pills">
        <button
          className={`activities-tab-pill ${selectedStatus === 'blockers' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('blockers')}
        >
          <span>Blockers</span>
          <span className="activities-tab-pill-count">{kpis.blocker_tasks}</span>
        </button>

        <button
          className={`activities-tab-pill ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('pending')}
        >
          <span>In Progress</span>
          <span className="activities-tab-pill-count">{kpis.pending_tasks}</span>
        </button>

        <button
          className={`activities-tab-pill ${selectedStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('completed')}
        >
          <span>Completed</span>
          <span className="activities-tab-pill-count">{kpis.completed_tasks}</span>
        </button>

        <button
          className={`activities-tab-pill ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <span>All Sites</span>
          <span className="activities-tab-pill-count">{kpis.total_activities}</span>
        </button>
      </div>

      {/* OPERATIONS INSIGHT BANNER */}
      {kpis.blocker_tasks > 0 ? (
        <div className="activities-insight-banner">
          <AlertTriangle size={16} color="#e11d48" style={{ flexShrink: 0 }} />
          <span>
            <strong>Attention:</strong> {kpis.blocker_tasks} site blocker(s) flagged by technicians.
            Review notes below to expedite material delivery or site clearance.
          </span>
        </div>
      ) : (
        <div className="activities-insight-banner">
          <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
          <span>
            <strong>Insight:</strong> All {kpis.total_tasks} site tasks proceeding on schedule with 0 active blockers.
          </span>
        </div>
      )}

      {/* DATA DISPLAY: LOADING / EMPTY / MOBILE CARDS / DESKTOP TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
          <div>Loading site activities...</div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            No Activities Found
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
            No site tasks found for the selected date and filter.
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================
             1. MOBILE-FIRST CARDS VIEW (< 768px)
             ======================================================== */}
          <div className="mobile-activities-cards-list">
            {filteredActivities.map((act) => {
              const hasBlockers = act.metrics.has_blockers;
              return (
                <div key={act.id} className={`mobile-activity-card ${hasBlockers ? 'has-blocker' : ''}`}>
                  {/* Top Header: Project Name & Status */}
                  <div className="activity-card-header">
                    <div>
                      <div className="activity-project-name">{act.project?.name || 'Project'}</div>
                      <div className="activity-client-sub">
                        <span>{act.project?.client}</span>
                        <span>&bull;</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {act.project?.project_code}
                        </span>
                      </div>
                    </div>

                    <span className={`activity-status-tag ${act.status}`}>
                      {act.status === 'open' ? '● Open' : '✓ Closed'}
                    </span>
                  </div>

                  {/* Site Location & Technician Info */}
                  <div className="activity-sub-meta">
                    {act.site && (
                      <div className="activity-site-chip">
                        <MapPin size={13} color="#7c3aed" style={{ flexShrink: 0 }} />
                        <span>{act.site.site_name}</span>
                      </div>
                    )}

                    {act.assigned_to && (
                      <div className="activity-tech-chip">
                        <span style={{ fontWeight: 650, color: '#0f172a' }}>
                          Technician: <strong>{act.assigned_to.name}</strong>
                        </span>
                        {act.assigned_to.phone && (
                          <a href={`tel:${act.assigned_to.phone}`} className="tech-call-link">
                            <Phone size={12} />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="activity-progress-wrap">
                    <div className="activity-progress-text">
                      <span>Progress</span>
                      <span>
                        {act.metrics.completed} / {act.metrics.total_tasks} Tasks ({act.metrics.progress_percent}%)
                      </span>
                    </div>
                    <div className="activity-progress-track">
                      <div
                        className={`activity-progress-fill ${hasBlockers ? 'with-blocker' : ''}`}
                        style={{ width: `${act.metrics.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  <div className="activity-tasks-preview">
                    {act.tasks.map((t) => {
                      return (
                        <div key={t.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div className="activity-task-row">
                            <span className={`task-status-chip ${t.status}`}>
                              {t.status === 'completed' && '✓ Done'}
                              {t.status === 'not_completed' && '✕ Issue'}
                              {t.status === 'pending' && '⏳ In Progress'}
                              {t.status === 'no_response' && '—'}
                            </span>
                            <span style={{ color: '#1e293b', fontWeight: 550 }}>
                              {t.task_description}
                            </span>
                          </div>

                          {/* Blocker Note */}
                          {t.status === 'not_completed' && t.worker_note && (
                            <div className="task-blocker-note">
                              <strong>Technician Blocker Note:</strong> {t.worker_note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Row */}
                  {act.status === 'open' && (
                    <div className="activity-actions-row">
                      <button
                        onClick={() => handleCloseActivity(act.id)}
                        className="btn-signoff-activity"
                        title="Sign off and close daily site activity"
                      >
                        <Check size={14} />
                        <span>Sign-off / Close Day ✓</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================================
             2. DESKTOP-ONLY TABLE VIEW (≥ 768px)
             ======================================================== */}
          <div className="desktop-activities-table-card">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Project & Site</th>
                  <th>Assigned Technician</th>
                  <th>Tasks Breakdown</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => {
                  return (
                    <tr key={act.id}>
                      <td>
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>
                          {act.project?.name || 'Project'}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {act.site?.site_name} &bull; {act.project?.project_code}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 650, color: '#0f172a' }}>
                          {act.assigned_to?.name || 'Unassigned'}
                        </div>
                        {act.assigned_to?.phone && (
                          <a href={`tel:${act.assigned_to.phone}`} style={{ fontSize: 11.5, color: '#2563eb', textDecoration: 'none' }}>
                            {act.assigned_to.phone}
                          </a>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 360 }}>
                          {act.tasks.map((t) => (
                            <div key={t.id} style={{ fontSize: 12 }}>
                              <span className={`task-status-chip ${t.status}`} style={{ marginRight: 6 }}>
                                {t.status === 'completed' ? '✓' : t.status === 'not_completed' ? '✕' : '⏳'}
                              </span>
                              <span>{t.task_description}</span>
                              {t.status === 'not_completed' && t.worker_note && (
                                <div style={{ fontSize: 11, color: '#e11d48', marginTop: 2, fontStyle: 'italic' }}>
                                  Note: {t.worker_note}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td>
                        <div style={{ minWidth: 100 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                            {act.metrics.completed}/{act.metrics.total_tasks} ({act.metrics.progress_percent}%)
                          </div>
                          <div className="activity-progress-track">
                            <div
                              className={`activity-progress-fill ${act.metrics.has_blockers ? 'with-blocker' : ''}`}
                              style={{ width: `${act.metrics.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`activity-status-tag ${act.status}`}>
                          {act.status === 'open' ? '● Open' : '✓ Closed'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {act.status === 'open' && (
                          <button
                            onClick={() => handleCloseActivity(act.id)}
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
                            Sign-off ✓
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
    </div>
  );
};

export default SiteActivityReportPage;
