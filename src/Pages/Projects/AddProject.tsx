import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  HardHat,
  Plus,
  Check,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AddProject.css';
import type { ProjectWorker, ProjectSiteItem, ProjectStatus } from './projectTypes';
import { INITIAL_PROJECT_SITES } from './projectTypes';
import { usersApi } from '../../api/usersApi';
import { projectsApi } from '../../api/projectsApi';

const DEFAULT_MANAGERS: { id: number; name: string; email: string }[] = [
  { id: 2, name: 'Alex Manager', email: 'manager1@123' },
  { id: 1, name: 'System Admin', email: 'zeffali7@gmail.com' },
];

const DEFAULT_WORKERS: ProjectWorker[] = [
  { id: 4, name: 'Rahul Kumar', email: 'worker1@123', role: 'worker', phone: '+91 98765 43210' },
  { id: 5, name: 'Mohammed Zafar', email: 'worker2@123', role: 'worker', phone: '+91 98765 77889' },
  { id: 6, name: 'Amit Das', email: 'worker3@123', role: 'worker', phone: '+91 98765 11223' },
];

export const AddProject: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [managerId, setManagerId] = useState<number | string>(2);
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Selected Workers
  const [availableWorkers, setAvailableWorkers] = useState<ProjectWorker[]>(DEFAULT_WORKERS);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<number | string>>(new Set([4, 5]));

  // Managers List
  const [availableManagers, setAvailableManagers] = useState(DEFAULT_MANAGERS);

  // Quick Add Worker inline
  const [showQuickAddWorker, setShowQuickAddWorker] = useState(false);
  const [quickWorkerName, setQuickWorkerName] = useState('');
  const [quickWorkerLogin, setQuickWorkerLogin] = useState('');
  const [quickWorkerPhone, setQuickWorkerPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Load team users from API if possible
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await usersApi.getAll();
        if (res && res.data && res.data.data) {
          const apiWorkers = res.data.data
            .filter((u) => u.role === 'worker' || u.role === 'technician')
            .map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              phone: u.phone || undefined,
            }));
          if (apiWorkers.length > 0) setAvailableWorkers(apiWorkers);

          const apiManagers = res.data.data
            .filter((u) => u.role === 'manager' || u.role === 'admin')
            .map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
            }));
          if (apiManagers.length > 0) {
            setAvailableManagers(apiManagers);
            setManagerId(apiManagers[0].id);
          }
        }
      } catch (err) {
        console.warn('Using local fallback for managers & workers', err);
      }
    };
    loadTeam();
  }, []);

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

  const handleQuickAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWorkerName.trim()) return;

    const newWorkerId = Date.now();
    const newWorker: ProjectWorker = {
      id: newWorkerId,
      name: quickWorkerName.trim(),
      email: quickWorkerLogin.trim() || `worker${availableWorkers.length + 1}@123`,
      role: 'worker',
      phone: quickWorkerPhone.trim() || undefined,
    };

    setAvailableWorkers((prev) => [...prev, newWorker]);
    setSelectedWorkerIds((prev) => new Set(prev).add(newWorkerId));
    setQuickWorkerName('');
    setQuickWorkerLogin('');
    setQuickWorkerPhone('');
    setShowQuickAddWorker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const chosenManager = availableManagers.find((m) => m.id === Number(managerId)) || availableManagers[0];
    const assignedWorkers = availableWorkers.filter((w) => selectedWorkerIds.has(w.id));

    // Persist to backend database API
    try {
      await projectsApi.createProject({
        name: name.trim(),
        client: client.trim() || 'Direct Client',
        site_location: siteLocation.trim() || 'Main Site Facility',
        manager_id: chosenManager?.id ? Number(chosenManager.id) : null,
        status: status === 'In Progress' ? 'in_progress' : status === 'Planning' ? 'planning' : status === 'Completed' ? 'completed' : 'on_hold',
        start_date: startDate || null,
        due_date: dueDate || null,
        description: description.trim() || null,
        worker_ids: Array.from(selectedWorkerIds).map((id) => Number(id)),
      });
    } catch (apiErr) {
      console.warn('Backend project creation fallback to localStorage', apiErr);
    }

    // Generate project code and save local state
    const existingRaw = localStorage.getItem('air_projects_list');
    const existingProjects: ProjectSiteItem[] = existingRaw ? JSON.parse(existingRaw) : INITIAL_PROJECT_SITES;
    const newCode = `PRJ-${String(existingProjects.length + 1).padStart(3, '0')}`;

    const newProject: ProjectSiteItem = {
      id: newCode,
      name: name.trim(),
      client: client.trim() || 'Direct Client',
      siteLocation: siteLocation.trim() || 'Main Site Facility',
      managerId: chosenManager?.id,
      managerName: chosenManager?.name || 'Assigned Manager',
      status: status,
      startDate: startDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: dueDate || 'TBD',
      workers: assignedWorkers,
      description: description.trim(),
    };

    const updatedProjects = [newProject, ...existingProjects];
    localStorage.setItem('air_projects_list', JSON.stringify(updatedProjects));

    setSuccessNotice(`Project "${name}" and Site "${siteLocation || name}" created successfully!`);
    setTimeout(() => {
      navigate('/dashboard/projects');
    }, 700);
  };

  return (
    <div className="add-project-container">
      {/* BACK BUTTON */}
      <Link to="/dashboard/projects" className="add-project-back-btn">
        <ArrowLeft size={16} /> Back to Projects & Sites
      </Link>

      {/* HEADER */}
      <div className="add-project-header">
        <div className="header-icon-box">
          <Building2 size={24} />
        </div>
        <div>
          <h1>Create Project & Job Site</h1>
          <p>Register an HVAC project contract, site physical location, manager, and deployed technicians.</p>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className="add-project-card">
        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PROJECT & SITE DETAILS */}
          <h3 className="project-section-title">
            <Building2 size={15} /> 1. Project & Site Location
          </h3>

          <div className="form-grid-2col">
            <div className="form-group-block">
              <label>
                Project Name <span className="req">*</span>
              </label>
              <div className="form-input-box">
                <Building2 size={16} />
                <input
                  type="text"
                  placeholder="e.g. Central Mall VRF HVAC Installation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-block">
              <label>Client / Contract Owner</label>
              <div className="form-input-box">
                <User size={16} />
                <input
                  type="text"
                  placeholder="e.g. DLF Retail Corp / Apollo Hospitals"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group-block">
            <label>
              Physical Site Location & Plant Room <span className="req">*</span>
            </label>
            <div className="form-input-box">
              <MapPin size={16} />
              <input
                type="text"
                placeholder="e.g. Sector 18, Level 3 Plant Room, MG Road (Exact location where workers work)"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* SECTION 2: MANAGEMENT & WORKERS */}
          <h3 className="project-section-title mt-6">
            <HardHat size={15} /> 2. Site Incharge & Deployed Field Technicians
          </h3>

          <div className="form-grid-2col">
            <div className="form-group-block">
              <label>
                Site Incharge (Project Manager) <span className="req">*</span>
              </label>
              <div className="form-input-box">
                <User size={16} />
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  required
                >
                  {availableManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group-block">
              <label>Project Status</label>
              <div className="form-input-box">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                >
                  <option value="In Progress">In Progress (Active Site)</option>
                  <option value="Planning">Planning / Setup</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* WORKERS DEPLOYMENT SECTION */}
          <div className="form-group-block">
            <label>
              Deploy Field Workers (Technicians) to this Site
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select technicians who are assigned to work at this physical site. Tools and materials can be checked out directly to these technicians.
            </p>

            <div className="workers-selection-grid">
              {availableWorkers.map((worker) => {
                const isSelected = selectedWorkerIds.has(worker.id);
                return (
                  <div
                    key={worker.id}
                    className={`worker-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleWorker(worker.id)}
                  >
                    <div className="worker-card-left">
                      <div className="worker-card-avatar">
                        <HardHat size={15} />
                      </div>
                      <div className="worker-card-info">
                        <h4>{worker.name}</h4>
                        <p>{worker.email}</p>
                      </div>
                    </div>
                    <div className="worker-checkbox-box">
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="worker-selection-summary">
              <span>
                <strong>{selectedWorkerIds.size}</strong> field technicians currently selected for this job site.
              </span>
              <button
                type="button"
                className="quick-add-worker-toggle"
                onClick={() => setShowQuickAddWorker((prev) => !prev)}
              >
                <Plus size={14} /> {showQuickAddWorker ? 'Cancel New Worker' : '+ Add New Worker'}
              </button>
            </div>

            {/* QUICK INLINE WORKER ADD */}
            {showQuickAddWorker && (
              <div className="quick-add-worker-box">
                <p className="text-xs font-semibold text-slate-700 m-0">
                  Quick Add Worker to Site Roster:
                </p>
                <div className="quick-add-grid">
                  <input
                    type="text"
                    placeholder="Worker Full Name"
                    className="quick-add-input"
                    value={quickWorkerName}
                    onChange={(e) => setQuickWorkerName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Login ID (e.g. worker4@123)"
                    className="quick-add-input"
                    value={quickWorkerLogin}
                    onChange={(e) => setQuickWorkerLogin(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (optional)"
                    className="quick-add-input"
                    value={quickWorkerPhone}
                    onChange={(e) => setQuickWorkerPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddWorker}
                    className="btn-quick-add"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: TIMELINE & SCOPE */}
          <h3 className="project-section-title mt-6">
            <Calendar size={15} /> 3. Timeline & Work Scope
          </h3>

          <div className="form-grid-2col">
            <div className="form-group-block">
              <label>Start Date</label>
              <div className="form-input-box">
                <Calendar size={16} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-block">
              <label>Target Completion Date</label>
              <div className="form-input-box">
                <Calendar size={16} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group-block">
            <label>Project Scope / Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Full mechanical piping, refrigerant pressure testing, ducting and VRF unit commissioning."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="form-action-buttons">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={() => navigate('/dashboard/projects')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-form-submit"
            >
              <Check size={16} /> {isSubmitting ? 'Creating Project...' : 'Create Project & Job Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
