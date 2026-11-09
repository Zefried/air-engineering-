import api from './axios';

export type InventoryTransactionType = 'issue' | 'return_restock' | 'return_damaged' | 'adjustment' | 'reversal';
export type StockDerivedState = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryTransactionItem {
  id: number;
  transaction_code: string;
  project_id?: number | null;
  product_variant_id: number;
  user_id: number;
  worker_id?: number | null;
  reversal_of_id?: number | null;
  type: InventoryTransactionType;
  quantity: number | string;
  damaged_quantity: number | string;
  adjustment_delta?: number | string | null;
  uom: string;
  pre_stock: number | string;
  post_stock: number | string;
  pre_stock_state: StockDerivedState;
  post_stock_state: StockDerivedState;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    project_code: string;
    name: string;
    client: string;
    site_location: string;
  } | null;
  variant?: {
    id: number;
    size_label?: string;
    variant_name?: string;
    sku: string;
    stock: number | string;
    unit_cost: number | string;
    product?: {
      id: number;
      name: string;
      brand?: string;
      base_uom: string;
      category_id: number;
    };
  } | null;
  assignedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  worker?: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
  } | null;
  reversedTransaction?: {
    id: number;
    transaction_code: string;
    type: InventoryTransactionType;
    created_at: string;
  } | null;
  reversal?: {
    id: number;
    transaction_code: string;
    created_at: string;
  } | null;
}

export interface InventoryKpis {
  total_movements: number;
  total_issued: number;
  total_restocked: number;
  total_damaged_scrap: number;
  total_adjustments: number;
  total_reversals: number;
}

export interface InventoryTransactionListResponse {
  status: boolean;
  kpis: InventoryKpis;
  data: InventoryTransactionItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface RecordTransactionPayload {
  project_id?: number | null;
  product_variant_id: number;
  worker_id?: number | null;
  type: 'issue' | 'return_restock' | 'return_damaged' | 'adjustment';
  quantity: number;
  counted_quantity?: number;
  notes?: string;
}

export const inventoryApi = {
  getTransactions: async (params?: {
    project_id?: number | string;
    product_variant_id?: number | string;
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<InventoryTransactionListResponse> => {
    const res = await api.get('/inventory/transactions', { params });
    return res.data;
  },

  recordTransaction: async (payload: RecordTransactionPayload): Promise<{
    status: boolean;
    message: string;
    data: InventoryTransactionItem;
  }> => {
    const res = await api.post('/inventory/transactions', payload);
    return res.data;
  },

  reverseTransaction: async (id: number | string, notes?: string): Promise<{
    status: boolean;
    message: string;
    data: InventoryTransactionItem;
  }> => {
    const res = await api.post(`/inventory/transactions/${id}/reverse`, { notes });
    return res.data;
  },
};
