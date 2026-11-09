import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import { activitiesApi, type DailyActivityItem, type TaskStatus } from '../../api/activitiesApi';
import { CreateActivityModal } from './Components/CreateActivityModal';
import { ActivityTimelineModal } from './Components/ActivityTimelineModal';
import './Styles/Activities.css';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<DailyActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [timelineActivityId, setTimelineActivityId] = useState<number | string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activitiesApi.getActivities({
        date: selectedDate || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res && res.data) {
        setActivities(res.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load activities.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleManualClose = async (activityId: number) => {
    if (!window.confirm('Are you sure you want to close this daily activity? Any pending tasks will be stamped as No Response.')) {
      return;
    }
    try {
      await activitiesApi.closeActivity(activityId);
      setFeedback({
        type: 'success',
        message: 'Daily activity closed successfully.',
      });
      loadActivities();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to close activity.',
      });
    }
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge-status badge-completed">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'not_completed':
        return (
          <span className="badge-status badge-not-completed">
            <XSquare size={12} /> Not Completed
          </span>
        );
      case 'no_response':
        return (
          <span className="badge-status badge-no-response">
            <AlertTriangle size={12} /> No Response
          </span>
        );
      default:
        return (
          <span className="badge-status badge-pending">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  // KPIs
  const totalActivities = activities.length;
  const openCount = activities.filter((a) => a.status === 'open').length;
  const allTasks = activities.flatMap((a) => a.tasks || []);
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
  const noResponseTasks = allTasks.filter((t) => t.status === 'no_response').length;

  return (
    <div className="activities-container">
      {/* HEADER */}
      <div className="activities-header-row">
        <div>
          <h1 className="activities-title">Daily Activity & Task Dispatch</h1>
          <p className="activities-subtitle">
            Assign site to-dos to technicians, track live progress & audit historical timelines
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => loadActivities()}
            className="btn-primary-action"
            style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary-action"
            style={{ background: '#0d9488' }}
          >
            <Plus size={16} /> Assign Activity
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
          }}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* KPI GRID */}
      <div className="activities-kpi-grid">
        <div className="activities-kpi-card">
          <div>
            <div className="activities-kpi-label">Activities Scheduled</div>
            <div className="activities-kpi-val">{totalActivities}</div>
          </div>
          <div className="activities-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CalendarCheck size={22} />
          </div>
        </div>

        <div className="activities-kpi-card">
          <div>
            <div className="activities-kpi-label">Open Shifts</div>
            <div className="activities-kpi-val">{openCount}</div>
          </div>
          <div className="activities-kpi-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="activities-kpi-card">
          <div>
            <div className="activities-kpi-label">Tasks Completed</div>
            <div className="activities-kpi-val" style={{ color: '#059669' }}>{completedTasks}</div>
          </div>
          <div className="activities-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="activities-kpi-card">
          <div>
            <div className="activities-kpi-label">No Response (EOD)</div>
            <div className="activities-kpi-val" style={{ color: '#dc2626' }}>{noResponseTasks}</div>
          </div>
          <div className="activities-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="activities-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} color="#64748b" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-input"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Only</option>
            <option value="closed">Closed Only</option>
          </select>
        </div>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear Date (Show All)
          </button>
        )}
      </div>

      {/* ACTIVITIES LIST */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', color: '#0d9488' }} />
          Loading daily activities...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 14 }}>
          <CheckSquare size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>
            No Activities Found for Selected Filter
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
            Click "Assign Activity" above to create and dispatch tasks to technicians for this date.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary-action"
            style={{ background: '#0d9488', margin: '0 auto' }}
          >
            <Plus size={15} /> Assign First Activity
          </button>
        </div>
      ) : (
        <div>
          {activities.map((act) => {
            const tasks = act.tasks || [];
            const completed = tasks.filter((t) => t.status === 'completed').length;
            const notCompleted = tasks.filter((t) => t.status === 'not_completed').length;
            const noResponse = tasks.filter((t) => t.status === 'no_response').length;
            const pending = tasks.filter((t) => t.status === 'pending').length;

            return (
              <div key={act.id} className="activity-list-card">
                {/* Header */}
                <div className="activity-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="activity-code-pill">{act.activity_code}</span>
                    <strong style={{ fontSize: 15, color: '#0f172a' }}>
                      {act.assigned_to?.name || 'Technician'}
                    </strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>({act.assigned_to?.role})</span>
                    <span
                      className="badge-status"
                      style={{
                        background: act.status === 'open' ? '#ecfdf5' : '#f1f5f9',
                        color: act.status === 'open' ? '#059669' : '#475569',
                        border: `1px solid ${act.status === 'open' ? '#a7f3d0' : '#e2e8f0'}`,
                      }}
                    >
                      {act.status.toUpperCase()}
                    </span>
                    <span className="activity-code-pill" style={{ textTransform: 'capitalize' }}>
                      {act.task_type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setTimelineActivityId(act.id)}
                      className="btn-primary-action"
                      style={{ padding: '6px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
                      title="View Chronological Timeline"
                    >
                      <Eye size={14} color="#0d9488" />
                      <span>Timeline</span>
                    </button>

                    {act.status === 'open' && (
                      <button
                        onClick={() => handleManualClose(act.id)}
                        className="btn-primary-action"
                        style={{ padding: '6px 12px', background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca' }}
                        title="Close Activity Manually"
                      >
                        <Lock size={14} />
                        <span>Close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="activity-meta-grid">
                  <div>
                    <div className="activity-meta-label">Project</div>
                    <div className="activity-meta-val">{act.project?.name || 'General Project'}</div>
                  </div>
                  <div>
                    <div className="activity-meta-label">Site Location</div>
                    <div className="activity-meta-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="#ef4444" />
                      <span>{act.site?.site_name || 'Main Site'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="activity-meta-label">Date</div>
                    <div className="activity-meta-val">{act.activity_date}</div>
                  </div>
                  <div>
                    <div className="activity-meta-label">Task Progress</div>
                    <div className="activity-meta-val" style={{ fontSize: 12 }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{completed} Done</span>
                      {notCompleted > 0 && <span style={{ color: '#d97706', marginLeft: 6 }}>{notCompleted} Incomplete</span>}
                      {pending > 0 && <span style={{ color: '#64748b', marginLeft: 6 }}>{pending} Pending</span>}
                      {noResponse > 0 && <span style={{ color: '#dc2626', marginLeft: 6 }}>{noResponse} No Response</span>}
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="activity-tasks-box">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                    Assigned Tasks ({tasks.length})
                  </div>
                  {tasks.map((task) => (
                    <div key={task.id} className="task-item-row">
                      <div style={{ flex: 1 }}>
                        <p className="task-desc">{task.task_description}</p>
                        {task.worker_note && (
                          <p className="task-note-text">Note: "{task.worker_note}"</p>
                        )}
                      </div>
                      <div>
                        {getTaskStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ACTIVITY MODAL */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          setFeedback({
            type: 'success',
            message: 'New daily activity created and tasks assigned.',
          });
          loadActivities();
        }}
      />

      {/* TIMELINE AUDIT MODAL */}
      <ActivityTimelineModal
        activityId={timelineActivityId}
        isOpen={timelineActivityId !== null}
        onClose={() => setTimelineActivityId(null)}
      />
    </div>
  );
};

export default ActivitiesPage;
