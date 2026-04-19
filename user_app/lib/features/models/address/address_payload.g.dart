// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateAddressPayload _$CreateAddressPayloadFromJson(
  Map<String, dynamic> json,
) => CreateAddressPayload(
  label: json['label'] as String,
  type: json['type'] as String,
  customLabel: json['customLabel'] as String?,
  fullName: json['fullName'] as String,
  phone: json['phone'] as String,
  alternatePhone: json['alternatePhone'] as String?,
  addressLine1: json['addressLine1'] as String,
  addressLine2: json['addressLine2'] as String?,
  landmark: json['landmark'] as String?,
  city: json['city'] as String,
  state: json['state'] as String,
  pincode: json['pincode'] as String,
  country: json['country'] as String?,
  isDefault: json['isDefault'] as bool?,
);

Map<String, dynamic> _$CreateAddressPayloadToJson(
  CreateAddressPayload instance,
) => <String, dynamic>{
  'label': instance.label,
  'type': instance.type,
  'customLabel': instance.customLabel,
  'fullName': instance.fullName,
  'phone': instance.phone,
  'alternatePhone': instance.alternatePhone,
  'addressLine1': instance.addressLine1,
  'addressLine2': instance.addressLine2,
  'landmark': instance.landmark,
  'city': instance.city,
  'state': instance.state,
  'pincode': instance.pincode,
  'country': instance.country,
  'isDefault': instance.isDefault,
};

UpdateAddressPayload _$UpdateAddressPayloadFromJson(
  Map<String, dynamic> json,
) => UpdateAddressPayload(
  label: json['label'] as String?,
  type: json['type'] as String?,
  customLabel: json['customLabel'] as String?,
  fullName: json['fullName'] as String?,
  phone: json['phone'] as String?,
  alternatePhone: json['alternatePhone'] as String?,
  addressLine1: json['addressLine1'] as String?,
  addressLine2: json['addressLine2'] as String?,
  landmark: json['landmark'] as String?,
  city: json['city'] as String?,
  state: json['state'] as String?,
  pincode: json['pincode'] as String?,
  country: json['country'] as String?,
  isDefault: json['isDefault'] as bool?,
);

Map<String, dynamic> _$UpdateAddressPayloadToJson(
  UpdateAddressPayload instance,
) => <String, dynamic>{
  'label': instance.label,
  'type': instance.type,
  'customLabel': instance.customLabel,
  'fullName': instance.fullName,
  'phone': instance.phone,
  'alternatePhone': instance.alternatePhone,
  'addressLine1': instance.addressLine1,
  'addressLine2': instance.addressLine2,
  'landmark': instance.landmark,
  'city': instance.city,
  'state': instance.state,
  'pincode': instance.pincode,
  'country': instance.country,
  'isDefault': instance.isDefault,
};

SetDefaultAddressPayload _$SetDefaultAddressPayloadFromJson(
  Map<String, dynamic> json,
) => SetDefaultAddressPayload(addressId: json['addressId'] as String);

Map<String, dynamic> _$SetDefaultAddressPayloadToJson(
  SetDefaultAddressPayload instance,
) => <String, dynamic>{'addressId': instance.addressId};

DeleteAddressPayload _$DeleteAddressPayloadFromJson(
  Map<String, dynamic> json,
) => DeleteAddressPayload(
  addressId: json['addressId'] as String,
  permanent: json['permanent'] as bool? ?? false,
);

Map<String, dynamic> _$DeleteAddressPayloadToJson(
  DeleteAddressPayload instance,
) => <String, dynamic>{
  'addressId': instance.addressId,
  'permanent': instance.permanent,
};

RestoreAddressPayload _$RestoreAddressPayloadFromJson(
  Map<String, dynamic> json,
) => RestoreAddressPayload(addressId: json['addressId'] as String);

Map<String, dynamic> _$RestoreAddressPayloadToJson(
  RestoreAddressPayload instance,
) => <String, dynamic>{'addressId': instance.addressId};
