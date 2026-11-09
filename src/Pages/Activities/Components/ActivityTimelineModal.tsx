import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, AlertTriangle, Calendar, RefreshCw, Send, Lock } from 'lucide-react';
import { activitiesApi, type ActivityTimelineResponse } from '../../../api/activitiesApi';

interface ActivityTimelineModalProps {
  activityId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityTimelineModal: React.FC<ActivityTimelineModalProps> = ({ activityId, isOpen, onClose }) => {
  const [data, setData] = useState<ActivityTimelineResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activityId) return;

    setLoading(true);
    setErrorMessage(null);
    activitiesApi.getTimeline(activityId)
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        setErrorMessage(err?.response?.data?.message || 'Failed to load timeline.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, activityId]);

  if (!isOpen) return null;

  const renderEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'ACTIVITY_CREATED':
        return <Calendar size={14} color="#0d9488" />;
      case 'TASK_STATUS_UPDATED':
        return <CheckCircle2 size={14} color="#2563eb" />;
      case 'REMINDER_SENT':
        return <Send size={14} color="#d97706" />;
      case 'TASK_NO_RESPONSE':
        return <AlertTriangle size={14} color="#dc2626" />;
      case 'ACTIVITY_CLOSED_EOD':
      case 'ACTIVITY_CLOSED_MANUAL':
        return <Lock size={14} color="#475569" />;
      default:
        return <Clock size={14} color="#64748b" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="activity-code-pill">{data?.activity?.activity_code || 'ACT-...'}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Daily Activity Chronological Audit Timeline
              </h3>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Permanent audit ledger &bull; Date: {data?.activity?.activity_date}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto', color: '#0d9488' }} />
              Loading timeline events...
            </div>
          ) : errorMessage ? (
            <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
              {errorMessage}
            </div>
          ) : data ? (
            <div>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Tasks</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{data.activity.summary.total_tasks}</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Completed</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{data.activity.summary.completed}</div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Not Completed</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{data.activity.summary.not_completed}</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>No Response</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{data.activity.summary.no_response}</div>
                </div>
              </div>

              {/* Context bar */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Technician: </span>
                  <strong style={{ color: '#0f172a' }}>{data.activity.technician?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Project: </span>
                  <strong style={{ color: '#0f172a' }}>{data.activity.project?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Site: </span>
                  <strong style={{ color: '#0f172a' }}>{data.activity.site?.site_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Status: </span>
                  <strong style={{ textTransform: 'uppercase', color: data.activity.status === 'open' ? '#059669' : '#475569' }}>
                    {data.activity.status}
                  </strong>
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="timeline-container">
                {data.timeline_events.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-marker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderEventIcon(event.event_type)}
                    </div>
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                        <div className="timeline-title">{event.title}</div>
                        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {event.event_timestamp}
                        </span>
                      </div>

                      <div className="timeline-meta">
                        Actor: <strong>{event.actor_name}</strong> ({event.actor_role})
                        {event.status_before && event.status_after && (
                          <span style={{ marginLeft: 8 }}>
                            Transition: <span className="badge-status badge-pending">{event.status_before}</span> &rarr;{' '}
                            <span className={`badge-status ${event.status_after === 'completed' ? 'badge-completed' : event.status_after === 'not_completed' ? 'badge-not-completed' : 'badge-no-response'}`}>
                              {event.status_after}
                            </span>
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0 0' }}>
                          {event.description}
                        </p>
                      )}

                      {event.worker_note && (
                        <div style={{ marginTop: 6, padding: '6px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, color: '#0f172a' }}>
                          <span style={{ fontWeight: 600, color: '#64748b', marginRight: 6 }}>Worker Note:</span>
                          "{event.worker_note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
