import mongoose from "mongoose";
import { ITransactionDocument, TransactionModelType } from "../../lib/types/transactions/transactions.types";

export const transactionUtils = {
  statics: {
    async recordTransaction(
      this: TransactionModelType,
      walletId: mongoose.Types.ObjectId,
      type: "CREDIT" | "DEBIT",
      source: "ORDER" | "REFUND" | "PROMO" | "MANUAL" | "WITHDRAWAL" | "SYSTEM",
      amount: number,
      balanceAfter: number,
      status: "SUCCESS" | "FAILED" | "PENDING" = "SUCCESS",
      description?: string,
      referenceId?: string,
      meta?: Record<string, any>,
      session?: mongoose.ClientSession
    ): Promise<ITransactionDocument> {
      const [txn] = await this.create([{
        walletId,
        type,
        source,
        amount,
        balanceAfter,
        status,
        description,
        referenceId,
        meta,
      }], { session });
      return txn;
    },

    async getRecentTransactions(
      this: TransactionModelType,
      walletId: string,
      limit = 10
    ): Promise<ITransactionDocument[]> {
      return this.find({ walletId }).sort({ createdAt: -1 }).limit(limit);
    },
  },

  methods: {
    isCredit(this: ITransactionDocument): boolean {
      return this.type === "CREDIT";
    },
    isDebit(this: ITransactionDocument): boolean {
      return this.type === "DEBIT";
    },
  },
};