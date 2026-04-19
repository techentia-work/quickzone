import {
  CreateWalletPayload,
  WalletResponse,
  WalletType,
} from "@/lib/types/wallet/wallet.types";
import axiosClient from "../client/axios";

export const walletApi = {
  // Create a new wallet for the user
  createWallet: (data: { ownerId: string; ownerModel: string }) =>
    axiosClient.post<{ success: boolean; message: string; data: WalletType }>(
      "/api/wallet",
      data
    ),

  // Fetch the user's wallet
  getWallet: () => axiosClient.get<any>("/api/wallet"),

  // Update wallet balance (e.g., add or deduct funds)
  updateWalletBalance: (amount: number) =>
    axiosClient.patch<{ success: boolean; message: string; data: WalletType }>(
      "/api/wallet/balance",
      { amount }
    ),

  // Deactivate a specific wallet
  deactivateWallet: (walletId: string) =>
    axiosClient.patch<{ success: boolean; message: string; data: WalletType }>(
      `/api/wallet/${walletId}/deactivate`
    ),

  // Fetch only the user's promo cash and expiry info
  getPromoCash: () =>
    axiosClient.get<{
      success: boolean;
      message: string;
      data: { promoCash: number; validTill: string | null };
    }>("/api/wallet/promocash"),
};

export default walletApi;
