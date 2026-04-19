"use client";

import addressApi from "@/lib/api/address/address.api";
import {
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/lib/types/address/address.payload";
import { Address } from "@/lib/types/address/address.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/useAuth";

export const useAddress = (userId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)

  const { data: addresses = [], isLoading, isError, refetch, } = useQuery({
    queryKey: ["addresses", user?._id],
    queryFn: async () => {
      const res = await addressApi.getAllAddresses();
      return res.data?.addresses;
    },
    enabled: !!user?._id,
  });

  // ✅ Create address
  const createMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      addressApi.createAddress(payload),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message || "Failed to add address");
      else toast.success(res.message || "Address added successfully");

      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error while creating address");
    },
  });

  // ✅ Update address
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressPayload }) =>
      addressApi.updateAddress(id, data),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message || "Failed to update address");
      else toast.success(res.message || "Address updated successfully");

      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error while updating address");
    },
  });

  // ✅ Delete address
  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message || "Failed to delete address");
      else toast.success(res.message || "Address deleted successfully");

      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error while deleting address");
    },
  });

  // ✅ Set Default Address
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: (res) => {
      if (!res.success)
        toast.error(res.message || "Failed to set default address");
      else toast.success(res.message || "Default address updated");

      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error while setting default address");
    },
  });

  useEffect(() => {
    if (!addresses?.length) return;

    const def = addresses.find(p => p.isDefault) || null;
    setDefaultAddress(def);
  }, [addresses, queryClient]);

  return {
    addresses,
    defaultAddress,
    isLoading,
    isError,
    refetch,
    // Mutations
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
};
