import 'package:json_annotation/json_annotation.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

part 'address_model.g.dart';

@JsonSerializable(
  explicitToJson: true,
  includeIfNull: false, // 🔥 IMPORTANT
)
class AddressType {
  @JsonKey(name: '_id')
  final String? id;

  final String userId;
  final String label;
  final AddressLabelType type;

  @JsonKey(includeIfNull: false)
  final String? customLabel;

  final String fullName;
  final String phone;

  @JsonKey(includeIfNull: false)
  final String? alternatePhone;

  final String addressLine1;

  @JsonKey(includeIfNull: false)
  final String? addressLine2;

  @JsonKey(includeIfNull: false)
  final String? googleLocation;

  @JsonKey(includeIfNull: false)
  final String? landmark;

  final String city;
  final String state;
  final String pincode;
  final String country;

  @JsonKey(includeIfNull: false)
  final String? formattedAddress;

  @JsonKey(includeIfNull: false)
  final GeoLocation? location;

  @JsonKey(includeIfNull: false)
  final int? placeId;

  @JsonKey(includeIfNull: false)
  final String? osmType;

  @JsonKey(includeIfNull: false)
  final String? addressType;

  final bool isDefault;
  final bool isActive;

  @JsonKey(includeIfNull: false)
  final DateTime? createdAt;

  @JsonKey(includeIfNull: false)
  final DateTime? updatedAt;

  AddressType({
    this.id,
    required this.userId,
    required this.label,
    required this.type,
    this.customLabel,
    required this.fullName,
    required this.phone,
    this.alternatePhone,
    required this.addressLine1,
    this.addressLine2,
    this.googleLocation,
    this.landmark,
    required this.city,
    required this.state,
    required this.pincode,
    required this.country,
    this.formattedAddress,
    this.location,
    this.placeId,
    this.osmType,
    this.addressType,
    this.isDefault = false,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  factory AddressType.fromJson(Map<String, dynamic> json) =>
      _$AddressTypeFromJson(json);

  Map<String, dynamic> toJson() => _$AddressTypeToJson(this);
}

@JsonSerializable(includeIfNull: false)
class GeoLocation {
  final String type;
  final List<double> coordinates;

  GeoLocation({
    required this.type,
    required this.coordinates,
  });

  factory GeoLocation.fromJson(Map<String, dynamic> json) =>
      _$GeoLocationFromJson(json);

  Map<String, dynamic> toJson() => _$GeoLocationToJson(this);
}
