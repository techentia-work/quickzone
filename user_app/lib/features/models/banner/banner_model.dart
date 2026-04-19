import 'package:json_annotation/json_annotation.dart';
import '../category/category_basic_model.dart';

part 'banner_model.g.dart';

@JsonSerializable(explicitToJson: true)
class BannerType {
  @JsonKey(name: '_id')
  final String id;

  final String title;
  final String? slug;
  final String? description;
  final String imageUrl;
  final int? order;
  final bool? isActive;
  final bool? isClickable;

  /// ============================
  /// MASTER CATEGORY (NEW)
  /// ============================
  @JsonKey(fromJson: _categoryFromJson)
  final CategoryBasic? masterCategory;

  /// ============================
  /// CATEGORY (AS-IS)
  /// ============================
  @JsonKey(fromJson: _categoryFromJson)
  final CategoryBasic? category;

  /// ============================
  /// SUBCATEGORY (AS-IS)
  /// ============================
  @JsonKey(defaultValue: [])
  final List<CategoryBasic> subcategory;

  final bool? isDeleted;
  final List<dynamic>? mappings;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  BannerType({
    required this.id,
    required this.title,
    this.slug,
    this.description,
    required this.imageUrl,
    this.order,
    this.isActive,
    this.isClickable,
    this.masterCategory,
    this.category,
    this.subcategory = const [],
    this.isDeleted,
    this.mappings,
    this.createdAt,
    this.updatedAt,
    this.v,
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

  factory BannerType.fromJson(Map<String, dynamic> json) =>
      _$BannerTypeFromJson(json);

  Map<String, dynamic> toJson() => _$BannerTypeToJson(this);
}
