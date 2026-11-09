import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Trash2,
  RotateCcw,
  Search,
  Layers,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { inventoryApi } from '../../../api/inventoryApi';
import type {
  InventoryTransactionItem,
  InventoryKpis,
} from '../../../api/inventoryApi';
import '../Styles/MaterialAllocationsTable.css';

interface MaterialAllocationsTableProps {
  projectId?: number;
  onRefreshNeeded?: () => void;
}

export const MaterialAllocationsTable: React.FC<MaterialAllocationsTableProps> = ({
  projectId,
  onRefreshNeeded,
}) => {
  const [transactions, setTransactions] = useState<InventoryTransactionItem[]>([]);
  const [kpis, setKpis] = useState<InventoryKpis>({
    total_movements: 0,
    total_issued: 0,
    total_restocked: 0,
    total_damaged_scrap: 0,
    total_adjustments: 0,
    total_reversals: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Undo / Reversal Modal State
  const [reversalTarget, setReversalTarget] = useState<InventoryTransactionItem | null>(null);
  const [reversalNotes, setReversalNotes] = useState<string>('');
  const [isReversing, setIsReversing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await inventoryApi.getTransactions({
        project_id: projectId,
        type: selectedType !== 'all' ? selectedType : undefined,
        search: search.trim() || undefined,
        page,
        per_page: 15,
      });

      setTransactions(res.data || []);
      if (res.kpis) {
        setKpis(res.kpis);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.last_page);
      }
    } catch (err: any) {
      console.error('Failed to load inventory transactions:', err);
      setErrorMsg('Failed to load inventory ledger data.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedType, search, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleConfirmReversal = async () => {
    if (!reversalTarget) return;
    try {
      setIsReversing(true);
      await inventoryApi.reverseTransaction(reversalTarget.id, reversalNotes.trim() || undefined);
      setReversalTarget(null);
      setReversalNotes('');
      fetchTransactions();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      console.error('Failed to reverse transaction:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.reversal?.[0] || 'Reversal failed.';
      alert(`Reversal Error: ${msg}`);
    } finally {
      setIsReversing(false);
    }
  };

  const renderTypeBadge = (txn: InventoryTransactionItem) => {
    switch (txn.type) {
      case 'issue':
        return (
          <span className="mat-badge issue">
            <TrendingDown size={13} /> Issue (-)
          </span>
        );
      case 'return_restock':
        return (
          <span className="mat-badge return_restock">
            <TrendingUp size={13} /> Restock (+)
          </span>
        );
      case 'return_damaged':
        return (
          <span className="mat-badge return_damaged">
            <Trash2 size={13} /> Scrap Loss
          </span>
        );
      case 'adjustment':
        return (
          <span className="mat-badge adjustment">
            <ArrowLeftRight size={13} /> Physical Audit
          </span>
        );
      case 'reversal':
        return (
          <span className="mat-badge reversal">
            <RotateCcw size={13} /> Reversal (Undo)
          </span>
        );
      default:
        return <span className="mat-badge adjustment">{txn.type}</span>;
    }
  };

  const renderStatePill = (state: string) => {
    switch (state) {
      case 'in_stock':
        return <span className="mat-state-pill in_stock">In Stock</span>;
      case 'low_stock':
        return <span className="mat-state-pill low_stock">Low Stock</span>;
      case 'out_of_stock':
        return <span className="mat-state-pill out_of_stock">Out of Stock</span>;
      default:
        return <span className="mat-state-pill in_stock">{state}</span>;
    }
  };

  return (
    <div className="mat-container">
      {/* KPI Cards Row */}
      <div className="mat-kpis">
        <div className="mat-kpi-card">
          <div className="mat-kpi-info">
            <span className="mat-kpi-label">Total Movements</span>
            <span className="mat-kpi-value">{kpis.total_movements}</span>
          </div>
          <div className="mat-kpi-icon">
            <ArrowLeftRight size={20} />
          </div>
        </div>

        <div className="mat-kpi-card">
          <div className="mat-kpi-info">
            <span className="mat-kpi-label">Dispatched to Sites</span>
            <span className="mat-kpi-value">{kpis.total_issued.toFixed(1)}</span>
          </div>
          <div className="mat-kpi-icon issue">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="mat-kpi-card">
          <div className="mat-kpi-info">
            <span className="mat-kpi-label">Restocked Surplus</span>
            <span className="mat-kpi-value">{kpis.total_restocked.toFixed(1)}</span>
          </div>
          <div className="mat-kpi-icon restock">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="mat-kpi-card">
          <div className="mat-kpi-info">
            <span className="mat-kpi-label">Damaged Scrap Loss</span>
            <span className="mat-kpi-value">{kpis.total_damaged_scrap.toFixed(1)}</span>
          </div>
          <div className="mat-kpi-icon damaged">
            <Trash2 size={20} />
          </div>
        </div>

        <div className="mat-kpi-card">
          <div className="mat-kpi-info">
            <span className="mat-kpi-label">Compensating Reversals</span>
            <span className="mat-kpi-value">{kpis.total_reversals}</span>
          </div>
          <div className="mat-kpi-icon reversal">
            <RotateCcw size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mat-filter-bar">
        <div className="mat-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by code, project, material or technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mat-type-tabs">
          {[
            { id: 'all', label: 'All Movements' },
            { id: 'issue', label: 'Site Issues' },
            { id: 'return_restock', label: 'Restocks' },
            { id: 'return_damaged', label: 'Damaged Scrap' },
            { id: 'adjustment', label: 'Audits' },
            { id: 'reversal', label: 'Reversals' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`mat-type-btn ${selectedType === tab.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedType(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="mat-table-card">
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading ledger transactions...
          </div>
        ) : errorMsg ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#ef4444' }}>
            {errorMsg}
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Layers size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No material movements recorded yet.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem' }}>
              Issue material from the Projects page to build your immutable movement history.
            </p>
          </div>
        ) : (
          <table className="mat-table">
            <thead>
              <tr>
                <th>Txn Ref & Time</th>
                <th>Project & Site</th>
                <th>Material & Variant</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Stock Impact</th>
                <th>Authorized / Assigned</th>
                <th style={{ textAlign: 'right' }}>Ledger Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const dateStr = new Date(txn.created_at).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                const isReversal = txn.type === 'reversal';
                const hasBeenReversed = !!txn.reversal;

                return (
                  <tr key={txn.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                          {txn.transaction_code}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {dateStr}
                        </span>
                      </div>
                    </td>

                    <td>
                      {txn.project ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{txn.project.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {txn.project.project_code} · {txn.project.site_location}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Warehouse General</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {txn.variant?.product?.name || 'Material Item'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {txn.variant?.variant_name || txn.variant?.size_label || 'Standard'} ({txn.variant?.sku})
                        </span>
                      </div>
                    </td>

                    <td>{renderTypeBadge(txn)}</td>

                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {txn.type === 'issue' ? '-' : txn.type === 'return_restock' ? '+' : ''}
                        {parseFloat(String(txn.quantity)).toFixed(2)} {txn.uom}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          <span>{parseFloat(String(txn.pre_stock)).toFixed(2)}</span>
                          <ArrowRight size={12} color="#94a3b8" />
                          <span style={{ color: '#0f172a' }}>{parseFloat(String(txn.post_stock)).toFixed(2)}</span>
                          <span style={{ color: '#64748b', fontWeight: 400 }}>{txn.uom}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {renderStatePill(txn.pre_stock_state)}
                          <ArrowRight size={10} color="#cbd5e1" />
                          {renderStatePill(txn.post_stock_state)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.785rem' }}>
                        <span style={{ color: '#0f172a' }}>
                          By: <strong>{txn.assignedBy?.name || 'Admin'}</strong>
                        </span>
                        {txn.worker && (
                          <span style={{ color: '#64748b' }}>
                            Tech: {txn.worker.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {isReversal ? (
                        <span className="mat-reversed-tag">
                          Compensating entry for {txn.reversedTransaction?.transaction_code}
                        </span>
                      ) : hasBeenReversed ? (
                        <span className="mat-reversed-tag">
                          Reversed by {txn.reversal?.transaction_code}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="mat-btn-undo"
                          onClick={() => setReversalTarget(txn)}
                          title="Create compensating reversal transaction"
                        >
                          <RotateCcw size={13} />
                          Undo / Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className="mat-type-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="mat-type-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compensating Reversal Confirmation Modal */}
      {reversalTarget && (
        <div className="mat-rev-modal-overlay" onClick={() => setReversalTarget(null)}>
          <div className="mat-rev-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="mat-rev-title">Reverse Transaction {reversalTarget.transaction_code}?</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setReversalTarget(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mat-rev-desc">
              Following strict immutable ledger rules, this operation will <strong>NOT</strong> delete or edit the original record.
              It will atomically create a compensating reversal transaction and restore the warehouse stock balance.
            </p>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.825rem' }}>
              <div><strong>Material:</strong> {reversalTarget.variant?.product?.name} ({reversalTarget.variant?.variant_name || reversalTarget.variant?.size_label})</div>
              <div><strong>Movement:</strong> {reversalTarget.type.toUpperCase()} ({parseFloat(String(reversalTarget.quantity)).toFixed(2)} {reversalTarget.uom})</div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Reason for Reversal / Correction:
              </label>
              <input
                type="text"
                className="mat-rev-input"
                placeholder="e.g. Accidental double entry or wrong quantity specified"
                value={reversalNotes}
                onChange={(e) => setReversalNotes(e.target.value)}
              />
            </div>

            <div className="mat-rev-actions">
              <button
                type="button"
                className="mat-type-btn"
                onClick={() => setReversalTarget(null)}
                disabled={isReversing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mat-btn-undo"
                style={{ background: '#0f172a', borderColor: '#0f172a', color: '#ffffff' }}
                onClick={handleConfirmReversal}
                disabled={isReversing}
              >
                {isReversing ? 'Reversing...' : 'Confirm Compensating Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
