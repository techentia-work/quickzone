// @/hooks/useUserProfile.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileApi } from '@/lib/api';
import { UserProfileType } from '@/lib/types';
import toast from 'react-hot-toast';

export const useUserProfile = () => {
    const queryClient = useQueryClient();

    // Get detailed profile
    const { data, isLoading, error, refetch } = useQuery<UserProfileType>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await userProfileApi.getProfile();
            return res.data!;
        },
        refetchOnWindowFocus: false,
    });

    // Update profile
    const updateMutation = useMutation({
        mutationFn: async (payload: Partial<UserProfileType>) => userProfileApi.updateProfile(payload),
        onSuccess: (res) => {
            if (!res.success) {
                toast.error(res.message || 'Failed to update profile');
            } else {
                toast.success(res.message || 'Profile updated successfully');
            }
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    return {
        profile: data,
        isLoading,
        error,
        refetch,
        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
};
