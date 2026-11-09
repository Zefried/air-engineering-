import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, User } from 'lucide-react';
import './Styles/Projects.css';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [search, setSearch] = useState("");

  const dummyProjects = [
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
    }
  ];

  return (
    <div className="admin-panel-content">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Admin Panel — Projects
          </h2>
          <p className="text-gray-500">Manage projects and assigned managers</p>
        </div>
        <Link to="/dashboard/add-project" className="add-btn flex items-center gap-2">
          <Plus size={16} />
          Add Project
        </Link>
      </div>

      {/* QUICK STATS */}
      <div className="projects-stats-grid mb-6">
        <div className="proj-stat-card flex-1 sm:flex-none">
          <p className="stat-label">All Projects</p>
          <h3 className="stat-value">8</h3>
        </div>
        <div className="proj-stat-card flex-1 sm:flex-none">
          <p className="stat-label">Managers</p>
          <h3 className="stat-value">4</h3>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="projects-table-container">
        <div className="table-header-actions mb-4 flex justify-between items-center">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search project name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="projects-table w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="px-2">Project Info</th>
                <th className="px-2">Assigned Manager</th>
                <th className="px-2">Dates</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyProjects.map((proj) => (
                <tr key={proj.id}>
                  <td className="px-2">
                    <div className="proj-info">
                      <h4 className="font-bold">{proj.name}</h4>
                      <p className="text-xs text-gray-500">{proj.id} · {proj.client}</p>
                    </div>
                  </td>
                  <td className="px-2">
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
                  <td className="px-2">
                    <div className="dates-info text-xs flex flex-col gap-1">
                      <p><span className="text-gray-500">Start:</span> {proj.startDate}</p>
                      <p><span className="text-gray-500">Due:</span> {proj.dueDate}</p>
                    </div>
                  </td>
                  <td className="px-2">
                    <span className={`status-badge ${proj.status === 'Assigned' ? 'assigned' : 'unassigned'}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="actions-cell flex justify-end gap-1">
                      <button className="action-btn view" title="View"><Eye size={15} /></button>
                      <button className="action-btn edit" title="Edit"><Edit2 size={15} /></button>
                      <button className="action-btn delete" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;
