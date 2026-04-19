export type TransactionType = {
  _id: string;
  walletId: string; // reference to Wallet
  ownerId: string; // user or business id
  ownerModel: "User" | "Admin" | "Merchant";

  type: "CREDIT" | "DEBIT"; // transaction type
  source: string; // e.g. "order_payment", "refund", "admin_adjustment"
  amount: number;
  balanceAfter?: number; // optional — wallet balance after this transaction

  description?: string;
  referenceId?: string; // e.g. related orderId, promoId, etc.
  meta?: Record<string, any>; // flexible metadata

  status?: "pending" | "completed" | "failed"; // optional for async flows
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};