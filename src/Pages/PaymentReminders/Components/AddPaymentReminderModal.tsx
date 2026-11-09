import React, { useState, useEffect } from 'react';
import { X, BellRing, RefreshCw, Check } from 'lucide-react';
import { paymentRemindersApi } from '../../../api/paymentRemindersApi';
import { projectsApi, type ProjectItem } from '../../../api/projectsApi';

interface AddPaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddPaymentReminderModal: React.FC<AddPaymentReminderModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reminderDatetime, setReminderDatetime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30); // Default to 30 mins from now
    // Format YYYY-MM-DDTHH:mm
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    projectsApi.getProjects().then((res) => {
      if (res && res.data) {
        setProjects(res.data);
        if (res.data.length > 0 && !projectId) {
          setProjectId(String(res.data[0].id));
        }
      }
    }).catch(() => {});
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMsg('Please select a project.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a reminder title.');
      return;
    }
    if (!reminderDatetime) {
      setErrorMsg('Please select a reminder date and time.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await paymentRemindersApi.create({
        project_id: projectId,
        title: title.trim(),
        amount: amount.trim() ? parseFloat(amount) : null,
        reminder_datetime: reminderDatetime.replace('T', ' ') + ':00',
        notes: notes.trim() || undefined,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to create payment reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-modal-overlay" onClick={onClose}>
      <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={18} color="#0f172a" />
            <h3 className="attendance-modal-title">Schedule Payment Reminder</h3>
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

            {/* Project Selection */}
            <div className="attendance-field-group">
              <label className="attendance-field-label">Select Project:</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="attendance-input"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.project_code}) &bull; {p.client}
                  </option>
                ))}
              </select>
            </div>

            {/* Reminder Title */}
            <div className="attendance-field-group">
              <label className="attendance-field-label">Reminder Title / Milestone:</label>
              <input
                type="text"
                placeholder="e.g. Milestone 2 - Ducting Inspection Clearance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="attendance-input"
                required
              />
            </div>

            {/* Optional Amount */}
            <div className="attendance-field-group">
              <label className="attendance-field-label">Pending Amount (₹ - Optional):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 150000 (Leave empty if unspecified)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="attendance-input"
              />
            </div>

            {/* Date & Time */}
            <div className="attendance-field-group">
              <label className="attendance-field-label">Reminder Date & Time:</label>
              <input
                type="datetime-local"
                value={reminderDatetime}
                onChange={(e) => setReminderDatetime(e.target.value)}
                className="attendance-input"
                required
              />
              <span style={{ fontSize: 11, color: '#64748b' }}>
                You will receive an in-app and browser desktop push notification at this exact time.
              </span>
            </div>

            {/* Notes / Instructions */}
            <div className="attendance-field-group">
              <label className="attendance-field-label">Notes / Contact Person (Optional):</label>
              <textarea
                placeholder="e.g. Call Client PM Mr. Sharma. Cheque due on verification of riser ducts."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="attendance-input"
                rows={3}
                style={{ resize: 'vertical' }}
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
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Schedule Reminder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
