import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Ban,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Products.css';
import { INITIAL_PRODUCTS } from './productTypes';
import type { ProductItem } from './productTypes';
import { productsApi } from '../../api/productsApi';
import type { ProductResponse } from '../../api/productsApi';
import { categoriesApi } from '../../api/categoriesApi';
import type { CategoryItem } from '../../api/categoriesApi';
import Pagination from '../../Components/Pagination/Pagination';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [expandedId, setExpandedId] = useState<string | null>("PRD-001");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All Products" | "In Stock" | "Low Stock Alert">("All Products");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categoryList, setCategoryList] = useState<{ id: number; name: string }[]>([]);

  // KPIs
  const [kpis, setKpis] = useState({
    total_items: 24,
    total_variants: 68,
    low_stock_alerts: 4,
    out_of_stock: 2,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Active menu dropdown id for row actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    brand: string;
    baseUom: string;
    packageUom: string;
    packageRatio: number;
    variants: { id: string; sizeLabel: string; sku: string; stock: number; minThreshold: number; unitCost: number }[];
  }>({
    name: '',
    brand: '',
    baseUom: '',
    packageUom: '',
    packageRatio: 1,
    variants: [],
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.status && res.data?.flat) {
          setCategoryList(res.data.flat.map((c: CategoryItem) => ({ id: c.id, name: c.name })));
        }
      } catch (err) {
        console.warn("Could not fetch categories from server:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products from backend API
  const handleManualSync = async () => {
    try {
      setLoading(true);
      let statusParam: "all" | "in_stock" | "low_stock" | "out_of_stock" = "all";
      if (activeTab === "In Stock") statusParam = "in_stock";
      if (activeTab === "Low Stock Alert") statusParam = "low_stock";

      const matchedCat = categoryList.find((c) => c.name === selectedCategory);
      const categoryIdParam = matchedCat ? matchedCat.id : undefined;

      const res = await productsApi.getAll({
        page: currentPage,
        per_page: perPage,
        search: search.trim() || undefined,
        category_id: categoryIdParam,
        status: statusParam,
      });

      if (res.status && res.data) {
        setKpis(res.kpis);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
        setTotalItems(res.data.total);
        setFrom(res.data.from || 0);
        setTo(res.data.to || 0);

        const mapped: ProductItem[] = res.data.data.map((p: ProductResponse) => ({
          id: String(p.id),
          name: p.name,
          brand: p.brand || "Standard",
          categoryName: p.category?.name || "General",
          subCategoryName: p.sub_category?.name,
          baseUom: p.base_uom,
          packageUom: p.package_uom || undefined,
          packageRatio: p.package_ratio ? Number(p.package_ratio) : undefined,
          hasVariants: Boolean(p.has_variants ?? true),
          variants: (p.variants || []).map((v) => ({
            id: String(v.id),
            sizeLabel: v.size_label,
            sku: v.sku,
            stock: Number(v.stock),
            minThreshold: Number(v.min_threshold),
            unitCost: Number(v.unit_cost),
          })),
        }));

        setProducts(mapped);
      }
    } catch (err) {
      console.warn("Backend API unavailable, using fallback dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    let statusParam: "all" | "in_stock" | "low_stock" | "out_of_stock" = "all";
    if (activeTab === "In Stock") statusParam = "in_stock";
    if (activeTab === "Low Stock Alert") statusParam = "low_stock";

    const matchedCat = categoryList.find((c) => c.name === selectedCategory);
    const categoryIdParam = matchedCat ? matchedCat.id : undefined;

    productsApi.getAll({
      page: currentPage,
      per_page: perPage,
      search: search.trim() || undefined,
      category_id: categoryIdParam,
      status: statusParam,
    }).then((res) => {
      if (active && res.status && res.data) {
        setKpis(res.kpis);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
        setTotalItems(res.data.total);
        setFrom(res.data.from || 0);
        setTo(res.data.to || 0);

        const mapped: ProductItem[] = res.data.data.map((p: ProductResponse) => ({
          id: String(p.id),
          name: p.name,
          brand: p.brand || "Standard",
          categoryName: p.category?.name || "General",
          subCategoryName: p.sub_category?.name,
          baseUom: p.base_uom,
          packageUom: p.package_uom || undefined,
          packageRatio: p.package_ratio ? Number(p.package_ratio) : undefined,
          hasVariants: Boolean(p.has_variants ?? true),
          variants: (p.variants || []).map((v) => ({
            id: String(v.id),
            sizeLabel: v.size_label,
            sku: v.sku,
            stock: Number(v.stock),
            minThreshold: Number(v.min_threshold),
            unitCost: Number(v.unit_cost),
          })),
        }));

        setProducts(mapped);
      }
    }).catch((err) => {
      console.warn("Backend API unavailable, using fallback dataset:", err);
    });

    return () => {
      active = false;
    };
  }, [currentPage, perPage, search, activeTab, selectedCategory, categoryList]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Helper for status badge
  const renderStatusPill = (status: "In Stock" | "Low Stock" | "Out of Stock") => {
    if (status === "In Stock") {
      return (
        <span className="status-pill-badge green">
          <span className="dot" /> In Stock
        </span>
      );
    }
    if (status === "Low Stock") {
      return (
        <span className="status-pill-badge amber">
          <span className="dot" /> Low Stock
        </span>
      );
    }
    return (
      <span className="status-pill-badge rose">
        <span className="dot" /> Out of Stock
      </span>
    );
  };

  // Helper for variant status
  const getVariantStatus = (stock: number, min: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= min) return "Low Stock";
    return "In Stock";
  };

  // Open Edit Modal
  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      brand: p.brand || "",
      baseUom: p.baseUom,
      packageUom: p.packageUom || "",
      packageRatio: p.packageRatio || 1,
      variants: p.variants.map((v) => ({ ...v })),
    });
    setActiveMenuId(null);
  };

  // Save Product Updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsUpdating(true);
      const numericId = parseInt(editingProduct.id, 10);
      if (!isNaN(numericId)) {
        const matchedCat = categoryList.find((c) => c.name === editingProduct.categoryName) || categoryList[0];
        await productsApi.update(numericId, {
          name: editForm.name,
          brand: editForm.brand,
          category_id: matchedCat ? matchedCat.id : 1,
          base_uom: editForm.baseUom,
          package_uom: editForm.packageUom || undefined,
          package_ratio: editForm.packageRatio || undefined,
          variants: editForm.variants.map((v) => {
            const vNumId = parseInt(v.id, 10);
            return {
              id: !isNaN(vNumId) ? vNumId : undefined,
              size_label: v.sizeLabel,
              sku: v.sku,
              stock: Number(v.stock),
              min_threshold: Number(v.minThreshold),
              unit_cost: Number(v.unitCost),
            };
          }),
        });
        await handleManualSync();
      } else {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? {
                  ...item,
                  name: editForm.name,
                  brand: editForm.brand,
                  baseUom: editForm.baseUom,
                  packageUom: editForm.packageUom,
                  packageRatio: editForm.packageRatio,
                  variants: editForm.variants,
                }
              : item
          )
        );
      }
      setEditingProduct(null);
    } catch (err) {
      console.error("Save product edit failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}" and its size variants?`)) {
      try {
        await productsApi.delete(id);
        handleManualSync();
      } catch (err) {
        console.warn("Delete call failed, removing locally:", err);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      setActiveMenuId(null);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter products locally as well if operating on fallback
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "All Categories" && p.categoryName !== selectedCategory && p.subCategoryName !== selectedCategory) {
        return false;
      }

      if (activeTab === "In Stock") {
        const allIn = p.variants.every((v) => v.stock > v.minThreshold);
        if (!allIn) return false;
      } else if (activeTab === "Low Stock Alert") {
        const hasLow = p.variants.some((v) => v.stock > 0 && v.stock <= v.minThreshold);
        if (!hasLow) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSizes = p.variants.some((v) => v.sizeLabel.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesSizes) return false;
      }

      return true;
    });
  }, [products, selectedCategory, activeTab, search]);

  return (
    <div className="products-page">
      {/* TOP BREADCRUMB */}
      <div className="products-breadcrumb">Inventory</div>

      {/* HEADER SECTION */}
      <div className="products-header">
        <div className="products-header-text">
          <h1>HVAC Product & Material Catalog</h1>
          <p>View, track, and manage all HVAC products, materials, and their stock.</p>
        </div>

        <div className="header-action-group">
          <button
            onClick={handleManualSync}
            className="btn-manage-categories flex items-center gap-2"
            disabled={loading}
            title="Sync products with backend"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync DB"}
          </button>
          <Link to="/dashboard/categories" className="btn-manage-categories">
            <Layers size={16} />
            Manage Categories
          </Link>
          <Link to="/dashboard/add-product" className="btn-add-product-dark">
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* 4 METRIC CARDS */}
      <div className="product-stats-grid">
        {/* Total Items */}
        <div className="stat-metric-card">
          <div className="stat-icon-box gray">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Items</p>
            <h2 className="stat-count">{kpis.total_items}</h2>
          </div>
        </div>

        {/* Size Variants */}
        <div className="stat-metric-card">
          <div className="stat-icon-box gray">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Size Variants</p>
            <h2 className="stat-count">{kpis.total_variants}</h2>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="stat-metric-card">
          <div className="stat-icon-box amber">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Low Stock Alerts</p>
            <h2 className="stat-count">{kpis.low_stock_alerts}</h2>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="stat-metric-card">
          <div className="stat-icon-box rose">
            <Ban size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Out of Stock</p>
            <h2 className="stat-count">{kpis.out_of_stock}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="products-toolbar">
        {/* Left Pills */}
        <div className="toolbar-left-pills">
          {(["All Products", "In Stock", "Low Stock Alert"] as const).map((tab) => (
            <button
              key={tab}
              className={`filter-pill-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Controls */}
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
            {categoryList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            {categoryList.length === 0 && (
              <>
                <option value="Ducting & Piping Materials">Ducting & Piping Materials</option>
                <option value="Consumables & Gases">Consumables & Gases</option>
                <option value="HVAC Equipment & Units">HVAC Equipment & Units</option>
              </>
            )}
          </select>

          <div className="search-pill-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="products-table-container">
        <div className="responsive-table-wrapper">
          <table className="custom-products-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Base Unit</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state py-12 text-center text-slate-500">
                    <Package size={36} className="mx-auto text-slate-300 mb-2" />
                    <h4>No products matching criteria</h4>
                    <p className="text-xs">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

                  return (
                    <React.Fragment key={p.id}>
                      {/* PRIMARY ROW */}
                      <tr
                        className={`main-product-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleExpand(p.id)}
                      >
                        <td>
                          <span className="product-chevron-trigger">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </span>
                        </td>
                        <td>
                          <div className="product-title-text">{p.name}</div>
                        </td>
                        <td>
                          <div className="product-brand-text">{p.brand}</div>
                        </td>
                        <td>
                          <div className="product-cat-text">
                            {p.subCategoryName || p.categoryName}
                          </div>
                        </td>
                        <td>
                          <div className="product-uom-text">{p.baseUom}</div>
                        </td>
                        <td>
                          <div className="product-stock-primary">
                            {totalStock.toFixed(2)} {p.baseUom}
                          </div>
                          {p.packageRatio && (
                            <div className="product-stock-sub">
                              (= {(totalStock / p.packageRatio).toFixed(1)} {p.packageUom})
                            </div>
                          )}
                        </td>
                        <td>
                          {renderStatusPill(
                            p.variants.some((v) => v.stock <= 0)
                              ? "Out of Stock"
                              : p.variants.some((v) => v.stock <= v.minThreshold)
                              ? "Low Stock"
                              : "In Stock"
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                          <div className="product-action-menu-container">
                            <button
                              className="row-action-more-btn"
                              title="More options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) => (prev === p.id ? null : p.id));
                              }}
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {activeMenuId === p.id && (
                              <div
                                className="product-flyout-dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="product-flyout-item"
                                  onClick={() => handleOpenEdit(p)}
                                >
                                  <Edit2 size={14} /> Edit Product
                                </button>

                                <div className="product-flyout-divider" />

                                <button
                                  className="product-flyout-item danger"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                >
                                  <Trash2 size={14} /> Delete Product
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* NESTED EXPANDED SIZES DRAWER */}
                      {isExpanded && p.variants.length > 0 && (
                        <tr>
                          <td colSpan={8} className="nested-sizes-drawer-cell">
                            <div className="nested-sizes-card">
                              <table className="nested-sizes-table">
                                <thead>
                                  <tr>
                                    <th>Size (Diameter)</th>
                                    <th>SKU Code</th>
                                    <th>Stock</th>
                                    <th>Min Alert Level</th>
                                    <th>Unit Cost (₹)</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.variants.map((v) => {
                                    const status = getVariantStatus(v.stock, v.minThreshold);
                                    return (
                                      <tr key={v.id}>
                                        <td className="size-label-bold">{v.sizeLabel}</td>
                                        <td className="font-mono text-xs text-slate-500">{v.sku}</td>
                                        <td className="size-stock-text">
                                          {v.stock.toFixed(2)} {p.baseUom}
                                        </td>
                                        <td className="text-xs text-slate-500 font-mono">
                                          {v.minThreshold.toFixed(2)} {p.baseUom}
                                        </td>
                                        <td className="text-xs font-semibold text-slate-800">
                                          ₹{v.unitCost.toFixed(2)}
                                        </td>
                                        <td>{renderStatusPill(status)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MONOCHROMATIC PAGINATION COMPONENT */}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          totalItems={totalItems || displayedProducts.length}
          from={from || 1}
          to={to || displayedProducts.length}
          perPage={perPage}
          perPageOptions={[5, 10, 20, 50]}
          onPageChange={(page) => setCurrentPage(page)}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="product-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="product-modal-header">
              <h3>Edit Product: {editingProduct.name}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="product-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="product-modal-body">
                <div className="product-modal-row-2col">
                  <div className="product-modal-field">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className="product-modal-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="product-modal-field">
                    <label>Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="product-modal-input"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="product-modal-row-2col">
                  <div className="product-modal-field">
                    <label>Base Unit of Measure (UOM) *</label>
                    <input
                      type="text"
                      className="product-modal-input"
                      value={editForm.baseUom}
                      onChange={(e) => setEditForm({ ...editForm, baseUom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="product-modal-field">
                    <label>Packaging UOM (Optional)</label>
                    <input
                      type="text"
                      className="product-modal-input"
                      placeholder="e.g. Coils or Boxes"
                      value={editForm.packageUom}
                      onChange={(e) => setEditForm({ ...editForm, packageUom: e.target.value })}
                    />
                  </div>
                </div>

                {editForm.variants.length > 0 && (
                  <div className="product-modal-variants-section">
                    <h4>Size Variants & Stock Levels</h4>
                    <table className="product-modal-variants-table">
                      <thead>
                        <tr>
                          <th>Size / Spec</th>
                          <th>SKU</th>
                          <th>Current Stock</th>
                          <th>Min Alert</th>
                          <th>Unit Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.variants.map((v, idx) => (
                          <tr key={v.id || idx}>
                            <td>
                              <input
                                type="text"
                                className="product-modal-var-input"
                                value={v.sizeLabel}
                                onChange={(e) => {
                                  const updated = [...editForm.variants];
                                  updated[idx].sizeLabel = e.target.value;
                                  setEditForm({ ...editForm, variants: updated });
                                }}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="product-modal-var-input font-mono"
                                value={v.sku}
                                onChange={(e) => {
                                  const updated = [...editForm.variants];
                                  updated[idx].sku = e.target.value;
                                  setEditForm({ ...editForm, variants: updated });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="product-modal-var-input font-semibold"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...editForm.variants];
                                  updated[idx].stock = parseFloat(e.target.value) || 0;
                                  setEditForm({ ...editForm, variants: updated });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="product-modal-var-input"
                                value={v.minThreshold}
                                onChange={(e) => {
                                  const updated = [...editForm.variants];
                                  updated[idx].minThreshold = parseFloat(e.target.value) || 0;
                                  setEditForm({ ...editForm, variants: updated });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="product-modal-var-input"
                                value={v.unitCost}
                                onChange={(e) => {
                                  const updated = [...editForm.variants];
                                  updated[idx].unitCost = parseFloat(e.target.value) || 0;
                                  setEditForm({ ...editForm, variants: updated });
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="product-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-product-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-product-save"
                >
                  <Check size={14} /> {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
