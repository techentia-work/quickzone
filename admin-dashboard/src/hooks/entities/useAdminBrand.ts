"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData, } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { BrandType, CreateBrandPayload } from "@/lib/types";
import brandApi from "@/lib/api/brand/brand.api";

export const useAdminBrand = (queryParams?: string) => {
    const queryClient = useQueryClient();
    const [selectedBrand, setSelectedBrand] = useState<BrandType | null>(null);
    const [pagination, setPagination] = useState<any | null>(null);

    // Fetch brands list
    const { data: brandList = [], isLoading: isLoadingBrand, error: brandError, refetch: refetchBrand, } = useQuery({
        queryKey: ["admin", "brand", queryParams],
        queryFn: async () => {
            const finalQueryParams = queryParams || "limit=100";
            const res = await brandApi.getAll(finalQueryParams);

            setPagination((res?.data as any)?.pagination ?? null);
            return (res.data as any)?.brands || [];
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });

    // Get brand by ID
    const getBrandById = useCallback(async (id: string) => {
        try {
            const response = await brandApi.getById(id);
            const data = response?.data;
            if (data) setSelectedBrand(data);
            return data;
        } catch (error) {
            console.error("Error fetching brand:", error);
            throw error;
        }
    }, []);

    // Create
    const createBrandMutation = useMutation({
        mutationFn: (data: CreateBrandPayload) => brandApi.create(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "brand"] });

            if (response?.data) setSelectedBrand(response.data);
        },
        onError: (error) => console.error("Error creating brand:", error),
    });

    // Update
    const updateBrandMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateBrandPayload> }) =>
            brandApi.update(id, data),

        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "brand"] });
            queryClient.invalidateQueries({
                queryKey: ["admin", "brand", variables.id],
            });

            if (response?.data && selectedBrand?._id === variables.id) {
                setSelectedBrand(response.data);
            }
        },

        onError: (error) => console.error("Error updating brand:", error),
    });

    // Delete
    const deleteBrandMutation = useMutation({
        mutationFn: (id: string) => brandApi.delete(id),

        onSuccess: (response, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "brand"] });
            if (selectedBrand?._id === deletedId) setSelectedBrand(null);
        },

        onError: (error) => console.error("Error deleting brand:", error),
    });

    // Toggle active/inactive
    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => brandApi.toggleStatus(id),

        onSuccess: (response, id) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "brand"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "brand", id] });

            if (response?.data && selectedBrand?._id === id) {
                setSelectedBrand(response.data);
            }
        },

        onError: (error) => console.error("Error toggling brand status:", error),
    });

    const isMutating = useMemo(
        () =>
            createBrandMutation.isPending ||
            updateBrandMutation.isPending ||
            deleteBrandMutation.isPending ||
            toggleStatusMutation.isPending,
        [
            createBrandMutation.isPending,
            updateBrandMutation.isPending,
            deleteBrandMutation.isPending,
            toggleStatusMutation.isPending,
        ]
    );

    const createBrand = useCallback(
        (data: CreateBrandPayload) => createBrandMutation.mutateAsync(data),
        [createBrandMutation]
    );

    const updateBrand = useCallback(
        (id: string, data: Partial<CreateBrandPayload>) =>
            updateBrandMutation.mutateAsync({ id, data }),
        [updateBrandMutation]
    );

    const deleteBrand = useCallback(
        (id: string) => deleteBrandMutation.mutateAsync(id),
        [deleteBrandMutation]
    );

    const toggleBrandStatus = useCallback(
        (id: string) => toggleStatusMutation.mutateAsync(id),
        [toggleStatusMutation]
    );

    const clearSelectedBrand = useCallback(() => setSelectedBrand(null), []);

    return {
        brandList,
        pagination,
        selectedBrand,
        isLoadingBrand,
        isMutating,
        brandError,
        refetchBrand,

        createBrand,
        updateBrand,
        deleteBrand,
        toggleBrandStatus,

        mutations: {
            create: createBrandMutation,
            update: updateBrandMutation,
            delete: deleteBrandMutation,
            toggleStatus: toggleStatusMutation,
        },

        getBrandById,
        clearSelectedBrand,
        setSelectedBrand,
    };
};
