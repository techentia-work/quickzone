import mongoose from "mongoose";
import { AppError } from "../../lib/types/index";
import { IWalletDocument, WalletModelType } from "../../lib/types/wallet/wallet.types";

export const walletUtils = {
  statics: {
    async getOrCreateWallet(
      this: WalletModelType,
      ownerId: mongoose.Types.ObjectId,
      ownerModel: string
    ): Promise<IWalletDocument> {
      let wallet = await this.findOne({ ownerId, ownerModel });
      if (!wallet) {
        wallet = await this.create({ ownerId, ownerModel });
      }
      return wallet;
    },

    async getBalance(
      this: WalletModelType,
      ownerId: mongoose.Types.ObjectId,
      ownerModel: string
    ): Promise<number> {
      const wallet = await this.findOne({ ownerId, ownerModel });
      return wallet ? wallet.balance : 0;
    },
  },

  methods: {
    async credit(this: IWalletDocument, amount: number): Promise<IWalletDocument> {
      if (amount <= 0) throw new AppError("Invalid credit amount", 400);
      this.balance += amount;
      await this.save();
      return this;
    },

    async debit(this: IWalletDocument, amount: number): Promise<IWalletDocument> {
      if (amount <= 0) throw new AppError("Invalid debit amount", 400);
      if (this.balance < amount) throw new AppError("Insufficient balance", 400);
      this.balance -= amount;
      await this.save();
      return this;
    },

    async addPromoCash(this: IWalletDocument, amount: number): Promise<IWalletDocument> {
      if (amount <= 0) throw new AppError("Invalid promo cash amount", 400);
      this.promoCash += amount;
      await this.save();
      return this;
    },

    async useWalletFunds(this: IWalletDocument, amount: number) {
      if (amount <= 0) throw new AppError("Invalid wallet deduction amount", 400);

      let remaining = amount;

      // 1. Use PromoCash first (if not expired)
      if (this.promoCash > 0 && this.promoCashExpiresAt && this.promoCashExpiresAt > new Date()) {
        const promoToUse = Math.min(this.promoCash, remaining);
        this.promoCash -= promoToUse;
        remaining -= promoToUse;
      }

      // 2. Use normal wallet balance
      if (remaining > 0) {
        if (this.balance < remaining) {
          throw new AppError("Insufficient wallet balance", 400);
        }
        this.balance -= remaining;
      }

      return {
        promoUsed: amount - remaining,
        balanceUsed: remaining,
      };
    }
  },
};
