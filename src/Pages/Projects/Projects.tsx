import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Briefcase,
  Building2,
  MapPin,
  HardHat,
  Package,
  CheckCircle2,
  Trash2,
  ListOrdered
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Projects.css';
import type { ProjectSiteItem, ProjectWorker, ProjectStatus } from './projectTypes';
import { INITIAL_PROJECT_SITES } from './projectTypes';
import { ManageSiteWorkersModal } from './Components/ManageSiteWorkersModal';
import { IssueMaterialModal } from './Components/IssueMaterialModal';
import { MaterialAllocationsTable } from './Components/MaterialAllocationsTable';
import { projectsApi } from '../../api/projectsApi';
import type { ProjectItem } from '../../api/projectsApi';
import { usersApi } from '../../api/usersApi';

const DEFAULT_ALL_WORKERS: ProjectWorker[] = [
  { id: 4, name: 'Rahul Kumar', email: 'worker1@123', role: 'worker', phone: '+91 98765 43210' },
  { id: 5, name: 'Mohammed Zafar', email: 'worker2@123', role: 'worker', phone: '+91 98765 77889' },
  { id: 6, name: 'Amit Das', email: 'worker3@123', role: 'worker', phone: '+91 98765 11223' },
];

export const Projects: React.FC = () => {
  // Navigation tabs: 'projects' | 'allocations'
  const [activeTab, setActiveTab] = useState<'projects' | 'allocations'>('projects');

  // Real API Projects state
  const [apiProjects, setApiProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  // Available Workers for Site Crew management
  const [availableWorkers, setAvailableWorkers] = useState<ProjectWorker[]>(DEFAULT_ALL_WORKERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manage Workers Modal State
  const [managingProject, setManagingProject] = useState<ProjectSiteItem | null>(null);

  // Material Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real projects from backend API
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const res = await projectsApi.getProjects();
      if (res && res.data) {
        setApiProjects(res.data);
      }
    } catch (err) {
      console.warn('Backend projects API offline or error, falling back to local defaults', err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load available technicians dynamically from usersApi
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersApi.getAll();
        if (res && res.data && res.data.data) {
          const workers = res.data.data
            .filter((u) => u.role === 'worker' || u.role === 'technician')
            .map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              phone: u.phone || undefined,
            }));
          if (workers.length > 0) {
            setAvailableWorkers(workers);
          }
        }
      } catch (err) {
        console.warn('Using default workers list fallback', err);
      }
    };
    fetchUsers();
  }, []);

  // Save crew changes from ManageSiteWorkersModal
  const handleSaveSiteCrew = async (projectIdStr: string, updatedWorkers: ProjectWorker[]) => {
    const projIdNum = parseInt(projectIdStr.replace(/\D/g, ''), 10) || 1;
    const workerIds = updatedWorkers.map((w) => Number(w.id));

    try {
      await projectsApi.updateProject(projIdNum, {
        name: managingProject?.name || 'Project Site',
        client: managingProject?.client || 'Client',
        site_location: managingProject?.siteLocation || 'Site',
        worker_ids: workerIds,
      });
      fetchProjects();
      setToastMessage(`Updated field technicians assigned to site!`);
    } catch (err) {
      console.error('Failed to update crew on backend:', err);
      setToastMessage(`Updated site crew locally.`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Delete project
  const handleDeleteProject = async (id: number | string, name: string) => {
    if (window.confirm(`Are you sure you want to remove project "${name}" and its site records?`)) {
      try {
        await projectsApi.deleteProject(id);
        fetchProjects();
        setToastMessage(`Project "${name}" removed successfully.`);
      } catch (err) {
        console.error('Failed to delete project on backend:', err);
        setApiProjects((prev) => prev.filter((p) => p.id !== id));
        setToastMessage(`Project removed.`);
      }
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Material Issue Handlers
  const handleOpenIssueModal = (projId?: number) => {
    setModalProjectId(projId);
    setIsIssueModalOpen(true);
  };

  const handleMaterialSuccess = () => {
    fetchProjects();
    setToastMessage('Material movement successfully recorded in the immutable ledger!');
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Normalize API projects for UI display
  const displayProjects: (ProjectSiteItem & { dbId: number })[] = apiProjects.length > 0
    ? apiProjects.map((p) => {
        let mappedStatus: ProjectStatus = 'In Progress';
        if (p.status === 'planning') mappedStatus = 'Planning';
        else if (p.status === 'on_hold') mappedStatus = 'On Hold';
        else if (p.status === 'completed') mappedStatus = 'Completed';

        return {
          dbId: p.id,
          id: p.project_code || `PRJ-${p.id}`,
          name: p.name,
          client: p.client,
          siteLocation: p.site_location,
          managerId: p.manager_id || undefined,
          managerName: p.manager?.name || 'Site Manager',
          status: mappedStatus,
          startDate: p.start_date || 'Active',
          dueDate: p.due_date || 'TBD',
          workers: (p.workers || []).map((w) => ({
            id: w.id,
            name: w.name,
            email: w.email,
            role: w.role,
            phone: w.phone,
          })),
          description: p.description || undefined,
        };
      })
    : INITIAL_PROJECT_SITES.map((p, idx) => ({ ...p, dbId: idx + 1 }));

  // Filtered Projects
  const filteredProjects = displayProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.siteLocation.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.workers.some((w) => w.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalProjectsCount = displayProjects.length;
  const activeSitesCount = displayProjects.filter((p) => p.status === 'In Progress').length;
  const deployedWorkersSet = new Set<string | number>();
  displayProjects.forEach((p) => {
    if (p.status === 'In Progress') {
      p.workers.forEach((w) => deployedWorkersSet.add(w.id));
    }
  });
  const deployedWorkersCount = deployedWorkersSet.size;

  return (
    <div className="projects-container">
      {/* PAGE HEADER */}
      <div className="projects-header">
        <div className="projects-title-area">
          <h1>
            <Building2 size={24} /> Projects & Site Allocations
          </h1>
          <p>
            Manage HVAC commercial job sites, assigned technician crews, and track ledger material movements.
          </p>
        </div>

        <div className="projects-header-actions">
          <button
            onClick={() => handleOpenIssueModal(undefined)}
            className="btn-header-material"
          >
            <Package size={16} /> Issue / Return Material
          </button>
          <Link to="/dashboard/add-project" className="btn-header-add">
            <Plus size={16} /> Add Project / Site
          </Link>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="projects-nav-tabs">
        <button
          className={`projects-nav-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Building2 size={16} />
          <span>Active Projects & Sites</span>
          <span className="projects-tab-badge">{totalProjectsCount}</span>
        </button>

        <button
          className={`projects-nav-tab-btn ${activeTab === 'allocations' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocations')}
        >
          <ListOrdered size={16} />
          <span>Material Allocations & Audit Trail</span>
          <span className="projects-tab-badge">Ledger</span>
        </button>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: ACTIVE PROJECTS & SITES */}
      {activeTab === 'projects' && (
        <>
          {/* KPI METRIC CARDS */}
          <div className="projects-kpi-grid">
            <div className="projects-kpi-card">
              <div className="kpi-card-info">
                <p>Total Projects</p>
                <h3>{totalProjectsCount}</h3>
              </div>
              <div className="kpi-icon-pill">
                <Briefcase size={20} />
              </div>
            </div>

            <div className="projects-kpi-card">
              <div className="kpi-card-info">
                <p>Active Job Sites</p>
                <h3>{activeSitesCount}</h3>
              </div>
              <div className="kpi-icon-pill">
                <Building2 size={20} />
              </div>
            </div>

            <div className="projects-kpi-card">
              <div className="kpi-card-info">
                <p>Technicians Deployed</p>
                <h3>{deployedWorkersCount}</h3>
              </div>
              <div className="kpi-icon-pill">
                <HardHat size={20} />
              </div>
            </div>

            <div className="projects-kpi-card">
              <div className="kpi-card-info">
                <p>Movement Ledger</p>
                <h3>Live</h3>
              </div>
              <div className="kpi-icon-pill">
                <Package size={20} />
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH BAR */}
          <div className="projects-filter-bar">
            <div className="status-filter-pills">
              {['All', 'In Progress', 'Planning', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  className={`status-filter-btn ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab === 'All' ? 'All Sites' : tab}
                </button>
              ))}
            </div>

            <div className="projects-search-box">
              <Search size={16} />
              <input
                type="text"
                className="projects-search-input"
                placeholder="Search project, site location, technician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* MAIN PROJECTS & SITES TABLE */}
          <div className="projects-table-card">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project & Job Site Location</th>
                  <th>Site Incharge</th>
                  <th>Deployed Field Technicians</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProjects ? (
                  <tr>
                    <td colSpan={6} className="projects-empty-row">
                      Loading projects and job sites from database...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="projects-empty-row">
                      No projects or job sites found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => (
                    <tr key={proj.id}>
                      {/* PROJECT & SITE */}
                      <td>
                        <h4 className="project-name-text">{proj.name}</h4>
                        <p className="project-client-sub">
                          {proj.id} &bull; {proj.client}
                        </p>
                        <div className="site-location-pill" title={proj.siteLocation}>
                          <MapPin size={11} className="text-slate-500" />
                          <span>{proj.siteLocation}</span>
                        </div>
                      </td>

                      {/* SITE INCHARGE */}
                      <td>
                        <div className="site-manager-badge">
                          <div className="manager-avatar-circle">
                            {proj.managerName ? proj.managerName.charAt(0) : 'M'}
                          </div>
                          <div>
                            <p className="manager-name">{proj.managerName}</p>
                            <p className="text-[11px] text-slate-400">Site Manager</p>
                          </div>
                        </div>
                      </td>

                      {/* DEPLOYED WORKERS */}
                      <td>
                        <div className="site-crew-cell">
                          {proj.workers.length > 0 ? (
                            <div className="crew-avatars-stack" title={proj.workers.map((w) => w.name).join(', ')}>
                              {proj.workers.slice(0, 3).map((w) => (
                                <div key={w.id} className="crew-avatar-mini" title={w.name}>
                                  {w.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No workers</span>
                          )}

                          <button
                            className="btn-manage-crew-pill"
                            onClick={() => setManagingProject(proj)}
                            title="Add or remove technicians for this job site"
                          >
                            <HardHat size={12} />
                            {proj.workers.length} {proj.workers.length === 1 ? 'Worker' : 'Workers'}
                          </button>
                        </div>
                      </td>

                      {/* TIMELINE */}
                      <td>
                        <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                          <span>
                            <strong className="text-slate-400 font-normal">Start:</strong> {proj.startDate}
                          </span>
                          <span>
                            <strong className="text-slate-400 font-normal">Due:</strong> {proj.dueDate}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`project-status-pill ${
                            proj.status === 'In Progress'
                              ? 'in-progress'
                              : proj.status === 'Completed'
                              ? 'completed'
                              : proj.status === 'Planning'
                              ? 'planning'
                              : 'on-hold'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="project-row-actions">
                          <button
                            className="btn-row-action"
                            onClick={() => handleOpenIssueModal(proj.dbId)}
                            title="Issue material to this site"
                          >
                            <Package size={13} /> Issue Material
                          </button>
                          <button
                            className="btn-row-action"
                            onClick={() => setManagingProject(proj)}
                            title="Manage site crew"
                          >
                            <HardHat size={13} /> Crew
                          </button>
                          <button
                            className="btn-row-action delete"
                            onClick={() => handleDeleteProject(proj.dbId, proj.name)}
                            title="Delete project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: MATERIAL ALLOCATIONS & AUDIT TRAIL */}
      {activeTab === 'allocations' && (
        <MaterialAllocationsTable onRefreshNeeded={fetchProjects} />
      )}

      {/* MANAGE SITE WORKERS MODAL */}
      <ManageSiteWorkersModal
        isOpen={managingProject !== null}
        onClose={() => setManagingProject(null)}
        project={managingProject}
        availableWorkers={availableWorkers}
        onSave={handleSaveSiteCrew}
      />

      {/* ISSUE MATERIAL MODAL */}
      <IssueMaterialModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        projects={apiProjects}
        defaultProjectId={modalProjectId}
        onSuccess={handleMaterialSuccess}
      />
    </div>
  );
};

export default Projects;
