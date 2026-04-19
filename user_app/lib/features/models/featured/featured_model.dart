import 'package:json_annotation/json_annotation.dart';
import '../category/category_basic_model.dart';
import '../product/product_variant_model.dart';

part 'featured_model.g.dart';

/// =======================================================
/// FEATURED PRODUCT DATA
/// =======================================================
@JsonSerializable(explicitToJson: true)
class FeaturedProductData {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;
  final String? thumbnail;
  final List<ProductVariantType>? variants;

  FeaturedProductData({
    required this.id,
    required this.name,
    required this.slug,
    this.thumbnail,
    this.variants,
  });

  factory FeaturedProductData.fromJson(Map<String, dynamic> json) =>
      _$FeaturedProductDataFromJson(json);

  Map<String, dynamic> toJson() => _$FeaturedProductDataToJson(this);
}

/// =======================================================
/// FEATURED MAPPING
/// =======================================================
@JsonSerializable(explicitToJson: true)
class FeaturedMapping {
  /// PRODUCT | SUBCATEGORY | CATEGORY
  final String type;

  final String refId;
  final String? externalUrl;

  /// backend kabhi object, kabhi list bhejta hai
  @JsonKey(name: 'data', fromJson: _productFromJson)
  final FeaturedProductData? productData;

  FeaturedMapping({
    required this.type,
    required this.refId,
    this.externalUrl,
    this.productData,
  });

  static FeaturedProductData? _productFromJson(dynamic json) {
    if (json == null) return null;

    if (json is Map<String, dynamic>) {
      return FeaturedProductData.fromJson(json);
    }

    if (json is List && json.isNotEmpty) {
      return FeaturedProductData.fromJson(
        Map<String, dynamic>.from(json.first),
      );
    }

    return null;
  }

  factory FeaturedMapping.fromJson(Map<String, dynamic> json) =>
      _$FeaturedMappingFromJson(json);

  Map<String, dynamic> toJson() => _$FeaturedMappingToJson(this);
}

/// =======================================================
/// FEATURED SECTION TYPE
/// =======================================================
@JsonSerializable(explicitToJson: true)
class FeaturedType {
  @JsonKey(name: '_id')
  final String id;

  final String title;
  final String? slug;
  final String? description;
  final String? imageUrl;
  final String? imageUrl1;
  /// 🔥 COLOR FIELD (HEX STRING like #FFFFFF)
  final String? color;

  final String? position;
  final int? order;
  final String? appLayout;
  final int? gridCount;

  final String? metaTitle;
  final String? metaDescription;

  final bool? isActive;
  final bool? isClickable;

  final List<FeaturedMapping>? mappings;

  /// 🔥 MASTER CATEGORY (MOST IMPORTANT – REQUIRED FOR MATCHING)
  @JsonKey(fromJson: _categoryFromJson)
  final CategoryBasic? masterCategory;

  /// 🔥 SINGLE CATEGORY (safe)
  @JsonKey(fromJson: _categoryFromJson)
  final CategoryBasic? category;

  /// 🔥 MULTIPLE SUBCATEGORIES (safe)
  @JsonKey(fromJson: _subcategoryFromJson, defaultValue: [])
  final List<CategoryBasic> subcategory;

  final bool? isDeleted;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  FeaturedType({
    required this.id,
    required this.title,
    this.slug,
    this.description,
    this.imageUrl,
    this.imageUrl1,
    this.color,
    this.position,
    this.order,
    this.appLayout,
    this.gridCount,
    this.metaTitle,
    this.metaDescription,
    this.isActive,
    this.isClickable,
    this.mappings,

    this.masterCategory, // ✅ ADDED & FIXED

    this.category,
    this.subcategory = const [],
    this.isDeleted,
    this.createdAt,
    this.updatedAt,
    this.v,
  });

  /// -------------------------------------------------------
  /// JSON HELPERS
  /// -------------------------------------------------------
  static CategoryBasic? _categoryFromJson(dynamic json) {
    if (json == null) return null;

    if (json is Map<String, dynamic>) {
      return CategoryBasic.fromJson(json);
    }

    if (json is List && json.isNotEmpty) {
      return CategoryBasic.fromJson(
        Map<String, dynamic>.from(json.first),
      );
    }

    return null;
  }

  static List<CategoryBasic> _subcategoryFromJson(dynamic json) {
    if (json == null) return [];

    if (json is List) {
      return json
          .whereType<Map<String, dynamic>>()
          .map(CategoryBasic.fromJson)
          .toList();
    }

    if (json is Map<String, dynamic>) {
      return [CategoryBasic.fromJson(json)];
    }

    return [];
  }

  factory FeaturedType.fromJson(Map<String, dynamic> json) =>
      _$FeaturedTypeFromJson(json);

  Map<String, dynamic> toJson() => _$FeaturedTypeToJson(this);

  /// -------------------------------------------------------
  /// UI SAFE HELPERS
  /// -------------------------------------------------------
  bool get hasMappings => mappings != null && mappings!.isNotEmpty;

  bool get isProductSection =>
      mappings?.any((m) => m.type == 'PRODUCT') == true;

  bool get isSubcategorySection =>
      mappings?.any((m) => m.type == 'SUBCATEGORY') == true;

  bool get hasAppImage => imageUrl1 != null && imageUrl1!.isNotEmpty;
}
