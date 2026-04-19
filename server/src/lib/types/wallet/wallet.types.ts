import { Document, Model, Types } from "mongoose";

export type WalletOwnerType = "USER" | "ADMIN";

export interface IWallet {
  ownerId: Types.ObjectId;
  ownerName?: string;
  ownerModel: WalletOwnerType;
  balance: number;
  promoCash: number;
  currency: string;
  isActive: boolean;
  promoCashExpiresAt?: Date | null;
}

/** 🧾 Instance Methods */
export interface IWalletDocument extends IWallet, Document {
  credit(amount: number, source?: string): Promise<IWalletDocument>;
  debit(amount: number, source?: string): Promise<IWalletDocument>;
  useWalletFunds(amount: number, source?: string): Promise<{ promoUsed: number, balanceUsed: number, }>;
  addPromoCash(amount: number): Promise<IWalletDocument>;
  consumePromoCash(amount: number): Promise<IWalletDocument>;
}

/** 🧠 Static Methods */
export interface WalletModelType extends Model<IWalletDocument> {
  getOrCreateWallet(
    ownerId: string,
    ownerModel: WalletOwnerType
  ): Promise<IWalletDocument>;
  getBalance(
    ownerId: string,
    ownerModel: WalletOwnerType
  ): Promise<number>;
}