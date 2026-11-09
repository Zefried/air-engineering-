import { useState } from 'react';
import { Search, Plus, CheckCircle, X, Calendar, Edit2 } from 'lucide-react';
import './Styles/Contracts.css';
import { Link } from 'react-router-dom';
import { Can } from '../../Components/Auth/Can';

type AMC = {
  id: string;
  client: string;
  location: string;
  status: string;
  nextServiceDate: string;
  frequency: string;
};

const initialContracts: AMC[] = [
  { id: "AMC-001", client: "ABC Mall", location: "Guwahati", status: "Active", nextServiceDate: "31 Dec 2026", frequency: "Annually" },
  { id: "AMC-002", client: "City Hospital", location: "Dispur", status: "Due Soon", nextServiceDate: "20 Nov 2026", frequency: "Quarterly" },
  { id: "AMC-003", client: "Tech Park", location: "Guwahati", status: "Overdue", nextServiceDate: "10 Nov 2026", frequency: "Bi-Annually" },
  { id: "AMC-004", client: "Green Residency", location: "Guwahati", status: "Expiring Soon", nextServiceDate: "15 Oct 2026", frequency: "Annually" },
  { id: "AMC-005", client: "Office Complex", location: "Dispur", status: "Expired", nextServiceDate: "30 Sep 2026", frequency: "Annually" },
];

const Contracts = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Contracts");
  const [contracts, setContracts] = useState<AMC[]>(initialContracts);
  const [loggingServiceFor, setLoggingServiceFor] = useState<AMC | null>(null);

  // Form state for Log Service
  const [serviceDate, setServiceDate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("No");
  const [nextDate, setNextDate] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const tabs = ["All Contracts", "Active", "Due Soon", "Overdue", "Expiring Soon", "Expired"];

  const filteredContracts = contracts.filter(c => {
    if (activeTab !== "All Contracts" && c.status !== activeTab) return false;
    if (search && !c.client.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleLogServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!serviceDate) newErrors.serviceDate = true;
    if (!serviceType) newErrors.serviceType = true;
    if (!notes) newErrors.notes = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (loggingServiceFor) {
      setContracts(prev => prev.map(c => {
        if (c.id === loggingServiceFor.id) {
          // If contract is not expired, update next service date and set status to Active (clearing Overdue/Due Soon)
          let newStatus = c.status;
          if (c.status !== "Expired" && c.status !== "Expiring Soon") {
             newStatus = "Active";
          }
          return {
            ...c,
            status: newStatus,
            nextServiceDate: nextDate || c.nextServiceDate 
          };
        }
        return c;
      }));
    }

    // Reset and close
    closeModal();
  };

  const closeModal = () => {
    setLoggingServiceFor(null);
    setServiceDate("");
    setServiceType("");
    setTechnician("");
    setNotes("");
    setPartsUsed("No");
    setNextDate("");
    setErrors({});
  };

  return (
    <div className="admin-panel-content relative">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contracts</h2>
          <p className="text-gray-500">Annual Maintenance Contracts</p>
        </div>
        <Can roles={["admin"]}>
          <Link to="/dashboard/add-contract" className="add-btn flex items-center gap-2">
            <Plus size={16} />
            Add Contract
          </Link>
        </Can>
      </div>

      <div className="contracts-table-container">
        <div className="table-header-actions mb-4">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search contract or client..." 
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

        <div className="mb-2 text-sm text-gray-500 font-medium">Contract list &bull; {filteredContracts.length} records</div>

        <div className="table-responsive">
          <table className="contracts-table w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="px-2">Client Info</th>
                <th className="px-2">Status</th>
                <th className="px-2">Next Service</th>
                <th className="px-2">Frequency</th>
                <th className="text-right px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">{contract.client}</h4>
                      <p className="text-xs text-gray-500">{contract.id} &bull; {contract.location}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`contract-badge ${contract.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {contract.nextServiceDate || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {contract.frequency}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-3 items-center pr-2">
                      <button className="action-btn-text text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Edit2 size={14} /> View / Edit
                      </button>
                      <button 
                        onClick={() => setLoggingServiceFor(contract)}
                        className="action-btn-text text-teal-700 bg-teal-50 hover:bg-teal-100 dark:text-teal-300 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 shadow-sm"
                      >
                        <CheckCircle size={14} /> Log Service
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {loggingServiceFor && (
        <div className="modal-backdrop">
          <div className="service-modal">
            <div className="modal-header">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Log Service</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Record a completed AMC visit</p>
              </div>
              <button onClick={closeModal} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-context-box">
              <h4>{loggingServiceFor.client}</h4>
              <p>Contract ID: {loggingServiceFor.id} &bull; Contract status: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loggingServiceFor.status}</span></p>
            </div>

            <form onSubmit={handleLogServiceSubmit} className="service-form text-left">
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>Service details</h4>
              
              <div className="modal-form-group">
                <label>Service completion date <span className="text-red-500">*</span></label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} className={`modal-input has-icon ${errors.serviceDate ? 'border-red-500' : ''}`} />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Service type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {['Routine maintenance', 'Repair', 'Inspection', 'Emergency visit'].map(type => (
                    <label key={type} className={`service-type-box ${serviceType === type ? 'selected' : ''}`}>
                      <input type="radio" name="serviceType" value={type} checked={serviceType === type} onChange={() => setServiceType(type)} className="hidden" />
                      {type}
                    </label>
                  ))}
                </div>
                {errors.serviceType && <p className="text-xs text-red-500 mt-1">Please select a service type.</p>}
              </div>

              <div className="modal-form-group">
                <label>Technician</label>
                <select value={technician} onChange={e => setTechnician(e.target.value)} className="modal-input">
                  <option value="">Select technician...</option>
                  <option value="Rakesh Kumar">Rakesh Kumar</option>
                  <option value="Amit Das">Amit Das</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>Service notes <span className="text-red-500">*</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`modal-input ${errors.notes ? 'border-red-500' : ''}`} placeholder="Details of work performed..."></textarea>
              </div>

              <div className="modal-form-group">
                <label>Were any parts or materials used?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-[13.5px] cursor-pointer font-medium" style={{ color: 'var(--text-primary)' }}>
                    <input type="radio" checked={partsUsed === "No"} onChange={() => setPartsUsed("No")} style={{ accentColor: 'var(--accent)' }} /> No
                  </label>
                  <label className="flex items-center gap-1.5 text-[13.5px] cursor-pointer font-medium" style={{ color: 'var(--text-primary)' }}>
                    <input type="radio" checked={partsUsed === "Yes"} onChange={() => setPartsUsed("Yes")} style={{ accentColor: 'var(--accent)' }} /> Yes
                  </label>
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label>Next service date (optional)</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="modal-input has-icon" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
