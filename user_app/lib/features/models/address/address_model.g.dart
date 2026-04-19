// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddressType _$AddressTypeFromJson(Map<String, dynamic> json) => AddressType(
  id: json['_id'] as String?,
  userId: json['userId'] as String,
  label: json['label'] as String,
  type: $enumDecode(_$AddressLabelTypeEnumMap, json['type']),
  customLabel: json['customLabel'] as String?,
  fullName: json['fullName'] as String,
  phone: json['phone'] as String,
  alternatePhone: json['alternatePhone'] as String?,
  addressLine1: json['addressLine1'] as String,
  addressLine2: json['addressLine2'] as String?,
  googleLocation: json['googleLocation'] as String?,
  landmark: json['landmark'] as String?,
  city: json['city'] as String,
  state: json['state'] as String,
  pincode: json['pincode'] as String,
  country: json['country'] as String,
  formattedAddress: json['formattedAddress'] as String?,
  location: json['location'] == null
      ? null
      : GeoLocation.fromJson(json['location'] as Map<String, dynamic>),
  placeId: (json['placeId'] as num?)?.toInt(),
  osmType: json['osmType'] as String?,
  addressType: json['addressType'] as String?,
  isDefault: json['isDefault'] as bool? ?? false,
  isActive: json['isActive'] as bool? ?? true,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$AddressTypeToJson(AddressType instance) =>
    <String, dynamic>{
      '_id': ?instance.id,
      'userId': instance.userId,
      'label': instance.label,
      'type': _$AddressLabelTypeEnumMap[instance.type]!,
      'customLabel': ?instance.customLabel,
      'fullName': instance.fullName,
      'phone': instance.phone,
      'alternatePhone': ?instance.alternatePhone,
      'addressLine1': instance.addressLine1,
      'addressLine2': ?instance.addressLine2,
      'googleLocation': ?instance.googleLocation,
      'landmark': ?instance.landmark,
      'city': instance.city,
      'state': instance.state,
      'pincode': instance.pincode,
      'country': instance.country,
      'formattedAddress': ?instance.formattedAddress,
      'location': ?instance.location?.toJson(),
      'placeId': ?instance.placeId,
      'osmType': ?instance.osmType,
      'addressType': ?instance.addressType,
      'isDefault': instance.isDefault,
      'isActive': instance.isActive,
      'createdAt': ?instance.createdAt?.toIso8601String(),
      'updatedAt': ?instance.updatedAt?.toIso8601String(),
    };

const _$AddressLabelTypeEnumMap = {
  AddressLabelType.HOME: 'HOME',
  AddressLabelType.WORK: 'WORK',
  AddressLabelType.CUSTOM: 'CUSTOM',
};

GeoLocation _$GeoLocationFromJson(Map<String, dynamic> json) => GeoLocation(
  type: json['type'] as String,
  coordinates: (json['coordinates'] as List<dynamic>)
      .map((e) => (e as num).toDouble())
      .toList(),
);

Map<String, dynamic> _$GeoLocationToJson(GeoLocation instance) =>
    <String, dynamic>{
      'type': instance.type,
      'coordinates': instance.coordinates,
    };
