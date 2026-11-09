import React, { useState, useEffect } from 'react';
import { X, CalendarX, AlertTriangle, RefreshCw } from 'lucide-react';
import { attendanceApi } from '../../../api/attendanceApi';

interface MarkAbsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  userName: string;
  startDate: string;
  endDate: string;
  joiningDate?: string;
  onMarked: () => void;
}

export const MarkAbsentModal: React.FC<MarkAbsentModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  startDate,
  endDate,
  joiningDate,
  onMarked,
}) => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStart(startDate || new Date().toISOString().split('T')[0]);
      setEnd(endDate || startDate || new Date().toISOString().split('T')[0]);
      setReason('');
      setErrorMsg(null);
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  const calculateDays = () => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const dayCount = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dayCount <= 0) {
      setErrorMsg('End date must be greater than or equal to start date.');
      return;
    }

    if (joiningDate && start < joiningDate) {
      setErrorMsg(`Cannot mark absent before employee joining date (${joiningDate}).`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await attendanceApi.markAbsent(userId, {
        start_date: start,
        end_date: end,
        reason: reason.trim() || undefined,
      });

      onMarked();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to record absence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-modal-overlay" onClick={onClose}>
      <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarX size={18} color="#dc2626" />
            <h3 className="attendance-modal-title">Mark Absent &bull; {userName}</h3>
          </div>
          <button onClick={onClose} className="worker-modal-close" type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="attendance-modal-body">
            {errorMsg && (
              <div className="attendance-alert attendance-alert-error" style={{ marginBottom: 0 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="attendance-field-group">
                <label className="attendance-field-label">From Date:</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="attendance-input"
                  required
                />
              </div>

              <div className="attendance-field-group">
                <label className="attendance-field-label">To Date:</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="attendance-input"
                  required
                />
              </div>
            </div>

            <div className="attendance-info-banner" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#d97706" />
              <div>
                <strong>Total Days:</strong> {dayCount} {dayCount === 1 ? 'day' : 'days'} will be marked Absent.
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Each absent day deducts 1 day of salary (<code>Monthly Salary / 30</code>).
                </div>
              </div>
            </div>

            <div className="attendance-field-group">
              <label className="attendance-field-label">Reason / Notes (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Unwell / Family function / Did not report"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="attendance-input"
              />
            </div>
          </div>

          <div className="attendance-modal-footer">
            <button type="button" onClick={onClose} className="attendance-btn-outline" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="attendance-btn-primary"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              disabled={loading || dayCount <= 0}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Marking Absent...</span>
                </>
              ) : (
                <>
                  <CalendarX size={14} />
                  <span>Confirm Mark Absent ({dayCount} d)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
