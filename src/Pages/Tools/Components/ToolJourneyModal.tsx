import React, { useState } from 'react';
import {
  X,
  Clock,
  Info,
  FileText,
  User,
  CornerDownLeft,
  Wrench,
  Package,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { ToolItem } from '../toolTypes';
import './ToolJourneyModal.css';

interface ToolJourneyModalProps {
  tool: ToolItem;
  isOpen: boolean;
  onClose: () => void;
  onAddNote?: (toolId: string, text: string) => Promise<void> | void;
}

export const ToolJourneyModal: React.FC<ToolJourneyModalProps> = ({
  tool,
  isOpen,
  onClose,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<"journey" | "details" | "notes">("journey");
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (!isOpen) return null;

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !onAddNote) return;
    try {
      setIsSubmittingNote(true);
      await onAddNote(tool.id, newNote.trim());
      setNewNote("");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const notesCount = tool.notesList ? tool.notesList.length : 3;

  const renderEventIcon = (eventType: string) => {
    switch (eventType) {
      case "ASSIGNED":
        return <User size={16} className="text-slate-700" />;
      case "RETURNED":
        return <CornerDownLeft size={16} className="text-slate-700" />;
      case "MAINTENANCE_SENT":
        return <Wrench size={16} className="text-slate-700" />;
      case "MAINTENANCE_RETURNED":
        return <RotateCcw size={16} className="text-slate-700" />;
      case "CREATED":
        return <Package size={16} className="text-slate-700" />;
      case "SCRAPPED":
        return <AlertTriangle size={16} className="text-rose-600" />;
      default:
        return <Package size={16} className="text-slate-700" />;
    }
  };

  const renderBadge = (variant: string, label: string) => {
    if (variant === "good") {
      return (
        <span className="journey-badge good">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>{label}</span>
        </span>
      );
    }
    if (variant === "rough") {
      return (
        <span className="journey-badge rough">
          <AlertTriangle size={13} className="shrink-0" />
          <span>{label}</span>
        </span>
      );
    }
    if (variant === "repair") {
      return (
        <span className="journey-badge repair">
          <Wrench size={13} className="shrink-0" />
          <span>{label}</span>
        </span>
      );
    }
    return (
      <span className="journey-badge scrapped">
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="journey-modal-backdrop">
      <div className="journey-modal-card">
        {/* TOP CLOSE BUTTON */}
        <button onClick={onClose} className="journey-modal-close-btn" aria-label="Close modal">
          <X size={20} />
        </button>

        {/* HEADER SECTION */}
        <div className="journey-modal-header">
          <div className="header-left-col">
            <div className="tool-header-thumb">
              {tool.imageUrl ? (
                <img src={tool.imageUrl} alt={tool.name} className="tool-thumb-img" />
              ) : (
                <span className="fallback-tool-icon">🔧</span>
              )}
            </div>
            <div>
              <span className="tool-header-tag-pill">{tool.toolCode}</span>
              <h2 className="tool-header-title">{tool.name}</h2>
              <p className="tool-header-sub">
                {tool.brand} {tool.modelNo} &nbsp;•&nbsp; S/N: {tool.serialNo}
              </p>
            </div>
          </div>

          <div className="header-right-col">
            <span className={`tool-header-status-pill ${tool.status.toLowerCase().replace(" ", "-")}`}>
              <span className="dot" /> {tool.status}
            </span>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="journey-modal-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "journey" ? "active" : ""}`}
            onClick={() => setActiveTab("journey")}
          >
            <Clock size={15} />
            <span>Journey (History)</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <Info size={15} />
            <span>Details</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            <FileText size={15} />
            <span>Notes ({notesCount})</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="journey-modal-body">
          {activeTab === "journey" && (
            <div className="journey-timeline-list">
              {tool.journey.map((event, index) => {
                const isFirst = index === 0;
                const isLast = index === tool.journey.length - 1;

                return (
                  <div key={event.id} className="timeline-row-item">
                    {/* Left Timeline Line & Dot */}
                    <div className="timeline-node-track">
                      <div className={`timeline-dot ${isFirst ? "filled-black" : isLast ? "filled-gray" : "hollow"}`} />
                      {!isLast && <div className="timeline-vertical-line" />}
                    </div>

                    {/* Event Icon Square */}
                    <div className="timeline-icon-box">
                      {renderEventIcon(event.eventType)}
                    </div>

                    {/* Event Title & Subtitle */}
                    <div className="timeline-info-col">
                      <div className="timeline-title-bold">{event.title}</div>
                      <div className="timeline-subtitle-gray">{event.subtitle}</div>
                    </div>

                    {/* Center Condition / Status Pill */}
                    <div className="timeline-badge-col">
                      {renderBadge(event.badgeVariant, event.badgeLabel)}
                    </div>

                    {/* Optional Note & Image */}
                    <div className="timeline-note-col">
                      {event.noteImage && (
                        <div className="note-thumb-wrap">
                          <img src={event.noteImage} alt="Dent inspection" />
                        </div>
                      )}
                      {event.noteText && (
                        <span className="timeline-note-text">{event.noteText}</span>
                      )}
                    </div>

                    {/* Timestamp Right Aligned */}
                    <div className="timeline-time-col">
                      {event.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "details" && (
            <div className="details-tab-grid">
              <div className="detail-field-box">
                <span className="detail-label">Asset Tag / Tool ID</span>
                <span className="detail-value font-mono">{tool.toolCode}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Equipment Category</span>
                <span className="detail-value">{tool.category}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Manufacturer / Brand</span>
                <span className="detail-value">{tool.brand}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Model Number</span>
                <span className="detail-value">{tool.modelNo}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Serial Number (S/N)</span>
                <span className="detail-value font-mono">{tool.serialNo}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Tool Room Location</span>
                <span className="detail-value">{tool.storageLocation}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Acquisition Date</span>
                <span className="detail-value">{tool.purchaseDate}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Purchase Value</span>
                <span className="detail-value font-semibold">₹{tool.purchaseCost.toLocaleString()}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Current Condition</span>
                <span className="detail-value">{tool.currentCondition}</span>
              </div>
              <div className="detail-field-box">
                <span className="detail-label">Current Custody</span>
                <span className="detail-value">
                  {tool.assignedTo ? `${tool.assignedTo.workerName} (${tool.assignedTo.projectName})` : "In Tool Crib (Available)"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="notes-tab-list">
              {onAddNote && (
                <form onSubmit={handleCreateNote} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an inspection or damage note..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSubmittingNote ? "Adding..." : "Add Note"}
                  </button>
                </form>
              )}
              {tool.notesList && tool.notesList.length > 0 ? (
                tool.notesList.map((n) => (
                  <div key={n.id} className="note-card-item">
                    <div className="note-card-header">
                      <strong className="text-slate-900 text-xs font-semibold">{n.author}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{n.date}</span>
                    </div>
                    <p className="note-card-body">{n.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No inspection notes logged for this equipment.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
