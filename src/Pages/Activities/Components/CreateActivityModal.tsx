import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Briefcase, MapPin, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { activitiesApi, type ProjectSiteItem, type TaskType } from '../../../api/activitiesApi';
import { projectsApi, type ProjectItem } from '../../../api/projectsApi';
import { usersApi, type UserItem } from '../../../api/usersApi';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [sites, setSites] = useState<ProjectSiteItem[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [taskType, setTaskType] = useState<TaskType>('both');

  const [taskList, setTaskList] = useState<string[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSites, setLoadingSites] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load technicians and projects
  useEffect(() => {
    if (!isOpen) return;

    usersApi.getAll({ per_page: 100 }).then((res) => {
      const list = res?.data?.data || [];
      // Allow assigning to technicians, workers, and managers (self-assignment)
      const eligible = list.filter((u: UserItem) =>
        ['worker', 'technician', 'manager', 'admin'].includes(u.role)
      );
      setUsers(eligible);
      if (eligible.length > 0 && !selectedUserId) {
        setSelectedUserId(String(eligible[0].id));
      }
    }).catch(() => {});

    projectsApi.getAll().then((res) => {
      if (res && res.data) {
        setProjects(res.data);
        if (res.data.length > 0 && !selectedProjectId) {
          const firstProjId = String(res.data[0].id);
          setSelectedProjectId(firstProjId);
        }
      }
    }).catch(() => {});
  }, [isOpen]);

  // Load sites dynamically when selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setSites([]);
      setSelectedSiteId('');
      return;
    }

    setLoadingSites(true);
    activitiesApi.getSites(selectedProjectId).then((res) => {
      if (res && res.sites) {
        setSites(res.sites);
        if (res.sites.length > 0) {
          setSelectedSiteId(String(res.sites[0].id));
        } else {
          setSelectedSiteId('');
        }
      }
    }).catch(() => {
      setSites([]);
      setSelectedSiteId('');
    }).finally(() => {
      setLoadingSites(false);
    });
  }, [selectedProjectId]);

  const handleAddTask = () => {
    const trimmed = currentTaskInput.trim();
    if (!trimmed) return;
    setTaskList((prev) => [...prev, trimmed]);
    setCurrentTaskInput('');
  };

  const handleRemoveTask = (index: number) => {
    setTaskList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedUserId) {
      setErrorMessage('Please select a technician/employee.');
      return;
    }
    if (!selectedProjectId) {
      setErrorMessage('Please select a project.');
      return;
    }
    if (!selectedSiteId) {
      setErrorMessage('Please select a site belonging to this project.');
      return;
    }
    if (taskList.length === 0) {
      setErrorMessage('Please add at least one task to the to-do list.');
      return;
    }

    setLoading(true);
    try {
      await activitiesApi.createActivity({
        assigned_to_user_id: selectedUserId,
        project_id: selectedProjectId,
        project_site_id: selectedSiteId,
        activity_date: activityDate,
        task_type: taskType,
        tasks: taskList.map((t) => ({ task_description: t })),
      });

      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create daily activity.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={20} color="#0d9488" />
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Assign Daily Activity & Tasks
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {errorMessage && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Technician & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 5 }}>
                  <User size={13} style={{ display: 'inline', marginRight: 4 }} /> Assign To (Technician / Worker)
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%' }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 5 }}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} /> Activity Date
                </label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Row 2: Project & Dynamic Site */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 5 }}>
                  <Briefcase size={13} style={{ display: 'inline', marginRight: 4 }} /> Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%' }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.project_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 5 }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} /> Project Site {loadingSites && '(Loading...)'}
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={loadingSites || sites.length === 0}
                  className="filter-input"
                  style={{ width: '100%' }}
                >
                  {sites.length === 0 ? (
                    <option value="">No sites found for project</option>
                  ) : (
                    sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.site_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Row 3: Task Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                Task Type
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['both', 'service', 'project'] as TaskType[]).map((type) => (
                  <label key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="taskType"
                      value={type}
                      checked={taskType === type}
                      onChange={() => setTaskType(type)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row 4: To-Do List Builder */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                Tasks To-Do List ({taskList.length} added)
              </label>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={currentTaskInput}
                  onChange={(e) => setCurrentTaskInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }}
                  placeholder="Type task description and click Add..."
                  className="filter-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="btn-primary-action"
                  style={{ padding: '7px 14px', background: '#0d9488' }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>

              {taskList.length === 0 ? (
                <div style={{ padding: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No tasks added yet. Enter a task above and press Add (+).
                </div>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc' }}>
                  {taskList.map((taskText, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: idx < taskList.length - 1 ? '1px solid #e2e8f0' : 'none', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#1e293b' }}>
                        <strong style={{ color: '#64748b', marginRight: 6 }}>#{idx + 1}</strong>
                        {taskText}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                        title="Remove task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving Activity...</span>
                </>
              ) : (
                <span>Assign Activity</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
