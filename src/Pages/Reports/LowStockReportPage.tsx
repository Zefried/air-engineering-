import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Package,
  Layers,
  DollarSign,
  ChevronRight,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import {
  lowStockReportApi,
  type LowStockItem,
  type LowStockKPIs
} from '../../api/lowStockReportApi';
import { ReportNavTabs } from './Components/ReportNavTabs';
import './Styles/LowStockReport.css';

export const LowStockReportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [kpis, setKpis] = useState<LowStockKPIs>({
    critical_count: 0,
    out_of_stock_count: 0,
    low_stock_count: 0,
    total_reorder_cost: 0,
    impacted_projects_count: 0,
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await lowStockReportApi.getSummary({
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      });

      if (res.status) {
        setKpis(res.kpis);
        setCategories(res.categories || []);
        setItems(res.items || []);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to load low stock alerts.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSeverity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatINR = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="low-stock-report-container">
      {/* Ambient Atmospheric Top Glow */}
      <div className="low-stock-top-ambient" />

      {/* QUICK REPORT SWITCHER NAV TABS */}
      <ReportNavTabs />

      {/* HEADER ROW */}
      <div className="low-stock-header-row">
        <div className="low-stock-title-wrap">
          <div className="low-stock-icon-wrap">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="low-stock-title">Low Stock & Replenishment</h1>
            <p className="low-stock-subtitle">
              Safety stock monitoring, zero-stock warnings, and reorder cost estimates
            </p>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER SELECTOR */}
      <div className="low-stock-category-selector">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Package size={16} color="#64748b" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="low-stock-category-dropdown"
          >
            <option value="all">All Material Categories (Storewide)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <ChevronDown size={16} color="#94a3b8" />
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="low-stock-insight-banner" style={{ background: '#fef2f2', color: '#991b1b' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2x2 MOBILE KPI GRID */}
      <div className="low-stock-kpi-grid">
        {/* KPI 1: Out of Stock */}
        <div
          className={`low-stock-kpi-card ${selectedSeverity === 'out_of_stock' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity(selectedSeverity === 'out_of_stock' ? 'all' : 'out_of_stock')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill red">
              <AlertCircle size={13} />
            </div>
            <span className="kpi-card-label">Out of Stock</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="low-stock-kpi-value rose">{kpis.out_of_stock_count}</div>
          <div className="kpi-card-sub">Zero inventory</div>
        </div>

        {/* KPI 2: Low Stock */}
        <div
          className={`low-stock-kpi-card ${selectedSeverity === 'low_stock' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity(selectedSeverity === 'low_stock' ? 'all' : 'low_stock')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill amber">
              <AlertTriangle size={13} />
            </div>
            <span className="kpi-card-label">Low Stock</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="low-stock-kpi-value amber">{kpis.low_stock_count}</div>
          <div className="kpi-card-sub">Below threshold</div>
        </div>

        {/* KPI 3: Reorder Cost Est. */}
        <div className="low-stock-kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-pill purple">
              <DollarSign size={13} />
            </div>
            <span className="kpi-card-label">Reorder Est.</span>
          </div>
          <div className="low-stock-kpi-value purple">
            {kpis.total_reorder_cost >= 100000
              ? `₹${(kpis.total_reorder_cost / 100000).toFixed(2)}L`
              : formatINR(kpis.total_reorder_cost)}
          </div>
          <div className="kpi-card-sub">Replenishment capital</div>
        </div>

        {/* KPI 4: Total Critical */}
        <div
          className={`low-stock-kpi-card ${selectedSeverity === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity('all')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon-pill blue">
              <Layers size={13} />
            </div>
            <span className="kpi-card-label">Total Critical</span>
            <ChevronRight size={14} className="kpi-card-arrow" />
          </div>
          <div className="low-stock-kpi-value">{kpis.critical_count}</div>
          <div className="kpi-card-sub">Alerted items</div>
        </div>
      </div>

      {/* SEGMENTED FILTER PILL TABS */}
      <div className="low-stock-tab-pills">
        <button
          className={`low-stock-tab-pill ${selectedSeverity === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity('all')}
        >
          <span>All Critical</span>
          <span className="low-stock-tab-pill-count">{kpis.critical_count}</span>
        </button>

        <button
          className={`low-stock-tab-pill ${selectedSeverity === 'out_of_stock' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity('out_of_stock')}
        >
          <span>Out of Stock</span>
          <span className="low-stock-tab-pill-count">{kpis.out_of_stock_count}</span>
        </button>

        <button
          className={`low-stock-tab-pill ${selectedSeverity === 'low_stock' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity('low_stock')}
        >
          <span>Low Stock</span>
          <span className="low-stock-tab-pill-count">{kpis.low_stock_count}</span>
        </button>
      </div>

      {/* OPERATIONS INSIGHT BANNER */}
      {kpis.out_of_stock_count > 0 ? (
        <div className="low-stock-insight-banner">
          <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0 }} />
          <span>
            <strong>Urgent:</strong> {kpis.out_of_stock_count} items are completely out of stock. Total estimated
            capital to replenish to safety threshold is {formatINR(kpis.total_reorder_cost)}.
          </span>
        </div>
      ) : (
        <div className="low-stock-insight-banner" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Attention:</strong> {kpis.low_stock_count} items are currently below minimum safety thresholds.
          </span>
        </div>
      )}

      {/* DATA DISPLAY: LOADING / EMPTY / MOBILE CARDS / DESKTOP TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
          <div>Scanning warehouse stock levels...</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <Package size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            No Critical Stock Alerts
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
            All inventory in this category is currently operating above safety thresholds.
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================
             1. MOBILE-FIRST CARDS VIEW (< 768px)
             ======================================================== */}
          <div className="mobile-stock-cards-list">
            {items.map((item) => {
              const isOutOfStock = item.severity === 'out_of_stock';
              const fillPercent = item.min_threshold > 0 ? Math.min(100, Math.round((item.stock / item.min_threshold) * 100)) : 0;

              return (
                <div key={item.id} className={`mobile-stock-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                  {/* Top: Product Name, Category & Severity Badge */}
                  <div className="stock-card-header">
                    <div>
                      <div className="stock-product-name">{item.product_name}</div>
                      <div className="stock-variant-sub">
                        <span><strong>{item.size_label}</strong></span>
                        <span>&bull;</span>
                        <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>
                      </div>
                    </div>

                    <span className={`stock-severity-badge ${item.severity}`}>
                      {isOutOfStock ? '✕ Out of Stock' : '⚠️ Low Stock'}
                    </span>
                  </div>

                  {/* Stock Gauge Box */}
                  <div className="stock-gauge-box">
                    <div className="stock-gauge-text">
                      <span>Stock Level:</span>
                      <strong>
                        {item.stock} / {item.min_threshold} {item.uom}
                      </strong>
                    </div>

                    <div className="stock-gauge-track">
                      <div
                        className={`stock-gauge-fill ${item.severity}`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Reorder Economics Row */}
                  <div className="stock-econ-row">
                    <div>
                      Rate: <strong>{formatINR(item.unit_cost)}</strong> / {item.uom}
                    </div>
                    <div>
                      Rec. Order: <span className="reorder-val-badge">+{item.reorder.recommended_qty} {item.uom} ({formatINR(item.reorder.estimated_cost)})</span>
                    </div>
                  </div>

                  {/* Impacted Projects (if any) */}
                  {item.impacted_projects && item.impacted_projects.length > 0 && (
                    <div className="stock-impacted-sites">
                      <span>Sites using part:</span>
                      {item.impacted_projects.map((p) => (
                        <span key={p.id} className="impacted-site-pill">
                          {p.project_code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================================
             2. DESKTOP-ONLY TABLE VIEW (≥ 768px)
             ======================================================== */}
          <div className="desktop-stock-table-card">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Material & SKU</th>
                  <th>Category</th>
                  <th>Stock vs Threshold</th>
                  <th>Unit Rate</th>
                  <th>Recommended Order</th>
                  <th>Est. Cost</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isOutOfStock = item.severity === 'out_of_stock';
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>{item.product_name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {item.size_label} &bull; <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 12, color: '#475569' }}>{item.category_name}</span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: isOutOfStock ? '#e11d48' : '#b45309' }}>
                          {item.stock} / {item.min_threshold} {item.uom}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12.5, color: '#0f172a' }}>
                          {formatINR(item.unit_cost)}
                        </div>
                      </td>

                      <td>
                        <strong style={{ fontSize: 12.5, color: '#0f172a' }}>
                          +{item.reorder.recommended_qty} {item.uom}
                        </strong>
                      </td>

                      <td>
                        <strong style={{ fontSize: 13, color: '#7c3aed' }}>
                          {formatINR(item.reorder.estimated_cost)}
                        </strong>
                      </td>

                      <td>
                        <span className={`stock-severity-badge ${item.severity}`}>
                          {isOutOfStock ? '✕ Out of Stock' : '⚠️ Low Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LowStockReportPage;
