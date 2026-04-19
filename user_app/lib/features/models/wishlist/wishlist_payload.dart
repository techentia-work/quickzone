// features/models/wishlist/wishlist_payload.dart
import 'package:json_annotation/json_annotation.dart';

part 'wishlist_payload.g.dart';

@JsonSerializable()
class AddToWishlistPayload {
  final String productId;
  final String variantId;

  AddToWishlistPayload({required this.productId, required this.variantId});

  factory AddToWishlistPayload.fromJson(Map<String, dynamic> json) => _$AddToWishlistPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$AddToWishlistPayloadToJson(this);
}

@JsonSerializable()
class RemoveWishlistItemPayload {
  final String variantId;

  RemoveWishlistItemPayload({required this.variantId});

  factory RemoveWishlistItemPayload.fromJson(Map<String, dynamic> json) => _$RemoveWishlistItemPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$RemoveWishlistItemPayloadToJson(this);
}