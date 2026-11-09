import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ToolItem, ToolCondition } from '../toolTypes';
import './ReturnToolModal.css';

interface ReturnToolModalProps {
  tool: ToolItem;
  isOpen: boolean;
  onClose: () => void;
  onReturn: (toolId: string, payload: {
    returnCondition: ToolCondition;
    notes?: string;
  }) => void;
}

export const ReturnToolModal: React.FC<ReturnToolModalProps> = ({
  tool,
  isOpen,
  onClose,
  onReturn,
}) => {
  const [returnCondition, setReturnCondition] = useState<ToolCondition>("Good");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const assigned = tool.assignedTo;
  const initialCondition = assigned?.assignedCondition || tool.currentCondition;

  // Detect degradation
  const isDegraded =
    (initialCondition === "Brand New" || initialCondition === "Good") &&
    (returnCondition === "Damaged" || returnCondition === "Scrapped");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReturn(tool.id, {
      returnCondition,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="return-modal-backdrop" onClick={onClose}>
      <div className="return-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="return-modal-header">
          <div>
            <div className="return-modal-title-row">
              <span className="return-modal-tag">
                {tool.toolCode}
              </span>
              <h3 className="return-modal-title">Return Tool</h3>
            </div>
            <p className="return-modal-subtitle">{tool.name}</p>
          </div>
          <button
            onClick={onClose}
            className="return-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="return-modal-form">
          {/* Active Handover Info Box */}
          {assigned && (
            <div className="return-handover-card">
              <div className="return-handover-row">
                <span>Assigned Worker:</span>
                <strong className="return-handover-val">{assigned.workerName}</strong>
              </div>
              <div className="return-handover-row">
                <span>Site / Project:</span>
                <span className="return-handover-val">{assigned.projectName}</span>
              </div>
              <div className="return-handover-row">
                <span>Checkout Condition:</span>
                <span className="return-condition-pill">
                  {assigned.assignedCondition}
                </span>
              </div>
              <div className="return-handover-row">
                <span>Assigned On:</span>
                <span className="return-handover-date">{assigned.assignedDate}</span>
              </div>
            </div>
          )}

          {/* Return Condition Selector */}
          <div className="return-form-group">
            <label className="return-form-label">
              Physical Condition Upon Return *
            </label>
            <select
              className="return-select"
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as ToolCondition)}
            >
              <option value="Good">Good (Working, clean, ready for next worker)</option>
              <option value="Rough">Rough / Fair (Working, cosmetic scratches/wear)</option>
              <option value="Damaged">Damaged / Defective (Needs maintenance/repair)</option>
              <option value="Scrapped">Beyond Repair / Scrapped (Burned out, unfixable)</option>
              <option value="Lost">Lost / Missing (Worker could not locate)</option>
            </select>
          </div>

          {/* Condition Degradation Warning */}
          {isDegraded && (
            <div className="return-alert-amber">
              <AlertTriangle size={18} className="shrink-0" style={{ marginTop: 2, color: '#d97706' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 2 }}>Condition Degraded Under {assigned?.workerName || "Worker"}</strong>
                Tool was dispatched in <strong>{initialCondition}</strong> condition and is returning in{" "}
                <strong>{returnCondition}</strong> condition. This degradation will be permanently logged in the tool's audit trail.
              </div>
            </div>
          )}

          {returnCondition === "Scrapped" && (
            <div className="return-alert-rose">
              <ShieldAlert size={18} className="shrink-0" style={{ marginTop: 2, color: '#e11d48' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 2 }}>Scrap & Procurement Notice</strong>
                Marking this tool as Scrapped will retire it from active crib inventory and flag it as a replacement purchase requisition.
              </div>
            </div>
          )}

          {/* Notes / Damage details */}
          <div className="return-form-group">
            <label className="return-form-label">
              Return Inspection Notes {isDegraded && <span style={{ color: '#e11d48' }}>*</span>}
            </label>
            <textarea
              className="return-textarea"
              rows={3}
              placeholder={
                isDegraded
                  ? "Describe what is damaged (e.g. Motor burnt, chuck cracked, missing power cord)..."
                  : "Inspection notes or accessories returned..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required={isDegraded}
            />
          </div>

          {/* Actions */}
          <div className="return-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="return-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="return-btn-submit"
            >
              <Check size={14} /> Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
