import { Document } from "mongoose";
import { OtpPurpose } from "../../lib/types/index";

export interface IOTP extends Document {
    identifier: string; // email
    otp: string; // hashed OTP
    purpose: OtpPurpose;
    expiresAt: Date;
    isVerified: boolean;
    attempts: number;
    createdAt: Date;
    tempUserData?: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        password: string;
    };
}
