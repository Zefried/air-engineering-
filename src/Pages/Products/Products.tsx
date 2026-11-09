import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Ban,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Products.css';
import { INITIAL_PRODUCTS } from './productTypes';
import type { ProductItem } from './productTypes';

export const Products: React.FC = () => {
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [expandedId, setExpandedId] = useState<string | null>("PRD-001"); // Auto-expand first row to match design
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Products");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

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

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "All Categories" && p.categoryName !== selectedCategory) {
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
            <h2 className="stat-count">24</h2>
          </div>
        </div>

        {/* Size Variants */}
        <div className="stat-metric-card">
          <div className="stat-icon-box gray">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Size Variants</p>
            <h2 className="stat-count">68</h2>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="stat-metric-card">
          <div className="stat-icon-box amber">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Low Stock Alerts</p>
            <h2 className="stat-count">4</h2>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="stat-metric-card">
          <div className="stat-icon-box rose">
            <Ban size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Out of Stock</p>
            <h2 className="stat-count">2</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="products-toolbar">
        {/* Left Pills */}
        <div className="toolbar-left-pills">
          {["All Products", "In Stock", "Low Stock Alert"].map((tab) => (
            <button
              key={tab}
              className={`filter-pill-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
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
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">Category: All Categories</option>
            <option value="Ducting & Piping Materials">Ducting & Piping Materials</option>
            <option value="Consumables & Gases">Consumables & Gases</option>
            <option value="HVAC Equipment & Units">HVAC Equipment & Units</option>
          </select>

          <div className="search-pill-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              {filteredProducts.map((p) => {
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
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="row-action-more-btn" title="More options">
                          <MoreHorizontal size={18} />
                        </button>
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
                                  <th>Stock</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.variants.map((v) => {
                                  const status = getVariantStatus(v.stock, v.minThreshold);
                                  return (
                                    <tr key={v.id}>
                                      <td className="size-label-bold">{v.sizeLabel}</td>
                                      <td className="size-stock-text">
                                        {v.stock.toFixed(2)} {p.baseUom}
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
