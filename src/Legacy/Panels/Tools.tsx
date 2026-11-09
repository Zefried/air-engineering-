import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Link2, Link2Off, Archive, Package, Wrench } from 'lucide-react';
import './Styles/Tools.css';
import { Link } from 'react-router-dom';

const Tools = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Tools");

  const tabs = ["All Tools", "In Use", "Available", "Under Repair", "Retired"];

  const dummyTools = [
    {
      id: "TL-014",
      name: "Impact Drill",
      category: "Power Tools",
      assignedTo: "Rakesh Kumar",
      status: "In Use",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAH-qrhi4yk21ITEM687L46opIkO9r40QfQcfdmkkFMQyNDaVRwqhOdkPB&s=10",
      condition: "Good"
    },
    {
      id: "TL-022",
      name: "Pipe Cutter",
      category: "Cutting Tools",
      assignedTo: null,
      status: "Available",
      image: "https://m.media-amazon.com/images/I/51GbxjkeMbL.jpg",
      condition: "New"
    },
    {
      id: "TL-025",
      name: "Pressure Gauge",
      category: "Measuring Tools",
      assignedTo: "Workshop",
      status: "Under Repair",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsr22luuXjJHtoeRSirFFWQgfideqYkChslHr837473ZqvXjpUPsiFumKj&s=10",
      condition: "Poor"
    }
  ];

  return (
    <div className="admin-panel-content">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Tools Inventory
          </h2>
          <p className="text-gray-500">Manage and track your equipment</p>
        </div>
        <Link to="/dashboard/add-tool" className="add-btn flex items-center gap-2">
          <Plus size={16} />
          Add Tool
        </Link>
      </div>

      {/* QUICK STATS */}
      <div className="tools-stats-grid mb-6">
        <div className="tool-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper blue">
            <Package size={20} />
          </div>
          <div>
            <p className="stat-label">Total Tools</p>
            <h3 className="stat-value">36</h3>
          </div>
        </div>
        <div className="tool-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper teal">
            <Wrench size={20} />
          </div>
          <div>
            <p className="stat-label">In Use</p>
            <h3 className="stat-value">28</h3>
          </div>
        </div>
        <div className="tool-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper red">
            <Archive size={20} />
          </div>
          <div>
            <p className="stat-label">Retired</p>
            <h3 className="stat-value">5</h3>
          </div>
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="tools-table-container">
        <div className="table-header-actions mb-4">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by tool name or ID..." 
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
          <table className="tools-table w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="px-2">Tool Info</th>
                <th className="px-2">Condition</th>
                <th className="px-2">Assigned To</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyTools.map((tool) => (
                <tr key={tool.id}>
                  <td className="px-2">
                    <div className="tool-info-wrapper">
                      <div className="tool-img-container">
                        <img src={tool.image} alt={tool.name} />
                      </div>
                      <div className="tool-info">
                        <h4 className="font-bold text-sm">{tool.name}</h4>
                        <p className="text-xs text-gray-500">{tool.id} · {tool.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2">
                    <span className="text-sm font-medium">{tool.condition}</span>
                  </td>
                  <td className="px-2">
                    {tool.assignedTo ? (
                      <span className="font-semibold text-sm">{tool.assignedTo}</span>
                    ) : (
                      <span className="text-sm italic text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-2">
                    <span className={`tool-status-badge ${tool.status.toLowerCase().replace(' ', '-')}`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="actions-cell flex justify-end gap-1">
                      <button className="action-btn view" title="View details"><Eye size={15} /></button>
                      <button className="action-btn edit" title="Edit"><Edit2 size={15} /></button>
                      {tool.status === 'In Use' ? (
                        <button className="action-btn unassign" title="Unassign"><Link2Off size={15} /></button>
                      ) : (
                        <button className="action-btn assign" title="Assign"><Link2 size={15} /></button>
                      )}
                      <button className="action-btn retire" title="Retire"><Archive size={15} /></button>
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

export default Tools;
