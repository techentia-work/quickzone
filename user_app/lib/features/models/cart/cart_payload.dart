// features/models/cart/cart_payload.dart
import 'package:json_annotation/json_annotation.dart';

part 'cart_payload.g.dart';

@JsonSerializable()
class AddToCartPayload {
  final String productId;
  final String variantId;
  final int? quantity;

  AddToCartPayload({required this.productId, required this.variantId, this.quantity});

  factory AddToCartPayload.fromJson(Map<String, dynamic> json) => _$AddToCartPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$AddToCartPayloadToJson(this);
}

@JsonSerializable()
class UpdateCartQuantityPayload {
  final String productId;
  final String variantId;
  final int quantity;

  UpdateCartQuantityPayload({required this.productId, required this.variantId, required this.quantity});

  factory UpdateCartQuantityPayload.fromJson(Map<String, dynamic> json) => _$UpdateCartQuantityPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateCartQuantityPayloadToJson(this);
}

@JsonSerializable()
class RemoveCartItemPayload {
  final String variantId;

  RemoveCartItemPayload({required this.variantId});

  factory RemoveCartItemPayload.fromJson(Map<String, dynamic> json) => _$RemoveCartItemPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$RemoveCartItemPayloadToJson(this);
}

@JsonSerializable()
class ClearCartPayload {
  final String userId;

  ClearCartPayload({required this.userId});

  factory ClearCartPayload.fromJson(Map<String, dynamic> json) => _$ClearCartPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$ClearCartPayloadToJson(this);
}
