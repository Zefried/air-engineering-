import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/Products.css';
import { generateUniqueId } from '../../utils/idGenerator';

interface VariantRow {
  id: string;
  sizeLabel: string;
  sku: string;
  stock: number;
  minThreshold: number;
  unitCost: number;
}

const HVAC_PRESET_SIZES: Record<string, string[]> = {
  "Copper Pipes & Tubes": [
    "1/4\" (6.35 mm)",
    "3/8\" (9.52 mm)",
    "1/2\" (12.7 mm)",
    "5/8\" (15.88 mm)",
    "3/4\" (19.05 mm)",
    "7/8\" (22.2 mm)",
    "1-1/8\" (28.6 mm)",
  ],
  "Refrigerant Gases": [
    "R-410A (10 Kg)",
    "R-32 (10 Kg)",
    "R-134a (13.6 Kg)",
    "R-22 (13.6 Kg)",
    "R-407C (11.3 Kg)",
  ],
  "Thermal Pipe Insulation": [
    "1/4\" x 9mm Wall",
    "3/8\" x 9mm Wall",
    "1/2\" x 13mm Wall",
    "5/8\" x 13mm Wall",
    "3/4\" x 19mm Wall",
  ],
  "GI Sheet Ducts": [
    "24 Gauge (0.63 mm)",
    "22 Gauge (0.80 mm)",
    "20 Gauge (1.00 mm)",
    "18 Gauge (1.25 mm)",
  ],
};

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();

  // Basic Details
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Ducting & Piping Materials");
  const [subCategory, setSubCategory] = useState("Copper Pipes & Tubes");
  const [baseUom, setBaseUom] = useState("Meters");
  const [packageUom, setPackageUom] = useState("Coils (15m)");
  const [hasVariants, setHasVariants] = useState(true);

  // Variant Rows
  const [variants, setVariants] = useState<VariantRow[]>([
    { id: "1", sizeLabel: "1/4\" (6.35 mm)", sku: "CU-025", stock: 30.0, minThreshold: 15.0, unitCost: 140 },
    { id: "2", sizeLabel: "3/8\" (9.52 mm)", sku: "CU-038", stock: 30.0, minThreshold: 15.0, unitCost: 220 },
    { id: "3", sizeLabel: "1/2\" (12.7 mm)", sku: "CU-050", stock: 15.0, minThreshold: 15.0, unitCost: 310 },
  ]);

  // Custom size entry
  const [customSize, setCustomSize] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Quick chips based on subcategory
  const activePresets = HVAC_PRESET_SIZES[subCategory] || [];

  const handleChipClick = (preset: string) => {
    // If already exists, do not duplicate
    if (variants.some((v) => v.sizeLabel === preset)) return;

    const cleanCode = preset.replace(/[^a-zA-Z0-9]+/g, "").toUpperCase();
    const newRow: VariantRow = {
      id: generateUniqueId("v"),
      sizeLabel: preset,
      sku: `SKU-${cleanCode.slice(0, 6)}`,
      stock: 0.0,
      minThreshold: 10.0,
      unitCost: 100,
    };
    setVariants((prev) => [...prev, newRow]);
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSize.trim()) return;
    if (variants.some((v) => v.sizeLabel.toLowerCase() === customSize.trim().toLowerCase())) return;

    const cleanCode = customSize.replace(/[^a-zA-Z0-9]+/g, "").toUpperCase();
    const newRow: VariantRow = {
      id: generateUniqueId("v"),
      sizeLabel: customSize.trim(),
      sku: `SKU-${cleanCode.slice(0, 6)}`,
      stock: 0.0,
      minThreshold: 10.0,
      unitCost: 100,
    };
    setVariants((prev) => [...prev, newRow]);
    setCustomSize("");
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (
    id: string,
    field: keyof VariantRow,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaved(true);
    setTimeout(() => {
      navigate("/dashboard/products");
    }, 900);
  };

  return (
    <div className="products-page">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            to="/dashboard/products"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            Add HVAC Product & Sizes
          </h2>
          <p className="text-gray-500 text-sm">
            Zero-friction size preset picker with automatic decimal stock tracking
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 size={20} className="text-emerald-600" />
          Product and size variants successfully saved! Redirecting to catalog...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASIC PRODUCT INFORMATION */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            1. Basic Product Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Category *
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Ducting & Piping Materials">Ducting & Piping Materials</option>
                <option value="Consumables & Gases">Consumables & Gases</option>
                <option value="HVAC Equipment & Units">HVAC Equipment & Units</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Sub-Category *
              </label>
              <select
                className="form-select"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                {category === "Ducting & Piping Materials" && (
                  <>
                    <option value="Copper Pipes & Tubes">Copper Pipes & Tubes</option>
                    <option value="Thermal Pipe Insulation">Thermal Pipe Insulation</option>
                    <option value="GI Sheet Ducts">GI Sheet Ducts</option>
                  </>
                )}
                {category === "Consumables & Gases" && (
                  <>
                    <option value="Refrigerant Gases">Refrigerant Gases</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                  </>
                )}
                {category === "HVAC Equipment & Units" && (
                  <>
                    <option value="VRF / VRV Systems">VRF / VRV Systems</option>
                    <option value="Ductable Split Units">Ductable Split Units</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Product Name *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. VRF Seamless Copper Tube (Grade A)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mandev / Indigo / Daikin"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: UNIT & DUAL-PACKAGING HELPER */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            2. Unit of Measurement & Decimal Tracking
          </h3>

          <div className="dual-unit-info-banner">
            <Info size={18} className="shrink-0 mt-0.5 text-blue-600" />
            <div>
              <strong>Why Base Unit matters:</strong> HVAC materials are cut and charged in decimals
              (e.g. <code>3.50 Meters</code> of pipe, <code>0.85 Kg</code> of gas). Tracking in Base Unit
              ensures project deductions stay 100% accurate.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Base Tracking Unit (Site Consumption)
              </label>
              <select
                className="form-select"
                value={baseUom}
                onChange={(e) => setBaseUom(e.target.value)}
              >
                <option value="Meters">Meters (Copper Pipes / Insulations / Cables)</option>
                <option value="Kg">Kg (Refrigerant Gases / Brazing Rods)</option>
                <option value="Pieces">Pieces (Units / Thermostats / Valves)</option>
                <option value="Sq.Ft">Sq.Ft (GI Ducting sheets / Duct wraps)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Packaging Helper Label (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Coils (15m) or Cylinders (10kg)"
                value={packageUom}
                onChange={(e) => setPackageUom(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Shows storekeeper the package equivalent alongside decimal stock.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: SIZES & VARIANT MATRIX */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                3. Size / Dimension Variants
              </h3>
              <p className="text-xs text-gray-500">
                Does this material come in different diameters, gauges, or sizes?
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Enable Size Matrix
            </label>
          </div>

          {hasVariants ? (
            <div>
              {/* PRESET CHIPS */}
              {activePresets.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    1-Click HVAC Quick Presets (Click to add):
                  </div>
                  <div className="size-chips-wrap">
                    {activePresets.map((preset) => {
                      const isAdded = variants.some((v) => v.sizeLabel === preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleChipClick(preset)}
                          disabled={isAdded}
                          className={`size-chip-btn ${isAdded ? "selected cursor-not-allowed opacity-60" : ""}`}
                        >
                          {isAdded ? <Check size={13} /> : <Plus size={13} />}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CUSTOM SIZE INPUT */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Or type custom size (e.g. 1-3/8 inch or 26 Gauge)..."
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="form-input text-xs max-w-sm"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Custom Size
                </button>
              </div>

              {/* VARIANT ROWS TABLE */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Size / Dimension</th>
                      <th className="p-3">SKU Identifier</th>
                      <th className="p-3">Initial Stock ({baseUom})</th>
                      <th className="p-3">Min Alert Level ({baseUom})</th>
                      <th className="p-3">Unit Cost (₹)</th>
                      <th className="p-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="text"
                            value={v.sizeLabel}
                            onChange={(e) => handleVariantChange(v.id, "sizeLabel", e.target.value)}
                            className="font-bold border border-gray-200 rounded px-2 py-1 w-full text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleVariantChange(v.id, "sku", e.target.value)}
                            className="font-mono text-gray-600 border border-gray-200 rounded px-2 py-1 w-28 text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={v.stock}
                            onChange={(e) =>
                              handleVariantChange(v.id, "stock", parseFloat(e.target.value) || 0)
                            }
                            className="border border-gray-200 rounded px-2 py-1 w-24 text-xs font-semibold text-emerald-700"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={v.minThreshold}
                            onChange={(e) =>
                              handleVariantChange(v.id, "minThreshold", parseFloat(e.target.value) || 0)
                            }
                            className="border border-gray-200 rounded px-2 py-1 w-24 text-xs text-amber-700"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={v.unitCost}
                            onChange={(e) =>
                              handleVariantChange(v.id, "unitCost", parseFloat(e.target.value) || 0)
                            }
                            className="border border-gray-200 rounded px-2 py-1 w-24 text-xs"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="Remove Size"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              This product will be tracked as a single stock item without size variations.
            </div>
          )}
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <Link to="/dashboard/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            <CheckCircle2 size={18} />
            Save Product & Variants
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
