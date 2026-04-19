// features/models/auth/auth_payload.dart
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/core/utils/enums/auth_enum.dart';
import 'package:json_annotation/json_annotation.dart';

part 'auth_payload.g.dart';

@JsonSerializable()
class RegisterRequest {
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final String password;
  final UserRole? role;

  RegisterRequest({
    required this.firstName,
    required this.lastName,
    this.email,
    this.phone,
    required this.password,
    this.role,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

@JsonSerializable()
class LoginRequest {
  final String? email;
  final String? phone;
  final String password;

  LoginRequest({this.email, required this.password,this.phone,});

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class VerifyOTPRequest {
  final String identifier;
  final String otp;
  final OtpPurpose purpose;

  VerifyOTPRequest({required this.identifier, required this.otp, required this.purpose});

  factory VerifyOTPRequest.fromJson(Map<String, dynamic> json) => _$VerifyOTPRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyOTPRequestToJson(this);
}

@JsonSerializable()
class ForgotPasswordRequest {
  final String email;

  ForgotPasswordRequest({required this.email});

  factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) => _$ForgotPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ForgotPasswordRequestToJson(this);
}

@JsonSerializable()
class ResetPasswordRequest {
  final String resetToken;
  final String newPassword;
  final String identifier;

  ResetPasswordRequest({required this.resetToken, required this.newPassword, required this.identifier});

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) => _$ResetPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ResetPasswordRequestToJson(this);
}

@JsonSerializable()
class InitiateChangePasswordRequest {
  final String currentPassword;

  InitiateChangePasswordRequest({required this.currentPassword});

  factory InitiateChangePasswordRequest.fromJson(Map<String, dynamic> json) => _$InitiateChangePasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$InitiateChangePasswordRequestToJson(this);
}

@JsonSerializable()
class CompleteChangePasswordRequest {
  final String identifier;
  final String newPassword;
  final String changeToken;

  CompleteChangePasswordRequest({
    required this.identifier,
    required this.newPassword,
    required this.changeToken,
  });

  factory CompleteChangePasswordRequest.fromJson(Map<String, dynamic> json) => _$CompleteChangePasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CompleteChangePasswordRequestToJson(this);
}

@JsonSerializable()
class ResendOTPRequest {
  final String identifier;
  final OtpPurpose purpose;

  ResendOTPRequest({required this.identifier, required this.purpose});

  factory ResendOTPRequest.fromJson(Map<String, dynamic> json) => _$ResendOTPRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ResendOTPRequestToJson(this);
}

@JsonSerializable()
class UpdateProfileRequest {
  final String? firstName;
  final String? walletAddress;

  UpdateProfileRequest({this.firstName, this.walletAddress});

  factory UpdateProfileRequest.fromJson(Map<String, dynamic> json) => _$UpdateProfileRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileRequestToJson(this);
}

@JsonSerializable(explicitToJson: true)
class LoginResponse {
  final AuthenticatedUser? user;
  final String? token;
  final bool? requires2FA;
  final String? identifier;

  LoginResponse({this.user, this.token, this.requires2FA, this.identifier});

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class OTPVerificationResponse {
  final AuthenticatedUser? user;
  final String? token;
  final String? resetToken;
  final String? changeToken;

  OTPVerificationResponse({this.user, this.token, this.resetToken, this.changeToken});

  factory OTPVerificationResponse.fromJson(Map<String, dynamic> json) => _$OTPVerificationResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OTPVerificationResponseToJson(this);
}

@JsonSerializable()
class RegisterResponse {
  final String identifier;
  final OtpPurpose purpose;
  final String? verificationType;

  RegisterResponse({required this.identifier, required this.purpose, this.verificationType});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) => _$RegisterResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterResponseToJson(this);
}

@JsonSerializable()
class InitiateChangePasswordResponse {
  final String identifier;
  final OtpPurpose purpose;
  final String? message;

  InitiateChangePasswordResponse({required this.identifier, required this.purpose, this.message});

  factory InitiateChangePasswordResponse.fromJson(Map<String, dynamic> json) => _$InitiateChangePasswordResponseFromJson(json);
  Map<String, dynamic> toJson() => _$InitiateChangePasswordResponseToJson(this);
}

@JsonSerializable()
class ForgotPasswordResponse {
  final String identifier;
  final OtpPurpose purpose;
  final String? message;

  ForgotPasswordResponse({required this.identifier, required this.purpose, this.message});

  factory ForgotPasswordResponse.fromJson(Map<String, dynamic> json) => _$ForgotPasswordResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ForgotPasswordResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class RefreshTokenResponse {
  final String token;
  final AuthenticatedUser user;

  RefreshTokenResponse({required this.token, required this.user});

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) => _$RefreshTokenResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RefreshTokenResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class TokenValidationResponse {
  final bool valid;
  final AuthenticatedUser? user;
  final String? message;

  TokenValidationResponse({required this.valid, this.user, this.message});

  factory TokenValidationResponse.fromJson(Map<String, dynamic> json) => _$TokenValidationResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TokenValidationResponseToJson(this);
}
