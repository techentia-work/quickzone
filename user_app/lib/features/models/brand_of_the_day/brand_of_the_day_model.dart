import 'package:json_annotation/json_annotation.dart';
import '../category/category_basic_model.dart';

part 'brand_of_the_day_model.g.dart';

@JsonSerializable(explicitToJson: true)
class BrandOfTheDayType {
  @JsonKey(name: '_id')
  final String id;

  /// internal / short name
  final String name;

  /// display title
  final String title;

  /// external website / brand page
  final String websiteUrl;

  /// large banner image
  final String? banner;

  /// small card thumbnail
  final String? thumbnail;

  /// ============================
  /// MASTER CATEGORY
  /// ============================
  @JsonKey(fromJson: _categoryFromJson)
  final CategoryBasic? masterCategory;

  final bool isActive;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  BrandOfTheDayType({
    required this.id,
    required this.name,
    required this.title,
    required this.websiteUrl,
    this.banner,
    this.thumbnail,
    this.masterCategory,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  /// =====================================================
  /// SAFE PARSER: null | {} | [] | [{}]
  /// =====================================================
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

  factory BrandOfTheDayType.fromJson(Map<String, dynamic> json) =>
      _$BrandOfTheDayTypeFromJson(json);

  Map<String, dynamic> toJson() =>
      _$BrandOfTheDayTypeToJson(this);
}
