import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Wrench,
  MapPin,
  Building2,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  FolderKanban,
  PackageCheck,
  X,
  ListTodo,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../../Context/AuthContextValue';
import { toolsApi } from '../../api/toolsApi';
import { projectsApi, type ProjectItem } from '../../api/projectsApi';
import { activitiesApi, type DailyActivityItem } from '../../api/activitiesApi';
import { attendanceApi, type EmployeeAttendanceData } from '../../api/attendanceApi';
import type { ToolItem, ToolCondition } from '../Tools/toolTypes';
import './Styles/Technician.css';

const CONDITION_OPTIONS: { value: ToolCondition; label: string }[] = [
  { value: 'Good', label: 'Good (Bilkul Theek / Working)' },
  { value: 'Fair', label: 'Fair (Chalta Hai / Minor Wear)' },
  { value: 'Rough', label: 'Rough (Purana / Heavy Wear)' },
  { value: 'Damaged', label: 'Damaged (Kharab Hai / Repair Chahiye)' },
];

export const TechnicianDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const workerId = auth?.user?.id;
  const workerName = auth?.user?.name || 'Worker';

  const [tools, setTools] = useState<ToolItem[]>([]);
  const [nextProject, setNextProject] = useState<ProjectItem | null>(null);
  const [activities, setActivities] = useState<DailyActivityItem[]>([]);
  const [taskNotes, setTaskNotes] = useState<Record<number, string>>({});
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<EmployeeAttendanceData | null>(null);
  const [attendanceMonth, setAttendanceMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingToolId, setUpdatingToolId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Return to Store Modal State
  const [returningTool, setReturningTool] = useState<ToolItem | null>(null);
  const [handoverCondition, setHandoverCondition] = useState<ToolCondition>('Good');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    setFeedback(null);

    try {
      const [toolsRes, projectsRes, activitiesRes, attendanceRes] = await Promise.all([
        toolsApi.getAll({ worker_id: workerId }),
        projectsApi.getAll({ worker_id: workerId }),
        activitiesApi.getActivities(),
        attendanceApi.getMyAttendance(attendanceMonth).catch(() => null),
      ]);

      // Filter strictly to tools assigned to this worker ID
      const assigned = (toolsRes.tools || []).filter(
        (t) => String(t.assignedTo?.workerId) === String(workerId)
      );
      setTools(assigned);

      // Find the active or upcoming project for this worker
      const userProjects = projectsRes.data || [];
      const active = userProjects.find((p) => p.status === 'in_progress') || userProjects[0] || null;
      setNextProject(active);

      // Activities for this worker
      const acts = activitiesRes.data || [];
      setActivities(acts);
      const initialNotes: Record<number, string> = {};
      acts.forEach((act) => {
        (act.tasks || []).forEach((t) => {
          if (t.worker_note) {
            initialNotes[t.id] = t.worker_note;
          }
        });
      });
      setTaskNotes(initialNotes);

      // Attendance for this worker
      if (attendanceRes?.status) {
        setAttendanceData(attendanceRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Data load karne me problem aayi. Refresh karein.',
      });
    } finally {
      setLoading(false);
    }
  }, [workerId, attendanceMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskStatusUpdate = async (
    activityId: number,
    taskId: number,
    newStatus: 'completed' | 'not_completed'
  ) => {
    setUpdatingTaskId(taskId);
    setFeedback(null);

    const note = taskNotes[taskId] || '';

    try {
      const res = await activitiesApi.updateTaskStatus(activityId, taskId, {
        status: newStatus,
        worker_note: note.trim() || undefined,
      });

      // Update state locally: live fields derived from latest update
      setActivities((prev) =>
        prev.map((act) => {
          if (act.id === activityId) {
            return {
              ...act,
              tasks: (act.tasks || []).map((t) => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    status: newStatus,
                    worker_note: res.task?.worker_note ?? (note.trim() || t.worker_note),
                    updated_at_timestamp: res.task?.updated_at_timestamp ?? new Date().toISOString(),
                  };
                }
                return t;
              }),
            };
          }
          return act;
        })
      );

      const statusText =
        newStatus === 'completed' ? 'Kaam Pura Ho Gaya (Completed)' : 'Kaam Baaki Hai (Not Completed)';
      setFeedback({
        type: 'success',
        message: `Task status update ho gaya: "${statusText}".`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Task status update karne me error aaya.',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleConditionChange = async (toolId: string, newCondition: ToolCondition) => {
    setUpdatingToolId(toolId);
    setFeedback(null);

    try {
      await toolsApi.update(toolId, {
        current_condition: newCondition,
      });

      // Update state locally
      setTools((prev) =>
        prev.map((t) => {
          if (t.id === toolId) {
            const isDamaged = newCondition === 'Damaged';
            return {
              ...t,
              currentCondition: newCondition,
              status: isDamaged ? 'Needs Repair' : t.status,
            };
          }
          return t;
        })
      );

      setFeedback({
        type: 'success',
        message: `Tool condition "${newCondition}" update ho gayi.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Condition update nahi ho payi.',
      });
    } finally {
      setUpdatingToolId(null);
    }
  };

  const handleOpenReturnModal = (tool: ToolItem) => {
    setReturningTool(tool);
    setHandoverCondition(tool.currentCondition || 'Good');
    setHandoverNotes('');
  };

  const handleCloseReturnModal = () => {
    setReturningTool(null);
    setHandoverNotes('');
  };

  const handleConfirmHandoverNotice = async () => {
    if (!returningTool) return;
    setIsSubmittingNotice(true);

    try {
      const noteMsg = handoverNotes.trim()
        ? `Worker returning to store: ${handoverNotes.trim()}`
        : 'Worker initiated return to store';

      await toolsApi.update(returningTool.id, {
        current_condition: handoverCondition,
        notes: noteMsg,
      });

      // Update state locally
      setTools((prev) =>
        prev.map((t) => {
          if (t.id === returningTool.id) {
            const isDamaged = handoverCondition === 'Damaged';
            return {
              ...t,
              currentCondition: handoverCondition,
              status: isDamaged ? 'Needs Repair' : t.status,
            };
          }
          return t;
        })
      );

      handleCloseReturnModal();
      setFeedback({
        type: 'success',
        message: `Return notice bhej diya gaya hai! Ab ye tool Store Room me Store Manager ko handover karein.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Notice bhejne me error aaya.',
      });
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  const getStatusBadge = (status: string, condition: string) => {
    if (status === 'Needs Repair' || condition === 'Needs Repair' || condition === 'Damaged') {
      return <span className="worker-card-badge worker-badge-red">Kharab / Repair</span>;
    }
    if (status === 'In Field' || status === 'In Use') {
      return <span className="worker-card-badge worker-badge-blue">Aapke Paas (In Field)</span>;
    }
    return <span className="worker-card-badge worker-badge-green">{status}</span>;
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="worker-task-status-pill worker-task-status-completed">
            <CheckCircle size={13} />
            <span>✓ Ho Gaya (Done)</span>
          </span>
        );
      case 'not_completed':
        return (
          <span className="worker-task-status-pill worker-task-status-not_completed">
            <XCircle size={13} />
            <span>✗ Nahi Hua (Not Done)</span>
          </span>
        );
      case 'no_response':
        return (
          <span className="worker-task-status-pill worker-task-status-no_response">
            <Clock size={13} />
            <span>No Response (Band Ho Gaya)</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="worker-task-status-pill worker-task-status-pending">
            <Clock size={13} />
            <span>⏳ Baaki Hai (Pending)</span>
          </span>
        );
    }
  };

  const handlePrevAttendanceMonth = () => {
    const [y, m] = attendanceMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setAttendanceMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextAttendanceMonth = () => {
    const [y, m] = attendanceMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setAttendanceMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const renderWorkerCalendar = () => {
    if (!attendanceData) return null;
    const [year, month] = attendanceMonth.split('-').map(Number);
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const tiles = [];
    const joiningDate = attendanceData.user?.joining_date || '2026-01-01';
    const absentSet = new Set(attendanceData.absent_dates || []);
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < adjustedFirstDay; i++) {
      tiles.push(<div key={`pad-${i}`} className="worker-cal-day-cell day-disabled" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBeforeJoining = dayStr < joiningDate;
      const isAbsent = absentSet.has(dayStr);
      const isToday = dayStr === todayStr;

      tiles.push(
        <div
          key={dayStr}
          className={`worker-cal-day-cell ${isBeforeJoining ? 'day-disabled' : ''} ${isAbsent ? 'day-absent' : ''}`}
          style={isToday ? { border: '2px solid #3b82f6' } : undefined}
          title={
            isBeforeJoining
              ? `Joined on ${joiningDate}`
              : isAbsent
              ? `Absent (Deducted)`
              : `Payable Day`
          }
        >
          <span className="worker-cal-day-num">{day}</span>
          {isBeforeJoining ? (
            <span style={{ fontSize: 9, color: '#94a3b8' }}>-</span>
          ) : isAbsent ? (
            <span className="worker-cal-status-tag tag-absent">Absent</span>
          ) : (
            <span className="worker-cal-status-tag tag-payable">Payable</span>
          )}
        </div>
      );
    }

    return tiles;
  };

  return (
    <div className="worker-dashboard-container">
      {/* HEADER */}
      <div className="worker-header-row">
        <div>
          <div className="worker-title-wrap">
            <h1 className="worker-title">Worker Dashboard (Mera Kaam & Tools)</h1>
            <span className="worker-id-pill">Worker #{workerId}</span>
          </div>
          <p className="worker-subtitle">
            Namaste, <strong>{workerName}</strong> &bull; Aapke assigned tools aur kaam ki jagah (Job Site)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="worker-refresh-btn"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`worker-feedback-banner ${
            feedback.type === 'success' ? 'worker-feedback-success' : 'worker-feedback-error'
          }`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="worker-feedback-dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: ASSIGNED SITE / PROJECT */}
      <div className="worker-card">
        <div className="worker-card-header">
          <div className="worker-card-header-left">
            <div className="worker-card-icon worker-card-icon-blue">
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 className="worker-card-title">Kaam Ki Jagah (Assigned Site / Project)</h2>
              <p className="worker-card-desc">Aapko aaj yahan kaam karna hai (Current Project)</p>
            </div>
          </div>
          {nextProject && (
            <span
              className={`worker-card-badge ${
                nextProject.status === 'in_progress' ? 'worker-badge-green' : 'worker-badge-amber'
              }`}
            >
              {nextProject.status === 'in_progress' ? 'CHAL RAHA HAI (IN PROGRESS)' : nextProject.status.toUpperCase()}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 13 }}>
            Loading site details...
          </div>
        ) : nextProject ? (
          <div className="worker-project-box">
            <div>
              <div className="worker-field-label">Project (Kaam Ka Naam)</div>
              <div className="worker-field-value">{nextProject.name}</div>
              <div className="worker-field-sub">Code: {nextProject.project_code}</div>
            </div>

            <div>
              <div className="worker-field-label">Client (Kiske Liye Kaam)</div>
              <div className="worker-field-icon-row">
                <Building2 size={15} color="#64748b" />
                <span>{nextProject.client}</span>
              </div>
            </div>

            <div>
              <div className="worker-field-label">Site Location (Pata / Kahan Jana Hai)</div>
              <div className="worker-field-icon-row">
                <MapPin size={15} color="#ef4444" />
                <span>{nextProject.site_location}</span>
              </div>
            </div>

            <div>
              <div className="worker-field-label">Dates (Kab Tak)</div>
              <div className="worker-field-icon-row">
                <Calendar size={14} color="#64748b" />
                <span style={{ fontSize: 13 }}>
                  {nextProject.start_date || 'Ongoing'} &rarr; {nextProject.due_date || 'Ongoing'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="worker-empty-state">
            <p className="worker-empty-title">Abhi koi site assign nahi hai.</p>
            <p className="worker-empty-desc">Store Manager ya Supervisor se site assignment ke liye sampark karein.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: DAILY ACTIVITIES / TASKS (AAJ KE KAAM) */}
      <div className="worker-card">
        <div className="worker-card-header">
          <div className="worker-card-header-left">
            <div className="worker-card-icon worker-card-icon-violet">
              <ListTodo size={20} />
            </div>
            <div>
              <h2 className="worker-card-title">Aaj Ke Kaam (Daily Tasks & To-Do)</h2>
              <p className="worker-card-desc">
                Supervisor ne aapko jo task diye hain, complete hone par &ldquo;Kaam Ho Gaya&rdquo; dabayein
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="worker-card-badge worker-badge-neutral">
              {activities.reduce((acc, a) => acc + (a.tasks?.filter((t) => t.status === 'completed').length || 0), 0)} /{' '}
              {activities.reduce((acc, a) => acc + (a.tasks?.length || 0), 0)} Kaam Pura
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 13 }}>
            Loading your tasks...
          </div>
        ) : activities.length === 0 ? (
          <div className="worker-empty-state">
            <ListTodo size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <p className="worker-empty-title">Aaj ke liye koi task assign nahi hai.</p>
            <p className="worker-empty-desc">
              Jab Supervisor aapko Daily Activity assign karega, wo yahan dikhega.
            </p>
          </div>
        ) : (
          <div>
            {activities.map((activity) => {
              const isClosed = activity.status === 'closed';
              return (
                <div key={activity.id} className="worker-activity-block">
                  {/* Activity Sub-Header */}
                  <div className="worker-activity-block-header">
                    <div className="worker-activity-site-info">
                      <span className="worker-activity-site-name">
                        📍 {activity.site?.site_name || 'General Site'}
                      </span>
                      {activity.project && (
                        <span className="worker-activity-project-pill">
                          {activity.project.name} ({activity.project.project_code})
                        </span>
                      )}
                      <span className="worker-activity-date-pill">
                        <Calendar size={13} />
                        <span>Tarikh: {activity.activity_date}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className={`worker-card-badge ${
                          activity.task_type === 'service'
                            ? 'worker-badge-blue'
                            : activity.task_type === 'project'
                            ? 'worker-badge-amber'
                            : 'worker-badge-neutral'
                        }`}
                      >
                        Type: {activity.task_type.toUpperCase()}
                      </span>

                      <span
                        className={`worker-card-badge ${
                          isClosed ? 'worker-badge-neutral' : 'worker-badge-green'
                        }`}
                      >
                        {isClosed ? '🔒 Activity Closed (Din Band)' : '🟢 Open (Chal Raha Hai)'}
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="worker-tasks-list">
                    {(activity.tasks || []).map((task, idx) => {
                      const isUpdating = updatingTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`worker-task-card task-is-${task.status}`}
                        >
                          {/* Task Description (Read-Only) */}
                          <div className="worker-task-header-row">
                            <div className="worker-task-desc-wrap">
                              <span className="worker-task-index">Kaam #{idx + 1}</span>
                              <span className="worker-task-desc-text">
                                {task.task_description}
                              </span>
                            </div>
                            {getTaskStatusBadge(task.status)}
                          </div>

                          {/* Existing worker note if any */}
                          {task.worker_note && (
                            <div className="worker-task-last-update">
                              <div>
                                <strong>Aapka Note:</strong> &ldquo;{task.worker_note}&rdquo;
                              </div>
                              {task.updated_at_timestamp && (
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  Update Time: {new Date(task.updated_at_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Row */}
                          {!isClosed ? (
                            <div className="worker-task-action-box">
                              <input
                                type="text"
                                value={taskNotes[task.id] ?? ''}
                                onChange={(e) =>
                                  setTaskNotes((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.value,
                                  }))
                                }
                                placeholder="Note / Comment likhein (Optional - e.g. Saman lag gaya, wiring done...)"
                                className="worker-task-note-input"
                                disabled={isUpdating}
                              />

                              <div className="worker-task-buttons-row">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTaskStatusUpdate(activity.id, task.id, 'completed')
                                  }
                                  disabled={isUpdating}
                                  className="worker-task-btn-complete"
                                  title="Kaam Pura Hua"
                                >
                                  {isUpdating ? (
                                    <RefreshCw size={13} className="animate-spin" />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                  <span>✓ Kaam Ho Gaya (Done)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTaskStatusUpdate(activity.id, task.id, 'not_completed')
                                  }
                                  disabled={isUpdating}
                                  className="worker-task-btn-incomplete"
                                  title="Kaam Nahi Hua / Adhoora"
                                >
                                  {isUpdating ? (
                                    <RefreshCw size={13} className="animate-spin" />
                                  ) : (
                                    <XCircle size={14} />
                                  )}
                                  <span>✗ Nahi Hua (Not Done)</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="worker-task-closed-msg">
                              <Lock size={13} />
                              <span>
                                Ye activity band ho chuki hai (Closed). Ab status change nahi kiya ja sakta.
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: MERA ATTENDANCE & SALARY (MY ATTENDANCE & PAY) */}
      <div className="worker-card">
        <div className="worker-card-header">
          <div className="worker-card-header-left">
            <div className="worker-card-icon worker-card-icon-amber">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="worker-card-title">Mera Attendance & Salary (My Attendance & Monthly Pay)</h2>
              <p className="worker-card-desc">
                Aapki monthly salary, absent deduction, aur milne wali salary &bull; Joining Date: <strong>{attendanceData?.user?.joining_date || 'N/A'}</strong>
              </p>
            </div>
          </div>

          {attendanceData?.salary_summary?.configured && (
            <span className="worker-card-badge worker-badge-green">
              ₹{attendanceData.salary_summary.payable_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Net Payable
            </span>
          )}
        </div>

        {/* Salary KPI Strip */}
        <div className="worker-salary-grid">
          <div className="worker-salary-tile">
            <div className="worker-salary-label">Mahina Salary (Monthly)</div>
            <div className="worker-salary-val">
              ₹{attendanceData?.salary_summary?.configured ? attendanceData.salary_summary.monthly_salary.toLocaleString('en-IN') : '0.00'}
            </div>
            <div className="worker-salary-sub">Base Salary</div>
          </div>

          <div className="worker-salary-tile">
            <div className="worker-salary-label">1 Din Ka Rate (Daily)</div>
            <div className="worker-salary-val">
              ₹{attendanceData?.salary_summary?.configured ? attendanceData.salary_summary.daily_salary.toFixed(2) : '0.00'}
            </div>
            <div className="worker-salary-sub">Monthly / 30</div>
          </div>

          <div className="worker-salary-tile">
            <div className="worker-salary-label">Chhutti / Absent (Days)</div>
            <div className="worker-salary-val" style={{ color: (attendanceData?.salary_summary?.absent_days_count || 0) > 0 ? '#b91c1c' : '#0f172a' }}>
              {attendanceData?.salary_summary?.absent_days_count || 0} Days
            </div>
            <div className="worker-salary-sub">Kata Hua Din</div>
          </div>

          <div className="worker-salary-tile">
            <div className="worker-salary-label">Kata Hua Amount (Deduction)</div>
            <div className="worker-salary-val val-red">
              -₹{attendanceData?.salary_summary?.configured ? attendanceData.salary_summary.absent_deduction.toFixed(2) : '0.00'}
            </div>
            <div className="worker-salary-sub">Absent &times; Daily Rate</div>
          </div>

          <div className="worker-salary-tile tile-highlight">
            <div className="worker-salary-label">Milne Wali Salary (Net Pay)</div>
            <div className="worker-salary-val val-green">
              ₹{attendanceData?.salary_summary?.configured ? attendanceData.salary_summary.payable_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="worker-salary-sub">
              {attendanceData?.salary_summary?.is_mid_month_join ? 'Joining Month (Pro-rated)' : 'In Hand (After Absences)'}
            </div>
          </div>
        </div>

        {/* Month Navigator Bar */}
        <div className="worker-cal-month-bar">
          <button
            type="button"
            onClick={handlePrevAttendanceMonth}
            className="attendance-month-btn"
            title="Pichhla Mahina"
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            {new Date(
              parseInt(attendanceMonth.split('-')[0]),
              parseInt(attendanceMonth.split('-')[1]) - 1,
              1
            ).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>

          <button
            type="button"
            onClick={handleNextAttendanceMonth}
            className="attendance-month-btn"
            title="Agla Mahina"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Mini Calendar View */}
        <div>
          <div className="worker-cal-grid" style={{ marginBottom: 6 }}>
            <div className="worker-cal-weekday">M</div>
            <div className="worker-cal-weekday">T</div>
            <div className="worker-cal-weekday">W</div>
            <div className="worker-cal-weekday">T</div>
            <div className="worker-cal-weekday">F</div>
            <div className="worker-cal-weekday">S</div>
            <div className="worker-cal-weekday">S</div>
          </div>

          <div className="worker-cal-grid">
            {renderWorkerCalendar()}
          </div>
        </div>
      </div>

      {/* SECTION 4: EXACT ASSIGNED TOOLS */}
      <div className="worker-card">
        <div className="worker-card-header">
          <div className="worker-card-header-left">
            <div className="worker-card-icon worker-card-icon-teal">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="worker-card-title">Aapke Paas Tools (My Tools in Hand)</h2>
              <p className="worker-card-desc">
                Ye tools aapke naam pe issue hain (Total custody: Worker #{workerId})
              </p>
            </div>
          </div>
          <span className="worker-card-badge worker-badge-neutral">
            {tools.length} {tools.length === 1 ? 'Tool' : 'Tools'} Issued
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 13 }}>
            Loading your tools...
          </div>
        ) : tools.length === 0 ? (
          <div className="worker-empty-state">
            <ShieldCheck size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <p className="worker-empty-title">Aapke naam pe abhi koi tool issue nahi hai.</p>
            <p className="worker-empty-desc">Jab Store Manager aapko store se tool dega, wo yahan dikhega.</p>
          </div>
        ) : (
          <div className="worker-tools-list">
            {tools.map((tool) => {
              const isUpdating = updatingToolId === tool.id;
              return (
                <div key={tool.id} className="worker-tool-item">
                  {/* Tool info */}
                  <div className="worker-tool-info">
                    <div className="worker-tool-main-row">
                      <span className="worker-tool-code">{tool.toolCode}</span>
                      <h3 className="worker-tool-name">{tool.name}</h3>
                      {getStatusBadge(tool.status, tool.currentCondition)}
                    </div>

                    <div className="worker-tool-meta-row">
                      <span>Category: <strong>{tool.category}</strong></span>
                      {tool.brand && <span>Brand: <strong>{tool.brand}</strong></span>}
                      {tool.assignedTo?.projectName && (
                        <span>Site: <strong>{tool.assignedTo.projectName}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Condition Dropdown + Return to Store Button */}
                  <div className="worker-tool-actions">
                    <div className="worker-select-wrap">
                      <label htmlFor={`condition-${tool.id}`} className="worker-select-label">
                        Tool Kaisa Hai? (Condition)
                      </label>
                      <select
                        id={`condition-${tool.id}`}
                        value={tool.currentCondition || 'Good'}
                        disabled={isUpdating}
                        onChange={(e) => handleConditionChange(tool.id, e.target.value as ToolCondition)}
                        className="worker-condition-select"
                      >
                        {CONDITION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(tool)}
                      className="worker-return-btn"
                      title="Tool Store Me Wapas Jama Karein"
                    >
                      <PackageCheck size={16} color="#0d9488" />
                      <span>Return to Store (Wapas Karein)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RETURN TO STORE MODAL */}
      {returningTool && (
        <div className="worker-modal-overlay" onClick={handleCloseReturnModal}>
          <div className="worker-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="worker-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PackageCheck size={20} color="#0d9488" />
                <h3 className="worker-modal-title">Tool Store Me Jama Karein (Return to Store)</h3>
              </div>
              <button onClick={handleCloseReturnModal} className="worker-modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="worker-modal-body">
              {/* Tool summary */}
              <div className="worker-modal-tool-badge">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="worker-tool-code">{returningTool.toolCode}</span>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{returningTool.name}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Category: {returningTool.category} &bull; Current Site: {returningTool.assignedTo?.projectName || 'General Site'}
                </div>
              </div>

              {/* 3 Step Instruction in Plain Hindi + English */}
              <div className="worker-steps-box">
                <div className="worker-step-row">
                  <div className="worker-step-num">1</div>
                  <div>
                    <h4 className="worker-step-text-title">Store Room / Tool Crib Le Jayein</h4>
                    <p className="worker-step-text-desc">Ye tool physically Store Room me le jaakar jama karein.</p>
                  </div>
                </div>

                <div className="worker-step-row">
                  <div className="worker-step-num">2</div>
                  <div>
                    <h4 className="worker-step-text-title">Store Manager Ko Tool ID Dikhayein</h4>
                    <p className="worker-step-text-desc">
                      Store Manager ko Tool Code <strong>{returningTool.toolCode}</strong> batayein.
                    </p>
                  </div>
                </div>

                <div className="worker-step-row">
                  <div className="worker-step-num">3</div>
                  <div>
                    <h4 className="worker-step-text-title">Store Manager Scan Karke Clear Karega</h4>
                    <p className="worker-step-text-desc">
                      Store Manager tool check karke system me return confirm karega, aur ye tool aapke naam se hat jayega.
                    </p>
                  </div>
                </div>
              </div>

              {/* Handover Condition & Notes */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Tool Kaisa Jama Kar Rahe Hain? (Handover Condition):
                  </label>
                  <select
                    value={handoverCondition}
                    onChange={(e) => setHandoverCondition(e.target.value as ToolCondition)}
                    className="worker-condition-select"
                    style={{ width: '100%' }}
                  >
                    {CONDITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Koi Baat / Kharabi Likhni Hai? (Notes - Optional):
                  </label>
                  <input
                    type="text"
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="e.g. Kaam khatam ho gaya, wapas kar raha hu / switch loose hai..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      background: '#ffffff',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="worker-modal-footer">
              <button type="button" onClick={handleCloseReturnModal} className="worker-btn-secondary">
                Cancel (Band Karein)
              </button>
              <button
                type="button"
                onClick={handleConfirmHandoverNotice}
                disabled={isSubmittingNotice}
                className="worker-btn-primary"
              >
                {isSubmittingNotice ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sending Notice...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck size={16} />
                    <span>Send Return Notice (Manager Ko Batayein)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
