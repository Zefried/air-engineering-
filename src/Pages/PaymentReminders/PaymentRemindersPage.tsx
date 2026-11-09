import React, { useState, useEffect, useCallback } from 'react';
import {
  BellRing,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Trash2,
  Volume2,
  Send,
  CheckCheck
} from 'lucide-react';
import { paymentRemindersApi, type PaymentReminderItem, type PaymentReminderKPIs } from '../../api/paymentRemindersApi';
import { projectsApi, type ProjectItem } from '../../api/projectsApi';
import { AddPaymentReminderModal } from './Components/AddPaymentReminderModal';
import './Styles/PaymentReminders.css';

export const PaymentRemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<PaymentReminderItem[]>([]);
  const [kpis, setKpis] = useState<PaymentReminderKPIs>({
    total_count: 0,
    pending_count: 0,
    notified_count: 0,
    resolved_count: 0,
    pending_amount: 0,
    resolved_amount: 0,
  });
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Desktop Web Push Notification Permission State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Load Projects for filter
  useEffect(() => {
    projectsApi.getProjects().then((res) => {
      if (res && res.data) setProjects(res.data);
    }).catch(() => {});
  }, []);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentRemindersApi.getAll({
        project_id: selectedProjectId !== 'all' ? selectedProjectId : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      if (res.status) {
        setReminders(res.data || []);
        setKpis(res.kpis);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to load payment reminders.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, selectedStatus]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // Request HTML5 Desktop Push Notification Permission
  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop push notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        new Notification('AirOpps Desktop Push Active', {
          body: 'You will now receive instant desktop push notifications when payment reminders arrive!',
        });
        setFeedback({
          type: 'success',
          message: 'Desktop push notifications enabled successfully!',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark Resolved
  const handleResolve = async (id: number) => {
    try {
      await paymentRemindersApi.resolve(id);
      setFeedback({
        type: 'success',
        message: 'Payment reminder marked as resolved (Payment Received).',
      });
      loadReminders();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to resolve reminder.',
      });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment reminder?')) return;
    try {
      await paymentRemindersApi.delete(id);
      setFeedback({
        type: 'success',
        message: 'Payment reminder deleted successfully.',
      });
      loadReminders();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete reminder.',
      });
    }
  };

  // Test Push Alert
  const handleTestNotify = async (id: number) => {
    try {
      await paymentRemindersApi.testNotify(id);
      setFeedback({
        type: 'success',
        message: 'Test notification triggered! Check your notification bell and desktop push alerts.',
      });

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const item = reminders.find((r) => r.id === id);
        new Notification(`Payment Reminder: ${item?.project?.name || 'Project'}`, {
          body: `Amount: ₹${item?.amount ? Number(item.amount).toLocaleString('en-IN') : 'N/A'} - Payment follow-up test alert`,
        });
      }

      loadReminders();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to trigger test notification.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="payment-status-badge badge-resolved">✓ Resolved</span>;
      case 'notified':
        return <span className="payment-status-badge badge-notified">● Notified</span>;
      case 'pending':
      default:
        return <span className="payment-status-badge badge-pending">⏳ Pending</span>;
    }
  };

  return (
    <div className="payment-reminders-container">
      {/* HEADER */}
      <div className="payment-header-row">
        <div className="payment-title-wrap">
          <div className="payment-icon-wrap">
            <BellRing size={22} />
          </div>
          <div>
            <h1 className="payment-title">Project Payment Reminders</h1>
            <p className="payment-subtitle">
              Schedule payment pending reminders for projects with automated in-app & desktop push alerts
            </p>
          </div>
        </div>

        <div className="payment-header-actions">
          <button onClick={() => setIsAddModalOpen(true)} className="attendance-btn-primary">
            <Plus size={16} />
            <span>Schedule Payment Reminder</span>
          </button>

          <button onClick={loadReminders} className="attendance-btn-outline" title="Refresh">
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

      {/* BROWSER DESKTOP PUSH NOTIFICATION PROMPT */}
      {pushPermission !== 'granted' ? (
        <div className="push-permission-card">
          <div className="push-permission-left">
            <Volume2 size={24} color="#2563eb" />
            <div>
              <h3 className="push-permission-title">Enable Desktop Push Notifications</h3>
              <p className="push-permission-desc">
                Receive instant popups on your computer when payment reminders are due, even if you are in another tab.
              </p>
            </div>
          </div>
          <button onClick={handleRequestPushPermission} className="push-enable-btn">
            <BellRing size={14} />
            <span>Enable Push Alerts</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', marginBottom: 20 }}>
          <CheckCheck size={16} />
          <span>Desktop push alerts are <strong>active</strong> for payment reminders.</span>
        </div>
      )}

      {/* SUMMARY KPIS */}
      <div className="payment-kpi-grid">
        <div className="payment-kpi-card">
          <div className="payment-kpi-label">Total Reminders</div>
          <div className="payment-kpi-val">{kpis.total_count}</div>
          <div className="payment-kpi-sub">Across all projects</div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-label">Pending Reminders</div>
          <div className="payment-kpi-val amber">{kpis.pending_count}</div>
          <div className="payment-kpi-sub">Awaiting reminder time</div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-label">Notified Reminders</div>
          <div className="payment-kpi-val" style={{ color: '#2563eb' }}>{kpis.notified_count}</div>
          <div className="payment-kpi-sub">Push alert sent to admin</div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-label">Pending Amount</div>
          <div className="payment-kpi-val amber">
            ₹{kpis.pending_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="payment-kpi-sub">Payment pending from clients</div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-label">Resolved / Received</div>
          <div className="payment-kpi-val green">
            ₹{kpis.resolved_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="payment-kpi-sub">Cleared payments</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="payment-controls-bar">
        <div className="payment-filter-group">
          <label className="attendance-label">Filter Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="payment-select"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.project_code})
              </option>
            ))}
          </select>
        </div>

        <div className="payment-filter-group">
          <label className="attendance-label">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="payment-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="notified">Notified</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* REMINDERS TABLE */}
      <div className="payment-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Loading payment reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="payment-empty-box">
            <BellRing size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>No Payment Reminders Found</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 16px 0' }}>
              Create a payment reminder to track incoming client milestone payments.
            </p>
            <button onClick={() => setIsAddModalOpen(true)} className="attendance-btn-primary">
              <Plus size={15} />
              <span>Schedule First Reminder</span>
            </button>
          </div>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Project & Client</th>
                <th>Reminder Details</th>
                <th>Amount</th>
                <th>Scheduled Date & Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => {
                const isResolved = r.status === 'resolved';
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.project?.name || 'Project'}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Client: <strong>{r.project?.client}</strong> &bull; Code: {r.project?.project_code}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 650, color: '#0f172a' }}>{r.title}</div>
                      {r.notes && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {r.notes}
                        </div>
                      )}
                    </td>

                    <td>
                      {r.amount ? (
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>
                          ₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Unspecified</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <Clock size={14} color="#64748b" />
                        <span>
                          {new Date(r.reminder_datetime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td>{getStatusBadge(r.status)}</td>

                    <td>
                      <div className="payment-action-btns" style={{ justifyContent: 'flex-end' }}>
                        {!isResolved && (
                          <button
                            onClick={() => handleResolve(r.id)}
                            className="btn-icon-action btn-icon-resolve"
                            title="Mark as Resolved / Payment Received"
                          >
                            <Check size={14} />
                            <span>Received</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleTestNotify(r.id)}
                          className="btn-icon-action"
                          title="Trigger push notification alert immediately"
                        >
                          <Send size={13} />
                          <span>Test Alert</span>
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          className="btn-icon-action btn-icon-delete"
                          title="Delete Reminder"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD PAYMENT REMINDER MODAL */}
      {isAddModalOpen && (
        <AddPaymentReminderModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={() => {
            setFeedback({
              type: 'success',
              message: 'Payment reminder scheduled successfully!',
            });
            loadReminders();
          }}
        />
      )}
    </div>
  );
};

export default PaymentRemindersPage;
