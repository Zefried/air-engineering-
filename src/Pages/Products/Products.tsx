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
  RefreshCw
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
                        <td onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
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
                              className="absolute right-2 top-8 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                              >
                                <Trash2 size={14} /> Delete Product
                              </button>
                            </div>
                          )}
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
    </div>
  );
};

export default Products;
