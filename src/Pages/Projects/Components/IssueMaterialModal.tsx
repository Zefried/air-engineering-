import React, { useState } from 'react';
import {
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../Products/productTypes';
import type { ProductItem } from '../../Products/productTypes';
import { generateUniqueId } from '../../../utils/idGenerator';

export interface MaterialIssueRecord {
  id: string;
  projectId: string;
  projectName: string;
  productName: string;
  sizeLabel: string;
  quantity: number;
  uom: string;
  type: "issue" | "return";
  loggedBy: string;
  timestamp: string;
  notes?: string;
}

interface IssueMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
  onMaterialLogged: (record: MaterialIssueRecord) => void;
}

export const IssueMaterialModal: React.FC<IssueMaterialModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onMaterialLogged,
}) => {
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || "");
  const [transactionType, setTransactionType] = useState<"issue" | "return">("issue");

  // Material selection
  const [selectedProductId, setSelectedProductId] = useState<string>("PRD-001");
  const selectedProduct: ProductItem | undefined = INITIAL_PRODUCTS.find(
    (p) => p.id === selectedProductId
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>("var-3"); // 1/2" copper
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId);

  // Quantity with decimal
  const [quantity, setQuantity] = useState<number>(3.5);
  const [notes, setNotes] = useState<string>("Refrigerant piping run for outdoor to AHU-1");
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const currentStock = selectedVariant?.stock ?? 0;
  const isOverIssue = transactionType === "issue" && quantity > currentStock;
  const remainingStock =
    transactionType === "issue"
      ? currentStock - quantity
      : currentStock + quantity;

  const handleStep = (delta: number) => {
    setQuantity((prev) => Math.max(0.1, parseFloat((prev + delta).toFixed(2))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const currentProj = projects.find((p) => p.id === projectId);

    const record: MaterialIssueRecord = {
      id: generateUniqueId("LOG"),
      projectId,
      projectName: currentProj?.name || "Unknown Project",
      productName: selectedProduct?.name || "Material",
      sizeLabel: selectedVariant?.sizeLabel || "",
      quantity,
      uom: selectedProduct?.baseUom || "Meters",
      type: transactionType,
      loggedBy: "Rahul (Site Supervisor)",
      timestamp: "Just now",
      notes: notes.trim(),
    };

    onMaterialLogged(record);
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Package size={22} className="text-blue-600" />
              {transactionType === "issue" ? "Issue Material to Site" : "Return Material to Store"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Accurate fractional decimal deduction for project inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* SUCCESS ALERT */}
        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Inventory successfully updated and logged to project!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TRANSACTION TYPE TOGGLE (EDGE CASE: SITE RETURN) */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                transactionType === "issue"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
              onClick={() => setTransactionType("issue")}
            >
              Issue to Project (Deduct Stock)
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1 ${
                transactionType === "return"
                  ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
              onClick={() => setTransactionType("return")}
            >
              <RotateCcw size={12} />
              Return from Site (Restock)
            </button>
          </div>

          {/* PROJECT SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Select Destination Project *
            </label>
            <select
              className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.id})
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCT SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Select Material / Product *
            </label>
            <select
              className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = INITIAL_PRODUCTS.find((item) => item.id === e.target.value);
                if (p && p.variants.length > 0) {
                  setSelectedVariantId(p.variants[0].id);
                }
              }}
            >
              {INITIAL_PRODUCTS.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.brand})
                </option>
              ))}
            </select>
          </div>

          {/* SIZE / VARIANT SELECTOR */}
          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Select Exact Size / Dimension *
              </label>
              <select
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 font-semibold"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
              >
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.sizeLabel} &bull; Warehouse Stock: {v.stock.toFixed(2)} {selectedProduct.baseUom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QUANTITY ENTRY WITH TOUCH STEPPERS */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Quantity in {selectedProduct?.baseUom || "Units"} *
              </label>
              <span className="text-xs text-gray-500">
                Available in Store: <strong>{currentStock.toFixed(2)} {selectedProduct?.baseUom}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="w-12 h-11 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold flex items-center justify-center text-lg transition"
              >
                <Minus size={18} />
              </button>

              <input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="flex-1 h-11 text-center font-extrabold text-xl text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500"
                required
              />

              <button
                type="button"
                onClick={() => handleStep(1)}
                className="w-12 h-11 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold flex items-center justify-center text-lg transition"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* OVER-ISSUANCE EDGE CASE WARNING */}
          {isOverIssue && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Low Stock Notice:</strong> Requested quantity ({quantity.toFixed(2)}{" "}
                {selectedProduct?.baseUom}) exceeds current warehouse stock ({currentStock.toFixed(2)}{" "}
                {selectedProduct?.baseUom}). Stock will reflect a deficit of{" "}
                {(quantity - currentStock).toFixed(2)} {selectedProduct?.baseUom}.
              </div>
            </div>
          )}

          {/* DUAL DISPLAY CALCULATION HELPER */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span>
              Action: <strong>{transactionType === "issue" ? "Deduct" : "Restock"} {quantity.toFixed(2)} {selectedProduct?.baseUom}</strong>
            </span>
            <span className="flex items-center gap-1 font-semibold">
              Post-stock: {remainingStock.toFixed(2)} {selectedProduct?.baseUom}
            </span>
          </div>

          {/* NOTES / SITE RUN SPECIFICS */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Site Notes / Location Details
            </label>
            <input
              type="text"
              placeholder="e.g. 2nd floor server room AHU connection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition ${
                transactionType === "issue"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <CheckCircle2 size={16} />
              {transactionType === "issue" ? "Confirm Site Issue" : "Confirm Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
