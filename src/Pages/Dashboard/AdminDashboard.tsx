import React from 'react';
import { ToolsReportSection } from '../Reports/ToolsReportPage';
import { ReportNavTabs } from '../Reports/Components/ReportNavTabs';
import './Styles/AdminPanel.css';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto min-w-0 p-0 sm:p-4">
      {/* QUICK REPORTS SWITCHER PILL TABS */}
      <div style={{ padding: '0 10px' }}>
        <ReportNavTabs />
      </div>

      {/* TOOLS REPORTING OPERATIONS DASHBOARD (PIXEL-PERFECT MOBILE DESIGN) */}
      <ToolsReportSection showHeader={true} />
    </div>
  );
};

export default AdminDashboard;
