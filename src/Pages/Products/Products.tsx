import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FolderTree,
  Eye,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Styles/Products.css';
import { Can } from '../../Components/Auth/Can';
import { INITIAL_PRODUCTS } from './productTypes';
import type { ProductItem } from './productTypes';

export const Products: React.FC = () => {
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [expandedId, setExpandedId] = useState<string | null>("PRD-001"); // Auto-expand first item
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Products");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Helper to calculate status of a single variant
  const getVariantStatus = (stock: number, min: number) => {
    if (stock <= 0) return { label: "Out of Stock", class: "outofstock", icon: XCircle };
    if (stock <= min) return { label: "Low Stock", class: "lowstock", icon: AlertTriangle };
    return { label: "In Stock", class: "instock", icon: CheckCircle2 };
  };

  // Compute aggregate status for parent product
  const getProductOverallStatus = (product: ProductItem) => {
    const hasOut = product.variants.some((v) => v.stock <= 0);
    const hasLow = product.variants.some((v) => v.stock > 0 && v.stock <= v.minThreshold);
    if (hasOut) return { label: "Needs Restock", class: "outofstock" };
    if (hasLow) return { label: "Low Stock Alert", class: "lowstock" };
    return { label: "In Stock", class: "instock" };
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== "All Categories" && prod.categoryName !== selectedCategory) {
        return false;
      }

      // Tab status filter
      if (activeTab === "Low Stock") {
        const hasLow = prod.variants.some((v) => v.stock > 0 && v.stock <= v.minThreshold);
        if (!hasLow) return false;
      } else if (activeTab === "Out of Stock") {
        const hasOut = prod.variants.some((v) => v.stock <= 0);
        if (!hasOut) return false;
      } else if (activeTab === "In Stock") {
        const allGood = prod.variants.every((v) => v.stock > v.minThreshold);
        if (!allGood) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesVariant = prod.variants.some(
          (v) => v.sizeLabel.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesBrand && !matchesVariant) return false;
      }

      return true;
    });
  }, [products, selectedCategory, activeTab, search]);

  // Overall counts
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const lowStockCount = products.reduce(
    (acc, p) => acc + p.variants.filter((v) => v.stock > 0 && v.stock <= v.minThreshold).length,
    0
  );
  const outOfStockCount = products.reduce(
    (acc, p) => acc + p.variants.filter((v) => v.stock <= 0).length,
    0
  );

  return (
    <div className="products-page">
      {/* HEADER */}
      <div className="products-header">
        <div>
          <h2>
            <Package size={26} className="text-blue-600" />
            HVAC Product & Material Catalog
          </h2>
          <p>Live inventory tracking with size-variant fractional decimal calculations</p>
        </div>

        <div className="header-action-group">
          <Link to="/dashboard/categories" className="btn-secondary flex items-center gap-2">
            <FolderTree size={16} />
            Manage Categories
          </Link>
          <Can roles={["admin", "subadmin"]}>
            <Link to="/dashboard/add-product" className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Add Product
            </Link>
          </Can>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="product-stats-row">
        <div className="p-stat-card">
          <p className="p-stat-label">Total Catalog Items</p>
          <h3 className="p-stat-value">{products.length}</h3>
        </div>
        <div className="p-stat-card">
          <p className="p-stat-label">Total Size Variants</p>
          <h3 className="p-stat-value text-blue-600">{totalVariants}</h3>
        </div>
        <div className="p-stat-card">
          <p className="p-stat-label">Low Stock Alerts</p>
          <h3 className="p-stat-value text-amber-600">{lowStockCount}</h3>
        </div>
        <div className="p-stat-card">
          <p className="p-stat-label">Out of Stock Sizes</p>
          <h3 className="p-stat-value text-rose-600">{outOfStockCount}</h3>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="products-filter-bar">
        <div className="filter-tabs">
          {["All Products", "In Stock", "Low Stock", "Out of Stock"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          <select
            className="form-select text-xs py-2 px-3 w-48"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            <option value="Ducting & Piping Materials">Ducting & Piping Materials</option>
            <option value="Consumables & Gases">Consumables & Gases</option>
            <option value="HVAC Equipment & Units">HVAC Equipment & Units</option>
          </select>

          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search product, size, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="products-table-card">
        <table className="products-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>Product Details</th>
              <th>Category / Subcategory</th>
              <th>Base Unit</th>
              <th>Sizes Available</th>
              <th>Total Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const isExpanded = expandedId === product.id;
              const overallStatus = getProductOverallStatus(product);
              const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

              return (
                <React.Fragment key={product.id}>
                  <tr
                    className="product-main-row cursor-pointer"
                    onClick={() => toggleExpand(product.id)}
                  >
                    <td>
                      <button
                        className={`expand-chevron-btn ${isExpanded ? "rotated" : ""}`}
                        title={isExpanded ? "Collapse Sizes" : "Expand Sizes"}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                    <td>
                      <div className="product-name-block">
                        <div>
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400">Brand: {product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                        {product.subCategoryName || product.categoryName}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {product.baseUom}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600 font-medium">
                        {product.hasVariants
                          ? `${product.variants.length} Sizes`
                          : "Single Model"}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-gray-800">
                        {totalStock.toFixed(2)} {product.baseUom}
                      </span>
                      {product.packageRatio && (
                        <div className="text-xs text-gray-400">
                          (~{(totalStock / product.packageRatio).toFixed(1)} {product.packageUom})
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${overallStatus.class}`}>
                        {overallStatus.label}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="cat-actions">
                        <button className="action-btn" title="View Details">
                          <Eye size={15} />
                        </button>
                        <Can roles={["admin", "subadmin"]}>
                          <button className="action-btn" title="Edit Product">
                            <Edit2 size={15} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE SIZES DRAWER ROW */}
                  {isExpanded && (
                    <tr className="variants-expanded-row">
                      <td colSpan={8}>
                        <div className="variants-container">
                          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600 font-semibold">
                            <span>
                              Stock Breakdown by Size / Dimension &bull; Base Unit:{" "}
                              <strong>{product.baseUom}</strong>
                            </span>
                            <span className="text-blue-600">
                              Decimals supported for site consumption (e.g. 3.50 {product.baseUom})
                            </span>
                          </div>

                          <table className="variants-inner-table">
                            <thead>
                              <tr>
                                <th>Size / Dimension</th>
                                <th>SKU Code</th>
                                <th>Current Stock</th>
                                <th>Min Alert Threshold</th>
                                <th>Unit Cost</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants.map((v) => {
                                const vStatus = getVariantStatus(v.stock, v.minThreshold);
                                const StatusIcon = vStatus.icon;

                                return (
                                  <tr key={v.id}>
                                    <td className="font-bold text-gray-900">
                                      {v.sizeLabel}
                                    </td>
                                    <td className="font-mono text-xs text-gray-500">
                                      {v.sku}
                                    </td>
                                    <td>
                                      <span
                                        className={`font-extrabold ${
                                          v.stock <= 0
                                            ? "text-rose-600"
                                            : v.stock <= v.minThreshold
                                            ? "text-amber-600"
                                            : "text-emerald-700"
                                        }`}
                                      >
                                        {v.stock.toFixed(2)} {product.baseUom}
                                      </span>
                                    </td>
                                    <td className="text-gray-500 text-xs">
                                      {v.minThreshold.toFixed(2)} {product.baseUom}
                                    </td>
                                    <td className="text-gray-700 font-medium">
                                      ₹{v.unitCost.toLocaleString()}
                                    </td>
                                    <td>
                                      <span className={`status-pill ${vStatus.class}`}>
                                        <StatusIcon size={12} />
                                        {vStatus.label}
                                      </span>
                                    </td>
                                    <td className="text-right">
                                      <Link
                                        to="/dashboard/projects"
                                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded font-semibold transition"
                                      >
                                        Issue to Site &rarr;
                                      </Link>
                                    </td>
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
  );
};

export default Products;
