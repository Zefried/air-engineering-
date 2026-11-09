import React, { useState } from 'react';
import { X, Check, Calendar, User, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import type { ToolItem, ToolCondition } from '../toolTypes';
import { WORKERS_LIST, PROJECTS_LIST } from '../toolTypes';

interface AssignToolModalProps {
  tool: ToolItem;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (toolId: string, payload: {
    workerId: string;
    workerName: string;
    projectName: string;
    expectedReturnDate: string;
    assignedCondition: ToolCondition;
    notes?: string;
  }) => void;
}

export const AssignToolModal: React.FC<AssignToolModalProps> = ({
  tool,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState(WORKERS_LIST[0].id);
  const [projectName, setProjectName] = useState(PROJECTS_LIST[0].full);
  const [assignedCondition, setAssignedCondition] = useState<ToolCondition>(tool.currentCondition || "Good");
  const [durationPreset, setDurationPreset] = useState("1 Day");
  const [customReturnDate, setCustomReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0] + " 18:00";
  });
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handlePresetClick = (preset: string) => {
    setDurationPreset(preset);
    const d = new Date();
    if (preset === "Today") {
      // Today 18:00
      setCustomReturnDate(d.toISOString().split("T")[0] + " 18:00");
    } else if (preset === "1 Day") {
      d.setDate(d.getDate() + 1);
      setCustomReturnDate(d.toISOString().split("T")[0] + " 18:00");
    } else if (preset === "3 Days") {
      d.setDate(d.getDate() + 3);
      setCustomReturnDate(d.toISOString().split("T")[0] + " 18:00");
    } else if (preset === "1 Week") {
      d.setDate(d.getDate() + 7);
      setCustomReturnDate(d.toISOString().split("T")[0] + " 18:00");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = WORKERS_LIST.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    onAssign(tool.id, {
      workerId: worker.id,
      workerName: worker.name,
      projectName,
      expectedReturnDate: customReturnDate,
      assignedCondition,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                {tool.toolCode}
              </span>
              <h3 className="text-base font-bold text-slate-900">Assign Tool to Field Worker</h3>
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
          {/* Worker Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-slate-500" /> Field Worker (Responsible Person) *
            </label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              required
            >
              {WORKERS_LIST.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.trade} — {w.id})
                </option>
              ))}
            </select>
          </div>

          {/* Project Site */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Briefcase size={14} className="text-slate-500" /> Project / Job Site *
            </label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            >
              {PROJECTS_LIST.map((p) => (
                <option key={p.full} value={p.full}>
                  {p.full}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Preset Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-500" /> Duration (1-Click Presets)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["Today", "1 Day", "3 Days", "1 Week"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    durationPreset === preset
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                value={customReturnDate}
                onChange={(e) => {
                  setCustomReturnDate(e.target.value);
                  setDurationPreset("Custom");
                }}
                placeholder="YYYY-MM-DD HH:mm"
              />
            </div>
          </div>

          {/* Checkout Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-500" /> Condition When Handing Over *
            </label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
              value={assignedCondition}
              onChange={(e) => setAssignedCondition(e.target.value as ToolCondition)}
            >
              <option value="Brand New">Brand New (Unused)</option>
              <option value="Good">Good (Fully Functional)</option>
              <option value="Rough">Rough / Fair (Working with cosmetic wear)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Recorded into tool chain of custody so the worker is accountable upon return.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Notes (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              placeholder="e.g. Dispatched with 2 spare copper fittings and charger"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <Check size={14} /> Assign Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
