import 'package:json_annotation/json_annotation.dart';

import '../product/product_variant_model.dart'; // 🔥 IMPORTANT

part 'showcase_product_model.g.dart';

/// ===============================
/// SHOWCASE PRODUCT
/// ===============================
@JsonSerializable(explicitToJson: true)
class ShowcaseProductType {
  @JsonKey(name: '_id')
  final String id;

  /// FIXED + DYNAMIC (Trending Near, Sports Store, NEW_IN_STORE, etc.)
  final String showcaseType;

  /// ✅ MULTIPLE PRODUCTS (POPULATED)
  @JsonKey(defaultValue: [])
  final List<ShowcaseProductItem> products;

  /// ✅ MASTER CATEGORY
  final ShowcaseCategory masterCategory;

  /// ✅ SUB CATEGORIES
  @JsonKey(defaultValue: [])
  final List<ShowcaseCategory> subCategories;

  final int? displayOrder;

  final bool isActive;
  final bool isDeleted;

  final DateTime createdAt;
  final DateTime updatedAt;

  ShowcaseProductType({
    required this.id,
    required this.showcaseType,
    required this.products,
    required this.masterCategory,
    required this.subCategories,
    this.displayOrder,
    required this.isActive,
    required this.isDeleted,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ShowcaseProductType.fromJson(Map<String, dynamic> json) =>
      _$ShowcaseProductTypeFromJson(json);

  Map<String, dynamic> toJson() =>
      _$ShowcaseProductTypeToJson(this);
}

/// ===============================
/// PRODUCT (POPULATED)
//  🔥 SAME SHAPE AS NORMAL PRODUCT (FOR ProductCard)
/// ===============================
@JsonSerializable(explicitToJson: true)
class ShowcaseProductItem {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;
  final String? mainImage;

  /// 🔥 REQUIRED FOR ProductCard
  @JsonKey(defaultValue: [])
  final List<ProductVariantType> variants;

  ShowcaseProductItem({
    required this.id,
    required this.name,
    required this.slug,
    this.mainImage,
    this.variants = const [],
  });

  factory ShowcaseProductItem.fromJson(Map<String, dynamic> json) =>
      _$ShowcaseProductItemFromJson(json);

  Map<String, dynamic> toJson() =>
      _$ShowcaseProductItemToJson(this);
}

/// ===============================
/// CATEGORY (MASTER / SUB)
/// ===============================
@JsonSerializable()
class ShowcaseCategory {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;

  ShowcaseCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory ShowcaseCategory.fromJson(Map<String, dynamic> json) =>
      _$ShowcaseCategoryFromJson(json);

  Map<String, dynamic> toJson() =>
      _$ShowcaseCategoryToJson(this);
}

enum ShowcaseType {
  newInStore,
  bestDeals,
  premium,
  hotDeals,
  trendingNearYou,
  priceDrop,
  topPicks,
  quickEssentials,
  bestSellers,
  newArrivals,
  mostOrdered,
  trendingYourCity,
}