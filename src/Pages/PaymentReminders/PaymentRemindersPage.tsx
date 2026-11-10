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
  CheckCheck,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { paymentRemindersApi, type PaymentReminderItem, type PaymentReminderKPIs } from '../../api/paymentRemindersApi';
import { projectsApi, type ProjectItem } from '../../api/projectsApi';
import { AddPaymentReminderModal } from './Components/AddPaymentReminderModal';
import { ReportNavTabs } from '../Reports/Components/ReportNavTabs';
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
        return <span className="card-status-badge badge-resolved">✓ Cleared</span>;
      case 'notified':
        return <span className="card-status-badge badge-notified">● Notified</span>;
      case 'pending':
      default:
        return <span className="card-status-badge badge-pending">⏳ Pending</span>;
    }
  };

  const formatAmountINR = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '₹0.00';
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="payment-reminders-container">
      {/* Top Ambient Glow */}
      <div className="payment-top-ambient" />

      {/* QUICK REPORT SWITCHER NAV TABS */}
      <ReportNavTabs />

      {/* HEADER */}
      <div className="payment-header-row">
        <div className="payment-title-wrap">
          <div className="payment-icon-wrap">
            <BellRing size={20} />
          </div>
          <div>
            <h1 className="payment-title">Payment Reminders — Collections</h1>
            <p className="payment-subtitle">
              Live milestone receivables, scheduled reminders, and automated push alerts
            </p>
          </div>
        </div>

        <div className="payment-header-actions">
          <button onClick={() => setIsAddModalOpen(true)} className="payment-btn-primary">
            <Plus size={16} />
            <span>Schedule Reminder</span>
          </button>

          <button onClick={loadReminders} className="payment-btn-outline" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`payment-alert ${feedback.type === 'success' ? 'payment-alert-success' : 'payment-alert-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="payment-alert-dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* BROWSER DESKTOP PUSH NOTIFICATION PROMPT */}
      {pushPermission !== 'granted' ? (
        <div className="push-permission-card">
          <div className="push-permission-left">
            <div className="push-icon-box">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="push-permission-title">Enable Desktop Push Notifications</h3>
              <p className="push-permission-desc">
                Receive instant popups on your device when payment reminders are due, even if in another tab.
              </p>
            </div>
          </div>
          <button onClick={handleRequestPushPermission} className="push-enable-btn">
            <BellRing size={13} />
            <span>Enable Push Alerts</span>
          </button>
        </div>
      ) : (
        <div className="push-active-banner">
          <CheckCheck size={14} />
          <span>Desktop push alerts are <strong>active</strong> for payment reminders.</span>
        </div>
      )}

      {/* PROJECT FILTER TRIGGER SELECTOR */}
      <div className="payment-project-selector">
        <div className="payment-project-selector-left">
          <Briefcase size={16} color="#64748b" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="payment-project-dropdown"
          >
            <option value="all">All Projects (Overview)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.project_code}) &bull; {p.client}
              </option>
            ))}
          </select>
        </div>
        <ChevronDown size={16} className="payment-dropdown-chevron" />
      </div>

      {/* 2x2 MOBILE KPI GRID */}
      <div className="payment-kpi-grid">
        {/* KPI 1: Pending Amount */}
        <div
          className={`payment-kpi-card ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill amber">
              <Clock size={13} />
            </div>
            <span className="kpi-card-label">Pending Collect</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="payment-kpi-value amber">
            {kpis.pending_amount >= 100000
              ? `₹${(kpis.pending_amount / 100000).toFixed(2)}L`
              : `₹${kpis.pending_amount.toLocaleString('en-IN')}`}
          </div>
          <div className="kpi-card-sub">{kpis.pending_count} milestones pending</div>
        </div>

        {/* KPI 2: Notified Alerts */}
        <div
          className={`payment-kpi-card ${selectedStatus === 'notified' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'notified' ? 'all' : 'notified')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill blue">
              <BellRing size={13} />
            </div>
            <span className="kpi-card-label">Notified</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="payment-kpi-value blue">{kpis.notified_count}</div>
          <div className="kpi-card-sub">Alerts dispatched</div>
        </div>

        {/* KPI 3: Resolved / Received */}
        <div
          className={`payment-kpi-card ${selectedStatus === 'resolved' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'resolved' ? 'all' : 'resolved')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill green">
              <CheckCircle2 size={13} />
            </div>
            <span className="kpi-card-label">Received</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="payment-kpi-value green">
            {kpis.resolved_amount >= 100000
              ? `₹${(kpis.resolved_amount / 100000).toFixed(2)}L`
              : `₹${kpis.resolved_amount.toLocaleString('en-IN')}`}
          </div>
          <div className="kpi-card-sub">{kpis.resolved_count} payments cleared</div>
        </div>

        {/* KPI 4: Total Milestones */}
        <div
          className={`payment-kpi-card ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill purple">
              <Layers size={13} />
            </div>
            <span className="kpi-card-label">Total Milestones</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="payment-kpi-value">{kpis.total_count}</div>
          <div className="kpi-card-sub">All tracked items</div>
        </div>
      </div>

      {/* SEGMENTED FILTER PILL TABS */}
      <div className="payment-tab-pills">
        <button
          className={`payment-tab-pill ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('pending')}
        >
          <span>Pending</span>
          <span className="payment-tab-pill-count">{kpis.pending_count}</span>
        </button>

        <button
          className={`payment-tab-pill ${selectedStatus === 'notified' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('notified')}
        >
          <span>Notified</span>
          <span className="payment-tab-pill-count">{kpis.notified_count}</span>
        </button>

        <button
          className={`payment-tab-pill ${selectedStatus === 'resolved' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('resolved')}
        >
          <span>Resolved</span>
          <span className="payment-tab-pill-count">{kpis.resolved_count}</span>
        </button>

        <button
          className={`payment-tab-pill ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <span>All</span>
          <span className="payment-tab-pill-count">{kpis.total_count}</span>
        </button>
      </div>

      {/* OPERATIONS INSIGHT BANNER */}
      {kpis.pending_count > 0 && (
        <div className="payment-insight-banner">
          <Sparkles size={16} className="payment-insight-icon" />
          <span>
            <strong>Insight:</strong> ₹{kpis.pending_amount.toLocaleString('en-IN')} pending across{' '}
            {kpis.pending_count} milestone reminders. Prioritise follow-up with assigned clients.
          </span>
        </div>
      )}

      {/* DATA DISPLAY: LOADING / EMPTY / MOBILE CARDS / DESKTOP TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
          <div>Loading payment reminders...</div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="payment-empty-box">
          <BellRing size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            No Payment Reminders Found
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 16px 0' }}>
            {selectedStatus !== 'all'
              ? `No reminders in '${selectedStatus}' state. Try selecting another filter.`
              : 'Create a payment reminder to track incoming client milestone payments.'}
          </p>
          <button onClick={() => setIsAddModalOpen(true)} className="payment-btn-primary">
            <Plus size={15} />
            <span>Schedule First Reminder</span>
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================
             1. MOBILE-FIRST CARDS VIEW (< 768px)
             ======================================================== */}
          <div className="mobile-reminder-cards-list">
            {reminders.map((r) => {
              const isResolved = r.status === 'resolved';
              return (
                <div key={r.id} className="mobile-reminder-card">
                  {/* Header Row: Project Name + Status */}
                  <div className="card-header-row">
                    <div>
                      <div className="card-project-name">{r.project?.name || 'Project'}</div>
                      <div className="card-client-subtitle">
                        <span>{r.project?.client}</span>
                        <span>&bull;</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.project?.project_code}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  {/* Milestone Title & Amount Row */}
                  <div className="card-milestone-box">
                    <div className="card-milestone-title">{r.title}</div>
                    <div className="card-amount-val">{formatAmountINR(r.amount)}</div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="card-date-row">
                    <div className="card-datetime-chip">
                      <Calendar size={13} color="#7c3aed" />
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

                    {r.status === 'notified' && (
                      <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                        Alert Dispatched
                      </span>
                    )}
                  </div>

                  {/* Notes / Point of Contact (if available) */}
                  {r.notes && (
                    <div className="card-notes-bubble">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <MessageSquare size={12} color="#c084fc" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{r.notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="card-actions-row">
                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(r.id)}
                        className="btn-card-received"
                        title="Mark payment as received / resolved"
                      >
                        <Check size={14} />
                        <span>Received ✓</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleTestNotify(r.id)}
                      className="btn-card-test"
                      title="Trigger push notification alert immediately"
                    >
                      <Send size={13} />
                      <span>Test Alert</span>
                    </button>

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn-card-delete"
                      title="Delete Reminder"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
             2. DESKTOP-ONLY TABLE VIEW (≥ 768px)
             ======================================================== */}
          <div className="desktop-reminder-table-card">
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
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>
                          {r.project?.name || 'Project'}
                        </div>
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
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>
                          {formatAmountINR(r.amount)}
                        </strong>
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
          </div>
        </>
      )}

      {/* SCHEDULE PAYMENT REMINDER MODAL / BOTTOM SHEET */}
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
