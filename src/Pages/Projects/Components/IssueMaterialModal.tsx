import React, { useState, useEffect, useContext } from 'react';
import {
  X,
  Package,
  Layers,
  Tag,
  Scale,
  FileText,
  UserCheck,
  Check,
  RotateCcw,
  Plus,
  Minus,
  Briefcase,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { AuthContext } from '../../../Context/AuthContextValue';
import { productsApi } from '../../../api/productsApi';
import type { ProductResponse, ProductVariantResponse } from '../../../api/productsApi';
import { inventoryApi } from '../../../api/inventoryApi';
import type { ProjectItem, ProjectWorker } from '../../../api/projectsApi';
import '../Styles/IssueMaterialModal.css';

interface IssueMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  defaultProjectId?: number;
  onSuccess?: () => void;
}

export const IssueMaterialModal: React.FC<IssueMaterialModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onSuccess,
}) => {
  const auth = useContext(AuthContext);

  // Modal mode state
  const [mode, setMode] = useState<'issue' | 'return'>('issue');
  const [returnSubtype, setReturnSubtype] = useState<'usable' | 'damaged'>('usable');

  // Form selections
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>(
    defaultProjectId || (projects[0]?.id ?? '')
  );

  // Products and variants loaded dynamically from DB
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | ''>('');

  // Quantity and Notes
  const [quantity, setQuantity] = useState<number>(3.50);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync defaultProjectId when opened
  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects]);

  // Load products from DB on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const res = await productsApi.getAll({ per_page: 100 });
        const list = res?.data?.data || [];
        setProducts(list);
        if (list.length > 0 && !selectedProductId) {
          setSelectedProductId(list[0].id);
          if (list[0].variants && list[0].variants.length > 0) {
            setSelectedVariantId(list[0].variants[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load products for material issuance:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isOpen]);

  // When selected product changes, select its first variant
  useEffect(() => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === Number(selectedProductId));
    if (prod && prod.variants && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [selectedProductId, products]);

  // Current active project
  const currentProject = projects.find((p) => p.id === Number(selectedProjectId));
  const projectWorkers: ProjectWorker[] = currentProject?.workers || [];

  // When project changes, select its first worker if available
  useEffect(() => {
    if (projectWorkers.length > 0) {
      setSelectedWorkerId(projectWorkers[0].id);
    } else {
      setSelectedWorkerId('');
    }
  }, [selectedProjectId, currentProject]);

  if (!isOpen) return null;

  // Selected product & variant
  const currentProduct = products.find((p) => p.id === Number(selectedProductId));
  const currentVariant: ProductVariantResponse | undefined = currentProduct?.variants?.find(
    (v) => v.id === Number(selectedVariantId)
  );

  const currentStock = currentVariant ? parseFloat(String(currentVariant.stock)) : 0;
  const baseUom = currentProduct?.base_uom || 'Units';

  // Compute stock deduction / addition
  const isOverIssue = mode === 'issue' && quantity > currentStock;
  const postStock = mode === 'issue'
    ? Math.max(0, parseFloat((currentStock - quantity).toFixed(2)))
    : returnSubtype === 'usable'
      ? parseFloat((currentStock + quantity).toFixed(2))
      : currentStock; // Damaged return doesn't change usable stock!

  const handleStep = (delta: number) => {
    setQuantity((prev) => {
      const next = parseFloat((prev + delta).toFixed(2));
      return next < 0.1 ? 0.1 : next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedVariantId) {
      setFormError('Please select a valid material size / variant.');
      return;
    }

    if (quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    if (mode === 'issue' && isOverIssue) {
      setFormError(`Insufficient stock. Available: ${currentStock.toFixed(2)} ${baseUom}.`);
      return;
    }

    const type = mode === 'issue'
      ? 'issue'
      : returnSubtype === 'usable'
        ? 'return_restock'
        : 'return_damaged';

    try {
      setIsSubmitting(true);
      await inventoryApi.recordTransaction({
        project_id: selectedProjectId ? Number(selectedProjectId) : null,
        product_variant_id: Number(selectedVariantId),
        worker_id: selectedWorkerId ? Number(selectedWorkerId) : null,
        type,
        quantity,
        notes: notes.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Error logging inventory transaction:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.quantity?.[0] || 'Failed to record transaction.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="imm-overlay" onClick={onClose}>
      <div className="imm-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="imm-header">
          <div className="imm-header-left">
            <div className="imm-icon-badge">
              <Package size={22} />
            </div>
            <div>
              <h2 className="imm-title">
                {mode === 'issue' ? 'Issue Material to Site' : 'Return Material from Site'}
              </h2>
              <p className="imm-subtitle">
                {mode === 'issue'
                  ? 'Deduct material from inventory for an active project job site.'
                  : 'Restock surplus materials or write off damaged site scrap.'}
              </p>
            </div>
          </div>
          <button className="imm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="imm-body">
          {formError && (
            <div className="imm-calc-banner error">
              <div className="imm-calc-left">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="imm-mode-tabs">
            <button
              type="button"
              className={`imm-mode-btn ${mode === 'issue' ? 'active' : ''}`}
              onClick={() => setMode('issue')}
            >
              <TrendingDown size={16} />
              Issue to Project (Deduct Stock)
            </button>
            <button
              type="button"
              className={`imm-mode-btn ${mode === 'return' ? 'active' : ''}`}
              onClick={() => setMode('return')}
            >
              <RotateCcw size={16} />
              Return from Site (Restock)
            </button>
          </div>

          {/* Return Subtype Switcher */}
          {mode === 'return' && (
            <div className="imm-return-subtypes">
              <button
                type="button"
                className={`imm-sub-btn ${returnSubtype === 'usable' ? 'active-usable' : ''}`}
                onClick={() => setReturnSubtype('usable')}
              >
                ✓ Usable Surplus (Add back to Store Stock)
              </button>
              <button
                type="button"
                className={`imm-sub-btn ${returnSubtype === 'damaged' ? 'active-damaged' : ''}`}
                onClick={() => setReturnSubtype('damaged')}
              >
                ⚠ Damaged Material (Record Site Scrap Loss)
              </button>
            </div>
          )}

          {/* Row 1: Project / Site */}
          <div className="imm-row">
            <label className="imm-row-label">
              <Briefcase size={16} />
              <span>Project / Site *</span>
            </label>
            <div className="imm-input-control">
              <select
                className="imm-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.project_code}) · {p.site_location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Material / Product */}
          <div className="imm-row">
            <label className="imm-row-label">
              <Layers size={16} />
              <span>Material / Product *</span>
            </label>
            <div className="imm-input-control">
              <select
                className="imm-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                disabled={isLoadingProducts}
                required
              >
                {isLoadingProducts && <option value="">Loading catalog products...</option>}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.brand ? `(${p.brand})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Size / Variant */}
          <div className="imm-row">
            <label className="imm-row-label">
              <Tag size={16} />
              <span>Size / Variant *</span>
            </label>
            <div className="imm-input-control">
              <select
                className="imm-select"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                required
              >
                {currentProduct?.variants?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variant_name || v.size_label || 'Standard'} · Warehouse Stock: {parseFloat(String(v.stock)).toFixed(2)} {baseUom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Quantity Stepper & Available in Store */}
          <div className="imm-row">
            <label className="imm-row-label">
              <Scale size={16} />
              <span>Quantity ({baseUom}) *</span>
            </label>
            <div className="imm-qty-container">
              <div className="imm-stepper">
                <button
                  type="button"
                  className="imm-stepper-btn"
                  onClick={() => handleStep(-0.5)}
                  disabled={quantity <= 0.5}
                >
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="imm-stepper-input"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  required
                />
                <button
                  type="button"
                  className="imm-stepper-btn"
                  onClick={() => handleStep(0.5)}
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="imm-stock-snapshot">
                <Package size={15} />
                <span>
                  Available in Store: <strong>{currentStock.toFixed(2)} {baseUom}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Row 5: Live Green Calculation Banner */}
          <div className={`imm-calc-banner ${isOverIssue ? 'error' : 'success'}`}>
            <div className="imm-calc-left">
              {mode === 'issue' ? (
                <>
                  <TrendingDown size={16} />
                  <span>
                    {isOverIssue
                      ? `Insufficient warehouse stock (${currentStock.toFixed(2)} ${baseUom} available)`
                      : `This will deduct ${quantity.toFixed(2)} ${baseUom} from store stock.`}
                  </span>
                </>
              ) : returnSubtype === 'usable' ? (
                <>
                  <TrendingUp size={16} />
                  <span>This will restock +{quantity.toFixed(2)} ${baseUom} into warehouse store.</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Damaged material ({quantity.toFixed(2)} ${baseUom}) written off as site scrap. Stock untouched.</span>
                </>
              )}
            </div>
            {!isOverIssue && (
              <>
                <div className="imm-calc-divider">|</div>
                <div className="imm-calc-right">
                  <Package size={16} />
                  <span>
                    Post-stock: <strong>{postStock.toFixed(2)} {baseUom}</strong>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Row 6: Recipient Site Worker */}
          <div className="imm-row">
            <label className="imm-row-label">
              <UserCheck size={16} />
              <span>Assigned Technician *</span>
            </label>
            <div className="imm-input-control">
              {projectWorkers.length > 0 ? (
                <select
                  className="imm-select"
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                  required
                >
                  {projectWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role}) · {w.phone || w.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: '0.825rem', color: '#b91c1c', padding: '0.5rem 0' }}>
                  ⚠ No technicians deployed to this project site yet.
                </div>
              )}
            </div>
          </div>

          {/* Row 7: Logged-in Authorizer Banner */}
          <div className="imm-auth-pill">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="#0f172a" />
              <span>
                Authorized By: <strong>{auth?.user?.name || 'Authorized Supervisor'}</strong>
              </span>
            </div>
            <span className="imm-auth-badge">
              {auth?.user?.role || 'Admin'}
            </span>
          </div>

          {/* Row 8: Site Notes */}
          <div className="imm-row" style={{ alignItems: 'flex-start' }}>
            <label className="imm-row-label" style={{ paddingTop: '0.5rem' }}>
              <FileText size={16} />
              <span>Site Notes / Location</span>
            </label>
            <div className="imm-input-control">
              <textarea
                className="imm-textarea"
                rows={2}
                placeholder="e.g. Used for Central Mall – Outdoor Unit (Level 2 risers)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="imm-footer">
            <button
              type="button"
              className="imm-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="imm-btn-submit"
              disabled={isSubmitting || (mode === 'issue' && isOverIssue)}
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <Check size={16} />
                  {mode === 'issue'
                    ? 'Confirm Issue'
                    : returnSubtype === 'usable'
                      ? 'Confirm Restock'
                      : 'Record Damaged Scrap'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
