// @/lib/api/productApi.ts
import axiosClient from "../client/axios";
import { ProductType, PaginationResponse, } from "@/lib/types";

export const productsApi = {
    getAll: (queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product?${queryParams ?? ""}`),
    getById: (id: string) => axiosClient.get<ProductType>(`/api/product/${id}`),
    getBySlug: (slug: string) => axiosClient.get<ProductType>(`/api/product/slug/${slug}`),
    getByCategory: (categoryId: string, queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product/category/${categoryId}?${queryParams ?? ""}`),
    getByCategoryTree: (categoryId: string, queryParams: string = "") => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product/category-tree/${categoryId}?${queryParams}`),
    getBySeller: (sellerId: string, queryParams?: string) => axiosClient.get<{ products: ProductType[]; pagination: PaginationResponse }>(`/api/product/seller/${sellerId}?${queryParams ?? ""}`),
};

export default productsApi;