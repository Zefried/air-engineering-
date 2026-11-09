import React from 'react';
import { Wrench, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import './Styles/Technician.css';

export const TechnicianDashboard: React.FC = () => {
  const myAssignedTools = [
    { id: "TL-014", name: "Impact Drill", condition: "Good", category: "Power Tools" },
    { id: "TL-031", name: "Digital Manifold Gauge", condition: "New", category: "Measuring" },
  ];

  const todaysSchedule = [
    { client: "City Hospital - Wing B", service: "Quarterly HVAC Inspection", time: "11:00 AM", location: "Dispur, Guwahati", status: "Pending" },
    { client: "Sunrise Residency", service: "Chiller Leak Check", time: "03:30 PM", location: "Guwahati", status: "Upcoming" },
  ];

  return (
    <div className="admin-panel-content p-4">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Technician Field Portal</h2>
          <p className="text-gray-500">Your assigned jobs, tools, and scheduled service visits</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm">
          <Clock size={16} /> Log Service Entry
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Today's Visits</p>
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">2</h3>
          </div>
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Tools in Hand</p>
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">2</h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Wrench size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Completed This Month</p>
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">12</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TODAY'S SCHEDULE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Today's Service Schedule</h3>
          <div className="space-y-4">
            {todaysSchedule.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.client}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {item.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.service}</p>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MY ASSIGNED TOOLS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Assigned Equipment</h3>
          <div className="space-y-4">
            {myAssignedTools.map((tool) => (
              <div key={tool.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h4>
                  <p className="text-xs text-gray-500">ID: {tool.id} &bull; {tool.category}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {tool.condition} Condition
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
