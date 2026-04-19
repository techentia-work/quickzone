
// @/lib/config/db/models/OTP.ts
import { Schema, model, } from "mongoose";
import { IOTP, OtpPurpose } from "../../lib/types/index";

const OTPSchema = new Schema<IOTP>({
    identifier: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true, enum: Object.values(OtpPurpose) },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    tempUserData: { type: { firstName: String, lastName: String, email: String, phone: String, password: String, } }
});

OTPSchema.pre('validate', function (next) { (!this.tempUserData?.email && !this.tempUserData?.phone) ? next(new Error('Either email or phone must be provided')) : next() });

// TTL index - documents will be automatically deleted after expiration
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ identifier: 1, purpose: 1 });

export const OTP = model<IOTP>("OTP", OTPSchema);
