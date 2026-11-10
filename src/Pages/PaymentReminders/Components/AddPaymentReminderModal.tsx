import React, { useState, useEffect } from 'react';
import { X, BellRing, RefreshCw, Check, Calendar, DollarSign, FileText, Briefcase } from 'lucide-react';
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
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    projectsApi
      .getProjects()
      .then((res) => {
        if (res && res.data) {
          setProjects(res.data);
          if (res.data.length > 0 && !projectId) {
            setProjectId(String(res.data[0].id));
          }
        }
      })
      .catch(() => {});
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMsg('Please select a project.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a milestone / reminder title.');
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
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Swipe Bar */}
        <div className="payment-drag-bar" />

        <div className="payment-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BellRing size={16} />
            </div>
            <h3 className="payment-modal-title">Schedule Payment Reminder</h3>
          </div>
          <button onClick={onClose} className="payment-modal-close" type="button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="payment-modal-body">
            {errorMsg && (
              <div className="payment-alert payment-alert-error" style={{ marginBottom: 0 }}>
                {errorMsg}
              </div>
            )}

            {/* Project Selection */}
            <div className="payment-field-group">
              <label className="payment-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Briefcase size={13} color="#7c3aed" />
                <span>Select Project</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="payment-modal-input"
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
            <div className="payment-field-group">
              <label className="payment-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={13} color="#7c3aed" />
                <span>Milestone / Reminder Title</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Milestone 2 - Ducting Inspection Clearance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="payment-modal-input"
                required
              />
            </div>

            {/* Optional Amount */}
            <div className="payment-field-group">
              <label className="payment-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <DollarSign size={13} color="#7c3aed" />
                <span>Pending Amount (₹ INR - Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 150000 (Optional)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="payment-modal-input"
              />
            </div>

            {/* Date & Time */}
            <div className="payment-field-group">
              <label className="payment-field-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} color="#7c3aed" />
                <span>Reminder Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={reminderDatetime}
                onChange={(e) => setReminderDatetime(e.target.value)}
                className="payment-modal-input"
                required
              />
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Instant in-app bell notification & browser desktop push alert dispatched at this time.
              </span>
            </div>

            {/* Notes / Instructions */}
            <div className="payment-field-group">
              <label className="payment-field-label">Notes / Client Point of Contact (Optional):</label>
              <textarea
                placeholder="e.g. Follow up with Client PM Mr. Sharma. Cheque due on verification of riser ducts."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="payment-modal-input"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="payment-modal-footer">
            <button type="button" onClick={onClose} className="payment-btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="payment-btn-primary" disabled={loading}>
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
