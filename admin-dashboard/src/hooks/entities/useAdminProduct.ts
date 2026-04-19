"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  ProductType,
  CreateProductPayload,
  UpdateProductPayload,
  BulkUpdateProductsPayload,
  UpdateVariantPayload,
  PaginationResponse,
  ProductStatus,
} from "@/lib/types";
import { productsApi } from "@/lib/api";
import toast from "react-hot-toast";

export const useAdminProduct = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  // Query for all products
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["admin", "products", queryParams],
    queryFn: async () => {
      const res = await productsApi.getAll(queryParams);
      setPagination((res?.data as any)?.pagination ?? null);
      console.log(res.data);
      return (res?.data as any)?.products || [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  // Query for product stats
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["admin", "products", "stats"],
    queryFn: () => productsApi.getStats(),
    enabled: !!products?.length,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = useMemo(() => {
    return statsResponse?.data;
  }, [statsResponse]);

  // Get product by ID
  const getProductById = useCallback(async (id: string) => {
    try {
      const response = await productsApi.getById(id);
      const productData = response?.data;
      if (productData) {
        setSelectedProduct(productData);
      }
      return productData;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }, []);

  // Get products by category
  const getProductsByCategory = useCallback(
    async (categoryId: string, categoryQueryParams?: string) => {
      try {
        console.log("Id" , categoryId);
        
        const response = await productsApi.getByCategory(
          categoryId,
          categoryQueryParams
        );
        console.log("Res....." , response);
        
        return response?.data;
      } catch (error) {
        console.error("Error fetching products by category:", error);
        throw error;
      }
    },
    []
  );

  // Get products by seller
  const getProductsBySeller = useCallback(
    async (sellerId: string, sellerQueryParams?: string) => {
      try {
        const response = await productsApi.getBySeller(
          sellerId,
          sellerQueryParams
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching products by seller:", error);
        throw error;
      }
    },
    []
  );

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => productsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "stats"],
      });

      if (response?.data) {
        setSelectedProduct(response.data);
      }

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productsApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "stats"],
      });

      if (response?.data && selectedProduct?._id === variables.id) {
        setSelectedProduct(response.data);
      }

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (response, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "stats"],
      });

      if (selectedProduct?._id === deletedId) {
        setSelectedProduct(null);
      }

      if (response?.success) {
        toast.success(response.message || "Product deleted successfully");
      }
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    },
  });

  // Bulk update products mutation
  const bulkUpdateProductsMutation = useMutation({
    mutationFn: (data: BulkUpdateProductsPayload) =>
      productsApi.bulkUpdate(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "stats"],
      });

      if (response?.success) {
        toast.success(response.message || "Products updated successfully");
      }
    },
    onError: (error) => {
      console.error("Error bulk updating products:", error);
      toast.error("Failed to update products");
    },
  });

  // Toggle product status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (productId: string) => productsApi.toggleStatus(productId),
    onSuccess: (response, productId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "stats"],
      });

      if (response?.data && selectedProduct?._id === productId) {
        setSelectedProduct(response.data);
      }

      if (response?.success) {
        toast.success(response.message || "Product status updated");
      }
    },
    onError: (error) => {
      console.error("Error toggling product status:", error);
      toast.error("Failed to toggle product status");
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateVariantPayload;
    }) => productsApi.updateVariant(productId, variantId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId],
      });

      if (response?.success) {
        toast.success(response.message || "Variant updated successfully");
      }
    },
    onError: (error) => {
      console.error("Error updating variant:", error);
      toast.error("Failed to update variant");
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => productsApi.deleteVariant(productId, variantId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId],
      });

      if (response?.success) {
        toast.success(response.message || "Variant deleted successfully");
      }
    },
    onError: (error) => {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    },
  });

  // Check if any mutation is pending
  const isMutating = useMemo(
    () =>
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      deleteProductMutation.isPending ||
      bulkUpdateProductsMutation.isPending ||
      toggleStatusMutation.isPending ||
      updateVariantMutation.isPending ||
      deleteVariantMutation.isPending,
    [
      createProductMutation.isPending,
      updateProductMutation.isPending,
      deleteProductMutation.isPending,
      bulkUpdateProductsMutation.isPending,
      toggleStatusMutation.isPending,
      updateVariantMutation.isPending,
      deleteVariantMutation.isPending,
    ]
  );

  // Helper functions
  const createProduct = useCallback(
    async (data: CreateProductPayload) => {
      try {
        const result = await createProductMutation.mutateAsync(data);
        return result?.data;
      } catch (error) {
        throw error;
      }
    },
    [createProductMutation]
  );

  const updateProduct = useCallback(
    async (id: string, data: UpdateProductPayload) => {
      try {
        const result = await updateProductMutation.mutateAsync({ id, data });
        return result?.data;
      } catch (error) {
        throw error;
      }
    },
    [updateProductMutation]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        const result = await deleteProductMutation.mutateAsync(id);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [deleteProductMutation]
  );

  const bulkUpdateProducts = useCallback(
    async (data: BulkUpdateProductsPayload) => {
      try {
        const result = await bulkUpdateProductsMutation.mutateAsync(data);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [bulkUpdateProductsMutation]
  );

  const toggleProductStatus = useCallback(
    async (productId: string) => {
      try {
        const result = await toggleStatusMutation.mutateAsync(productId);
        return result?.data;
      } catch (error) {
        throw error;
      }
    },
    [toggleStatusMutation]
  );

  const updateVariant = useCallback(
    async (
      productId: string,
      variantId: string,
      data: UpdateVariantPayload
    ) => {
      try {
        const result = await updateVariantMutation.mutateAsync({
          productId,
          variantId,
          data,
        });
        return result?.data;
      } catch (error) {
        throw error;
      }
    },
    [updateVariantMutation]
  );

  const deleteVariant = useCallback(
    async (productId: string, variantId: string) => {
      try {
        const result = await deleteVariantMutation.mutateAsync({
          productId,
          variantId,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [deleteVariantMutation]
  );

  // Filter helpers
  const getActiveProducts = useCallback(
    () => products?.filter((product: any) => product.isActive && !product.isDeleted),
    [products]
  );

  const getApprovedProducts = useCallback(
    () =>
      products?.filter((product: any) => product.isApproved && !product.isDeleted),
    [products]
  );

  const getDeletedProducts = useCallback(
    () => products?.filter((product: any) => product.isDeleted),
    [products]
  );

  const getProductsByStatus = useCallback(
    (status: ProductStatus) =>
      products?.filter(
        (product: any) => product.status === status && !product.isDeleted
      ),
    [products]
  );

  const getReturnableProducts = useCallback(
    () =>
      products?.filter((product: any) => product.isReturnable && !product.isDeleted),
    [products]
  );

  const getCODProducts = useCallback(
    () => products?.filter((product: any) => product.isCOD && !product.isDeleted),
    [products]
  );

  // Clear selected product
  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return {
    // Data
    products,
    pagination,
    selectedProduct,
    stats,

    // Loading states
    isLoadingProducts,
    isLoadingStats,
    isMutating,

    // Error states
    productsError,
    statsError,

    // Refetch functions
    refetchProducts,

    // CRUD operations
    getProductById,
    getProductsByCategory,
    getProductsBySeller,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    toggleProductStatus,
    updateVariant,
    deleteVariant,

    // Mutations (for accessing loading states, errors, etc.)
    mutations: {
      create: createProductMutation,
      update: updateProductMutation,
      delete: deleteProductMutation,
      bulkUpdate: bulkUpdateProductsMutation,
      toggleStatus: toggleStatusMutation,
      updateVariant: updateVariantMutation,
      deleteVariant: deleteVariantMutation,
    },

    // State management
    setSelectedProduct,
    clearSelectedProduct,

    // Helper functions
    getActiveProducts,
    getApprovedProducts,
    getDeletedProducts,
    getProductsByStatus,
    getReturnableProducts,
    getCODProducts,

    // Computed values
    totalProducts: products?.length,
    activeProductsCount: getActiveProducts()?.length,
    approvedProductsCount: getApprovedProducts()?.length,
    deletedProductsCount: getDeletedProducts()?.length,
  };
};
