import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, HardHat } from 'lucide-react';
import type { ProjectSiteItem, ProjectWorker } from '../projectTypes';
import '../Styles/ManageSiteWorkersModal.css';

interface ManageSiteWorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSiteItem | null;
  availableWorkers: ProjectWorker[];
  onSave: (projectId: string, updatedWorkers: ProjectWorker[]) => void;
}

export const ManageSiteWorkersModal: React.FC<ManageSiteWorkersModalProps> = ({
  isOpen,
  onClose,
  project,
  availableWorkers,
  onSave,
}) => {
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<number | string>>(new Set());

  // Populate selected workers when project changes
  useEffect(() => {
    if (project) {
      setSelectedWorkerIds(new Set(project.workers.map((w) => w.id)));
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const toggleWorker = (id: number | string) => {
    setSelectedWorkerIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleSave = () => {
    const updatedWorkers = availableWorkers.filter((w) => selectedWorkerIds.has(w.id));
    onSave(project.id, updatedWorkers);
    onClose();
  };

  return (
    <div className="site-workers-modal-backdrop" onClick={onClose}>
      <div className="site-workers-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="site-workers-modal-header">
          <div>
            <h3 className="site-workers-modal-title">Deploy Field Technicians</h3>
            <p className="site-workers-modal-subtitle">
              <MapPin size={13} /> {project.name} &bull; {project.siteLocation}
            </p>
          </div>
          <button onClick={onClose} className="site-workers-modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="site-workers-modal-body">
          <div className="site-workers-info-banner">
            <span>
              <strong>{selectedWorkerIds.size}</strong> technicians currently assigned to this site
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{project.id}</span>
          </div>

          <div className="site-workers-list">
            {availableWorkers.map((worker) => {
              const isSelected = selectedWorkerIds.has(worker.id);
              return (
                <div
                  key={worker.id}
                  className={`site-worker-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleWorker(worker.id)}
                >
                  <div className="site-worker-left">
                    <div className={`site-worker-avatar ${isSelected ? 'selected' : ''}`}>
                      <HardHat size={16} />
                    </div>
                    <div>
                      <h4 className="site-worker-name">{worker.name}</h4>
                      <p className="site-worker-sub">
                        {worker.email} {worker.phone ? `• ${worker.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="site-worker-checkbox">
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="site-workers-modal-footer">
          <button type="button" onClick={onClose} className="btn-site-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-site-save">
            <Check size={14} /> Update Site Crew
          </button>
        </div>
      </div>
    </div>
  );
};
