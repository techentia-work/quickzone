"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  CategoryType,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  PaginationResponse,
  CategoryTreeQueryParams,
} from "@/lib/types";
import { categoryApi } from "@/lib/api";
import toast from "react-hot-toast";

export const useAdminCategory = (queryParams?: string, treeQueryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  /** ---------------------------- FETCH CATEGORIES ---------------------------- **/

  // Paginated categories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError, refetch: refetchCategories, } = useQuery({
    queryKey: ["admin", "categories", queryParams],
    queryFn: async () => {
      const res = await categoryApi.getAll(queryParams);
      setPagination((res?.data as any)?.pagination ?? null);
      return (res?.data as any)?.categories || [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  // All admin categories (no pagination)
  const { data: adminCategories = [], isLoading: isLoadingAdminCategories, error: adminCategoriesError, refetch: refetchAdminCategories, } = useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => {
      const res = await categoryApi.getAdminCategories();
      return (res.data as any)?.categories || [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  // Category tree
  const { data: categoryTree = [], isLoading: isLoadingTree, error: treeError, refetch: refetchTree, } = useQuery({
    queryKey: ["admin", "categories", "tree", treeQueryParams],
    queryFn: async () => {
      const res = await categoryApi.getTree(treeQueryParams);
      return res?.data || [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getCategoryByIdQuery = useCallback((id?: string) => {
    return useQuery({
      queryKey: ["admin", "category", id],
      queryFn: async (): Promise<CategoryType> => {
        if (!id) throw new Error("Missing category ID");
        const res = await categoryApi.getById(id);
        if (!res.success || !res.data) throw new Error(res.message || "Failed to fetch category");
        return res.data;
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    })
  }, []);

  /** ---------------------------- MUTATIONS ---------------------------- **/

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoryApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      if (res?.data) setSelectedCategory(res.data);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoryApi.update(id, data),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      if (res?.success && res.data) {
        setSelectedCategory(res.data);
        toast.success(res?.message || "Category updated successfully");
      } else {
        toast.error(res.message || "Failed to update category");
      }
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      if (selectedCategory?._id === id) setSelectedCategory(null);
      toast.success(res?.message || "Category deleted successfully");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const bulkDeleteCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => categoryApi.bulkDelete(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      toast.success(res?.message || "Categories deleted successfully");
    },
    onError: () => toast.error("Failed to delete categories"),
  });

  const restoreCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryApi.restore(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      if (res?.data && selectedCategory?._id === id)
        setSelectedCategory(res.data);
      toast.success(res?.message || "Category restored successfully");
    },
    onError: () => toast.error("Failed to restore category"),
  });

  /** ---------------------------- CATEGORY TREE ---------------------------- **/

  const rebuildTreeMutation = useMutation({
    mutationFn: (id: string) => categoryApi.rebuildTree(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      toast.success(res?.message || "Category tree rebuilt successfully");
    },
    onError: () => toast.error("Failed to rebuild category tree"),
  });

  const rebuildTreeAllMutation = useMutation({
    mutationFn: () => categoryApi.rebuildTreeAll(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "tree"],
      });
      toast.success(res?.message || "All category trees rebuilt successfully");
    },
    onError: () => toast.error("Failed to rebuild all category trees"),
  });

  /** ---------------------------- STATUS COMPUTATIONS ---------------------------- **/

  const isMutating = useMemo(
    () =>
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending ||
      bulkDeleteCategoriesMutation.isPending ||
      restoreCategoryMutation.isPending ||
      rebuildTreeMutation.isPending ||
      rebuildTreeAllMutation.isPending,
    [
      createCategoryMutation.isPending,
      updateCategoryMutation.isPending,
      deleteCategoryMutation.isPending,
      bulkDeleteCategoriesMutation.isPending,
      restoreCategoryMutation.isPending,
      rebuildTreeMutation.isPending,
      rebuildTreeAllMutation.isPending,
    ]
  );

  /** ---------------------------- HELPERS ---------------------------- **/

  const getActiveCategories = useCallback(
    () => categories.filter((cat: any) => cat.isActive && !cat.isDeleted),
    [categories]
  );

  const getDeletedCategories = useCallback(
    () => categories.filter((cat: any) => cat.isDeleted),
    [categories]
  );

  const getCategoriesByParent = useCallback(
    (parentId: string | null) => {
      if (!categories || categories.length === 0) return [];

      if (parentId === null) {
        return categories.filter(
          (cat: any) => (!cat.parent || cat.parent === null) && !cat.isDeleted
        );
      }

      const subcategories = categories.filter((cat: any) => {
        const parentValue =
          typeof cat.parent === "object" ? cat.parent?._id : cat.parent;
        return parentValue === parentId && !cat.isDeleted;
      });

      return subcategories;
    },
    [categories]
  );

  const clearSelectedCategory = useCallback(
    () => setSelectedCategory(null),
    []
  );

  /** ---------------------------- RETURN ---------------------------- **/

  return {
    categories,
    adminCategories,
    categoryTree,
    pagination,
    selectedCategory,

    // Loading & status
    isLoadingCategories,
    isLoadingAdminCategories,
    isLoadingTree,
    isMutating,

    // Errors
    categoriesError,
    adminCategoriesError,
    treeError,

    // Refetch
    refetchCategories,
    refetchAdminCategories,
    refetchTree,

    // CRUD
    getCategoryByIdQuery,
    createCategory: (data: CreateCategoryPayload) =>
      createCategoryMutation.mutateAsync(data),
    updateCategory: (id: string, data: UpdateCategoryPayload) =>
      updateCategoryMutation.mutateAsync({ id, data }),
    deleteCategory: (id: string) => deleteCategoryMutation.mutateAsync(id),
    bulkDeleteCategories: (ids: string[]) =>
      bulkDeleteCategoriesMutation.mutateAsync(ids),
    restoreCategory: (id: string) => restoreCategoryMutation.mutateAsync(id),
    rebuildTree: (id: string) => rebuildTreeMutation.mutateAsync(id),
    rebuildTreeAll: () => rebuildTreeAllMutation.mutateAsync(),

    // Helpers
    setSelectedCategory,
    clearSelectedCategory,
    getActiveCategories,
    getDeletedCategories,
    getCategoriesByParent,

    // Counts
    totalCategories: categories?.length,
    activeCategoriesCount: getActiveCategories()?.length,
    deletedCategoriesCount: getDeletedCategories()?.length,
  };
};
