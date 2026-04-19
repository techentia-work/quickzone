import mongoose, { Schema } from "mongoose";
import {
  IWalletDocument,
  WalletModelType,
} from "../../lib/types/wallet/wallet.types";
import { walletUtils } from "./wallet.utils";

const WalletSchema = new Schema<IWalletDocument, WalletModelType>(
  {
    ownerId: {type: Schema.Types.ObjectId,required: true,refPath: "ownerModel",index: true,},
    ownerName: {type: String,},
    ownerModel: {type: String,required: true,enum: ["USER", "ADMIN"],},
    balance: {type: Number,default: 0,min: 0,},
    promoCash: {type: Number,default: 0,min: 0,},
    promoCashExpiresAt: {type: Date,default: null,},
    currency: {type: String,default: "INR",trim: true,},
    isActive: {type: Boolean,default: true,},
  },
  { timestamps: true }
);

WalletSchema.index({ ownerId: 1, ownerModel: 1 });
WalletSchema.index({ isActive: 1 });

Object.assign(WalletSchema.statics, walletUtils.statics);
Object.assign(WalletSchema.methods, walletUtils.methods);

export const Wallet = mongoose.model<IWalletDocument, WalletModelType>(
  "Wallet",
  WalletSchema
);
