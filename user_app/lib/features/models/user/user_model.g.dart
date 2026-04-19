// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserProfileType _$UserProfileTypeFromJson(Map<String, dynamic> json) =>
    UserProfileType(
      id: json['_id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      fullName: json['fullName'] as String,
      walletAddress: json['walletAddress'] as String?,
      email: json['email'] as String,
      role: $enumDecode(_$UserRoleEnumMap, json['role']),
      balance: (json['balance'] as num).toDouble(),
      points: (json['points'] as num).toInt(),
      isActive: json['isActive'] as bool,
      isDeleted: json['isDeleted'] as bool,
      isEmailVerified: json['isEmailVerified'] as bool,
      isPhoneVerified: json['isPhoneVerified'] as bool,
      isAdmin: json['isAdmin'] as bool,
      isAdminUser: json['isAdminUser'] as bool,
      isLocked: json['isLocked'] as bool,
      deletedAt: json['deletedAt'] == null
          ? null
          : DateTime.parse(json['deletedAt'] as String),
      lastLogin: DateTime.parse(json['lastLogin'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: Metadata.fromJson(json['metadata'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$UserProfileTypeToJson(UserProfileType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'fullName': instance.fullName,
      'walletAddress': instance.walletAddress,
      'email': instance.email,
      'role': _$UserRoleEnumMap[instance.role]!,
      'balance': instance.balance,
      'points': instance.points,
      'isActive': instance.isActive,
      'isDeleted': instance.isDeleted,
      'isEmailVerified': instance.isEmailVerified,
      'isPhoneVerified': instance.isPhoneVerified,
      'isAdmin': instance.isAdmin,
      'isAdminUser': instance.isAdminUser,
      'isLocked': instance.isLocked,
      'deletedAt': instance.deletedAt?.toIso8601String(),
      'lastLogin': instance.lastLogin.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'metadata': instance.metadata,
    };

const _$UserRoleEnumMap = {
  UserRole.ADMIN: 'ADMIN',
  UserRole.USER: 'USER',
  UserRole.SELLER: 'SELLER',
};

Metadata _$MetadataFromJson(Map<String, dynamic> json) => Metadata(
  preferences: json['preferences'] == null
      ? null
      : Preferences.fromJson(json['preferences'] as Map<String, dynamic>),
  twoFactorEnabled: json['twoFactorEnabled'] as bool?,
  emailVerified: json['emailVerified'] as bool?,
  phoneVerified: json['phoneVerified'] as bool?,
  id: json['id'] as String?,
);

Map<String, dynamic> _$MetadataToJson(Metadata instance) => <String, dynamic>{
  'preferences': instance.preferences,
  'twoFactorEnabled': instance.twoFactorEnabled,
  'emailVerified': instance.emailVerified,
  'phoneVerified': instance.phoneVerified,
  'id': instance.id,
};

Preferences _$PreferencesFromJson(Map<String, dynamic> json) => Preferences(
  notifications: json['notifications'] == null
      ? null
      : Notifications.fromJson(json['notifications'] as Map<String, dynamic>),
);

Map<String, dynamic> _$PreferencesToJson(Preferences instance) =>
    <String, dynamic>{'notifications': instance.notifications};

Notifications _$NotificationsFromJson(Map<String, dynamic> json) =>
    Notifications(
      email: json['email'] as bool?,
      sms: json['sms'] as bool?,
      push: json['push'] as bool?,
    );

Map<String, dynamic> _$NotificationsToJson(Notifications instance) =>
    <String, dynamic>{
      'email': instance.email,
      'sms': instance.sms,
      'push': instance.push,
    };
