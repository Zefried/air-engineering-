import api from "./axios";

export interface VariantConfigPreset {
    label: string;
    sku_suffix?: string;
    default_cost?: number;
    package_ratio?: number;
}

export interface VariantConfig {
    has_variants?: boolean;
    attribute_name?: string | null;
    base_uom?: string | null;
    package_uom?: string | null;
    package_ratio?: number | null;
    presets?: VariantConfigPreset[];
}

export interface CategoryPayload {
    name: string;
    slug?: string;
    parent_id?: number | string | null;
    description?: string;
    default_uom?: string;
    variant_config?: VariantConfig | null;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    description: string | null;
    default_uom: string;
    variant_config?: VariantConfig | null;
    effective_variant_config?: VariantConfig | null;
    products_count?: number;
    children?: CategoryItem[];
    parent?: { id: number; name: string } | null;
}

export const categoriesApi = {
    getAll: async () => {
        const response = await api.get<{ status: boolean; data: { tree: CategoryItem[]; flat: CategoryItem[] } }>("/categories");
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<{ status: boolean; data: CategoryItem }>(`/categories/${id}`);
        return response.data;
    },

    create: async (payload: CategoryPayload) => {
        const response = await api.post<{ status: boolean; message: string; data: CategoryItem }>("/categories", payload);
        return response.data;
    },

    update: async (id: number | string, payload: CategoryPayload) => {
        const response = await api.put<{ status: boolean; message: string; data: CategoryItem }>(`/categories/${id}`, payload);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await api.delete<{ status: boolean; message: string }>(`/categories/${id}`);
        return response.data;
    },
};
