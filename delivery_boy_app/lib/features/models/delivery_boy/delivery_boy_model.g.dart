// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery_boy_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeliveryBoyProfileData _$DeliveryBoyProfileDataFromJson(
  Map<String, dynamic> json,
) => DeliveryBoyProfileData(
  id: json['_id'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String,
  deliveryCode: json['deliveryCode'] as String,
  status: json['status'] as String,
  isActive: json['isActive'] as bool,
  role: json['role'] as String,
  isDeleted: json['isDeleted'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  lastLogin: json['lastLogin'] == null
      ? null
      : DateTime.parse(json['lastLogin'] as String),
);

Map<String, dynamic> _$DeliveryBoyProfileDataToJson(
  DeliveryBoyProfileData instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'phone': instance.phone,
  'deliveryCode': instance.deliveryCode,
  'status': instance.status,
  'isActive': instance.isActive,
  'role': instance.role,
  'isDeleted': instance.isDeleted,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'lastLogin': instance.lastLogin?.toIso8601String(),
};
