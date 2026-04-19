// =============================
// WALLET TYPES
// =============================

// The model type that owns the wallet (can extend later to "Merchant", etc.)
export type WalletOwnerType = "User" | "Admin";

// Core Wallet structure
export interface WalletType {
  _id: string;
  ownerId: string; // User ID (stringified ObjectId)
  ownerModel: WalletOwnerType;
  balance: number;
  promoCash: number;
  currency: string;
  isActive: boolean;
  promoCashExpiresAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

// =============================
// REQUEST TYPES
// =============================

// Used when creating a new wallet
export interface CreateWalletPayload {
  ownerId: string;
  ownerModel: WalletOwnerType;
}

// Used when updating balance (user or admin)
export interface UpdateWalletBalancePayload {
  walletId?: string; // Admin may specify, user doesn’t
  amount: number;
}

// Used when updating promo cash (admin)
export interface UpdatePromoCashPayload {
  walletId: string;
  amount: number;
  validDays?: number;
}

// Used for admin to toggle active status
export interface SetWalletStatusPayload {
  walletId: string;
  isActive: boolean;
}

// =============================
// RESPONSE TYPES
// =============================

export interface WalletResponse {
  success: boolean;
  message: string;
  data: WalletType;
}

export interface WalletListResponse {
  success: boolean;
  message: string;
  data: {
    wallets: WalletType[];
    total: number;
  };
}

export interface PromoCashResponse {
  success: boolean;
  message: string;
  data: {
    promoCash: number;
    validTill: string | null;
  };
}
