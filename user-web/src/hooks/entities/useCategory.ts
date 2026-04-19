'use client';

import { useQuery } from '@tanstack/react-query';
import { TypeOfCategory, CategoryType } from '@/lib/types';
import { categoryApi } from '@/lib/api';

interface UseUserCategoryProps {
    type?: TypeOfCategory;
    tree?: boolean;
    enabled?: boolean;
}

export const useCategory = ({ type = TypeOfCategory.CATEGORY, tree = false, enabled = true, }: UseUserCategoryProps = {}) => {

    const { data, error, refetch, isLoading } = useQuery({
        queryKey: ['user', 'categories', type, tree],
        queryFn: async () => {
            if (tree) {
                const res = await categoryApi.getTree(`type=${type}`);
                return res?.data;
            } else {
                const res = await categoryApi.getAll(`type=${type}&isActive=true`);
                return res?.data?.categories || [];
            }
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });

    return { data: data || [], error, refetch, isLoading, };
};

export function useCategoryDisplay(masterId?: string) {
    return useQuery({
        queryKey: ["category-display", masterId],
        queryFn: async () => {
            const response = await categoryApi.getDisplayCategories(masterId);
            return response?.data?.categories || [];
        },
        enabled: !!masterId,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}