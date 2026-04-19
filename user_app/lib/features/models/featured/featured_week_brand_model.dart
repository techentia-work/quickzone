import 'package:json_annotation/json_annotation.dart';

part 'featured_week_brand_model.g.dart';

@JsonSerializable()
class FeaturedWeekBrand {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;
  final String? banner;
  final String? thumbnail;

  final MasterCategory? masterCategory;
  final bool isActive;

  // 🔥 IMPORTANT (for sorting latest first)
  final DateTime createdAt;
  final DateTime updatedAt;

  FeaturedWeekBrand({
    required this.id,
    required this.name,
    required this.slug,
    this.banner,
    this.thumbnail,
    this.masterCategory,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeaturedWeekBrand.fromJson(Map<String, dynamic> json) =>
      _$FeaturedWeekBrandFromJson(json);

  Map<String, dynamic> toJson() => _$FeaturedWeekBrandToJson(this);
}

@JsonSerializable()
class MasterCategory {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;

  MasterCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory MasterCategory.fromJson(Map<String, dynamic> json) =>
      _$MasterCategoryFromJson(json);

  Map<String, dynamic> toJson() => _$MasterCategoryToJson(this);
}
