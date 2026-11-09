import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, User, Briefcase, Clock, Layers, FileText, ChevronDown, AlertCircle } from 'lucide-react';
import type { ToolItem, ToolCondition } from '../toolTypes';
import { WORKERS_LIST, PROJECTS_LIST } from '../toolTypes';
import { usersApi } from '../../../api/usersApi';
import type { UserItem } from '../../../api/usersApi';
import { projectsApi } from '../../../api/projectsApi';
import type { ProjectItem, ProjectListResponse } from '../../../api/projectsApi';
import './AssignToolModal.css';

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
  }) => Promise<void> | void;
}

const formatDateFormatted = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}, 18:00`;
};

export const AssignToolModal: React.FC<AssignToolModalProps> = ({
  tool,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [workers, setWorkers] = useState<{ id: string; name: string; info: string }[]>(
    WORKERS_LIST.map(w => ({ id: w.id, name: w.name, info: `${w.trade} — ${w.id}` }))
  );
  const [projectOptions, setProjectOptions] = useState<string[]>(() => {
    return PROJECTS_LIST.map((p) => p.full);
  });
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [projectName, setProjectName] = useState(() => projectOptions[0] || PROJECTS_LIST[0].full);
  const [assignedCondition, setAssignedCondition] = useState<ToolCondition>(tool.currentCondition || "Good");
  const [durationPreset, setDurationPreset] = useState<"1 Day" | "3 Days" | "1 Week" | "Custom">("1 Day");
  const [customReturnDate, setCustomReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateFormatted(d);
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load registered workers and real projects from backend
  useEffect(() => {
    let isMounted = true;
    usersApi.getAll({ role: 'worker' })
      .then((res) => {
        if (!isMounted) return;
        const workerList = res?.data?.data || [];
        if (workerList.length > 0) {
          const mapped = workerList.map((w: UserItem) => ({
            id: String(w.id),
            name: w.name,
            info: `${w.name} (${w.email})`,
          }));
          setWorkers(mapped);
          setSelectedWorkerId(mapped[0].id);
        } else {
          setSelectedWorkerId(WORKERS_LIST[0].id);
        }
      })
      .catch(() => {
        if (isMounted) setSelectedWorkerId(WORKERS_LIST[0].id);
      });

    projectsApi.getAll()
      .then((res: ProjectListResponse) => {
        if (!isMounted) return;
        const projectList = res?.data || [];
        if (projectList.length > 0) {
          const mapped = projectList.map((p: ProjectItem) =>
            p.site_location ? `${p.project_code} - ${p.name} (${p.site_location})` : `${p.project_code} - ${p.name}`
          );
          setProjectOptions(mapped);
          setProjectName(mapped[0]);
        }
      })
      .catch((err: unknown) => {
        console.warn("Could not load backend projects, using fallbacks", err);
      });

    return () => { isMounted = false; };
  }, []);

  if (!isOpen) return null;

  const handlePresetClick = (preset: "1 Day" | "3 Days" | "1 Week") => {
    setDurationPreset(preset);
    const d = new Date();
    if (preset === "1 Day") {
      d.setDate(d.getDate() + 1);
    } else if (preset === "3 Days") {
      d.setDate(d.getDate() + 3);
    } else if (preset === "1 Week") {
      d.setDate(d.getDate() + 7);
    }
    setCustomReturnDate(formatDateFormatted(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const worker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
    if (!worker) {
      setErrorMessage("Please select a valid field worker.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAssign(tool.id, {
        workerId: worker.id,
        workerName: worker.name,
        projectName,
        expectedReturnDate: customReturnDate,
        assignedCondition,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to assign tool.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assign-modal-backdrop" onClick={onClose}>
      <div className="assign-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="assign-modal-header">
          <div className="assign-modal-title-group">
            <span className="assign-modal-tag">{tool.toolCode}</span>
            <h2 className="assign-modal-title">Assign Tool to Field Worker</h2>
          </div>
          <button
            onClick={onClose}
            className="assign-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="assign-modal-form">
          {errorMessage && (
            <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          {/* ROW 1: WORKER SELECT */}
          <div className="assign-form-row">
            <label className="assign-row-label">
              <User size={16} /> Field Worker (Responsible Person) *
            </label>
            <div className="assign-row-content">
              <select
                className="assign-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                required
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.info || w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 2: PROJECT SITE */}
          <div className="assign-form-row">
            <label className="assign-row-label">
              <Briefcase size={16} /> Project / Job Site *
            </label>
            <div className="assign-row-content">
              <select
                className="assign-select"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              >
                {projectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 3: DURATION */}
          <div className="assign-form-row">
            <label className="assign-row-label">
              <Clock size={16} /> Duration *
            </label>
            <div className="assign-row-content">
              <div className="assign-duration-grid">
                {/* 3 PRESETS */}
                <div className="assign-preset-group">
                  {(["1 Day", "3 Days", "1 Week"] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`assign-preset-btn ${durationPreset === preset ? "active" : ""}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* DATE TIME DISPLAY */}
                <div className="assign-datetime-col">
                  <span className="assign-datetime-mini-label">Assign Date & Time</span>
                  <div className="assign-datetime-picker-box">
                    <Calendar size={15} />
                    <input
                      type="text"
                      className="assign-datetime-input"
                      value={customReturnDate}
                      onChange={(e) => {
                        setCustomReturnDate(e.target.value);
                        setDurationPreset("Custom");
                      }}
                      placeholder="DD MMM YYYY, HH:mm"
                    />
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 4: CONDITION WHEN HANDING OVER */}
          <div className="assign-form-row">
            <label className="assign-row-label">
              <Layers size={16} /> Condition When Handing Over *
            </label>
            <div className="assign-row-content">
              <select
                className="assign-select"
                value={assignedCondition}
                onChange={(e) => setAssignedCondition(e.target.value as ToolCondition)}
              >
                <option value="Brand New">Brand New (Unused)</option>
                <option value="Good">Good (Fully Functional)</option>
                <option value="Rough">Rough / Fair (Working with cosmetic wear)</option>
              </select>
              <p className="assign-help-note">
                Recorded for accountability. This will be compared when the tool is returned.
              </p>
            </div>
          </div>

          {/* ROW 5: NOTES */}
          <div className="assign-form-row">
            <label className="assign-row-label">
              <FileText size={16} /> Assignment Notes (Optional)
            </label>
            <div className="assign-row-content">
              <textarea
                className="assign-textarea"
                rows={2}
                placeholder="e.g. Dispatched with 2 spare copper fittings and charger"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="assign-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-assign-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-assign-submit"
            >
              <Check size={16} /> {isSubmitting ? "Assigning..." : "Assign Tool"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignToolModal;
