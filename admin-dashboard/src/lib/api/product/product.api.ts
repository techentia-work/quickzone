// @/lib/api/productApi.ts
import axiosClient from "../client/axios";
import { ProductType, ProductVariantType, PaginationResponse, CreateProductPayload, UpdateProductPayload, BulkUpdateProductsPayload, UpdateVariantPayload, } from "@/lib/types";

export const productsApi = {
    // Public endpoints
    getAll: (queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product?${queryParams ?? ""}`),
    getById: (id: string) => axiosClient.get<ProductType>(`/api/product/${id}`),
    getByCategory: (categoryId: string, queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product/category/${categoryId}?${queryParams ?? ""}`),
    getBySeller: (sellerId: string, queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product/seller/${sellerId}?${queryParams ?? ""}`),

    // Admin endpoints
    create: (data: CreateProductPayload) => axiosClient.post<ProductType>("/api/product", data),
    update: (id: string, data: UpdateProductPayload) => axiosClient.put<ProductType>(`/api/product/${id}`, data),
    delete: (id: string) => axiosClient.delete(`/api/product/${id}`),

    // Bulk + variant operations
    bulkUpdate: (data: BulkUpdateProductsPayload) => axiosClient.patch(`/api/product/bulk-update`, data),
    toggleStatus: (productId: string) => axiosClient.patch<ProductType>(`/api/product/${productId}/toggle-status`),
    updateVariant: (productId: string, variantId: string, data: UpdateVariantPayload) => axiosClient.put<ProductVariantType>(`/api/product/${productId}/variants/${variantId}`, data),
    deleteVariant: (productId: string, variantId: string) => axiosClient.delete(`/api/product/${productId}/variants/${variantId}`),

    // Analytics
    getStats: () => axiosClient.get(`/api/product/analytics/stats`),
};

export default productsApi;