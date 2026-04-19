// @/lib/api/auth.ts
import {
  CompleteChangePasswordRequest,
  ForgotPasswordRequest,
  InitiateChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendOTPRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  VerifyOTPRequest,
} from "@/lib/types";
import axiosClient from "../client/axios";
import {
  ApiResponse,
  AuthenticatedUser,
  UserType,
  OtpPurpose,
} from "@/lib/types";

export const authAPI = {
  register: (data: RegisterRequest) =>
    axiosClient.post<RegisterResponse>("/api/auth/register", data),
  login: (data: LoginRequest) =>
    axiosClient.post<LoginResponse>("/api/auth/login", data),
  logout: () => axiosClient.post<{ message: string }>("/api/auth/logout"),
  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", data),
  initiateChangePassword: (data: InitiateChangePasswordRequest) =>
    axiosClient.post<InitiateChangePasswordResponse>(
      "/api/auth/change-password/initiate",
      data
    ),
  completeChangePassword: (data: CompleteChangePasswordRequest) =>
    axiosClient.post<{ message: string }>(
      "/api/auth/change-password/complete",
      data
    ),
  resetPassword: (data: ResetPasswordRequest) =>
    axiosClient.post<{ message: string }>("/api/auth/reset-password", data),

  // User management
  getCurrentUser: () => axiosClient.get<AuthenticatedUser>("/api/auth/me"),
  updateProfile: (data: UpdateProfileRequest) =>
    axiosClient.patch<AuthenticatedUser>("/api/auth/profile", data),

  // Token management
  refreshToken: () =>
    axiosClient.post<RefreshTokenResponse>("/api/auth/refresh"),
  validateToken: () =>
    axiosClient.post<TokenValidationResponse>("/api/auth/validate-token"),

  // OTP management
  verifyOTP: (data: VerifyOTPRequest) =>
    axiosClient.post<OTPVerificationResponse>("/api/auth/verify-otp", data),
  resendOTP: (data: ResendOTPRequest) =>
    axiosClient.post<{ message: string }>("/api/auth/resend-otp", data),
};

export default authAPI;

// Auth response interfaces based on actual API responses
export interface LoginResponse {
  user?: AuthenticatedUser;
  token?: string;
  requires2FA?: boolean;
  identifier?: string;
}

export interface OTPVerificationResponse {
  user?: AuthenticatedUser;
  token?: string;
  resetToken?: string;
  changeToken?: string;
}

export interface RegisterResponse {
  identifier: string;
  purpose: OtpPurpose;
  message?: string;
}

export interface InitiateChangePasswordResponse {
  identifier: string;
  purpose: OtpPurpose;
  message?: string;
}

export interface ForgotPasswordResponse {
  identifier: string;
  purpose: OtpPurpose;
  message?: string;
}

export interface RefreshTokenResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: AuthenticatedUser;
  message?: string;
}
