import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable(explicitToJson: true)
class ProductType {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;
  final String? sellerId;
  final String? brand;

  // categoryId is an object in the response
  final CategoryBasic categoryId;

  // categoryPath is array of CategoryBasic objects
  @JsonKey(name: 'categoryPath', defaultValue: [])
  final List<CategoryBasic> categoryHierarchy;

  @JsonKey(defaultValue: [])
  final List<String> tags;

  @JsonKey(defaultValue: [])
  final List<String> images;

  final String? mainImage;
  final String? description;
  final String? shortDescription;
  final String? metaTitle;
  final String? metaDescription;
  final String? metaKeywords;
  final ProductEatableType productType;
  final String? manufacturer;
  final String? madeIn;
  final String? fssaiNumber;
  final String? barcode;
  final int maxQtyPerUser;
  final bool isReturnable;
  final bool isCOD;
  final bool isCancelable;
  final ProductStatus status;

  // variants maps to variants
  @JsonKey(name: 'variants', defaultValue: [])
  final List<ProductVariantType> variants;

  @JsonKey(name: 'ratings', fromJson: _ratingsAvgFromJson)
  final double ratingsAvg;

  @JsonKey(defaultValue: 0)
  final int popularity;

  @JsonKey(defaultValue: [])
  final List<String> searchKeywords;

  final TaxRateType? taxRate;
  final bool isApproved;
  final bool isActive;
  final bool isDeleted;
  final String? deletedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  // Computed property for backward compatibility
  CategoryBasic get category => categoryId;

  ProductType({
    required this.id,
    required this.name,
    required this.slug,
    this.sellerId,
    this.brand,
    required this.categoryId,
    required this.categoryHierarchy,
    required this.tags,
    required this.images,
    this.mainImage,
    this.description,
    this.shortDescription,
    this.metaTitle,
    this.metaDescription,
    this.metaKeywords,
    required this.productType,
    this.manufacturer,
    this.madeIn,
    this.fssaiNumber,
    this.barcode,
    required this.maxQtyPerUser,
    required this.isReturnable,
    required this.isCOD,
    required this.isCancelable,
    required this.status,
    required this.variants,
    required this.ratingsAvg,
    required this.popularity,
    required this.searchKeywords,
    this.taxRate,
    required this.isApproved,
    required this.isActive,
    required this.isDeleted,
    this.deletedAt,
    required this.createdAt,
    required this.updatedAt,
    this.v,
  });

  // Helper to parse ratings.avg with null safety
  static double _ratingsAvgFromJson(dynamic json) {
    if (json == null) return 0.0;
    if (json is Map<String, dynamic>) {
      final avg = json['avg'];
      if (avg == null) return 0.0;
      if (avg is num) return avg.toDouble();
    }
    return 0.0;
  }

  // Helper to parse ratings.count with null safety
  static int _ratingsCountFromJson(dynamic json) {
    if (json == null) return 0;
    if (json is Map<String, dynamic>) {
      final count = json['count'];
      if (count == null) return 0;
      if (count is num) return count.toInt();
    }
    return 0;
  }

  factory ProductType.fromJson(Map<String, dynamic> json) =>
      _$ProductTypeFromJson(json);

  Map<String, dynamic> toJson() => _$ProductTypeToJson(this);
}