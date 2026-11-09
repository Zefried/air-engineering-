import React from 'react';
import { Briefcase, Package, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import './Styles/SubAdmin.css';

export const SubAdminDashboard: React.FC = () => {
  const delegatedStats = [
    { label: "Assigned Projects", value: "5", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Pending Approvals", value: "3", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Material Requests", value: "8", icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completed Services", value: "14", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  const pendingTasks = [
    { id: "TSK-101", task: "Review materials request for Tech Park HVAC", priority: "High", due: "Today" },
    { id: "TSK-102", task: "Approve AMC service report from Rakesh Kumar", priority: "Medium", due: "Tomorrow" },
    { id: "TSK-103", task: "Verify pressure gauge calibration report", priority: "Normal", due: "14 Nov 2026" },
  ];

  return (
    <div className="admin-panel-content p-4">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Sub-Admin Operations Portal</h2>
        <p className="text-gray-500">Monitor delegated HVAC projects, reviews & field approvals</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {delegatedStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* TASKS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Pending Review & Approvals</h3>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <AlertCircle size={14} /> 3 Action Required
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                <th className="py-3 px-3">Task ID</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-750">
                  <td className="py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">{t.id}</td>
                  <td className="py-3 px-3">{t.task}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.priority === "High" ? "bg-red-50 text-red-600" :
                      t.priority === "Medium" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-600"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{t.due}</td>
                  <td className="py-3 px-3 text-right">
                    <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium transition-colors">
                      Review
                    </button>
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

export default SubAdminDashboard;
