import React, { useContext, useEffect, useState } from 'react';
import { Briefcase, Wrench, Package, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContextValue';
import { projectsApi } from '../../api/projectsApi';
import { toolsApi } from '../../api/toolsApi';
import './Styles/Manager.css';

export const ManagerDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const userName = auth?.user?.name || "Operations Manager";

  const [kpis, setKpis] = useState({
    activeSites: 3,
    toolsInField: 2,
    totalProducts: 14,
    deployedCrew: 6,
  });

  const [activeProjects, setActiveProjects] = useState<any[]>([
    { code: "PRJ-001", name: "Central Mall VRF Installation", client: "Apex Commercial", status: "in_progress" },
    { code: "PRJ-002", name: "Tech Park Precision Cooling", client: "Cyber Heights", status: "in_progress" },
    { code: "PRJ-003", name: "City Hospital Wing B Retrofit", client: "Metro Healthcare", status: "planning" },
  ]);

  useEffect(() => {
    projectsApi.getAll()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setActiveProjects(res.data.slice(0, 4));
          if (res.kpis) {
            setKpis((prev) => ({
              ...prev,
              activeSites: res.kpis.active_sites ?? prev.activeSites,
              deployedCrew: res.kpis.deployed_workers ?? prev.deployedCrew,
            }));
          }
        }
      })
      .catch(() => {});

    toolsApi.getAll()
      .then((res) => {
        if (res && res.kpis) {
          setKpis((prev) => ({
            ...prev,
            toolsInField: res.kpis.in_field ?? prev.toolsInField,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="manager-dashboard-container">
      {/* Header */}
      <div className="manager-header-row">
        <div>
          <h1 className="manager-title">HVAC Operations Manager Portal</h1>
          <p className="manager-subtitle">Welcome back, {userName} &bull; Job-site execution, equipment fleet & inventory oversight</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to="/dashboard/projects"
            style={{
              padding: '9px 16px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Briefcase size={15} /> View Projects
          </Link>
          <Link
            to="/dashboard/tools"
            style={{
              padding: '9px 16px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Wrench size={15} /> Tool Crib
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="manager-kpi-grid">
        <div className="manager-kpi-card">
          <div>
            <div className="manager-kpi-label">Active Job Sites</div>
            <div className="manager-kpi-val">{kpis.activeSites}</div>
          </div>
          <div className="manager-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Briefcase size={22} />
          </div>
        </div>

        <div className="manager-kpi-card">
          <div>
            <div className="manager-kpi-label">Tools in Field</div>
            <div className="manager-kpi-val">{kpis.toolsInField}</div>
          </div>
          <div className="manager-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Wrench size={22} />
          </div>
        </div>

        <div className="manager-kpi-card">
          <div>
            <div className="manager-kpi-label">Material Catalog</div>
            <div className="manager-kpi-val">{kpis.totalProducts}</div>
          </div>
          <div className="manager-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Package size={22} />
          </div>
        </div>

        <div className="manager-kpi-card">
          <div>
            <div className="manager-kpi-label">Crew Deployed</div>
            <div className="manager-kpi-val">{kpis.deployedCrew}</div>
          </div>
          <div className="manager-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="manager-content-grid">
        {/* Active Projects */}
        <div className="manager-section-card">
          <div className="manager-section-header">
            <h2 className="manager-section-title">Active Site Projects</h2>
            <Link to="/dashboard/projects" className="manager-quick-link">
              All Projects <ChevronRight size={14} />
            </Link>
          </div>
          <div className="manager-list">
            {activeProjects.map((p, idx) => (
              <div key={idx} className="manager-list-item">
                <div>
                  <div className="manager-item-name">{p.project_code || p.code} &mdash; {p.name}</div>
                  <div className="manager-item-sub">Client: {p.client} &bull; {p.site_location || "On-site"}</div>
                </div>
                <span className={`manager-badge ${p.status === 'in_progress' ? 'manager-badge-emerald' : 'manager-badge-blue'}`}>
                  {p.status === 'in_progress' ? 'In Progress' : 'Planning'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Quick Actions & Ledger Overview */}
        <div className="manager-section-card">
          <div className="manager-section-header">
            <h2 className="manager-section-title">Site Operations & Ledger</h2>
            <Link to="/dashboard/products" className="manager-quick-link">
              Stock Matrix <ChevronRight size={14} />
            </Link>
          </div>
          <div className="manager-list">
            <div className="manager-list-item" style={{ background: '#fdf2f8', borderColor: '#fbcfe8' }}>
              <div>
                <div className="manager-item-name" style={{ color: '#9d174d' }}>Material Movement Ledger</div>
                <div className="manager-item-sub" style={{ color: '#be185d' }}>
                  Issue materials, accept job-site returns, and audit physical adjustments
                </div>
              </div>
              <Link
                to="/dashboard/projects"
                style={{
                  padding: '6px 12px',
                  background: '#be185d',
                  color: '#ffffff',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Go to Projects
              </Link>
            </div>

            <div className="manager-list-item" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div>
                <div className="manager-item-name" style={{ color: '#166534' }}>Tool Fleet Custody</div>
                <div className="manager-item-sub" style={{ color: '#15803d' }}>
                  Assign high-value tools to technicians and track condition check-in
                </div>
              </div>
              <Link
                to="/dashboard/tools"
                style={{
                  padding: '6px 12px',
                  background: '#15803d',
                  color: '#ffffff',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Go to Tools
              </Link>
            </div>

            <div className="manager-list-item" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <div>
                <div className="manager-item-name">Field Crew Allocation</div>
                <div className="manager-item-sub">Manage site workers and technicians assigned to job sites</div>
              </div>
              <Link
                to="/dashboard/projects"
                style={{
                  padding: '6px 12px',
                  background: '#334155',
                  color: '#ffffff',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Assign Crew
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
