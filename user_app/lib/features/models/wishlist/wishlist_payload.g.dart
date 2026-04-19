// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wishlist_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddToWishlistPayload _$AddToWishlistPayloadFromJson(
  Map<String, dynamic> json,
) => AddToWishlistPayload(
  productId: json['productId'] as String,
  variantId: json['variantId'] as String,
);

Map<String, dynamic> _$AddToWishlistPayloadToJson(
  AddToWishlistPayload instance,
) => <String, dynamic>{
  'productId': instance.productId,
  'variantId': instance.variantId,
};

RemoveWishlistItemPayload _$RemoveWishlistItemPayloadFromJson(
  Map<String, dynamic> json,
) => RemoveWishlistItemPayload(variantId: json['variantId'] as String);

Map<String, dynamic> _$RemoveWishlistItemPayloadToJson(
  RemoveWishlistItemPayload instance,
) => <String, dynamic>{'variantId': instance.variantId};
