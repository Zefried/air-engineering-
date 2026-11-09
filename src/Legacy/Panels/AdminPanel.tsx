import React, { useState } from 'react';
import { Users, Building2, Wrench, AlertTriangle, User, Edit3, ChevronRight, FileText, Clock } from 'lucide-react';
import './Styles/AdminPanel.css';

const AdminPanel = () => {
  // Image links arrays for you to paste later
  const inventoryImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrHxDGzx6IHLbWriMXfbFXGPd9sTAODE4LWMpdhuuBpA&s=10", // Copper Pipes
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsr22luuXjJHtoeRSirFFWQgfideqYkChslHr837473ZqvXjpUPsiFumKj&s=10", // Refrigerant Gas
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7IPoXG8DvETXgp4Cc-669z58tdRr4WFN1_gAiDjYVtdOZSf-0r65aRI8&s=10", // Nuts
  ];

  const toolImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAH-qrhi4yk21ITEM687L46opIkO9r40QfQcfdmkkFMQyNDaVRwqhOdkPB&s=10", // Impact Drill
    "https://m.media-amazon.com/images/I/51GbxjkeMbL.jpg", // Pipe Cutter", // Impact Drill
    "", // Pipe Cutter
  ];

  const projectImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYt-X1--KPTbcq2wKWLFjjn5xRcChr4TKofz8GWK2o0ii4HOS0kZxRHsjx&s=10", // Central Mall HVAC
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9ijoSrjnMc0mSkJgEdlV4l0lRCIWmKIlMSURYQSJDWxHEHVh7tJHsvBSY&s=10", // Tech Park Server Room
    "https://upload.wikimedia.org/wikipedia/commons/9/90/Belfast_City_Hospital.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original", // City Hospital Wing B
  ];

  const dummyProjects = [
    {
      id: 1,
      name: "Central Mall HVAC",
      manager: "Rahul Sharma",
      progress: 65,
      notes: "Installation ongoing.",
    },
    {
      id: 2,
      name: "Tech Park Server Room",
      manager: "Amit Das",
      progress: 82,
      notes: "Testing cooling units.",
    },
    {
      id: 3,
      name: "City Hospital Wing B",
      manager: "Priya Singh",
      progress: 30,
      notes: "Ductwork in progress. Waiting on material.",
    },
  ];

  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  const handleNextProject = () => {
    if (currentProjectIndex < dummyProjects.length - 1) {
      setCurrentProjectIndex((prev) => prev + 1);
    }
  };

  const handlePrevProject = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex((prev) => prev - 1);
    }
  };

  const currentProject = dummyProjects[currentProjectIndex];

  const expiringAmcs = [
    { id: "AMC-004", client: "Green Residency", location: "Guwahati", manager: "Rakesh Kumar", date: "15 Oct 2026" },
    { id: "AMC-008", client: "Sunrise Apartments", location: "Dispur", manager: "Amit Das", date: "18 Oct 2026" },
    { id: "AMC-012", client: "Blue Wave Mall", location: "Guwahati", manager: "Priya Singh", date: "22 Oct 2026" }
  ];

  const expiredAmcs = [
    { id: "AMC-005", client: "Office Complex", location: "Dispur", manager: "Amit Das", date: "30 Sep 2026" },
    { id: "AMC-002", client: "City Hospital Wing A", location: "Dispur", manager: "Rahul Sharma", date: "15 Sep 2026" },
    { id: "AMC-009", client: "Tech Park Block C", location: "Guwahati", manager: "Priya Singh", date: "10 Aug 2026" }
  ];

  const [currentExpiringIndex, setCurrentExpiringIndex] = useState(0);
  const [currentExpiredIndex, setCurrentExpiredIndex] = useState(0);

  const handleNextExpiring = () => { if (currentExpiringIndex < expiringAmcs.length - 1) setCurrentExpiringIndex(prev => prev + 1); };
  const handlePrevExpiring = () => { if (currentExpiringIndex > 0) setCurrentExpiringIndex(prev => prev - 1); };

  const handleNextExpired = () => { if (currentExpiredIndex < expiredAmcs.length - 1) setCurrentExpiredIndex(prev => prev + 1); };
  const handlePrevExpired = () => { if (currentExpiredIndex > 0) setCurrentExpiredIndex(prev => prev - 1); };

  const currentExpiring = expiringAmcs[currentExpiringIndex];
  const currentExpired = expiredAmcs[currentExpiredIndex];

  return (
    <div className="admin-panel-content p-4">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500">Overview of your field operations</p>
      </div>

      {/* STATS CARDS */}
      <section className="stats-grid flex gap-4 mb-8">
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon mb-3">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">24</h3>
            <p className="text-sm text-gray-500">Total Employees</p>
          </div>
        </div>
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon mb-3">
            <Building2 size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">8</h3>
            <p className="text-sm text-gray-500">Active Projects</p>
          </div>
        </div>
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon mb-3">
            <Wrench size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">36</h3>
            <p className="text-sm text-gray-500">Tools in Use</p>
          </div>
        </div>
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon warning mb-3">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">5</h3>
            <p className="text-sm text-gray-500">Damaged / Retired</p>
          </div>
        </div>
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon mb-3" style={{ background: 'var(--warning-light, #fff7ed)', color: 'var(--warning, #c2410c)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">4</h3>
            <p className="text-sm text-gray-500">Expiring AMCs</p>
          </div>
        </div>
        <div className="stat-card flex-1 p-5 rounded-lg">
          <div className="stat-icon mb-3" style={{ background: 'var(--page-bg, #f4f7fb)', color: 'var(--text-secondary, #718096)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-details">
            <h3 className="text-3xl font-bold">1</h3>
            <p className="text-sm text-gray-500">Expired AMCs</p>
          </div>
        </div>
      </section>

      {/* INVENTORY SECTION */}
      <section className="inventory-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Global Inventory — Low Stock</h3>
            <p className="text-gray-500 text-sm">Materials at or below their minimum stock threshold</p>
          </div>
          <button className="view-all-btn text-sm font-semibold flex items-center gap-1">View All <ChevronRight size={14} /></button>
        </div>

        <div className="inventory-list flex gap-4">
          {/* Item 1 */}
          <div className="inventory-card flex-1 flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow items-center">
            <div className="item-image-container w-16 h-16 bg-gray-200 rounded">
              {inventoryImages[0] ? <img src={inventoryImages[0]} alt="Copper Pipes" className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
            </div>
            <div className="item-details">
              <h4 className="font-bold">Copper Pipes</h4>
              <p className="text-sm text-yellow-600 mb-1">3 coils</p>
              <span className="badge warning px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Low stock</span>
            </div>
          </div>
          {/* Item 2 */}
          <div className="inventory-card flex-1 flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow items-center">
            <div className="item-image-container w-16 h-16 bg-gray-200 rounded">
              {inventoryImages[1] ? <img src={inventoryImages[1]} alt="Refrigerant Gas" className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
            </div>
            <div className="item-details">
              <h4 className="font-bold">Refrigerant Gas</h4>
              <p className="text-sm text-yellow-600 mb-1">2 cylinders</p>
              <span className="badge warning px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Low stock</span>
            </div>
          </div>
          {/* Item 3 */}
          <div className="inventory-card flex-1 flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow items-center">
            <div className="item-image-container w-16 h-16 bg-gray-200 rounded">
              {inventoryImages[2] ? <img src={inventoryImages[2]} alt="Nuts" className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
            </div>
            <div className="item-details">
              <h4 className="font-bold">Nuts</h4>
              <p className="text-sm text-yellow-600 mb-1">4 packets</p>
              <span className="badge warning px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Low stock</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS TO REPLACE SECTION */}
      <section className="tools-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Tools to Replace</h3>
            <p className="text-gray-500 text-sm">Permanently retired tools only</p>
          </div>
          <button className="view-all-btn text-sm font-semibold flex items-center gap-1">View All <ChevronRight size={14} /></button>
        </div>

        <div className="tools-list flex flex-col gap-4">
          {/* Tool 1 */}
          <div className="tool-list-item flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="tool-info flex items-center gap-4 w-1/3">
              <div className="tool-image w-12 h-12 bg-gray-200 rounded">
                {toolImages[0] ? <img src={toolImages[0]} alt="Impact Drill" className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
              </div>
              <div>
                <h4 className="font-bold">Impact Drill</h4>
                <p className="text-sm text-gray-500">ID: TL-014</p>
              </div>
            </div>
            <div className="tool-employee flex items-center gap-4 w-1/3">
              <div className="employee-icon w-8 h-8 rounded-full">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Associated employee:</p>
                <span className="text-sm font-semibold">Rakesh Kumar</span>
              </div>
            </div>
            <div className="tool-status w-1/3 flex justify-end">
              <span className="badge danger px-3 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-200">Retired</span>
            </div>
          </div>

          {/* Tool 2 */}
          <div className="tool-list-item flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="tool-info flex items-center gap-4 w-1/3">
              <div className="tool-image w-12 h-12 bg-gray-200 rounded">
                {toolImages[1] ? <img src={toolImages[1]} alt="Pipe Cutter" className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
              </div>
              <div>
                <h4 className="font-bold">Pipe Cutter</h4>
                <p className="text-sm text-gray-500">ID: TL-022</p>
              </div>
            </div>
            <div className="tool-employee flex items-center gap-4 w-1/3">
              <div className="employee-icon w-8 h-8 rounded-full">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Associated employee:</p>
                <span className="text-sm font-semibold">Amit Das</span>
              </div>
            </div>
            <div className="tool-status w-1/3 flex justify-end">
              <span className="badge danger px-3 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-200">Retired</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT PROGRESS SECTION */}
      <section className="project-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Project Progress</h3>
            <p className="text-gray-500 text-sm">Track progress, assigned managers and notes</p>
          </div>
          <div className="pagination flex items-center gap-2">
            <button
              className={`px-2 py-1 rounded text-sm ${currentProjectIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handlePrevProject}
              disabled={currentProjectIndex === 0}
            >{'<'}</button>
            <span className="text-sm font-semibold">Project {currentProjectIndex + 1} of {dummyProjects.length}</span>
            <button
              className={`px-2 py-1 rounded text-sm ${currentProjectIndex === dummyProjects.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handleNextProject}
              disabled={currentProjectIndex === dummyProjects.length - 1}
            >{'>'}</button>
          </div>
        </div>

        <div className="project-card flex gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="project-info flex gap-4 w-1/3">
            <div className="project-image w-24 h-24 bg-gray-200 rounded">
              {projectImages[currentProjectIndex] ? <img src={projectImages[currentProjectIndex]} alt={currentProject.name} className="w-full h-full object-cover rounded" /> : <div className="placeholder-img"></div>}
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold mb-2">{currentProject.name}</h4>
              <div className="project-manager flex items-center gap-2">
                <div className="manager-icon w-6 h-6 rounded-full">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned Manager</p>
                  <span className="text-sm font-semibold">{currentProject.manager}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="project-progress-tracker w-1/3 flex flex-col justify-center border-l border-r border-gray-200 dark:border-gray-700 px-6">
            <div className="progress-header flex justify-between mb-2">
              <span className="progress-label text-sm text-gray-500">Progress</span>
              <span className="progress-value font-bold text-teal-500">{currentProject.progress}%</span>
            </div>
            <div className="progress-bar-container h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="progress-bar h-full bg-teal-500 rounded-full" style={{ width: `${currentProject.progress}%` }}></div>
            </div>
          </div>

          <div className="project-notes w-1/3 flex flex-col justify-center pl-6">
            <div className="notes-header flex items-center gap-2 mb-2">
              <Edit3 size={14} className="text-gray-500" />
              <span className="text-sm text-gray-500">Manager Notes</span>
            </div>
            <div className="notes-content bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
              <p>{currentProject.notes}</p>
            </div>
          </div>
        </div>
      </section>

      {/* AMC EXPIRING SOON SECTION */}
      <section className="amc-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">AMCs Expiring Soon</h3>
            <p className="text-gray-500 text-sm">Contracts requiring renewal within 30 days</p>
          </div>
          <div className="pagination flex items-center gap-2">
            <button
              className={`px-2 py-1 rounded text-sm ${currentExpiringIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handlePrevExpiring}
              disabled={currentExpiringIndex === 0}
            >{'<'}</button>
            <span className="text-sm font-semibold">Contract {currentExpiringIndex + 1} of {expiringAmcs.length}</span>
            <button
              className={`px-2 py-1 rounded text-sm ${currentExpiringIndex === expiringAmcs.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handleNextExpiring}
              disabled={currentExpiringIndex === expiringAmcs.length - 1}
            >{'>'}</button>
          </div>
        </div>

        <div className="tools-list flex flex-col gap-4">
          <div className="tool-list-item flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="tool-info flex items-center gap-4 w-1/3">
              <div className="tool-image w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold">{currentExpiring.client}</h4>
                <p className="text-sm text-gray-500">ID: {currentExpiring.id} &bull; {currentExpiring.location}</p>
              </div>
            </div>
            <div className="tool-employee flex items-center gap-4 w-1/3">
              <div className="employee-icon w-8 h-8 rounded-full">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned Tech:</p>
                <span className="text-sm font-semibold">{currentExpiring.manager}</span>
              </div>
            </div>
            <div className="tool-status w-1/3 flex justify-end flex-col items-end">
              <span className="badge warning px-3 py-1 text-xs rounded bg-orange-100 text-orange-800 border border-orange-200 mb-1 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50">Expiring Soon</span>
              <span className="text-xs text-gray-500 font-medium">{currentExpiring.date}</span>
            </div>
          </div>
        </div>
      </section>

      {/* AMC EXPIRED SECTION */}
      <section className="amc-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Expired AMCs</h3>
            <p className="text-gray-500 text-sm">Contracts that have lapsed</p>
          </div>
          <div className="pagination flex items-center gap-2">
            <button
              className={`px-2 py-1 rounded text-sm ${currentExpiredIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handlePrevExpired}
              disabled={currentExpiredIndex === 0}
            >{'<'}</button>
            <span className="text-sm font-semibold">Contract {currentExpiredIndex + 1} of {expiredAmcs.length}</span>
            <button
              className={`px-2 py-1 rounded text-sm ${currentExpiredIndex === expiredAmcs.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              onClick={handleNextExpired}
              disabled={currentExpiredIndex === expiredAmcs.length - 1}
            >{'>'}</button>
          </div>
        </div>

        <div className="tools-list flex flex-col gap-4">
          <div className="tool-list-item flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="tool-info flex items-center gap-4 w-1/3">
              <div className="tool-image w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold">{currentExpired.client}</h4>
                <p className="text-sm text-gray-500">ID: {currentExpired.id} &bull; {currentExpired.location}</p>
              </div>
            </div>
            <div className="tool-employee flex items-center gap-4 w-1/3">
              <div className="employee-icon w-8 h-8 rounded-full">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned Tech:</p>
                <span className="text-sm font-semibold">{currentExpired.manager}</span>
              </div>
            </div>
            <div className="tool-status w-1/3 flex justify-end flex-col items-end">
              <span className="badge expired px-3 py-1 text-xs rounded bg-gray-100 text-gray-600 border border-gray-200 mb-1 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">Expired</span>
              <span className="text-xs text-gray-500 font-medium">{currentExpired.date}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;