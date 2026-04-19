import mongoose from "mongoose";
import { Document, Model, Types } from "mongoose";

export type TransactionType = "CREDIT" | "DEBIT";

export type TransactionSourceType =
  | "ORDER"
  | "REFUND"
  | "PROMO"
  | "MANUAL"
  | "WITHDRAWAL"
  | "SYSTEM";

export type TransactionStatusType = "SUCCESS" | "FAILED" | "PENDING";

export interface ITransaction {
  walletId: Types.ObjectId;
  type: TransactionType;
  source: TransactionSourceType;
  amount: number;
  balanceAfter: number;
  status: TransactionStatusType;
  description?: string;
  referenceId?: string | null;
  meta?: Record<string, any>;
}

/** 🧾 Instance Methods */
export interface ITransactionDocument extends ITransaction, Document {
  isCredit(): boolean;
  isDebit(): boolean;
}

/** 🧠 Static Methods */
export interface TransactionModelType extends Model<ITransactionDocument> {
  getRecentTransactions(
    walletId: string,
    limit?: number
  ): Promise<ITransactionDocument[]>;

  recordTransaction(
    walletId: string,
    type: TransactionType,
    source: TransactionSourceType,
    amount: number,
    balanceAfter: number,
    status?: TransactionStatusType,
    description?: string,
    referenceId?: string,
    meta?: Record<string, any>,
    session?: mongoose.ClientSession
  ): Promise<ITransactionDocument>;
}