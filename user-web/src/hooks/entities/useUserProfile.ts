"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileApi } from "@/lib/api";
import type { UserProfileType } from "@/lib/types/user/user.types";
import toast from "react-hot-toast";
import { useAuth } from "../auth/useAuth";

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ✅ Fetch user profile
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", user?._id],
    queryFn: async (): Promise<UserProfileType> => {
      const res = await userProfileApi.getProfile();
      if (!res) {
        throw new Error("Failed to fetch user profile");
      }
      return (res as any).user;
    },
    enabled: !!user?._id,
    refetchOnWindowFocus: false,
  });

  // ✅ Mutation for profile update
  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: Partial<UserProfileType>) => {
      const res = await userProfileApi.updateProfile(payload);
      if (!res.success)
        throw new Error(res.message || "Failed to update profile");
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,
    updateProfile,
    isUpdating,
  };
};
