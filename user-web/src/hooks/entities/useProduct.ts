// @/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";

export function useProducts(
  activeFilters: string,
  options?: { categoryId?: string; enabled?: boolean }
) {
  const { categoryId, enabled = true } = options || {};

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", categoryId, activeFilters],
    queryFn: async () => {
      if (categoryId) {
        return (await productsApi.getByCategory(categoryId, activeFilters))
          ?.data;
      }
      // if (sellerId) {
      //   return (await productsApi.getBySeller(sellerId, activeFilters))?.data;
      // }
      return (await productsApi.getAll(activeFilters))?.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return { products: data?.products || [], pagination: data?.pagination, isLoading, isFetching, error, refetch, };
}

export function useProduct(productId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => (await productsApi.getById(productId))?.data,
    enabled: enabled && !!productId,
  });

  return { product: data, isLoading, error, refetch };
}

interface UseProductsByCategoryTreeOptions {
  enabled?: boolean;
  limit?: number;
}

export function useProductsByCategoryTree(categoryId: string, options?: UseProductsByCategoryTreeOptions) {
  const { enabled = true, limit = 8 } = options || {};

  return useQuery({
    queryKey: ["products", "category-tree", categoryId, limit],
    queryFn: async () => {
      const response = await productsApi.getByCategoryTree(categoryId, `limit=${limit}&isActive=true`);
      return response?.data || { products: [], pagination: {} };
    },
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}