import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Package,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  History,
  MoreHorizontal,
  User,
  MapPin,
  Link2,
  CornerDownLeft,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Tools.css';
import { INITIAL_TOOLS, TOOL_CATEGORIES } from './toolTypes';
import type { ToolItem, ToolCondition, ToolStatus } from './toolTypes';
import { AssignToolModal } from './Components/AssignToolModal';
import { ReturnToolModal } from './Components/ReturnToolModal';
import { ToolJourneyModal } from './Components/ToolJourneyModal';
import Pagination from '../../Components/Pagination/Pagination';
import { toolsApi } from '../../api/toolsApi';

export const Tools: React.FC = () => {
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [kpiCounts, setKpiCounts] = useState<{
    total_tools: number;
    in_field: number;
    available: number;
    needs_repair: number;
  }>({
    total_tools: 6,
    in_field: 2,
    available: 2,
    needs_repair: 1,
  });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Tools");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [assigningTool, setAssigningTool] = useState<ToolItem | null>(null);
  const [returningTool, setReturningTool] = useState<ToolItem | null>(null);
  const [journeyTool, setJourneyTool] = useState<ToolItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load tools from backend
  const loadTools = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await toolsApi.getAll();
      if (res && res.tools && res.tools.length > 0) {
        setTools(res.tools);
      }
      if (res && res.kpis) {
        setKpiCounts(res.kpis);
      }
    } catch (err) {
      console.warn("Backend tools API unreachable, using local state", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Status badge styling matching mockup
  const renderStatusBadge = (status: ToolStatus) => {
    switch (status) {
      case "Available":
        return (
          <span className="mockup-status-pill available">
            <span className="dot" /> Available
          </span>
        );
      case "In Field":
      case "In Use":
        return (
          <span className="mockup-status-pill in-field">
            <span className="dot" /> In Field
          </span>
        );
      case "Needs Repair":
        return (
          <span className="mockup-status-pill needs-repair">
            <span className="dot" /> Needs Repair
          </span>
        );
      case "Retired":
        return (
          <span className="mockup-status-pill retired">
            <span className="dot" /> Retired
          </span>
        );
      default:
        return (
          <span className="mockup-status-pill lost">
            <span className="dot" /> Lost
          </span>
        );
    }
  };

  // Condition badge helper matching mockup
  const renderConditionBadge = (condition: ToolCondition) => {
    switch (condition) {
      case "Brand New":
      case "Good":
        return <span className="mockup-condition-badge good">Good</span>;
      case "Fair":
      case "Rough":
        return <span className="mockup-condition-badge fair">Fair</span>;
      case "Damaged":
        return <span className="mockup-condition-badge damaged">Damaged</span>;
      case "Scrapped":
        return <span className="mockup-condition-badge scrapped">Scrapped</span>;
      default:
        return <span className="mockup-condition-badge good">{condition}</span>;
    }
  };

  // Handlers for Tool Operations via API
  const handleAssignConfirm = async (
    toolId: string,
    payload: {
      workerId: string;
      workerName: string;
      projectName: string;
      expectedReturnDate: string;
      assignedCondition: ToolCondition;
      notes?: string;
    }
  ) => {
    try {
      const res = await toolsApi.assign(toolId, {
        worker_id: payload.workerId,
        project_name: payload.projectName,
        condition: payload.assignedCondition,
        expected_return_date: payload.expectedReturnDate,
        notes: payload.notes,
      });

      if (res && res.tool) {
        setTools((prev) => prev.map((t) => (t.id === toolId ? res.tool : t)));
        if (journeyTool?.id === toolId) setJourneyTool(res.tool);
      }
      await loadTools();
    } catch (err) {
      console.error("Assign error:", err);
      throw err;
    }
  };

  const handleReturnConfirm = async (
    toolId: string,
    payload: {
      returnCondition: ToolCondition;
      notes?: string;
    }
  ) => {
    try {
      const res = await toolsApi.returnTool(toolId, {
        condition: payload.returnCondition,
        note_text: payload.notes,
      });

      if (res && res.tool) {
        setTools((prev) => prev.map((t) => (t.id === toolId ? res.tool : t)));
        if (journeyTool?.id === toolId) setJourneyTool(res.tool);
      }
      await loadTools();
    } catch (err: any) {
      console.error("Return error:", err);
      alert(err?.response?.data?.message || "Failed to return tool.");
    }
  };

  const handleAddNoteToTool = async (toolId: string, text: string) => {
    try {
      await toolsApi.addNote(toolId, { text });
      const fresh = await toolsApi.getById(toolId);
      if (fresh && fresh.tool) {
        setTools((prev) => prev.map((t) => (t.id === toolId ? fresh.tool : t)));
        if (journeyTool?.id === toolId) setJourneyTool(fresh.tool);
      }
    } catch (err) {
      console.error("Add note error:", err);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!window.confirm("Are you sure you want to remove this tool from the fleet?")) return;
    try {
      await toolsApi.delete(toolId);
      await loadTools();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // KPIs matching mockup
  const totalTools = kpiCounts.total_tools ?? tools.length;
  const inFieldCount = kpiCounts.in_field ?? tools.filter((t) => t.status === "In Field" || t.status === "In Use").length;
  const availableCount = kpiCounts.available ?? tools.filter((t) => t.status === "Available").length;
  const needsRepairCount = kpiCounts.needs_repair ?? tools.filter((t) => t.status === "Needs Repair" || t.currentCondition === "Damaged").length;

  // Filtered List
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== "All Categories" && tool.category !== selectedCategory) {
        return false;
      }

      // Tab filter
      if (activeTab === "In Use" && tool.status !== "In Field" && tool.status !== "In Use") return false;
      if (activeTab === "Available" && tool.status !== "Available") return false;
      if (activeTab === "Needs Repair" && tool.status !== "Needs Repair" && tool.currentCondition !== "Damaged") return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = tool.name?.toLowerCase().includes(q);
        const matchesCode = tool.toolCode?.toLowerCase().includes(q);
        const matchesSerial = tool.serialNo?.toLowerCase().includes(q);
        const matchesWorker = tool.assignedTo?.workerName?.toLowerCase().includes(q);
        const matchesCategory = tool.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesSerial && !matchesWorker && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [tools, activeTab, selectedCategory, search]);

  // Paginated Tools
  const totalPages = Math.ceil(filteredTools.length / perPage) || 1;
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredTools.slice(start, start + perPage);
  }, [filteredTools, currentPage, perPage]);

  return (
    <div className="tools-mockup-page">
      {/* TOP BREADCRUMB */}
      <div className="tools-mockup-breadcrumb">Equipment & Assets</div>

      {/* HEADER */}
      <div className="tools-mockup-header">
        <div className="header-text-group">
          <h1>HVAC Tools & Equipment Fleet</h1>
          <p>Track chain-of-custody, field checkouts, damage, and tool lifecycle.</p>
        </div>
        <Link to="/dashboard/add-tool" className="btn-add-equipment-black">
          <Plus size={16} /> Add Equipment
        </Link>
      </div>

      {/* 4 TOP KPI CARDS */}
      <div className="mockup-stats-grid">
        <div className="mockup-stat-card">
          <div className="stat-icon-wrapper">
            <Package size={22} />
          </div>
          <div className="stat-details">
            <p className="stat-title">Total Tools</p>
            <h2 className="stat-number">{totalTools}</h2>
          </div>
        </div>

        <div className="mockup-stat-card">
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
          <div className="stat-details">
            <p className="stat-title">In Field (Assigned)</p>
            <h2 className="stat-number">{inFieldCount}</h2>
          </div>
        </div>

        <div className="mockup-stat-card">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-details">
            <p className="stat-title">Available (In Crib)</p>
            <h2 className="stat-number">{availableCount}</h2>
          </div>
        </div>

        <div className="mockup-stat-card">
          <div className="stat-icon-wrapper">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-details">
            <p className="stat-title">Needs Repair / Damaged</p>
            <h2 className="stat-number">{needsRepairCount}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="mockup-toolbar">
        {/* Left Tabs with Badges */}
        <div className="mockup-toolbar-tabs">
          {[
            { label: "All Tools", count: totalTools },
            { label: "In Use", count: inFieldCount },
            { label: "Available", count: availableCount },
            { label: "Needs Repair", count: needsRepairCount },
          ].map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                className={`mockup-pill-tab ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.label);
                  setCurrentPage(1);
                }}
              >
                <span>{tab.label}</span>
                <span className={`tab-badge ${isActive ? "active" : ""}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search & Filter */}
        <div className="mockup-toolbar-controls">
          <select
            className="mockup-category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All Categories">Category: All Categories</option>
            {TOOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="mockup-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tools by name, tag or serial..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="mockup-table-card">
        <div className="mockup-table-wrapper">
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Tool / Equipment</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Assignment / Location</th>
                <th>Status</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="empty-state py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">Loading fleet tools and equipment...</p>
                  </td>
                </tr>
              ) : paginatedTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state py-12 text-center text-slate-500">
                    <Package size={36} className="mx-auto text-slate-300 mb-2" />
                    <h4>No equipment found</h4>
                    <p className="text-xs">Try adjusting your search criteria or active tab.</p>
                  </td>
                </tr>
              ) : (
                paginatedTools.map((tool) => {
                  return (
                    <tr key={tool.id} className="mockup-row">
                      {/* TOOL / EQUIPMENT (THUMBNAIL + NAME + SUBTEXT) */}
                      <td>
                        <div className="tool-main-cell">
                          <div className="tool-thumb-box">
                            {tool.imageUrl ? (
                              <img
                                src={tool.imageUrl}
                                alt={tool.name}
                                className="tool-thumb-img"
                                onError={(e) => {
                                  // Fallback gracefully to icon if image fails
                                  e.currentTarget.style.display = "none";
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<span class="fallback-icon">🔧</span>';
                                  }
                                }}
                              />
                            ) : (
                              <span className="fallback-icon">🔧</span>
                            )}
                          </div>
                          <div>
                            <div className="tool-title-bold">{tool.name}</div>
                            <div className="tool-serial-sub">
                              {tool.toolCode} &nbsp;•&nbsp; S/N: {tool.serialNo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        <span className="tool-category-label">{tool.category}</span>
                      </td>

                      {/* CONDITION */}
                      <td>{renderConditionBadge(tool.currentCondition)}</td>

                      {/* ASSIGNMENT / LOCATION */}
                      <td>
                        {tool.assignedTo ? (
                          <div className="assignment-holder">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
                              <User size={14} className="text-slate-500 shrink-0" />
                              <span>{tool.assignedTo.workerName}</span>
                            </div>
                            <div className="assignment-subtext">
                              {tool.assignedTo.projectShortName || tool.assignedTo.projectName}
                            </div>
                          </div>
                        ) : (
                          <div className="location-holder flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span>{tool.storageLocation}</span>
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td>{renderStatusBadge(tool.status)}</td>

                      {/* ACTIONS */}
                      <td className="text-right">
                        <div className="mockup-action-buttons">
                          <button
                            onClick={() => setJourneyTool(tool)}
                            className="btn-mockup-journey"
                            title="View Lifecycle Journey"
                          >
                            <History size={14} />
                            <span>Journey</span>
                          </button>

                          <div className="tool-action-menu-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) => (prev === tool.id ? null : tool.id));
                              }}
                              className="btn-mockup-more"
                              title="More options"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {activeMenuId === tool.id && (
                              <div
                                className="tool-flyout-dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tool.status === "Available" && (
                                  <button
                                    className="tool-flyout-item primary"
                                    onClick={() => {
                                      setAssigningTool(tool);
                                      setActiveMenuId(null);
                                    }}
                                  >
                                    <Link2 size={14} /> Assign to Worker
                                  </button>
                                )}

                                {(tool.status === "In Field" || tool.status === "In Use") && (
                                  <button
                                    className="tool-flyout-item primary"
                                    onClick={() => {
                                      setReturningTool(tool);
                                      setActiveMenuId(null);
                                    }}
                                  >
                                    <CornerDownLeft size={14} /> Return Tool
                                  </button>
                                )}

                                <button
                                  className="tool-flyout-item"
                                  onClick={() => {
                                    setJourneyTool(tool);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <History size={14} /> View History
                                </button>

                                <div className="tool-flyout-divider" />

                                <button
                                  className="tool-flyout-item danger"
                                  onClick={() => {
                                    handleDeleteTool(tool.id);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <Trash2 size={14} /> Remove Tool
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          totalItems={filteredTools.length}
          from={filteredTools.length > 0 ? (currentPage - 1) * perPage + 1 : 0}
          to={Math.min(currentPage * perPage, filteredTools.length)}
          perPage={perPage}
          perPageOptions={[5, 10, 20]}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ASSIGN MODAL */}
      {assigningTool && (
        <AssignToolModal
          tool={assigningTool}
          isOpen={!!assigningTool}
          onClose={() => setAssigningTool(null)}
          onAssign={handleAssignConfirm}
        />
      )}

      {/* RETURN MODAL */}
      {returningTool && (
        <ReturnToolModal
          tool={returningTool}
          isOpen={!!returningTool}
          onClose={() => setReturningTool(null)}
          onReturn={handleReturnConfirm}
        />
      )}

      {/* JOURNEY MODAL */}
      {journeyTool && (
        <ToolJourneyModal
          tool={journeyTool}
          isOpen={!!journeyTool}
          onClose={() => setJourneyTool(null)}
          onAddNote={handleAddNoteToTool}
        />
      )}
    </div>
  );
};

export default Tools;
