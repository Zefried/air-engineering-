import { useState } from 'react';
import { Search, Plus, Eye, Edit2, RefreshCw, Box, AlertTriangle, XCircle } from 'lucide-react';
import './Styles/Materials.css';
import { Link } from 'react-router-dom';
import { Can } from '../../Components/Auth/Can';

const Materials = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Materials");

  const tabs = ["All Materials", "In Stock", "Low Stock", "Out of Stock"];

  const dummyMaterials = [
    {
      id: "MAT-001",
      name: "Copper Pipes",
      quantity: 3,
      unit: "coils",
      minThreshold: 5,
    },
    {
      id: "MAT-002",
      name: "Refrigerant Gas",
      quantity: 2,
      unit: "cylinders",
      minThreshold: 4,
    },
    {
      id: "MAT-003",
      name: "Pipe Insulation",
      quantity: 15,
      unit: "rolls",
      minThreshold: 10,
    },
    {
      id: "MAT-004",
      name: "Aluminium Foil Tape",
      quantity: 0,
      unit: "boxes",
      minThreshold: 3,
    },
    {
      id: "MAT-005",
      name: "Copper Fittings & Flare Nuts",
      quantity: 50,
      unit: "packs",
      minThreshold: 20,
    },
    {
      id: "MAT-006",
      name: "GI Duct Sheets",
      quantity: 12,
      unit: "sheets",
      minThreshold: 10,
    },
    {
      id: "MAT-007",
      name: "Air Filters",
      quantity: 4,
      unit: "pieces",
      minThreshold: 5,
    },
    {
      id: "MAT-010",
      name: "Electrical Cables & Wiring",
      quantity: 20,
      unit: "rolls",
      minThreshold: 15,
    }
  ];

  const getStatus = (quantity: number, min: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= min) return "Low Stock";
    return "In Stock";
  };

  const materialsWithStatus = dummyMaterials.map(m => ({
    ...m,
    status: getStatus(m.quantity, m.minThreshold)
  }));

  const totalTypes = 18;
  const lowStockCount = materialsWithStatus.filter(m => m.status === 'Low Stock').length;
  const outOfStockCount = materialsWithStatus.filter(m => m.status === 'Out of Stock').length;

  return (
    <div className="admin-panel-content">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Materials Inventory
          </h2>
          <p className="text-gray-500">Manage stock and material availability</p>
        </div>
        <Can roles={["admin", "subadmin"]}>
          <Link to="/dashboard/add-material" className="add-btn flex items-center gap-2">
            <Plus size={16} />
            Add Material
          </Link>
        </Can>
      </div>

      {/* QUICK STATS */}
      <div className="materials-stats-grid mb-6">
        <div className="material-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper blue">
            <Box size={20} />
          </div>
          <div>
            <p className="stat-label">Material Types</p>
            <h3 className="stat-value">{totalTypes}</h3>
          </div>
        </div>
        <div className="material-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper orange">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="stat-label">Low Stock</p>
            <h3 className="stat-value">{lowStockCount}</h3>
          </div>
        </div>
        <div className="material-stat-card flex-1 sm:flex-none">
          <div className="stat-icon-wrapper red">
            <XCircle size={20} />
          </div>
          <div>
            <p className="stat-label">Out of Stock</p>
            <h3 className="stat-value">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="materials-table-container">
        <div className="table-header-actions mb-4">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search material name..." 
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
          <table className="materials-table w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="px-2">Material Info</th>
                <th className="px-2">Quantity</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materialsWithStatus.map((mat) => (
                <tr key={mat.id}>
                  <td className="px-2">
                    <div className="mat-info">
                      <h4 className="font-bold text-sm">{mat.name}</h4>
                      <p className="text-xs text-gray-500">{mat.id}</p>
                    </div>
                  </td>
                  <td className="px-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{mat.quantity} {mat.unit}</span>
                      <span className="text-xs text-gray-500">Minimum: {mat.minThreshold} {mat.unit}</span>
                    </div>
                  </td>
                  <td className="px-2">
                    <span className={`mat-status-badge ${mat.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {mat.status}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="actions-cell flex justify-end gap-1">
                      <button className="action-btn view" title="View details"><Eye size={15} /></button>
                      <button className="action-btn edit" title="Edit"><Edit2 size={15} /></button>
                      <button className="action-btn update-stock" title="Update Stock"><RefreshCw size={15} /></button>
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

export default Materials;
