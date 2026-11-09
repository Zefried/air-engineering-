import React from 'react';
import { X, Calendar, User, Briefcase, AlertTriangle, CheckCircle2, Wrench, Shield, Box } from 'lucide-react';
import type { ToolItem } from '../toolTypes';

interface ToolJourneyModalProps {
  tool: ToolItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolJourneyModal: React.FC<ToolJourneyModalProps> = ({
  tool,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const renderEventIcon = (type: string) => {
    switch (type) {
      case "CREATED":
        return <Box size={16} className="text-slate-600" />;
      case "ASSIGNED":
        return <User size={16} className="text-blue-600" />;
      case "RETURNED":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "MAINTENANCE_SENT":
      case "MAINTENANCE_RETURNED":
        return <Wrench size={16} className="text-amber-600" />;
      case "SCRAPPED":
        return <AlertTriangle size={16} className="text-rose-600" />;
      default:
        return <Shield size={16} className="text-slate-500" />;
    }
  };

  const renderEventTitle = (type: string) => {
    switch (type) {
      case "CREATED":
        return "Tool Registered in Inventory";
      case "ASSIGNED":
        return "Dispatched & Assigned to Field Worker";
      case "RETURNED":
        return "Checked-In / Returned to Crib";
      case "MAINTENANCE_SENT":
        return "Sent for Servicing / Maintenance";
      case "MAINTENANCE_RETURNED":
        return "Returned from Maintenance";
      case "SCRAPPED":
        return "Decommissioned / Scrapped (Beyond Economic Repair)";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                {tool.toolCode}
              </span>
              <h3 className="text-base font-bold text-slate-900">Tool Lifecycle & Journey Timeline</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{tool.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tool Summary Strip */}
        <div className="bg-slate-900 text-white px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Brand & Model:</span>
            <strong className="font-semibold text-slate-100">{tool.brand} ({tool.modelNo})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Serial Number:</span>
            <span className="font-mono text-slate-200">{tool.serialNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Current Status:</span>
            <span className="font-semibold text-slate-100">{tool.status} ({tool.currentCondition})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Crib Location:</span>
            <span className="text-slate-200">{tool.storageLocation}</span>
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-6">
            {tool.journey.slice().reverse().map((event) => (
              <div key={event.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>

                {/* Event Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:bg-white hover:shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {renderEventIcon(event.eventType)}
                      <h4 className="text-xs font-bold text-slate-900">
                        {renderEventTitle(event.eventType)}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> {event.timestamp}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                    {event.workerName && (
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span>Worker: <strong className="text-slate-800">{event.workerName}</strong></span>
                      </div>
                    )}
                    {event.projectName && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={13} className="text-slate-400 shrink-0" />
                        <span>Site: <strong className="text-slate-800">{event.projectName}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Conditions & Overdue flags */}
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    {event.conditionBefore && event.conditionAfter && event.conditionBefore !== event.conditionAfter ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold text-[11px]">
                        Condition Degraded: {event.conditionBefore} ➔ {event.conditionAfter}
                      </span>
                    ) : event.conditionAfter ? (
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                        Condition: <strong>{event.conditionAfter}</strong>
                      </span>
                    ) : null}

                    {event.isOverdue && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-semibold text-[11px]">
                        Overdue Return
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      Handled By: {event.handledBy}
                    </span>
                  </div>

                  {/* Notes */}
                  {event.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                      "{event.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{tool.journey.length} recorded lifecycle events</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
