// @/lib/interfaces/auth.interfaces.ts

import { OtpPurpose, UserRole } from "./auth.enums";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface VerifyOTPRequest {
  identifier: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  identifier: string;
}

export interface InitiateChangePasswordRequest {
  currentPassword: string;
}

export interface CompleteChangePasswordRequest {
  identifier: string;  // can be email or phone
  newPassword: string;
  changeToken: string;
}

export interface ResendOTPRequest {
  identifier: string;
  purpose: OtpPurpose;
}

export interface UpdateProfileRequest {
  firstName?: string;
  walletAddress?: string;
}

export interface JWTPayload {
    sub: string;
    _id: string;
    email?: string;
    phone?: string;
    role?: string;
    isAdmin?: boolean;
    iat: number;
    exp: number;
}