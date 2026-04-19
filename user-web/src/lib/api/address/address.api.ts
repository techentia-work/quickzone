import { CreateAddressPayload, UpdateAddressPayload } from "@/lib/types/address/address.payload";
import axiosClient from "../client/axios";
import { Address } from "@/lib/types/address/address.types";

export const addressApi = {
  createAddress: (data: CreateAddressPayload) => axiosClient.post<{ success: boolean; message: string; data: Address }>("/api/address", data),
  getAllAddresses: () => axiosClient.get<{ addresses: Address[] }>("/api/address"),
  getDefaultAddress: () => axiosClient.get<{ success: boolean; data: Address | null }>("/api/address/default"),
  getAddressesByType: (type: string) => axiosClient.get<{ success: boolean; data: Address[] }>(`/api/address/type/${type}`),
  getAddressById: (addressId: string) => axiosClient.get<{ success: boolean; data: Address }>(`/api/address/${addressId}`),
  updateAddress: (addressId: string, data: UpdateAddressPayload) => axiosClient.patch<{ success: boolean; message: string; data: Address }>(`/api/address/${addressId}`, data),
  setDefaultAddress: (addressId: string) => axiosClient.patch<{ success: boolean; message: string }>(`/api/address/${addressId}/set-default`),
  deleteAddress: (addressId: string) => axiosClient.delete<{ success: boolean; message: string }>(`/api/address/${addressId}`),
  permanentDeleteAddress: (addressId: string) => axiosClient.delete<{ success: boolean; message: string }>(`/api/address/${addressId}/permanent`),
  restoreAddress: (addressId: string) => axiosClient.post<{ success: boolean; message: string }>(`/api/address/${addressId}/restore`),
}

export default addressApi;
