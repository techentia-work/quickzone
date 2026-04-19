// features/models/auth/auth_models.dart
import 'package:quickzone_delivery/core/utils/enums/auth_enum.dart';
import 'package:json_annotation/json_annotation.dart';

part 'auth_model.g.dart';

@JsonSerializable()
class AuthenticatedUser {
  @JsonKey(name: 'id')
  final String id;
  final String? email;
  final String? firstName;
  final String? fullName;
  final String? phone;
  final UserRole role;
  final bool? isAdmin;

  AuthenticatedUser({
    required this.id,
    this.email,
    this.firstName,
    this.fullName,
    this.phone,
    required this.role,
    this.isAdmin,
  });

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) => _$AuthenticatedUserFromJson(json);
  Map<String, dynamic> toJson() => _$AuthenticatedUserToJson(this);
}