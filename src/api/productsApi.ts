import api from "./axios";

export interface ProductVariantPayload {
    id?: number;
    size_label?: string;
    variant_name?: string;
    sku?: string;
    stock: number;
    min_threshold: number;
    unit_cost: number;
    package_uom?: string;
    package_ratio?: number;
    is_active?: boolean;
}

export interface ProductPayload {
    name: string;
    category_id: number | string;
    sub_category_id?: number | string | null;
    brand?: string;
    model_no?: string;
    base_uom: string;
    package_uom?: string;
    package_ratio?: number;
    has_variants?: boolean;
    description?: string;
    variants: ProductVariantPayload[];
}

export interface ProductVariantResponse {
    id: number;
    product_id: number;
    size_label: string;
    variant_name?: string;
    sku: string;
    stock: string | number;
    min_threshold: string | number;
    unit_cost: string | number;
    package_uom?: string | null;
    package_ratio?: string | number | null;
    effective_package_ratio?: number;
    effective_package_uom?: string;
    is_active: boolean;
}

export interface ProductResponse {
    id: number;
    category_id: number;
    sub_category_id: number | null;
    name: string;
    brand: string | null;
    model_no: string | null;
    base_uom: string;
    package_uom: string | null;
    package_ratio: string | number | null;
    has_variants: boolean;
    description: string | null;
    category?: { id: number; name: string; slug: string; default_uom: string };
    sub_category?: { id: number; name: string; slug: string; default_uom: string } | null;
    variants: ProductVariantResponse[];
}

export interface ProductListParams {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: string | number;
    sub_category_id?: string | number;
    status?: "all" | "in_stock" | "low_stock" | "out_of_stock";
}

export interface PaginatedProductsResponse {
    status: boolean;
    kpis: {
        total_items: number;
        total_variants: number;
        low_stock_alerts: number;
        out_of_stock: number;
    };
    data: {
        current_page: number;
        data: ProductResponse[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export const productsApi = {
    getAll: async (params?: ProductListParams) => {
        const response = await api.get<PaginatedProductsResponse>("/products", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<{ status: boolean; data: { product: ProductResponse; total_stock: number; status: string } }>(`/products/${id}`);
        return response.data;
    },

    create: async (payload: ProductPayload) => {
        const response = await api.post<{ status: boolean; message: string; data: ProductResponse }>("/products", payload);
        return response.data;
    },

    update: async (id: number | string, payload: ProductPayload) => {
        const response = await api.put<{ status: boolean; message: string; data: ProductResponse }>(`/products/${id}`, payload);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await api.delete<{ status: boolean; message: string }>(`/products/${id}`);
        return response.data;
    },
};
