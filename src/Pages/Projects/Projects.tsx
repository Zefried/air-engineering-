import { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  Package,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import './Styles/Projects.css';
import { Link } from 'react-router-dom';
import { Can } from '../../Components/Auth/Can';
import { IssueMaterialModal } from './Components/IssueMaterialModal';
import type { MaterialIssueRecord } from './Components/IssueMaterialModal';

const INITIAL_PROJECTS = [
  {
    id: "PRJ-001",
    name: "Central Mall HVAC",
    client: "Central Mall",
    manager: "Rahul Sharma",
    status: "Assigned",
    startDate: "12 Oct, 2026",
    dueDate: "20 Nov, 2026",
  },
  {
    id: "PRJ-002",
    name: "Tech Park Server Room",
    client: "Tech Park",
    manager: "Amit Das",
    status: "Assigned",
    startDate: "15 Oct, 2026",
    dueDate: "05 Dec, 2026",
  },
  {
    id: "PRJ-003",
    name: "City Hospital Wing B",
    client: "City Hospital",
    manager: null,
    status: "Unassigned",
    startDate: "22 Oct, 2026",
    dueDate: "10 Jan, 2027",
  },
];

const INITIAL_MATERIAL_LOGS: MaterialIssueRecord[] = [
  {
    id: "LOG-01",
    projectId: "PRJ-001",
    projectName: "Central Mall HVAC",
    productName: "VRF Grade Seamless Copper Pipe",
    sizeLabel: "1/2\" (12.7 mm)",
    quantity: 3.5,
    uom: "Meters",
    type: "issue",
    loggedBy: "Rahul (Site Supervisor)",
    timestamp: "10 mins ago",
    notes: "Rooftop outdoor unit connection",
  },
  {
    id: "LOG-02",
    projectId: "PRJ-002",
    projectName: "Tech Park Server Room",
    productName: "Pure Fluorinated Refrigerant Gas",
    sizeLabel: "R-410A (10 Kg)",
    quantity: 1.8,
    uom: "Kg",
    type: "issue",
    loggedBy: "Amit Das (Engineer)",
    timestamp: "1 hour ago",
    notes: "Recharge for circuit 2 pressure test",
  },
  {
    id: "LOG-03",
    projectId: "PRJ-001",
    projectName: "Central Mall HVAC",
    productName: "Nitrile Pipe Insulation",
    sizeLabel: "1/2\" x 13mm Wall",
    quantity: 6.0,
    uom: "Meters",
    type: "issue",
    loggedBy: "Rakesh (Technician)",
    timestamp: "3 hours ago",
    notes: "Suction line wrapping",
  },
];

const Projects = () => {
  const [search, setSearch] = useState("");
  const [projects] = useState(INITIAL_PROJECTS);
  const [materialLogs, setMaterialLogs] = useState<MaterialIssueRecord[]>(INITIAL_MATERIAL_LOGS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenIssueModal = (projId?: string) => {
    setModalProjectId(projId);
    setIsModalOpen(true);
  };

  const handleMaterialLogged = (newRecord: MaterialIssueRecord) => {
    setMaterialLogs((prev) => [newRecord, ...prev]);
    setToastMessage(
      `Successfully logged ${newRecord.quantity} ${newRecord.uom} of ${newRecord.sizeLabel} to ${newRecord.projectName}!`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUndoLog = (logId: string) => {
    const record = materialLogs.find((l) => l.id === logId);
    if (!record) return;
    if (window.confirm(`Undo consumption of ${record.quantity} ${record.uom} for ${record.projectName}?`)) {
      setMaterialLogs((prev) => prev.filter((l) => l.id !== logId));
      setToastMessage(`Reverted: ${record.quantity} ${record.uom} returned to warehouse inventory.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-panel-content">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Projects Overview & Site Materials
          </h2>
          <p className="text-gray-500">
            Monitor engineering projects and track fractional material consumption
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenIssueModal(undefined)}
            className="btn-secondary flex items-center gap-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm"
          >
            <Package size={17} className="text-blue-600" />
            Issue / Return Material
          </button>

          <Can roles={["admin", "subadmin"]}>
            <Link to="/dashboard/add-project" className="add-btn flex items-center gap-2">
              <Plus size={16} />
              Add Project
            </Link>
          </Can>
        </div>
      </div>

      {/* TOAST NOTICE */}
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

      {/* QUICK STATS */}
      <div className="projects-stats-grid mb-6">
        <div className="proj-stat-card flex-1 sm:flex-none">
          <p className="stat-label">Active Projects</p>
          <h3 className="stat-value">{projects.length}</h3>
        </div>
        <div className="proj-stat-card flex-1 sm:flex-none">
          <p className="stat-label">Site Material Logs</p>
          <h3 className="stat-value text-blue-600">{materialLogs.length}</h3>
        </div>
        <div className="proj-stat-card flex-1 sm:flex-none">
          <p className="stat-label">Project Managers</p>
          <h3 className="stat-value">4</h3>
        </div>
      </div>

      {/* PROJECTS TABLE SECTION */}
      <div className="projects-table-container mb-8">
        <div className="table-header-actions mb-4 flex justify-between items-center">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search project name or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="projects-table w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="px-3">Project Info</th>
                <th className="px-3">Assigned Manager</th>
                <th className="px-3">Dates</th>
                <th className="px-3">Status</th>
                <th className="px-3 text-center">Site Material Action</th>
                <th className="text-right px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => (
                <tr key={proj.id}>
                  <td className="px-3">
                    <div className="proj-info">
                      <h4 className="font-bold">{proj.name}</h4>
                      <p className="text-xs text-gray-500">{proj.id} &bull; {proj.client}</p>
                    </div>
                  </td>
                  <td className="px-3">
                    {proj.manager ? (
                      <div className="flex items-center gap-2">
                        <div className="manager-avatar w-7 h-7 rounded-full flex items-center justify-center">
                          <User size={13} />
                        </div>
                        <span className="font-semibold text-sm">{proj.manager}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="manager-avatar w-7 h-7 rounded-full flex items-center justify-center opacity-50">
                          <User size={13} />
                        </div>
                        <span className="text-sm italic">No manager</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3">
                    <div className="dates-info text-xs flex flex-col gap-1">
                      <p><span className="text-gray-500">Start:</span> {proj.startDate}</p>
                      <p><span className="text-gray-500">Due:</span> {proj.dueDate}</p>
                    </div>
                  </td>
                  <td className="px-3">
                    <span className={`status-badge ${proj.status === 'Assigned' ? 'assigned' : 'unassigned'}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-3 text-center">
                    <button
                      onClick={() => handleOpenIssueModal(proj.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition"
                      title="Issue material directly to this project"
                    >
                      <Package size={14} />
                      Log Material
                    </button>
                  </td>
                  <td className="px-3">
                    <div className="actions-cell flex justify-end gap-1">
                      <button className="action-btn view" title="View"><Eye size={15} /></button>
                      <Can roles={["admin", "subadmin"]}>
                        <button className="action-btn edit" title="Edit"><Edit2 size={15} /></button>
                        <button className="action-btn delete" title="Delete"><Trash2 size={15} /></button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT SITE MATERIAL CONSUMPTION LOGS */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={19} className="text-blue-600" />
              Live Project Material Consumption Log
            </h3>
            <p className="text-xs text-gray-500">
              Audit trail of exact materials, sizes, and fractional decimals deducted on site
            </p>
          </div>

          <button
            onClick={() => handleOpenIssueModal()}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            + Log New Material <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <th className="p-3">Project Destination</th>
                <th className="p-3">Material & Size Used</th>
                <th className="p-3">Quantity Deducted</th>
                <th className="p-3">Logged By</th>
                <th className="p-3">Site Notes</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materialLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80">
                  <td className="p-3">
                    <span className="font-bold text-gray-900">{log.projectName}</span>
                    <span className="block text-[11px] text-gray-400">{log.projectId}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-800">{log.productName}</span>
                    <span className="block text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-blue-100">
                      {log.sizeLabel}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-extrabold text-gray-900">
                      {log.type === "return" ? "+ " : "- "}
                      {log.quantity.toFixed(2)} {log.uom}
                    </span>
                    <span
                      className={`block text-[10px] uppercase font-bold ${
                        log.type === "return" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {log.type === "return" ? "Site Restock" : "Site Issued"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-700 font-medium">{log.loggedBy}</span>
                    <span className="block text-[11px] text-gray-400">{log.timestamp}</span>
                  </td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">
                    {log.notes || "—"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleUndoLog(log.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded inline-flex items-center gap-1 text-[11px] font-semibold transition"
                      title="Undo this consumption entry"
                    >
                      <RotateCcw size={12} />
                      Undo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISSUE MATERIAL MODAL */}
      <IssueMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        defaultProjectId={modalProjectId}
        onMaterialLogged={handleMaterialLogged}
      />
    </div>
  );
};

export default Projects;
