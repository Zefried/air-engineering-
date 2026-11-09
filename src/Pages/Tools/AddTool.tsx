import React, { useState } from 'react';
import { ArrowLeft, Wrench, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AddTool.css';
import { TOOL_CATEGORIES } from './toolTypes';
import type { ToolCondition } from './toolTypes';
import { toolsApi } from '../../api/toolsApi';

export const AddTool: React.FC = () => {
  const navigate = useNavigate();

  // Basic Info
  const [toolName, setToolName] = useState("");
  const [toolCode, setToolCode] = useState(() => "TL-" + Math.floor(100 + Math.random() * 900));
  const [category, setCategory] = useState(TOOL_CATEGORIES[0]);
  const [brand, setBrand] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [serialNo, setSerialNo] = useState("");

  // Purchase & Storage
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [purchaseCost, setPurchaseCost] = useState<number | string>("");
  const [storageLocation, setStorageLocation] = useState("Crib Bay A-1");
  const [initialCondition, setInitialCondition] = useState<ToolCondition>("Brand New");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await toolsApi.create({
        tool_code: toolCode.trim() || `TL-${Math.floor(100 + Math.random() * 900)}`,
        name: toolName.trim(),
        category,
        brand: brand.trim() || "Standard",
        model_no: modelNo.trim() || "N/A",
        serial_no: serialNo.trim() || `S/N-${Math.floor(1000 + Math.random() * 9000)}`,
        purchase_date: purchaseDate,
        purchase_cost: Number(purchaseCost) || 0,
        current_condition: initialCondition,
        storage_location: storageLocation.trim() || "Crib Bay A-1",
      });

      setIsSaved(true);
      setTimeout(() => {
        navigate("/dashboard/tools");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to register tool. Ensure tool code is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-tool-page">
      {/* BACK BUTTON */}
      <Link to="/dashboard/tools" className="back-link-btn">
        <ArrowLeft size={16} /> Back to Tools Fleet
      </Link>

      {/* HEADER */}
      <div className="add-tool-header">
        <div className="header-icon-box">
          <Wrench size={24} />
        </div>
        <div>
          <h1>Add HVAC Tool & Equipment</h1>
          <p>Register a company asset into the tool crib with unique identification, initial condition, and start its lifecycle journey.</p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check size={18} className="text-emerald-600" />
          Tool registered successfully! Starting tool journey audit trail...
        </div>
      )}

      {errorMessage && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CARD 1: IDENTITY */}
        <div className="tool-form-card">
          <div className="card-label-col">
            <h2>1. Equipment Identification</h2>
            <p>Define the physical tool, category, and manufacturer specs.</p>
          </div>

          <div className="card-fields-col">
            <div className="form-row-2col">
              <div className="field-group">
                <label>Tool Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Robinair 2-Stage Vacuum Pump (7 CFM)"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label>Tool Asset Tag / ID *</label>
                <input
                  type="text"
                  className="form-input font-mono font-semibold"
                  placeholder="e.g. TL-VP-001"
                  value={toolCode}
                  onChange={(e) => setToolCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="field-group">
                <label>Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {TOOL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Brand / Manufacturer *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Robinair, Fieldpiece, Bosch"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="field-group">
                <label>Model Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 15500-VacuMaster"
                  value={modelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Manufacturer Serial Number (S/N)</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. SN-8841-2024"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: CUSTODY & STORAGE */}
        <div className="tool-form-card">
          <div className="card-label-col">
            <h2>2. Storage & Purchase</h2>
            <p>Record crib shelf location, purchase cost, and acquisition date.</p>
          </div>

          <div className="card-fields-col">
            <div className="form-row-3col">
              <div className="field-group">
                <label>Crib Storage Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rack B-2, Tool Crib"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Purchase Cost (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 28500"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: INITIAL CONDITION */}
        <div className="tool-form-card">
          <div className="card-label-col">
            <h2>3. Initial Condition</h2>
            <p>Document initial baseline condition for future check-in comparisons.</p>
          </div>

          <div className="card-fields-col">
            <div className="field-group">
              <label className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-slate-500" /> Condition When Entering Inventory
              </label>
              <select
                className="form-select"
                value={initialCondition}
                onChange={(e) => setInitialCondition(e.target.value as ToolCondition)}
              >
                <option value="Brand New">Brand New (Unused, with box/warranty)</option>
                <option value="Good">Good (Refurbished / tested fully operational)</option>
                <option value="Rough">Rough / Fair (Working with cosmetic wear)</option>
              </select>
            </div>

            <div className="field-group">
              <label>Initial Notes / Accessories included</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Comes with 1/4 inch SAE charging hose, vacuum oil bottle and carry case..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="tool-actions-row">
          <Link to="/dashboard/tools" className="btn-cancel">
            Cancel
          </Link>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            <Check size={16} /> {isSubmitting ? "Registering Equipment..." : "Register Equipment & Start Journey"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTool;
