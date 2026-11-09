import React, { useState, useEffect } from 'react';
import { X, DollarSign, RefreshCw, Check } from 'lucide-react';
import { attendanceApi } from '../../../api/attendanceApi';

interface SalaryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  userName: string;
  currentSalary?: number;
  onSaved: () => void;
}

export const SalaryConfigModal: React.FC<SalaryConfigModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentSalary,
  onSaved,
}) => {
  const [monthlySalary, setMonthlySalary] = useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Default to 1st of current month
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMonthlySalary(currentSalary ? String(currentSalary) : '');
      setErrorMsg(null);
    }
  }, [isOpen, currentSalary]);

  if (!isOpen) return null;

  const numMonthly = parseFloat(monthlySalary) || 0;
  const computedDaily = numMonthly > 0 ? (numMonthly / 30).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numMonthly <= 0) {
      setErrorMsg('Please enter a valid monthly salary greater than 0.');
      return;
    }
    if (!effectiveFrom) {
      setErrorMsg('Please select an effective start date.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await attendanceApi.configureSalary(userId, {
        monthly_salary: numMonthly,
        effective_from: effectiveFrom,
        notes: notes.trim() || undefined,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save salary configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-modal-overlay" onClick={onClose}>
      <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={18} color="#0f172a" />
            <h3 className="attendance-modal-title">Configure Salary &bull; {userName}</h3>
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

            <div className="attendance-field-group">
              <label className="attendance-field-label">Monthly Salary (₹):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25000"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="attendance-input"
                required
              />
            </div>

            <div className="attendance-info-banner">
              <strong>Auto Daily Salary:</strong> ₹{computedDaily} per day
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Calculated as <code>Monthly Salary / 30</code>.
              </div>
            </div>

            <div className="attendance-field-group">
              <label className="attendance-field-label">Effective From Date:</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="attendance-input"
                required
              />
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Historical salary calculations prior to this date remain unchanged.
              </span>
            </div>

            <div className="attendance-field-group">
              <label className="attendance-field-label">Revision Notes (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Annual appraisal / probation confirmed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="attendance-input"
              />
            </div>
          </div>

          <div className="attendance-modal-footer">
            <button type="button" onClick={onClose} className="attendance-btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="attendance-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Salary</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
