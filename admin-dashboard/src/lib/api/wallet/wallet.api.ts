import { WalletType } from "@/lib/types/wallet/wallet.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const walletAdminApi = {
  getAllWallets: () =>
    axiosClient.get<{
      wallets: WalletType[];
      total: number;
      pagination: PaginationResponse;
    }>("/api/wallet/admin/all"),

  getWalletById: (walletId: string) =>
    axiosClient.get<WalletType>(`/api/wallet/admin/${walletId}`),

  adjustWalletBalance: (data: { walletId: string; amount: number }) =>
    axiosClient.patch<WalletType>("/api/wallet/admin/adjust", data),

  setWalletStatus: (walletId: string, isActive: boolean) =>
    axiosClient.patch<WalletType>(`/api/wallet/admin/${walletId}/status`, {
      isActive,
    }),

  adjustPromoCash: (data: {
    walletId: string;
    amount: number;
    validDays?: number;
  }) => axiosClient.patch<WalletType>("/api/wallet/admin/promocash", data),

  getPromoCashStats: () =>
    axiosClient.get<{
      totalPromoCash: number;
      avgPromoCash: number;
      usersWithPromoCash: number;
    }>("/api/wallet/admin/promocash/stats"),
};

export default walletAdminApi;
