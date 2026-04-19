// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthenticatedUser _$AuthenticatedUserFromJson(Map<String, dynamic> json) =>
    AuthenticatedUser(
      id: json['id'] as String,
      email: json['email'] as String?,
      firstName: json['firstName'] as String?,
      fullName: json['fullName'] as String?,
      phone: json['phone'] as String?,
      role: $enumDecode(_$UserRoleEnumMap, json['role']),
      isAdmin: json['isAdmin'] as bool?,
    );

Map<String, dynamic> _$AuthenticatedUserToJson(AuthenticatedUser instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'firstName': instance.firstName,
      'fullName': instance.fullName,
      'phone': instance.phone,
      'role': _$UserRoleEnumMap[instance.role]!,
      'isAdmin': instance.isAdmin,
    };

const _$UserRoleEnumMap = {
  UserRole.ADMIN: 'ADMIN',
  UserRole.USER: 'USER',
  UserRole.SELLER: 'SELLER',
};
