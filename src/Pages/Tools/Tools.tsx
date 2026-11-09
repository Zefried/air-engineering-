import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Package,
  AlertTriangle,
  Search,
  Plus,
  History,
  Link2,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Tools.css';
import { INITIAL_TOOLS, TOOL_CATEGORIES } from './toolTypes';
import type { ToolItem, ToolCondition, ToolStatus } from './toolTypes';
import { AssignToolModal } from './Components/AssignToolModal';
import { ReturnToolModal } from './Components/ReturnToolModal';
import { ToolJourneyModal } from './Components/ToolJourneyModal';
import Pagination from '../../Components/Pagination/Pagination';
import { generateUniqueId } from '../../utils/idGenerator';

export const Tools: React.FC = () => {
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Tools");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [assigningTool, setAssigningTool] = useState<ToolItem | null>(null);
  const [returningTool, setReturningTool] = useState<ToolItem | null>(null);
  const [journeyTool, setJourneyTool] = useState<ToolItem | null>(null);

  // Status badge styling helper
  const renderStatusBadge = (status: ToolStatus) => {
    switch (status) {
      case "Available":
        return (
          <span className="tool-pill-badge green">
            <span className="dot" /> Available (In Crib)
          </span>
        );
      case "In Use":
        return (
          <span className="tool-pill-badge blue">
            <span className="dot" /> In Field (Assigned)
          </span>
        );
      case "Under Repair":
        return (
          <span className="tool-pill-badge amber">
            <span className="dot" /> Under Repair
          </span>
        );
      case "Retired":
        return (
          <span className="tool-pill-badge slate">
            <span className="dot" /> Retired / Scrapped
          </span>
        );
      default:
        return (
          <span className="tool-pill-badge rose">
            <span className="dot" /> Lost / Missing
          </span>
        );
    }
  };

  // Condition badge helper
  const renderConditionBadge = (condition: ToolCondition) => {
    switch (condition) {
      case "Brand New":
        return <span className="condition-tag emerald">Brand New</span>;
      case "Good":
        return <span className="condition-tag green">Good</span>;
      case "Rough":
        return <span className="condition-tag amber">Rough / Fair</span>;
      case "Damaged":
        return <span className="condition-tag rose">Damaged</span>;
      case "Scrapped":
        return <span className="condition-tag dark">Scrapped</span>;
      default:
        return <span className="condition-tag slate">{condition}</span>;
    }
  };

  // Handlers for Tool Operations
  const handleAssignConfirm = (
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
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    setTools((prev) =>
      prev.map((t) => {
        if (t.id !== toolId) return t;

        const newJourneyEvent = {
          id: generateUniqueId("j"),
          eventType: "ASSIGNED" as const,
          timestamp: nowStr,
          workerId: payload.workerId,
          workerName: payload.workerName,
          projectName: payload.projectName,
          handledBy: "Manager",
          conditionBefore: payload.assignedCondition,
          expectedReturnDate: payload.expectedReturnDate,
          notes: payload.notes,
        };

        return {
          ...t,
          status: "In Use" as ToolStatus,
          currentCondition: payload.assignedCondition,
          assignedTo: {
            workerId: payload.workerId,
            workerName: payload.workerName,
            projectName: payload.projectName,
            assignedDate: nowStr,
            expectedReturnDate: payload.expectedReturnDate,
            isOverdue: false,
            assignedCondition: payload.assignedCondition,
          },
          journey: [...t.journey, newJourneyEvent],
        };
      })
    );
  };

  const handleReturnConfirm = (
    toolId: string,
    payload: {
      returnCondition: ToolCondition;
      notes?: string;
    }
  ) => {
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    setTools((prev) =>
      prev.map((t) => {
        if (t.id !== toolId) return t;

        const assigned = t.assignedTo;
        const conditionBefore = assigned?.assignedCondition || t.currentCondition;
        const isDegraded =
          (conditionBefore === "Brand New" || conditionBefore === "Good") &&
          (payload.returnCondition === "Damaged" || payload.returnCondition === "Scrapped");

        let nextStatus: ToolStatus = "Available";
        if (payload.returnCondition === "Damaged") nextStatus = "Under Repair";
        if (payload.returnCondition === "Scrapped") nextStatus = "Retired";
        if (payload.returnCondition === "Lost") nextStatus = "Lost";

        const newJourneyEvent = {
          id: generateUniqueId("j"),
          eventType:
            payload.returnCondition === "Scrapped"
              ? ("SCRAPPED" as const)
              : ("RETURNED" as const),
          timestamp: nowStr,
          workerId: assigned?.workerId,
          workerName: assigned?.workerName,
          projectName: assigned?.projectName,
          handledBy: "Manager",
          conditionBefore,
          conditionAfter: payload.returnCondition,
          actualReturnDate: nowStr,
          isOverdue: assigned?.isOverdue,
          notes: payload.notes
            ? payload.notes
            : isDegraded
            ? `Condition degraded from ${conditionBefore} to ${payload.returnCondition} under ${assigned?.workerName}`
            : "Returned in standard condition.",
        };

        return {
          ...t,
          status: nextStatus,
          currentCondition: payload.returnCondition,
          assignedTo: null,
          journey: [...t.journey, newJourneyEvent],
        };
      })
    );
  };

  // KPIs
  const totalTools = tools.length;
  const inUseCount = tools.filter((t) => t.status === "In Use").length;
  const availableCount = tools.filter((t) => t.status === "Available").length;
  const damagedCount = tools.filter((t) => t.currentCondition === "Damaged" || t.status === "Under Repair").length;
  const overdueCount = tools.filter((t) => t.assignedTo?.isOverdue).length;

  // Filtered List
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== "All Categories" && tool.category !== selectedCategory) {
        return false;
      }

      // Tab filter
      if (activeTab === "In Use" && tool.status !== "In Use") return false;
      if (activeTab === "Available" && tool.status !== "Available") return false;
      if (activeTab === "Under Repair" && tool.status !== "Under Repair") return false;
      if (activeTab === "Overdue Alert" && !tool.assignedTo?.isOverdue) return false;
      if (activeTab === "Retired / Scrapped" && tool.status !== "Retired") return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesCode = tool.toolCode.toLowerCase().includes(q);
        const matchesSerial = tool.serialNo.toLowerCase().includes(q);
        const matchesWorker = tool.assignedTo?.workerName.toLowerCase().includes(q);
        const matchesBrand = tool.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesSerial && !matchesWorker && !matchesBrand) {
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
    <div className="tools-management-page">
      {/* TOP BREADCRUMB */}
      <div className="tools-breadcrumb">Equipment & Assets</div>

      {/* HEADER */}
      <div className="tools-header">
        <div>
          <h1>HVAC Tools & Equipment Fleet</h1>
          <p>
            Track tool chain-of-custody, manage field worker checkouts, monitor damage degradation, and view
            complete tool lifecycles.
          </p>
        </div>
        <Link to="/dashboard/add-tool" className="btn-add-tool-dark">
          <Plus size={16} /> Add Equipment
        </Link>
      </div>

      {/* 4 TOP KPI CARDS */}
      <div className="tool-stats-grid">
        <div className="tool-stat-card">
          <div className="stat-icon-box gray">
            <Package size={22} />
          </div>
          <div>
            <p className="stat-label">Total Tools</p>
            <h2 className="stat-count">{totalTools}</h2>
          </div>
        </div>

        <div className="tool-stat-card">
          <div className="stat-icon-box blue">
            <Wrench size={22} />
          </div>
          <div>
            <p className="stat-label">In Field (Assigned)</p>
            <h2 className="stat-count">{inUseCount}</h2>
          </div>
        </div>

        <div className="tool-stat-card">
          <div className="stat-icon-box green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="stat-label">Available in Crib</p>
            <h2 className="stat-count">{availableCount}</h2>
          </div>
        </div>

        <div className="tool-stat-card">
          <div className="stat-icon-box amber">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="stat-label">Needs Repair / Damaged</p>
            <h2 className="stat-count">{damagedCount}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="tools-toolbar">
        {/* Left Tabs */}
        <div className="toolbar-left-pills">
          {[
            { label: "All Tools", count: totalTools },
            { label: "In Use", count: inUseCount },
            { label: "Available", count: availableCount },
            { label: "Under Repair", count: damagedCount },
            { label: "Overdue Alert", count: overdueCount },
            { label: "Retired / Scrapped", count: tools.filter((t) => t.status === "Retired").length },
          ].map((tab) => (
            <button
              key={tab.label}
              className={`filter-pill-btn ${activeTab === tab.label ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
            >
              {tab.label} {tab.count > 0 && <span className="count-pill">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Right Search & Filter */}
        <div className="toolbar-right-controls">
          <select
            className="category-pill-select"
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

          <div className="search-pill-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, tag, serial, worker..."
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
      <div className="tools-table-container">
        <div className="responsive-table-wrapper">
          <table className="custom-tools-table">
            <thead>
              <tr>
                <th>Tool Tag & Details</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Current Custody / Assignment</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state py-12 text-center text-slate-500">
                    <Wrench size={36} className="mx-auto text-slate-300 mb-2" />
                    <h4>No tools found</h4>
                    <p className="text-xs">Try adjusting your search query or filter pills.</p>
                  </td>
                </tr>
              ) : (
                paginatedTools.map((tool) => {
                  return (
                    <tr key={tool.id} className="tool-row">
                      {/* TOOL DETAILS */}
                      <td>
                        <div className="tool-details-cell">
                          <span className="tool-tag-pill">{tool.toolCode}</span>
                          <div>
                            <div className="tool-name-primary">{tool.name}</div>
                            <div className="tool-sub-specs">
                              {tool.brand} · {tool.modelNo} · S/N: <span className="font-mono">{tool.serialNo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        <span className="tool-cat-text">{tool.category}</span>
                      </td>

                      {/* CONDITION */}
                      <td>{renderConditionBadge(tool.currentCondition)}</td>

                      {/* CURRENT CUSTODY */}
                      <td>
                        {tool.assignedTo ? (
                          <div className="custody-info-box">
                            <div className="custody-worker font-semibold text-slate-900">
                              {tool.assignedTo.workerName}
                            </div>
                            <div className="custody-project flex items-center gap-1 text-[11px] text-slate-500">
                              <Briefcase size={11} /> {tool.assignedTo.projectName}
                            </div>
                            <div className="custody-due flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <Clock size={11} /> Due: {tool.assignedTo.expectedReturnDate}
                              {tool.assignedTo.isOverdue && (
                                <span className="overdue-tag">Overdue</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            In Crib ({tool.storageLocation})
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td>{renderStatusBadge(tool.status)}</td>

                      {/* ACTIONS */}
                      <td>
                        <div className="tool-row-actions">
                          {tool.status === "Available" && (
                            <button
                              onClick={() => setAssigningTool(tool)}
                              className="btn-action-assign"
                              title="Assign to Worker"
                            >
                              <Link2 size={13} /> Assign
                            </button>
                          )}

                          {tool.status === "In Use" && (
                            <button
                              onClick={() => setReturningTool(tool)}
                              className="btn-action-return"
                              title="Check-In / Return Tool"
                            >
                              <CheckCircle2 size={13} /> Check-In
                            </button>
                          )}

                          <button
                            onClick={() => setJourneyTool(tool)}
                            className="btn-action-journey"
                            title="View Complete Tool Journey Audit Trail"
                          >
                            <History size={13} /> Journey
                          </button>
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
          perPageOptions={[5, 10, 25, 50]}
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
        />
      )}
    </div>
  );
};

export default Tools;
