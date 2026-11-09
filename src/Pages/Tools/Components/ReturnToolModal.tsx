import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ToolItem, ToolCondition } from '../toolTypes';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                {tool.toolCode}
              </span>
              <h3 className="text-base font-bold text-slate-900">Check-In / Return Tool</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{tool.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Active Handover Info Box */}
          {assigned && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Assigned Worker:</span>
                <strong className="text-slate-900 font-semibold">{assigned.workerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Site / Project:</span>
                <span className="text-slate-800">{assigned.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span>Checkout Condition:</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-700">
                  {assigned.assignedCondition}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Assigned On:</span>
                <span className="font-mono">{assigned.assignedDate}</span>
              </div>
            </div>
          )}

          {/* Return Condition Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Physical Condition Upon Return *
            </label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
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
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Condition Degraded Under {assigned?.workerName || "Worker"}</strong>
                Tool was dispatched in <strong>{initialCondition}</strong> condition and is returning in{" "}
                <strong>{returnCondition}</strong> condition. This degradation will be permanently logged in the tool's audit trail.
              </div>
            </div>
          )}

          {returnCondition === "Scrapped" && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
              <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Scrap & Procurement Notice</strong>
                Marking this tool as Scrapped will retire it from active crib inventory and flag it as a replacement purchase requisition.
              </div>
            </div>
          )}

          {/* Notes / Damage details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return Inspection Notes {isDegraded && <span className="text-rose-600">*</span>}
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check size={14} /> Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
