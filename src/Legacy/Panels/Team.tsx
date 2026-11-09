import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, UserX, UserCheck, Users, Shield, Wrench } from 'lucide-react';
import './Styles/Team.css';
import { Link } from 'react-router-dom';

const Team = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Members");

  const tabs = ["All Members", "Managers", "Technicians", "Inactive"];

  const dummyTeam = [
    {
      id: "EMP-001",
      name: "Rahul Sharma",
      role: "Project Manager",
      status: "Active",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "EMP-002",
      name: "Rakesh Kumar",
      role: "Technician",
      status: "Active",
      image: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      id: "EMP-003",
      name: "Amit Das",
      role: "Project Manager",
      status: "Active",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    }
  ];

  return (
    <div className="admin-panel-content">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Team Members
          </h2>
          <p className="text-gray-500">Manage employees and managers</p>
        </div>
        <Link to="/dashboard/add-employee" className="add-btn flex items-center gap-2">
          <Plus size={16} />
          Add Member
        </Link>
      </div>

      {/* QUICK STATS */}
      <div className="team-stats-grid mb-6">
        <div className="team-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper blue">
            <Users size={20} />
          </div>
          <div>
            <p className="stat-label">Total Members</p>
            <h3 className="stat-value">24</h3>
          </div>
        </div>
        <div className="team-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper teal">
            <Shield size={20} />
          </div>
          <div>
            <p className="stat-label">Managers</p>
            <h3 className="stat-value">4</h3>
          </div>
        </div>
        <div className="team-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper orange">
            <Wrench size={20} />
          </div>
          <div>
            <p className="stat-label">Technicians</p>
            <h3 className="stat-value">20</h3>
          </div>
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="team-table-container">
        <div className="table-header-actions mb-4">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name or employee ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button 
                key={tab} 
                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="team-table w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="px-2">Employee Info</th>
                <th className="px-2">Role</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyTeam.map((member) => (
                <tr key={member.id}>
                  <td className="px-2">
                    <div className="team-info-wrapper">
                      <div className="team-img-container">
                        <img src={member.image} alt={member.name} />
                      </div>
                      <div className="team-info">
                        <h4 className="font-bold text-sm">{member.name}</h4>
                        <p className="text-xs text-gray-500">{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2">
                    <span className="text-sm font-medium">{member.role}</span>
                  </td>
                  <td className="px-2">
                    <span className={`team-status-badge ${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="actions-cell flex justify-end gap-1">
                      <button className="action-btn view" title="View details"><Eye size={15} /></button>
                      <button className="action-btn edit" title="Edit"><Edit2 size={15} /></button>
                      {member.status === 'Active' ? (
                        <button className="action-btn deactivate" title="Deactivate"><UserX size={15} /></button>
                      ) : (
                        <button className="action-btn activate" title="Activate"><UserCheck size={15} /></button>
                      )}
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

export default Team;
