// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    RegisterRequest(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      password: json['password'] as String,
      role: $enumDecodeNullable(_$UserRoleEnumMap, json['role']),
    );

Map<String, dynamic> _$RegisterRequestToJson(RegisterRequest instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'phone': instance.phone,
      'password': instance.password,
      'role': _$UserRoleEnumMap[instance.role],
    };

const _$UserRoleEnumMap = {
  UserRole.ADMIN: 'ADMIN',
  UserRole.USER: 'USER',
  UserRole.SELLER: 'SELLER',
};

LoginRequest _$LoginRequestFromJson(Map<String, dynamic> json) => LoginRequest(
  email: json['email'] as String?,
  password: json['password'] as String,
  phone: json['phone'] as String?,
);

Map<String, dynamic> _$LoginRequestToJson(LoginRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'phone': instance.phone,
      'password': instance.password,
    };

VerifyOTPRequest _$VerifyOTPRequestFromJson(Map<String, dynamic> json) =>
    VerifyOTPRequest(
      identifier: json['identifier'] as String,
      otp: json['otp'] as String,
      purpose: $enumDecode(_$OtpPurposeEnumMap, json['purpose']),
    );

Map<String, dynamic> _$VerifyOTPRequestToJson(VerifyOTPRequest instance) =>
    <String, dynamic>{
      'identifier': instance.identifier,
      'otp': instance.otp,
      'purpose': _$OtpPurposeEnumMap[instance.purpose]!,
    };

const _$OtpPurposeEnumMap = {
  OtpPurpose.register: 'register',
  OtpPurpose.login: 'login',
  OtpPurpose.forgot_password: 'forgot_password',
  OtpPurpose.change_password: 'change_password',
};

ForgotPasswordRequest _$ForgotPasswordRequestFromJson(
  Map<String, dynamic> json,
) => ForgotPasswordRequest(email: json['email'] as String);

Map<String, dynamic> _$ForgotPasswordRequestToJson(
  ForgotPasswordRequest instance,
) => <String, dynamic>{'email': instance.email};

ResetPasswordRequest _$ResetPasswordRequestFromJson(
  Map<String, dynamic> json,
) => ResetPasswordRequest(
  resetToken: json['resetToken'] as String,
  newPassword: json['newPassword'] as String,
  identifier: json['identifier'] as String,
);

Map<String, dynamic> _$ResetPasswordRequestToJson(
  ResetPasswordRequest instance,
) => <String, dynamic>{
  'resetToken': instance.resetToken,
  'newPassword': instance.newPassword,
  'identifier': instance.identifier,
};

InitiateChangePasswordRequest _$InitiateChangePasswordRequestFromJson(
  Map<String, dynamic> json,
) => InitiateChangePasswordRequest(
  currentPassword: json['currentPassword'] as String,
);

Map<String, dynamic> _$InitiateChangePasswordRequestToJson(
  InitiateChangePasswordRequest instance,
) => <String, dynamic>{'currentPassword': instance.currentPassword};

CompleteChangePasswordRequest _$CompleteChangePasswordRequestFromJson(
  Map<String, dynamic> json,
) => CompleteChangePasswordRequest(
  identifier: json['identifier'] as String,
  newPassword: json['newPassword'] as String,
  changeToken: json['changeToken'] as String,
);

Map<String, dynamic> _$CompleteChangePasswordRequestToJson(
  CompleteChangePasswordRequest instance,
) => <String, dynamic>{
  'identifier': instance.identifier,
  'newPassword': instance.newPassword,
  'changeToken': instance.changeToken,
};

ResendOTPRequest _$ResendOTPRequestFromJson(Map<String, dynamic> json) =>
    ResendOTPRequest(
      identifier: json['identifier'] as String,
      purpose: $enumDecode(_$OtpPurposeEnumMap, json['purpose']),
    );

Map<String, dynamic> _$ResendOTPRequestToJson(ResendOTPRequest instance) =>
    <String, dynamic>{
      'identifier': instance.identifier,
      'purpose': _$OtpPurposeEnumMap[instance.purpose]!,
    };

UpdateProfileRequest _$UpdateProfileRequestFromJson(
  Map<String, dynamic> json,
) => UpdateProfileRequest(
  firstName: json['firstName'] as String?,
  walletAddress: json['walletAddress'] as String?,
);

Map<String, dynamic> _$UpdateProfileRequestToJson(
  UpdateProfileRequest instance,
) => <String, dynamic>{
  'firstName': instance.firstName,
  'walletAddress': instance.walletAddress,
};

LoginResponse _$LoginResponseFromJson(Map<String, dynamic> json) =>
    LoginResponse(
      user: json['user'] == null
          ? null
          : AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String?,
      requires2FA: json['requires2FA'] as bool?,
      identifier: json['identifier'] as String?,
    );

Map<String, dynamic> _$LoginResponseToJson(LoginResponse instance) =>
    <String, dynamic>{
      'user': instance.user?.toJson(),
      'token': instance.token,
      'requires2FA': instance.requires2FA,
      'identifier': instance.identifier,
    };

OTPVerificationResponse _$OTPVerificationResponseFromJson(
  Map<String, dynamic> json,
) => OTPVerificationResponse(
  user: json['user'] == null
      ? null
      : AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
  token: json['token'] as String?,
  resetToken: json['resetToken'] as String?,
  changeToken: json['changeToken'] as String?,
);

Map<String, dynamic> _$OTPVerificationResponseToJson(
  OTPVerificationResponse instance,
) => <String, dynamic>{
  'user': instance.user?.toJson(),
  'token': instance.token,
  'resetToken': instance.resetToken,
  'changeToken': instance.changeToken,
};

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      identifier: json['identifier'] as String,
      purpose: $enumDecode(_$OtpPurposeEnumMap, json['purpose']),
      verificationType: json['verificationType'] as String?,
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{
      'identifier': instance.identifier,
      'purpose': _$OtpPurposeEnumMap[instance.purpose]!,
      'verificationType': instance.verificationType,
    };

InitiateChangePasswordResponse _$InitiateChangePasswordResponseFromJson(
  Map<String, dynamic> json,
) => InitiateChangePasswordResponse(
  identifier: json['identifier'] as String,
  purpose: $enumDecode(_$OtpPurposeEnumMap, json['purpose']),
  message: json['message'] as String?,
);

Map<String, dynamic> _$InitiateChangePasswordResponseToJson(
  InitiateChangePasswordResponse instance,
) => <String, dynamic>{
  'identifier': instance.identifier,
  'purpose': _$OtpPurposeEnumMap[instance.purpose]!,
  'message': instance.message,
};

ForgotPasswordResponse _$ForgotPasswordResponseFromJson(
  Map<String, dynamic> json,
) => ForgotPasswordResponse(
  identifier: json['identifier'] as String,
  purpose: $enumDecode(_$OtpPurposeEnumMap, json['purpose']),
  message: json['message'] as String?,
);

Map<String, dynamic> _$ForgotPasswordResponseToJson(
  ForgotPasswordResponse instance,
) => <String, dynamic>{
  'identifier': instance.identifier,
  'purpose': _$OtpPurposeEnumMap[instance.purpose]!,
  'message': instance.message,
};

RefreshTokenResponse _$RefreshTokenResponseFromJson(
  Map<String, dynamic> json,
) => RefreshTokenResponse(
  token: json['token'] as String,
  user: AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
);

Map<String, dynamic> _$RefreshTokenResponseToJson(
  RefreshTokenResponse instance,
) => <String, dynamic>{'token': instance.token, 'user': instance.user.toJson()};

TokenValidationResponse _$TokenValidationResponseFromJson(
  Map<String, dynamic> json,
) => TokenValidationResponse(
  valid: json['valid'] as bool,
  user: json['user'] == null
      ? null
      : AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
  message: json['message'] as String?,
);

Map<String, dynamic> _$TokenValidationResponseToJson(
  TokenValidationResponse instance,
) => <String, dynamic>{
  'valid': instance.valid,
  'user': instance.user?.toJson(),
  'message': instance.message,
};
