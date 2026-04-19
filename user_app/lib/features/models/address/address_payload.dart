import 'package:json_annotation/json_annotation.dart';

part 'address_payload.g.dart';

@JsonSerializable()
class CreateAddressPayload {
  final String label;
  final String type;
  final String? customLabel;
  final String fullName;
  final String phone;
  final String? alternatePhone;
  final String addressLine1;
  final String? addressLine2;
  final String? landmark;
  final String city;
  final String state;
  final String pincode;
  final String? country;
  final bool? isDefault;

  CreateAddressPayload({
    required this.label,
    required this.type,
    this.customLabel,
    required this.fullName,
    required this.phone,
    this.alternatePhone,
    required this.addressLine1,
    this.addressLine2,
    this.landmark,
    required this.city,
    required this.state,
    required this.pincode,
    this.country,
    this.isDefault,
  });

  factory CreateAddressPayload.fromJson(Map<String, dynamic> json) =>
      _$CreateAddressPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$CreateAddressPayloadToJson(this);
}

@JsonSerializable()
class UpdateAddressPayload {
  final String? label;
  final String? type;
  final String? customLabel;
  final String? fullName;
  final String? phone;
  final String? alternatePhone;
  final String? addressLine1;
  final String? addressLine2;
  final String? landmark;
  final String? city;
  final String? state;
  final String? pincode;
  final String? country;
  final bool? isDefault;

  UpdateAddressPayload({
    this.label,
    this.type,
    this.customLabel,
    this.fullName,
    this.phone,
    this.alternatePhone,
    this.addressLine1,
    this.addressLine2,
    this.landmark,
    this.city,
    this.state,
    this.pincode,
    this.country,
    this.isDefault,
  });

  factory UpdateAddressPayload.fromJson(Map<String, dynamic> json) =>
      _$UpdateAddressPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateAddressPayloadToJson(this);
}

@JsonSerializable()
class SetDefaultAddressPayload {
  final String addressId;

  SetDefaultAddressPayload({required this.addressId});

  factory SetDefaultAddressPayload.fromJson(Map<String, dynamic> json) =>
      _$SetDefaultAddressPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$SetDefaultAddressPayloadToJson(this);
}

@JsonSerializable()
class DeleteAddressPayload {
  final String addressId;
  final bool permanent;

  DeleteAddressPayload({required this.addressId, this.permanent = false});

  factory DeleteAddressPayload.fromJson(Map<String, dynamic> json) =>
      _$DeleteAddressPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$DeleteAddressPayloadToJson(this);
}

@JsonSerializable()
class RestoreAddressPayload {
  final String addressId;

  RestoreAddressPayload({required this.addressId});

  factory RestoreAddressPayload.fromJson(Map<String, dynamic> json) =>
      _$RestoreAddressPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$RestoreAddressPayloadToJson(this);
}
