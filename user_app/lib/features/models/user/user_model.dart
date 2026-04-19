import 'package:Quickzon/core/utils/enums/auth_enum.dart';
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserProfileType {
  @JsonKey(name: '_id')
  final String id;
  final String firstName;
  final String lastName;
  final String fullName;
  final String? walletAddress;
  final String email;
  final UserRole role;
  final double balance;
  final int points;
  final bool isActive;
  final bool isDeleted;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final bool isAdmin;
  final bool isAdminUser;
  final bool isLocked;
  final DateTime? deletedAt;
  final DateTime lastLogin;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Metadata metadata;

  UserProfileType({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.fullName,
    this.walletAddress,
    required this.email,
    required this.role,
    required this.balance,
    required this.points,
    required this.isActive,
    required this.isDeleted,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    required this.isAdmin,
    required this.isAdminUser,
    required this.isLocked,
    this.deletedAt,
    required this.lastLogin,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  factory UserProfileType.fromJson(Map<String, dynamic> json) => _$UserProfileTypeFromJson(json);
  Map<String, dynamic> toJson() => _$UserProfileTypeToJson(this);
}

@JsonSerializable()
class Metadata {
  final Preferences? preferences;
  final bool? twoFactorEnabled;
  final bool? emailVerified;
  final bool? phoneVerified;
  final String? id;

  Metadata({this.preferences, this.twoFactorEnabled, this.emailVerified, this.phoneVerified, this.id});

  factory Metadata.fromJson(Map<String, dynamic> json) => _$MetadataFromJson(json);
  Map<String, dynamic> toJson() => _$MetadataToJson(this);
}

@JsonSerializable()
class Preferences {
  final Notifications? notifications;

  Preferences({this.notifications});

  factory Preferences.fromJson(Map<String, dynamic> json) => _$PreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$PreferencesToJson(this);
}

@JsonSerializable()
class Notifications {
  final bool? email;
  final bool? sms;
  final bool? push;

  Notifications({this.email, this.sms, this.push});

  factory Notifications.fromJson(Map<String, dynamic> json) => _$NotificationsFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationsToJson(this);
}
