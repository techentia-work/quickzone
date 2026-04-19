import 'package:json_annotation/json_annotation.dart';

part 'delivery_boy_model.g.dart';

@JsonSerializable()
class DeliveryBoyProfileData {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String email;
  final String phone;
  final String deliveryCode;
  final String status;
  final bool isActive;
  final String role;
  final bool isDeleted;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastLogin;

  DeliveryBoyProfileData({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.deliveryCode,
    required this.status,
    required this.isActive,
    required this.role,
    required this.isDeleted,
    required this.createdAt,
    required this.updatedAt,
    this.lastLogin,
  });

  factory DeliveryBoyProfileData.fromJson(Map<String, dynamic> json) =>
      _$DeliveryBoyProfileDataFromJson(json);
  Map<String, dynamic> toJson() => _$DeliveryBoyProfileDataToJson(this);
}