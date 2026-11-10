import api from './axios';

export interface LowStockItem {
  id: number;
  product_id: number;
  product_name: string;
  category_name: string;
  size_label: string;
  sku: string;
  stock: number;
  min_threshold: number;
  uom: string;
  unit_cost: number;
  severity: 'out_of_stock' | 'low_stock';
  reorder: {
    recommended_qty: number;
    estimated_cost: number;
  };
  impacted_projects: {
    id: number;
    name: string;
    client: string;
    project_code: string;
    site_location: string;
  }[];
}

export interface LowStockKPIs {
  critical_count: number;
  out_of_stock_count: number;
  low_stock_count: number;
  total_reorder_cost: number;
  impacted_projects_count: number;
}

export interface LowStockSummaryResponse {
  status: boolean;
  kpis: LowStockKPIs;
  categories: { id: number; name: string }[];
  items: LowStockItem[];
}

export const lowStockReportApi = {
  getSummary: async (params?: {
    category_id?: string | number;
    severity?: string;
  }): Promise<LowStockSummaryResponse> => {
    const res = await api.get('/reports/low-stock-summary', { params });
    return res.data;
  },
};
