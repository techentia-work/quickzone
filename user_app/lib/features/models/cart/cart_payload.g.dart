// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddToCartPayload _$AddToCartPayloadFromJson(Map<String, dynamic> json) =>
    AddToCartPayload(
      productId: json['productId'] as String,
      variantId: json['variantId'] as String,
      quantity: (json['quantity'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AddToCartPayloadToJson(AddToCartPayload instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'variantId': instance.variantId,
      'quantity': instance.quantity,
    };

UpdateCartQuantityPayload _$UpdateCartQuantityPayloadFromJson(
  Map<String, dynamic> json,
) => UpdateCartQuantityPayload(
  productId: json['productId'] as String,
  variantId: json['variantId'] as String,
  quantity: (json['quantity'] as num).toInt(),
);

Map<String, dynamic> _$UpdateCartQuantityPayloadToJson(
  UpdateCartQuantityPayload instance,
) => <String, dynamic>{
  'productId': instance.productId,
  'variantId': instance.variantId,
  'quantity': instance.quantity,
};

RemoveCartItemPayload _$RemoveCartItemPayloadFromJson(
  Map<String, dynamic> json,
) => RemoveCartItemPayload(variantId: json['variantId'] as String);

Map<String, dynamic> _$RemoveCartItemPayloadToJson(
  RemoveCartItemPayload instance,
) => <String, dynamic>{'variantId': instance.variantId};

ClearCartPayload _$ClearCartPayloadFromJson(Map<String, dynamic> json) =>
    ClearCartPayload(userId: json['userId'] as String);

Map<String, dynamic> _$ClearCartPayloadToJson(ClearCartPayload instance) =>
    <String, dynamic>{'userId': instance.userId};
