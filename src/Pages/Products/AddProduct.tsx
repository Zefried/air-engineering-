import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Info,
  Check,
  Layers,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AddProduct.css';
import { generateUniqueId } from '../../utils/idGenerator';
import { categoriesApi } from '../../api/categoriesApi';
import type { CategoryItem, VariantConfigPreset } from '../../api/categoriesApi';
import { productsApi } from '../../api/productsApi';
import type { ProductPayload } from '../../api/productsApi';

interface VariantRow {
  id: string;
  sizeKey: string;
  sizeName: string;
  skuCode: string;
  initialStock: number;
  minAlertLevel: number;
  unitCost: number;
  packageRatio?: number;
  isCustom?: boolean;
}

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();

  // Categories from backend
  const [categoriesTree, setCategoriesTree] = useState<CategoryItem[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryItem[]>([]);

  // Basic Details
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [subCategoryId, setSubCategoryId] = useState<number | string>("");
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNo] = useState("");

  // Unit & Packaging
  const [baseUom, setBaseUom] = useState("Meters");
  const [packageUom, setPackageUom] = useState("Coils");
  const [packageRatio, setPackageRatio] = useState<number>(15.0);

  // Variant Matrix Toggle
  const [enableSizeMatrix, setEnableSizeMatrix] = useState(true);

  // Variant Rows
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // Single Product Fields (When enableSizeMatrix is false)
  const [singleSku, setSingleSku] = useState("");
  const [singleStock, setSingleStock] = useState<number>(0);
  const [singleMinThreshold, setSingleMinThreshold] = useState<number>(5.0);
  const [singleUnitCost, setSingleUnitCost] = useState<number>(0);

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.status && res.data) {
          const tree = res.data.tree || [];
          const flat = res.data.flat || [];
          setCategoriesTree(tree);
          setFlatCategories(flat);

          if (tree.length > 0) {
            const firstParent = tree[0];
            setCategoryId(firstParent.id);
            if (firstParent.children && firstParent.children.length > 0) {
              setSubCategoryId(firstParent.children[0].id);
            }
          }
        }
      } catch (err) {
        console.warn("Categories fetch error:", err);
      }
    };
    fetchCats();
  }, []);

  // Selected Category and Subcategory Objects
  const selectedParentCategory = useMemo(() => {
    return flatCategories.find((c) => String(c.id) === String(categoryId));
  }, [flatCategories, categoryId]);

  const selectedSubCategory = useMemo(() => {
    return flatCategories.find((c) => String(c.id) === String(subCategoryId));
  }, [flatCategories, subCategoryId]);

  // Available subcategories for chosen parent
  const availableSubCategories = useMemo(() => {
    return flatCategories.filter(
      (c) => c.parent_id !== null && String(c.parent_id) === String(categoryId)
    );
  }, [flatCategories, categoryId]);

  // Effective Active Category (Subcategory takes precedence, falls back to parent)
  const activeCategory = selectedSubCategory || selectedParentCategory;

  // Effective Variant Configuration (Inherited or overridden)
  const effectiveConfig = useMemo(() => {
    if (!activeCategory) return null;
    return activeCategory.effective_variant_config || activeCategory.variant_config || selectedParentCategory?.variant_config || null;
  }, [activeCategory, selectedParentCategory]);

  // Attribute label (e.g. "Outer Diameter" vs "Gas Type" vs "Wall Thickness")
  const attributeLabel = effectiveConfig?.attribute_name || "Size / Spec";

  // Chip Presets for active category
  const chipPresets: VariantConfigPreset[] = useMemo(() => {
    return effectiveConfig?.presets || [];
  }, [effectiveConfig]);

  // Auto-adapt form defaults when active category changes
  useEffect(() => {
    if (effectiveConfig) {
      if (effectiveConfig.base_uom) setBaseUom(effectiveConfig.base_uom);
      if (effectiveConfig.package_uom) setPackageUom(effectiveConfig.package_uom);
      if (effectiveConfig.package_ratio) setPackageRatio(effectiveConfig.package_ratio);

      if (effectiveConfig.has_variants === false) {
        setEnableSizeMatrix(false);
        setVariants([]);
      } else {
        setEnableSizeMatrix(true);
        // Pre-select the first 3 presets if available
        if (effectiveConfig.presets && effectiveConfig.presets.length > 0) {
          const initial = effectiveConfig.presets.slice(0, 3).map((p, idx) => ({
            id: `v-${idx + 1}`,
            sizeKey: p.label,
            sizeName: p.label,
            skuCode: p.sku_suffix ? `SKU-${p.sku_suffix}` : `SKU-00${idx + 1}`,
            initialStock: 10.0,
            minAlertLevel: 5.0,
            unitCost: p.default_cost || 0,
            packageRatio: p.package_ratio || effectiveConfig.package_ratio || 1.0,
            isCustom: false,
          }));
          setVariants(initial);
        }
      }
    } else if (activeCategory) {
      if (activeCategory.default_uom) setBaseUom(activeCategory.default_uom);
    }
  }, [categoryId, subCategoryId]);

  // Toggle size chip
  const handleToggleSizeChip = (preset: VariantConfigPreset) => {
    const exists = variants.some((v) => v.sizeKey === preset.label);

    if (exists) {
      setVariants((prev) => prev.filter((v) => v.sizeKey !== preset.label));
    } else {
      const newRow: VariantRow = {
        id: generateUniqueId("v"),
        sizeKey: preset.label,
        sizeName: preset.label,
        skuCode: preset.sku_suffix ? `SKU-${preset.sku_suffix}` : generateUniqueId("SKU"),
        initialStock: 10.0,
        minAlertLevel: 5.0,
        unitCost: preset.default_cost || 0,
        packageRatio: preset.package_ratio || packageRatio || 1.0,
        isCustom: false,
      };
      setVariants((prev) => [...prev, newRow]);
    }
  };

  // Add custom variant row
  const handleAddCustomVariant = () => {
    const customCount = variants.filter((v) => v.isCustom).length + 1;
    const newRow: VariantRow = {
      id: generateUniqueId("v-custom"),
      sizeKey: `Custom-${customCount}`,
      sizeName: "",
      skuCode: `SKU-CST-${customCount}`,
      initialStock: 0,
      minAlertLevel: 5.0,
      unitCost: 0,
      packageRatio: packageRatio || 1.0,
      isCustom: true,
    };
    setVariants((prev) => [...prev, newRow]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleRowChange = (id: string, field: keyof VariantRow, value: string | number) => {
    setVariants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    const effectiveCatId = categoryId || (categoriesTree.length > 0 ? categoriesTree[0].id : 1);

    const payload: ProductPayload = {
      name: productName.trim(),
      category_id: effectiveCatId,
      sub_category_id: subCategoryId ? subCategoryId : null,
      brand: brand.trim() || undefined,
      model_no: modelNo.trim() || undefined,
      base_uom: baseUom,
      package_uom: packageUom || undefined,
      package_ratio: packageRatio || undefined,
      has_variants: enableSizeMatrix,
      variants: enableSizeMatrix && variants.length > 0
        ? variants.map((v) => ({
            size_label: v.sizeName || v.sizeKey,
            variant_name: v.sizeName || v.sizeKey,
            sku: v.skuCode,
            stock: Number(v.initialStock) || 0,
            min_threshold: Number(v.minAlertLevel) || 5.0,
            unit_cost: Number(v.unitCost) || 0,
            package_uom: packageUom || undefined,
            package_ratio: v.packageRatio ? Number(v.packageRatio) : undefined,
          }))
        : [
            {
              size_label: "Standard",
              variant_name: "Standard",
              sku: singleSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
              stock: Number(singleStock) || 0,
              min_threshold: Number(singleMinThreshold) || 5.0,
              unit_cost: Number(singleUnitCost) || 0,
              package_uom: packageUom || undefined,
              package_ratio: packageRatio || undefined,
            },
          ],
    };

    try {
      setIsSubmitting(true);
      await productsApi.create(payload);
      setIsSaved(true);
      setTimeout(() => {
        navigate("/dashboard/products");
      }, 700);
    } catch (err: unknown) {
      console.warn("Backend API error on create:", err);
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(apiMsg || "Failed to save product to database.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1>Add HVAC Product & Inventory</h1>
          <p>
            Configure product details, category, unit, packaging, and dynamic variants ({attributeLabel}).
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check size={18} className="text-emerald-600" />
          Product and variants saved successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CARD 1: BASIC DETAILS */}
        <div className="form-section-card">
          <div className="section-label-col">
            <h2>1. Category & Product Info</h2>
            <p>Select category to load specialized unit & variant presets automatically.</p>
          </div>

          <div className="section-fields-col">
            <div className="fields-row-2col">
              <div className="field-item">
                <label>Category *</label>
                <select
                  className="custom-select"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const chosen = categoriesTree.find((c) => String(c.id) === String(e.target.value));
                    if (chosen && chosen.children && chosen.children.length > 0) {
                      setSubCategoryId(chosen.children[0].id);
                    } else {
                      setSubCategoryId("");
                    }
                  }}
                  required
                >
                  {categoriesTree.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-item">
                <label>Sub-Category</label>
                <select
                  className="custom-select"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                >
                  <option value="">None (Top Level Category)</option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fields-row-2col">
              <div className="field-item">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. VRF Seamless Copper Tube or R-410A Refrigerant"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div className="field-item">
                <label>Brand / Manufacturer</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Mandev, Chemours, Astral, Honeywell"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
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
              Stock is strictly tracked in <strong>{baseUom}</strong>. Packaging is a conversion reference for warehousing.
            </p>
          </div>

          <div className="section-fields-col">
            <div className="unit-info-banner">
              <Info size={18} className="shrink-0 text-blue-600" />
              <span>
                <strong>Authoritative Base Unit: {baseUom}.</strong> All site dispatches and cuts deduct in decimals without conversion rounding errors.
              </span>
            </div>

            <div className="fields-row-2col items-center">
              <div className="field-item">
                <label>Base Inventory Unit *</label>
                <select
                  className="custom-select"
                  value={baseUom}
                  onChange={(e) => setBaseUom(e.target.value)}
                >
                  <option value="Meters">Meters (Piping, Insulation, Cables)</option>
                  <option value="Kg">Kg (Refrigerant Gases, Chemicals)</option>
                  <option value="Pieces">Pieces (Valves, Thermostats, Breakers)</option>
                  <option value="Sq.Ft">Sq.Ft (Duct Sheet, Underdeck Insulation)</option>
                  <option value="Sets">Sets (Refnet Kits, Flange Sets)</option>
                  <option value="Rolls">Rolls (Foil Tapes, Acoustic Foam)</option>
                </select>
              </div>

              <div className="field-item">
                <div className="packaging-reference-box">
                  <Layers size={22} className="pkg-icon" />
                  <div>
                    <p className="pkg-label">Default Packaging Reference</p>
                    <p className="pkg-value">
                      1 {packageUom || "Package"} = {packageRatio || 1} {baseUom}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="fields-row-2col mt-3">
              <div className="field-item">
                <label>Packaging Container Label</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Coil, Cylinder, Box, Bundle, Drum"
                  value={packageUom}
                  onChange={(e) => setPackageUom(e.target.value)}
                />
              </div>

              <div className="field-item">
                <label>Conversion Ratio ({baseUom} per {packageUom || 'Package'})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="custom-input"
                  value={packageRatio}
                  onChange={(e) => setPackageRatio(parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: VARIANT MATRIX OR SINGLE PRODUCT */}
        <div className="form-section-card">
          <div className="section-label-col">
            <h2>3. {enableSizeMatrix ? `Variant Matrix (${attributeLabel})` : 'Single Product Inventory'}</h2>
            <p>
              {enableSizeMatrix
                ? `Add variations based on ${attributeLabel.toLowerCase()}. Stock and pricing are tracked independently per variant.`
                : 'This product has a single specification. Enter standard stock and alert thresholds below.'}
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
                Has Multiple Variants / Sizes ({enableSizeMatrix ? "Yes" : "No"})
              </span>
            </div>

            {/* IF SINGLE PRODUCT */}
            {!enableSizeMatrix ? (
              <div className="single-product-grid">
                <div className="single-product-field">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    className="custom-input font-mono"
                    placeholder="e.g. TH-6861"
                    value={singleSku}
                    onChange={(e) => setSingleSku(e.target.value)}
                  />
                </div>
                <div className="single-product-field">
                  <label>Opening Stock ({baseUom})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    value={singleStock}
                    onChange={(e) => setSingleStock(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="single-product-field">
                  <label>Min Alert ({baseUom})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    value={singleMinThreshold}
                    onChange={(e) => setSingleMinThreshold(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="single-product-field">
                  <label>Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    value={singleUnitCost}
                    onChange={(e) => setSingleUnitCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* 1-CLICK DYNAMIC PRESET CHIPS */}
                {chipPresets.length > 0 && (
                  <div className="mb-4">
                    <div className="chips-section-title">
                      Select {attributeLabel} (1-Click Presets from Category):
                    </div>
                    <div className="preset-chips-cluster">
                      {chipPresets.map((preset) => {
                        const isSelected = variants.some((v) => v.sizeKey === preset.label);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleToggleSizeChip(preset)}
                            className={`size-pill-chip ${isSelected ? "selected" : ""}`}
                          >
                            {isSelected && <Check size={14} />}
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SIZES TABLE */}
                <div className="variant-matrix-card">
                  <div className="responsive-matrix-wrapper">
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>{attributeLabel} / Specification</th>
                          <th>SKU Code</th>
                          <th>Stock ({baseUom})</th>
                          <th>Min Alert ({baseUom})</th>
                          <th>Unit Cost (₹)</th>
                          <th>Pkg Ratio ({baseUom}/{packageUom || 'Pkg'})</th>
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-slate-400 italic">
                              No variants selected. Click presets above or "+ Add Custom Variant" below.
                            </td>
                          </tr>
                        ) : (
                          variants.map((v) => (
                            <tr key={v.id}>
                              <td className="cell-size-name">
                                {v.isCustom ? (
                                  <input
                                    type="text"
                                    className="table-input-field"
                                    placeholder="Enter custom size/spec..."
                                    value={v.sizeName}
                                    onChange={(e) => handleRowChange(v.id, "sizeName", e.target.value)}
                                    required
                                  />
                                ) : (
                                  v.sizeName
                                )}
                              </td>
                              <td className="cell-sku-text">
                                <input
                                  type="text"
                                  className="table-input-field font-mono"
                                  value={v.skuCode}
                                  onChange={(e) => handleRowChange(v.id, "skuCode", e.target.value)}
                                />
                              </td>
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
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="table-input-field"
                                  placeholder={String(packageRatio)}
                                  value={v.packageRatio || ""}
                                  onChange={(e) =>
                                    handleRowChange(v.id, "packageRatio", parseFloat(e.target.value) || 0)
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-remove-row"
                                  onClick={() => handleRemoveVariant(v.id)}
                                  title="Remove variant"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ADD CUSTOM VARIANT BUTTON */}
                <button
                  type="button"
                  onClick={handleAddCustomVariant}
                  className="btn-add-custom-variant"
                >
                  <Plus size={14} /> + Add Custom Variant (Unlisted {attributeLabel})
                </button>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM ACTIONS ROW */}
        <div className="bottom-actions-row">
          <Link to="/dashboard/products" className="btn-cancel-light">
            Cancel
          </Link>
          <button type="submit" className="btn-save-dark" disabled={isSubmitting}>
            <Check size={16} /> {isSubmitting ? "Saving..." : "Save Product & Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
