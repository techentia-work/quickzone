// @/lib/types/wallet/wallet.types.ts

export type WalletOwnerType = "User" | "Vendor" | "Driver" | "Admin";

export interface WalletType {
  _id: string;
  ownerId: string; // Stringified ObjectId
  ownerModel: WalletOwnerType;
  balance: number;
  promoCash: number;
  currency: string;
  isActive: boolean;
  promoCashExpiresAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}