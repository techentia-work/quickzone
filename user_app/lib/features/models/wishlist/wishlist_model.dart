// features/models/wishlist/wishlist_model.dart
import 'package:Quickzon/features/models/product/product_variant_model.dart';
import 'package:json_annotation/json_annotation.dart';

part 'wishlist_model.g.dart';

@JsonSerializable(explicitToJson: true)
class WishlistItemType {
  final ProductRef productId;
  final String variantId;
  final String? title;

  WishlistItemType({
    required this.productId,
    required this.variantId,
    this.title,
  });

  factory WishlistItemType.fromJson(Map<String, dynamic> json) => _$WishlistItemTypeFromJson(json);
  Map<String, dynamic> toJson() => _$WishlistItemTypeToJson(this);
}

@JsonSerializable()
class ProductRef {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;
  final String mainImage;
  final List<ProductVariantType>? variants;

  ProductRef({
    required this.id,
    required this.name,
    required this.slug,
    required this.mainImage,
    this.variants,
  });

  factory ProductRef.fromJson(Map<String, dynamic> json) => _$ProductRefFromJson(json);
  Map<String, dynamic> toJson() => _$ProductRefToJson(this);
}

@JsonSerializable(explicitToJson: true)
class WishlistType {
  @JsonKey(name: '_id')
  final String? id;
  final String userId;
  final List<WishlistItemType> items;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  WishlistType({
    this.id,
    required this.userId,
    required this.items,
    this.createdAt,
    this.updatedAt,
  });

  factory WishlistType.fromJson(Map<String, dynamic> json) => _$WishlistTypeFromJson(json);
  Map<String, dynamic> toJson() => _$WishlistTypeToJson(this);
}
