"use client";

import { useQuery } from "@tanstack/react-query";
import { userProfileApi } from "@/lib/api";

export const useAdminUser = (userId?: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["adminUserDetails", userId],
    queryFn: async () => {
      console.log("Hook called with userId:", userId);
      const res = await userProfileApi.getUserDetails(userId);
      console.log("Resss", res);

      return res.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });

  return {
    userDetails: data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useAllUsers = (filters?: any) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["allUsers", filters],
    queryFn: async () => {
      const res = await userProfileApi.getAllUsers(filters);
      console.log("Data", res);

      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    refetch,
  };
};
