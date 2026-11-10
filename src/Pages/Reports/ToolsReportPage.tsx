import React, { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Phone,
  RefreshCw,
  Users,
  ChevronRight,
  Filter,
  Sparkles,
  MapPin,
  User,
  X,
  Layers,
  ShieldAlert,
  Check,
} from "lucide-react";
import toolsReportApi from "../../api/toolsReportApi";
import type {
  ToolsReportSummaryResponse,
  TechnicianOptionItem,
  WorkerHoldingItem,
  DamagedHistoryItem,
} from "../../api/toolsReportApi";
import "./Styles/ToolsReport.css";

interface ToolsReportProps {
  showHeader?: boolean;
  defaultWorkerId?: string | number;
}

export const ToolsReportSection: React.FC<ToolsReportProps> = ({
  showHeader = true,
  defaultWorkerId = "all",
}) => {
  const [data, setData] = useState<ToolsReportSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | number>(defaultWorkerId);
  const [techniciansList, setTechniciansList] = useState<TechnicianOptionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"overdue" | "worker" | "history" | "in_field">("overdue");

  // Modals & Drawers
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [tempWorkerId, setTempWorkerId] = useState<string | number>(defaultWorkerId);
  const [tempStatus, setTempStatus] = useState<"overdue" | "in_field" | "damaged" | "in_service">("overdue");

  const [activeToolModal, setActiveToolModal] = useState<any | null>(null);
  const [activeWorkerModal, setActiveWorkerModal] = useState<WorkerHoldingItem | null>(null);
  const [activeDamageModal, setActiveDamageModal] = useState<DamagedHistoryItem | null>(null);

  const fetchReport = async (workerIdToFetch: string | number = selectedWorkerId) => {
    try {
      setLoading(true);
      const res = await toolsReportApi.getSummary(workerIdToFetch);
      setData(res);

      if (res.technicians_list && res.technicians_list.length > 0) {
        setTechniciansList(res.technicians_list);
      }
    } catch (err) {
      console.error("Failed to load tools report summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedWorkerId);
    setTempWorkerId(selectedWorkerId);
  }, [selectedWorkerId]);

  const handleOpenFilterDrawer = () => {
    setTempWorkerId(selectedWorkerId);
    if (activeTab === "overdue") setTempStatus("overdue");
    else if (activeTab === "in_field") setTempStatus("in_field");
    else if (activeTab === "history") setTempStatus("damaged");
    else setTempStatus("overdue");
    setIsFilterDrawerOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedWorkerId(tempWorkerId);
    if (tempStatus === "overdue") setActiveTab("overdue");
    else if (tempStatus === "in_field") setActiveTab("in_field");
    else if (tempStatus === "damaged") setActiveTab("history");
    else setActiveTab("overdue");
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setTempWorkerId("all");
    setTempStatus("overdue");
    setSelectedWorkerId("all");
    setActiveTab("overdue");
    setIsFilterDrawerOpen(false);
  };

  const closeModal = () => {
    setActiveToolModal(null);
    setActiveWorkerModal(null);
    setActiveDamageModal(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isWorkerSpecific = data?.is_worker_specific ?? false;
  const kpis = data?.kpis;
  const overdueTools = data?.overdue_tools || [];
  const workerHoldings = data?.worker_holdings || [];
  const damagedHistory = data?.damaged_history || [];

  // Current filter label
  const selectedTechObj = techniciansList.find((t) => String(t.id) === String(selectedWorkerId));
  const currentFilterLabel = selectedTechObj
    ? selectedTechObj.name
    : "All Technicians";

  return (
    <div className="tools-mobile-dashboard">
      {/* Top Ambient Violet Wave */}
      <div className="dashboard-top-ambient" />

      {/* Header Block */}
      {showHeader && (
        <div className="dashboard-header-block">
          <div className="flex items-center justify-between">
            <h1 className="dashboard-header-title">
              Tools Reporting — Operations Dashboard
            </h1>
            <button
              onClick={() => fetchReport(selectedWorkerId)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition"
              title="Refresh Report"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="dashboard-header-desc">
            Live equipment tracking, technician assignments, and overdue recovery
          </p>
        </div>
      )}

      {/* Top Filter Trigger Bar (Matches Screenshot) */}
      <div
        className="filter-selector-trigger"
        onClick={handleOpenFilterDrawer}
        role="button"
        tabIndex={0}
      >
        <div className="filter-selector-left">
          <div className="filter-icon-wrap">
            <Filter className="w-4 h-4" />
          </div>
          <span className="filter-selector-text">{currentFilterLabel}</span>
        </div>
        <ChevronRight className="w-4 h-4 filter-selector-chevron rotate-90" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading equipment data...</p>
        </div>
      ) : isWorkerSpecific ? (
        /* ========================================================
           WORKER-SPECIFIC DRILLDOWN VIEW
           ======================================================== */
        <div>
          {/* Worker Hero Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white font-black text-lg flex items-center justify-center">
                {data?.worker_profile?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {data?.worker_profile?.name}
                  <span className="text-[10px] font-bold uppercase bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md">
                    {data?.worker_profile?.role || "Technician"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  📞 {data?.worker_profile?.phone || "No phone saved"} &bull; {data?.worker_kpis?.active_tools_count || 0} Tools in hand
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedWorkerId("all")}
              className="text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 transition"
            >
              All Techs
            </button>
          </div>

          {/* Assigned Tools List */}
          <div className="tool-cards-list">
            {(data?.active_tools || []).map((tool) => (
              <div
                key={tool.id}
                className="tool-modern-card"
                onClick={() =>
                  setActiveToolModal({
                    ...tool,
                    worker_name: data?.worker_profile?.name,
                    worker_phone: data?.worker_profile?.phone,
                  })
                }
              >
                <div className="tool-card-left">
                  <div className="tool-icon-square">
                    <Wrench className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="tool-card-info">
                    <div className="tool-card-title-row">
                      <span className="tool-card-title">{tool.name}</span>
                      {tool.is_overdue ? (
                        <span className="badge-late">LATE</span>
                      ) : (
                        <span className="badge-active">ACTIVE</span>
                      )}
                    </div>
                    <div className="tool-card-subrow">
                      <User className="w-3.5 h-3.5" />
                      <span>{data?.worker_profile?.name}</span>
                    </div>
                    <div className="tool-card-subrow">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{tool.project_name || "General Site"}</span>
                    </div>
                  </div>
                </div>
                <div className="tool-card-right">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================
           OVERALL FLEET VIEW (EXACT SCREENSHOT LAYOUT)
           ======================================================== */
        <div>
          {/* 2x2 Metric Cards Grid */}
          <div className="kpi-2x2-grid">
            {/* Card 1: Overdue / Late */}
            <div
              className={`kpi-modern-card ${activeTab === "overdue" ? "active" : ""}`}
              onClick={() => setActiveTab("overdue")}
            >
              <div className="kpi-card-top">
                <div className="flex items-center min-w-0">
                  <div className="kpi-icon-pill red">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="kpi-card-label">Overdue / Late</span>
                </div>
                <ChevronRight className="w-4 h-4 kpi-card-arrow" />
              </div>
              <div>
                <div className="kpi-card-value">{kpis?.overdue_count || 0}</div>
                <div className="kpi-card-sub">Action required</div>
              </div>
            </div>

            {/* Card 2: In Field (Site PE) */}
            <div
              className={`kpi-modern-card ${activeTab === "in_field" ? "active" : ""}`}
              onClick={() => setActiveTab("in_field")}
            >
              <div className="kpi-card-top">
                <div className="flex items-center min-w-0">
                  <div className="kpi-icon-pill purple">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="kpi-card-label">In Field (Site PE)</span>
                </div>
                <ChevronRight className="w-4 h-4 kpi-card-arrow" />
              </div>
              <div>
                <div className="kpi-card-value">{kpis?.in_field_count || 0}</div>
                <div className="kpi-card-sub">Ongoing jobs</div>
              </div>
            </div>

            {/* Card 3: Technicians */}
            <div
              className={`kpi-modern-card ${activeTab === "worker" ? "active" : ""}`}
              onClick={() => setActiveTab("worker")}
            >
              <div className="kpi-card-top">
                <div className="flex items-center min-w-0">
                  <div className="kpi-icon-pill blue">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <span className="kpi-card-label">Technicians</span>
                </div>
                <ChevronRight className="w-4 h-4 kpi-card-arrow" />
              </div>
              <div>
                <div className="kpi-card-value">{workerHoldings.length || techniciansList.length}</div>
                <div className="kpi-card-sub">Handling tools</div>
              </div>
            </div>

            {/* Card 4: Needs Repair */}
            <div
              className={`kpi-modern-card ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <div className="kpi-card-top">
                <div className="flex items-center min-w-0">
                  <div className="kpi-icon-pill green">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="kpi-card-label">Needs Repair</span>
                </div>
                <ChevronRight className="w-4 h-4 kpi-card-arrow" />
              </div>
              <div>
                <div className="kpi-card-value">{kpis?.damaged_count || 0}</div>
                <div className="kpi-card-sub">Service needed</div>
              </div>
            </div>
          </div>

          {/* Segmented Filter Tab Pills */}
          <div className="segmented-pill-bar">
            <button
              className={`segmented-pill ${activeTab === "overdue" ? "active" : ""}`}
              onClick={() => setActiveTab("overdue")}
            >
              <span>Late / Overdue</span>
              <span className="segmented-pill-count">{kpis?.overdue_count || 0}</span>
            </button>

            <button
              className={`segmented-pill ${activeTab === "worker" ? "active" : ""}`}
              onClick={() => setActiveTab("worker")}
            >
              <span>By Worker</span>
            </button>

            <button
              className={`segmented-pill ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <span>History</span>
            </button>
          </div>

          {/* Insight Banner (Matches Screenshot) */}
          <div className="insight-banner">
            <Sparkles className="w-4 h-4 insight-icon" />
            <p className="insight-text">
              <strong>Insight:</strong>{" "}
              {(kpis?.overdue_count || 0) > 0
                ? `${kpis?.overdue_count} tools are overdue. Prioritise follow-up with the assigned technicians.`
                : "All tools are currently on time across active projects."}
            </p>
          </div>

          {/* List of Cards Based on Selected Tab */}
          {activeTab === "overdue" && (
            <div className="tool-cards-list">
              {overdueTools.length === 0 ? (
                <div className="empty-state-modern">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="empty-state-title">All Tools On Time</div>
                  <p className="empty-state-desc">Currently no tools are overdue.</p>
                </div>
              ) : (
                overdueTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="tool-modern-card"
                    onClick={() => setActiveToolModal(tool)}
                  >
                    <div className="tool-card-left">
                      <div className="tool-icon-square">
                        <Wrench className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="tool-card-info">
                        <div className="tool-card-title-row">
                          <span className="tool-card-title">{tool.name}</span>
                          <span className="badge-late">LATE</span>
                        </div>
                        <div className="tool-card-subrow">
                          <User className="w-3.5 h-3.5" />
                          <span>{tool.worker_name}</span>
                        </div>
                        <div className="tool-card-subrow">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{tool.project_name || "General Site"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tool-card-right">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "in_field" && (
            <div className="tool-cards-list">
              {workerHoldings.flatMap((w) =>
                w.tools.map((tool) => (
                  <div
                    key={`${w.worker_id}-${tool.id}`}
                    className="tool-modern-card"
                    onClick={() =>
                      setActiveToolModal({
                        ...tool,
                        worker_name: w.worker_name,
                        worker_phone: w.worker_phone,
                        assigned_worker_id: w.worker_id,
                      })
                    }
                  >
                    <div className="tool-card-left">
                      <div className="tool-icon-square">
                        <Layers className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="tool-card-info">
                        <div className="tool-card-title-row">
                          <span className="tool-card-title">{tool.name}</span>
                          {tool.is_overdue ? (
                            <span className="badge-late">LATE</span>
                          ) : (
                            <span className="badge-active">IN FIELD</span>
                          )}
                        </div>
                        <div className="tool-card-subrow">
                          <User className="w-3.5 h-3.5" />
                          <span>{w.worker_name}</span>
                        </div>
                        <div className="tool-card-subrow">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{tool.project_name || "General Site"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tool-card-right">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "worker" && (
            <div className="tool-cards-list">
              {workerHoldings.map((worker) => (
                <div
                  key={worker.worker_id}
                  className="tool-modern-card"
                  onClick={() => setActiveWorkerModal(worker)}
                >
                  <div className="tool-card-left">
                    <div className="tool-icon-square" style={{ background: "#ede9fe", color: "#6347d1" }}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="tool-card-info">
                      <div className="tool-card-title-row">
                        <span className="tool-card-title">{worker.worker_name}</span>
                        {worker.has_overdue && <span className="badge-late">LATE</span>}
                      </div>
                      <div className="tool-card-subrow">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{worker.worker_phone || "No phone saved"}</span>
                      </div>
                      <div className="tool-card-subrow">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>
                          {worker.active_tools_count} {worker.active_tools_count === 1 ? "tool" : "tools"} &bull; {formatCurrency(worker.total_holding_value)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tool-card-right">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="tool-cards-list">
              {damagedHistory.length === 0 ? (
                <div className="empty-state-modern">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="empty-state-title">No Service Incidents</div>
                  <p className="empty-state-desc">All tools in operational condition.</p>
                </div>
              ) : (
                damagedHistory.map((item) => (
                  <div
                    key={item.journey_id}
                    className="tool-modern-card"
                    onClick={() => setActiveDamageModal(item)}
                  >
                    <div className="tool-card-left">
                      <div className="tool-icon-square" style={{ background: "#fee2e2", color: "#dc2626" }}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="tool-card-info">
                        <div className="tool-card-title-row">
                          <span className="tool-card-title">{item.name}</span>
                          <span className="badge-late">REPAIR</span>
                        </div>
                        <div className="tool-card-subrow">
                          <User className="w-3.5 h-3.5" />
                          <span>{item.worker_name || "Technician"}</span>
                        </div>
                        <div className="tool-card-subrow">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.project_name || "Site"} &bull; {item.formatted_date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tool-card-right">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SCREEN 2: FILTER REPORTS BOTTOM SHEET DRAWER
          (PIXEL-PERFECT REPLICA OF USER UPLOADED SCREENSHOT)
          ======================================================== */}
      {isFilterDrawerOpen && (
        <div className="filter-drawer-backdrop" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="filter-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drag-bar" />

            <div className="filter-drawer-header">
              <div className="filter-drawer-title-group">
                <div className="filter-header-icon-box">
                  <Filter className="w-4 h-4" />
                </div>
                <h3 className="filter-drawer-title">Filter Reports</h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="filter-close-btn"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Field 1: Technician Dropdown */}
            <div className="filter-field-group">
              <label className="filter-field-label">Technician</label>
              <select
                className="filter-select-input"
                value={tempWorkerId}
                onChange={(e) => setTempWorkerId(e.target.value)}
              >
                <option value="all">All Technicians</option>
                {techniciansList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.active_tools_count} {t.active_tools_count === 1 ? "Tool" : "Tools"}
                    {t.has_overdue ? " • Late" : ""})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Status 2x2 Toggle Chips Grid */}
            <div className="filter-field-group">
              <label className="filter-field-label">Status</label>
              <div className="status-chip-grid">
                {/* Chip 1: Overdue / Late */}
                <div
                  className={`status-chip ${tempStatus === "overdue" ? "selected" : ""}`}
                  onClick={() => setTempStatus("overdue")}
                >
                  <div className="status-radio-icon">
                    {tempStatus === "overdue" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Overdue / Late</span>
                </div>

                {/* Chip 2: In Field (Site PE) */}
                <div
                  className={`status-chip ${tempStatus === "in_field" ? "selected" : ""}`}
                  onClick={() => setTempStatus("in_field")}
                >
                  <div className="status-radio-icon">
                    {tempStatus === "in_field" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>In Field (Site PE)</span>
                </div>

                {/* Chip 3: Needs Repair */}
                <div
                  className={`status-chip ${tempStatus === "damaged" ? "selected" : ""}`}
                  onClick={() => setTempStatus("damaged")}
                >
                  <div className="status-radio-icon">
                    {tempStatus === "damaged" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Needs Repair</span>
                </div>

                {/* Chip 4: In Service */}
                <div
                  className={`status-chip ${tempStatus === "in_service" ? "selected" : ""}`}
                  onClick={() => setTempStatus("in_service")}
                >
                  <div className="status-radio-icon">
                    {tempStatus === "in_service" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>In Service</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="filter-actions-block">
              <button onClick={handleApplyFilters} className="btn-apply-filters">
                Apply Filters
              </button>
              <button onClick={handleClearFilters} className="btn-clear-filters">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TOOL DETAILS MODAL DRAWER
          ======================================================== */}
      {activeToolModal && (
        <div className="filter-drawer-backdrop" onClick={closeModal}>
          <div className="tool-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drag-bar" />

            <div className="filter-drawer-header">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {activeToolModal.name}
                  </h3>
                  {activeToolModal.is_overdue || activeToolModal.days_overdue ? (
                    <span className="badge-late">LATE</span>
                  ) : (
                    <span className="badge-active">ACTIVE</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Code: <strong>{activeToolModal.tool_code}</strong> &bull; {activeToolModal.category}
                </div>
              </div>
              <button onClick={closeModal} className="filter-close-btn" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="tool-specs-2x2">
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Assigned Worker</span>
                <span className="tool-spec-val">{activeToolModal.worker_name || "Unassigned"}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Job Site</span>
                <span className="tool-spec-val">{activeToolModal.project_name || "General"}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Expected Return</span>
                <span className="tool-spec-val font-black text-rose-600">
                  {activeToolModal.expected_return_date || "N/A"}
                </span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Tool Value</span>
                <span className="tool-spec-val">{formatCurrency(activeToolModal.purchase_cost || 0)}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Condition</span>
                <span className="tool-spec-val">{activeToolModal.condition || activeToolModal.current_condition || "Good"}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Issued Date</span>
                <span className="tool-spec-val">{activeToolModal.assigned_date || "N/A"}</span>
              </div>
            </div>

            <div className="tool-modal-actions">
              {activeToolModal.worker_phone ? (
                <a
                  href={`tel:${activeToolModal.worker_phone.replace(/\D/g, "")}`}
                  className="btn-call-direct"
                >
                  <Phone className="w-4 h-4" />
                  Call {activeToolModal.worker_name?.split(" ")[0]} ({activeToolModal.worker_phone})
                </a>
              ) : null}

              {activeToolModal.assigned_worker_id && (
                <button
                  onClick={() => {
                    const wId = activeToolModal.assigned_worker_id;
                    closeModal();
                    setSelectedWorkerId(wId);
                  }}
                  className="btn-inspect-direct"
                >
                  <Users className="w-4 h-4" />
                  View Technician History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          WORKER HOLDINGS MODAL DRAWER
          ======================================================== */}
      {activeWorkerModal && (
        <div className="filter-drawer-backdrop" onClick={closeModal}>
          <div className="tool-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drag-bar" />

            <div className="filter-drawer-header">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {activeWorkerModal.worker_name}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Total Custody: <strong>{formatCurrency(activeWorkerModal.total_holding_value)}</strong> &bull; {activeWorkerModal.active_tools_count} Tools
                </div>
              </div>
              <button onClick={closeModal} className="filter-close-btn" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {activeWorkerModal.tools.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {t.name}
                      {t.is_overdue && <span className="badge-late">LATE</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.tool_code} &bull; 📍 {t.project_name || "General"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{formatCurrency(t.purchase_cost)}</div>
                    <div className="text-[10px] text-slate-500">{t.condition}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tool-modal-actions">
              {activeWorkerModal.worker_phone ? (
                <a
                  href={`tel:${activeWorkerModal.worker_phone.replace(/\D/g, "")}`}
                  className="btn-call-direct"
                >
                  <Phone className="w-4 h-4" />
                  Call {activeWorkerModal.worker_name.split(" ")[0]}
                </a>
              ) : null}

              <button
                onClick={() => {
                  const wId = activeWorkerModal.worker_id;
                  closeModal();
                  setSelectedWorkerId(wId);
                }}
                className="btn-inspect-direct"
              >
                <Users className="w-4 h-4" />
                Open Full Worker Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DAMAGE INCIDENT MODAL DRAWER
          ======================================================== */}
      {activeDamageModal && (
        <div className="filter-drawer-backdrop" onClick={closeModal}>
          <div className="tool-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drag-bar" />

            <div className="filter-drawer-header">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {activeDamageModal.name}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Code: <strong>{activeDamageModal.tool_code}</strong>
                </div>
              </div>
              <button onClick={closeModal} className="filter-close-btn" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="tool-specs-2x2">
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Condition Shift</span>
                <span className="tool-spec-val font-black text-rose-600">
                  {activeDamageModal.condition_before} &rarr; {activeDamageModal.condition_after}
                </span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Incident Type</span>
                <span className="tool-spec-val">{activeDamageModal.title || activeDamageModal.event_type}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Technician</span>
                <span className="tool-spec-val">{activeDamageModal.worker_name || "N/A"}</span>
              </div>
              <div className="tool-spec-item">
                <span className="tool-spec-lbl">Job Site</span>
                <span className="tool-spec-val">{activeDamageModal.project_name || "Site"}</span>
              </div>
            </div>

            {activeDamageModal.note_text && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 mb-4 leading-relaxed">
                <strong>Technician Note:</strong> "{activeDamageModal.note_text}"
              </div>
            )}

            <button onClick={closeModal} className="btn-inspect-direct w-full">
              Close Incident Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ToolsReportPage = ToolsReportSection;
export default ToolsReportPage;
