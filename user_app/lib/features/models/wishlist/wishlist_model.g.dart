// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wishlist_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WishlistItemType _$WishlistItemTypeFromJson(Map<String, dynamic> json) =>
    WishlistItemType(
      productId: ProductRef.fromJson(json['productId'] as Map<String, dynamic>),
      variantId: json['variantId'] as String,
      title: json['title'] as String?,
    );

Map<String, dynamic> _$WishlistItemTypeToJson(WishlistItemType instance) =>
    <String, dynamic>{
      'productId': instance.productId.toJson(),
      'variantId': instance.variantId,
      'title': instance.title,
    };

ProductRef _$ProductRefFromJson(Map<String, dynamic> json) => ProductRef(
  id: json['_id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  mainImage: json['mainImage'] as String,
  variants: (json['variants'] as List<dynamic>?)
      ?.map((e) => ProductVariantType.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$ProductRefToJson(ProductRef instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'mainImage': instance.mainImage,
      'variants': instance.variants,
    };

WishlistType _$WishlistTypeFromJson(Map<String, dynamic> json) => WishlistType(
  id: json['_id'] as String?,
  userId: json['userId'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => WishlistItemType.fromJson(e as Map<String, dynamic>))
      .toList(),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$WishlistTypeToJson(WishlistType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'items': instance.items.map((e) => e.toJson()).toList(),
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
