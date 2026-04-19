// src/lib/types/otp/otp.types.ts
import { Document} from "mongoose";

export interface IOTP extends Document {
  identifier: string; // email or phone
  otp: string; // hashed OTP
  type: 'email' | 'phone';
  purpose: 'register' | 'login' | 'forgot_password';
  expiresAt: Date;
  isVerified: boolean;
  attempts: number;
  tempUserData?: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}