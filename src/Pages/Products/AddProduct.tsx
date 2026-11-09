import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Info,
  Check,
  Layers
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AddProduct.css';
import { generateUniqueId } from '../../utils/idGenerator';

interface VariantRow {
  id: string;
  sizeKey: string;
  sizeName: string;
  skuCode: string;
  initialStock: number;
  minAlertLevel: number;
  unitCost: number;
}

const ALL_COPPER_SIZES = [
  { key: "1/4", label: "1/4\" (6.35 mm)", defaultSku: "CP-014", cost: 780, stock: 45.0 },
  { key: "3/8", label: "3/8\" (9.52 mm)", defaultSku: "CP-038", cost: 1050, stock: 32.5 },
  { key: "1/2", label: "1/2\" (12.70 mm)", defaultSku: "CP-012", cost: 1440, stock: 18.0 },
  { key: "5/8", label: "5/8\" (15.88 mm)", defaultSku: "CP-058", cost: 1950, stock: 4.0 },
  { key: "3/4", label: "3/4\" (19.05 mm)", defaultSku: "CP-034", cost: 2450, stock: 0.0 },
  { key: "7/8", label: "7/8\" (22.20 mm)", defaultSku: "CP-078", cost: 2950, stock: 0.0 },
  { key: "1-1/8", label: "1-1/8\" (28.60 mm)", defaultSku: "CP-118", cost: 3600, stock: 0.0 },
];

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();

  // Basic Details
  const [category, setCategory] = useState("Ducting & Piping Materials");
  const [subCategory, setSubCategory] = useState("Copper Pipes & Tubes");
  const [productName, setProductName] = useState("VRF Seamless Copper Tube (Grade A)");
  const [brand, setBrand] = useState("Mandev / Indigo");

  // Unit & Packaging
  const [baseUom, setBaseUom] = useState("Meters");
  const [pkgReference] = useState("1 Coil = 15 Meters");

  // Size Matrix Toggle
  const [enableSizeMatrix, setEnableSizeMatrix] = useState(true);

  // Variant Rows - Preloaded matching the design mockup (first 4 selected)
  const [variants, setVariants] = useState<VariantRow[]>([
    {
      id: "v-1",
      sizeKey: "1/4",
      sizeName: "1/4\" (6.35 mm)",
      skuCode: "CP-014",
      initialStock: 45.0,
      minAlertLevel: 5.0,
      unitCost: 780.0,
    },
    {
      id: "v-2",
      sizeKey: "3/8",
      sizeName: "3/8\" (9.52 mm)",
      skuCode: "CP-038",
      initialStock: 32.5,
      minAlertLevel: 5.0,
      unitCost: 1050.0,
    },
    {
      id: "v-3",
      sizeKey: "1/2",
      sizeName: "1/2\" (12.70 mm)",
      skuCode: "CP-012",
      initialStock: 18.0,
      minAlertLevel: 5.0,
      unitCost: 1440.0,
    },
    {
      id: "v-4",
      sizeKey: "5/8",
      sizeName: "5/8\" (15.88 mm)",
      skuCode: "CP-058",
      initialStock: 4.0,
      minAlertLevel: 5.0,
      unitCost: 1950.0,
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  // Toggle size chip
  const handleToggleSizeChip = (sizeObj: (typeof ALL_COPPER_SIZES)[0]) => {
    const exists = variants.some((v) => v.sizeKey === sizeObj.key);

    if (exists) {
      // Remove variant
      setVariants((prev) => prev.filter((v) => v.sizeKey !== sizeObj.key));
    } else {
      // Add variant with default 5.00 low stock alert level
      const newRow: VariantRow = {
        id: generateUniqueId("v"),
        sizeKey: sizeObj.key,
        sizeName: sizeObj.label,
        skuCode: sizeObj.defaultSku,
        initialStock: sizeObj.stock,
        minAlertLevel: 5.0, // Default alert when stock reaches 5
        unitCost: sizeObj.cost,
      };
      setVariants((prev) => [...prev, newRow]);
    }
  };

  const handleRowChange = (id: string, field: keyof VariantRow, value: string | number) => {
    setVariants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSaved(true);
    setTimeout(() => {
      navigate("/dashboard/products");
    }, 700);
  };

  return (
    <div className="add-product-page">
      {/* TOP BACK LINK */}
      <Link to="/dashboard/products" className="back-link-btn">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {/* HEADER SECTION */}
      <div className="add-product-header">
        <div className="header-icon-box">
          <Package size={26} />
        </div>
        <div className="header-text-group">
          <h1>Add HVAC Product & Sizes</h1>
          <p>Create a product, set its unit and add size variants (e.g. 1/4", 3/8", 1/2") in one go.</p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check size={18} className="text-emerald-600" />
          Product and size variants saved successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CARD 1: BASIC DETAILS */}
        <div className="form-section-card">
          <div className="section-label-col">
            <h2>1. Basic Details</h2>
            <p>Tell us what product you're adding.</p>
          </div>

          <div className="section-fields-col">
            <div className="fields-row-2col">
              <div className="field-item">
                <label>Category *</label>
                <select
                  className="custom-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Ducting & Piping Materials">Ducting & Piping Materials</option>
                  <option value="Consumables & Gases">Consumables & Gases</option>
                  <option value="HVAC Equipment & Units">HVAC Equipment & Units</option>
                </select>
              </div>

              <div className="field-item">
                <label>Sub-Category *</label>
                <select
                  className="custom-select"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="Copper Pipes & Tubes">Copper Pipes & Tubes</option>
                  <option value="Thermal Pipe Insulation">Thermal Pipe Insulation</option>
                  <option value="GI Sheet Ducts">GI Sheet Ducts</option>
                </select>
              </div>
            </div>

            <div className="fields-row-2col">
              <div className="field-item">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. VRF Seamless Copper Tube (Grade A)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div className="field-item">
                <label>Brand / Make *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Mandev / Indigo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: UNIT & PACKAGING */}
        <div className="form-section-card">
          <div className="section-label-col">
            <h2>2. Unit & Packaging</h2>
            <p>
              Set the base unit and packaging details. Stock will be tracked in {baseUom.toLowerCase()} with
              decimal support.
            </p>
          </div>

          <div className="section-fields-col">
            <div className="unit-info-banner">
              <Info size={18} className="shrink-0 text-blue-600" />
              <span>
                <strong>Base Unit: {baseUom}.</strong> All site cutting will automatically deduct in decimals
                (e.g. 3.50m) without manual conversion.
              </span>
            </div>

            <div className="fields-row-2col items-center">
              <div className="field-item">
                <label>Base Unit *</label>
                <select
                  className="custom-select"
                  value={baseUom}
                  onChange={(e) => setBaseUom(e.target.value)}
                >
                  <option value="Meters">Meters</option>
                  <option value="Kg">Kg</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Sq.Ft">Sq.Ft</option>
                </select>
              </div>

              <div className="field-item">
                <div className="packaging-reference-box">
                  <Layers size={22} className="pkg-icon" />
                  <div>
                    <p className="pkg-label">Packaging (Reference)</p>
                    <p className="pkg-value">{pkgReference}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SIZE MATRIX (VARIANTS) */}
        <div className="form-section-card">
          <div className="section-label-col">
            <h2>3. Size Matrix (Variants)</h2>
            <p>
              Add size variants for this product. Select common sizes below and enter stock, alert level and
              cost.
            </p>
          </div>

          <div className="section-fields-col">
            {/* TOGGLE */}
            <div className="toggle-row">
              <button
                type="button"
                onClick={() => setEnableSizeMatrix((prev) => !prev)}
                className={`toggle-switch-btn ${enableSizeMatrix ? "" : "off"}`}
              >
                <div className="toggle-knob" />
              </button>
              <span className="toggle-label-text">
                Enable Size Matrix ({enableSizeMatrix ? "Yes" : "No"})
              </span>
            </div>

            {enableSizeMatrix && (
              <>
                {/* 1-CLICK SIZE CHIPS */}
                <div>
                  <div className="chips-section-title">Select Sizes (1-Click)</div>
                  <div className="preset-chips-cluster">
                    {ALL_COPPER_SIZES.map((sizeObj) => {
                      const isSelected = variants.some((v) => v.sizeKey === sizeObj.key);
                      return (
                        <button
                          key={sizeObj.key}
                          type="button"
                          onClick={() => handleToggleSizeChip(sizeObj)}
                          className={`size-pill-chip ${isSelected ? "selected" : ""}`}
                        >
                          {isSelected && <Check size={14} />}
                          {sizeObj.key}"
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SIZES TABLE */}
                <div className="variant-matrix-card">
                  <div className="responsive-matrix-wrapper">
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>Size Name</th>
                          <th>SKU Code</th>
                          <th>Initial Stock ({baseUom})</th>
                          <th>Min Alert Level ({baseUom})</th>
                          <th>Unit Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v) => (
                          <tr key={v.id}>
                            <td className="cell-size-name">{v.sizeName}</td>
                            <td className="cell-sku-text">{v.skuCode}</td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="table-input-field"
                                value={v.initialStock}
                                onChange={(e) =>
                                  handleRowChange(v.id, "initialStock", parseFloat(e.target.value) || 0)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="table-input-field"
                                value={v.minAlertLevel}
                                onChange={(e) =>
                                  handleRowChange(v.id, "minAlertLevel", parseFloat(e.target.value) || 0)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="table-input-field"
                                value={v.unitCost}
                                onChange={(e) =>
                                  handleRowChange(v.id, "unitCost", parseFloat(e.target.value) || 0)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM ACTIONS ROW */}
        <div className="bottom-actions-row">
          <Link to="/dashboard/products" className="btn-cancel-light">
            Cancel
          </Link>
          <button type="submit" className="btn-save-dark">
            <Check size={16} /> Save Product & Variants
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
