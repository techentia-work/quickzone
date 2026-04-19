import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/core/network/api_client.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/features/models/auth/auth_payload.dart';
import 'package:Quickzon/features/models/auth/auth_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return AuthRepository(client);
});

class AuthRepository {
  final ApiClient _client;
  AuthRepository(this._client);

  /// Validate current session and fetch the authenticated user
  Future<ApiResponse<AuthenticatedUser>> getCurrentUser() async =>
      _client.get<AuthenticatedUser>('/auth/me', fromJson: (json) => AuthenticatedUser.fromJson(json));

  /// Register new user
  Future<ApiResponse<RegisterResponse>> register(RegisterRequest payload) async =>
      _client.post<RegisterResponse>('/auth/register', data: payload.toJson(), fromJson: (json) => RegisterResponse.fromJson(json));

  /// Login user (email or phone)
  Future<ApiResponse<LoginResponse>> login(LoginRequest payload) =>
      _client.post<LoginResponse>('/auth/login', data: payload.toJson(), fromJson: (json) => LoginResponse.fromJson(json));

  /// Verify OTP for authentication, password reset, etc.
  Future<ApiResponse<OTPVerificationResponse>> verifyOTP(VerifyOTPRequest payload) async =>
      _client.post<OTPVerificationResponse>('/auth/verify-otp', data: payload.toJson(), fromJson: (json) => OTPVerificationResponse.fromJson(json));

  /// Resend OTP
  Future<ApiResponse<RegisterResponse>> resendOTP(ResendOTPRequest payload) async =>
      _client.post<RegisterResponse>('/auth/resend-otp', data: payload.toJson(), fromJson: (json) => RegisterResponse.fromJson(json));

  /// Forgot password
  Future<ApiResponse<ForgotPasswordResponse>> forgotPassword(ForgotPasswordRequest payload) async =>
      _client.post<ForgotPasswordResponse>('/auth/forgot-password', data: payload.toJson(), fromJson: (json) => ForgotPasswordResponse.fromJson(json));

  /// Reset password using token
  Future<ApiResponse<OTPVerificationResponse>> resetPassword(ResetPasswordRequest payload) async =>
      _client.post<OTPVerificationResponse>('/auth/reset-password', data: payload.toJson(), fromJson: (json) => OTPVerificationResponse.fromJson(json));

  /// Initiate change password (requires current password)
  Future<ApiResponse<InitiateChangePasswordResponse>> initiateChangePassword(
      InitiateChangePasswordRequest payload) async =>
      _client.post<InitiateChangePasswordResponse>('/auth/change-password/initiate', data: payload.toJson(), fromJson: (json) => InitiateChangePasswordResponse.fromJson(json));

  /// Complete change password (after OTP verification)
  Future<ApiResponse<OTPVerificationResponse>> completeChangePassword(
      CompleteChangePasswordRequest payload) async =>
      _client.post<OTPVerificationResponse>('/auth/change-password/complete', data: payload.toJson(), fromJson: (json) => OTPVerificationResponse.fromJson(json));

  /// Refresh access token
  Future<ApiResponse<RefreshTokenResponse>> refreshAccessToken() async =>
      _client.get<RefreshTokenResponse>('/auth/refresh-token', fromJson: (json) => RefreshTokenResponse.fromJson(json));

  /// Validate current token
  Future<ApiResponse<TokenValidationResponse>> validateToken() async =>
      _client.get<TokenValidationResponse>('/auth/validate-token', fromJson: (json) => TokenValidationResponse.fromJson(json));

  /// Update user profile (partial updates)
  Future<ApiResponse<AuthenticatedUser>> updateProfile(UpdateProfileRequest payload) async =>
      _client.patch<AuthenticatedUser>('/auth/update-profile', data: payload.toJson(), fromJson: (json) => AuthenticatedUser.fromJson(json['user']));

  /// Logout user (invalidate session)
  Future<ApiResponse<void>> logout() async =>
      _client.post<void>('/auth/logout', fromJson: (_) {});
}
