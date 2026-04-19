import mongoose from "mongoose";
import { ITransactionDocument, TransactionModelType } from "../../lib/types/transactions/transactions.types";
import { transactionUtils } from "./transaction.utils";

const TransactionSchema = new mongoose.Schema<ITransactionDocument, TransactionModelType>(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true, index: true, },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true, },
    source: { type: String, enum: ["ORDER", "REFUND", "PROMO", "MANUAL", "WITHDRAWAL", "SYSTEM"], default: "SYSTEM", },
    amount: { type: Number, required: true, min: 0, },
    balanceAfter: { type: Number, required: true, min: 0, },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "SUCCESS", },
    description: { type: String, trim: true, maxlength: 300, },
    referenceId: { type: String, trim: true, default: null, },
    meta: { type: mongoose.Schema.Types.Mixed, default: {}, },
  },
  { timestamps: true }
);

TransactionSchema.index({ walletId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });

Object.assign(TransactionSchema.statics, transactionUtils.statics);
Object.assign(TransactionSchema.methods, transactionUtils.methods);

export const Transaction = mongoose.model<ITransactionDocument, TransactionModelType>(
  "Transaction",
  TransactionSchema
);
