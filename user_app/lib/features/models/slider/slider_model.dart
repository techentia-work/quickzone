import 'package:json_annotation/json_annotation.dart';
import '../category/category_basic_model.dart';

part 'slider_model.g.dart';

@JsonSerializable(explicitToJson: true)
class SliderType {
  @JsonKey(name: '_id')
  final String id;

  final String title;
  final String? slug;
  final String imageUrl;

  final int? order;
  final bool? isActive;
  final bool? isClickable;

  /// 🔥 MASTER CATEGORY (NEW)
  final CategoryBasic? masterCategory;

  /// 🔥 BACKEND SE LIST AATI HAI
  @JsonKey(defaultValue: [])
  final List<CategoryBasic> category;

  @JsonKey(defaultValue: [])
  final List<CategoryBasic> subcategory;

  final bool? isDeleted;
  final List<dynamic>? mappings;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  SliderType({
    required this.id,
    required this.title,
    this.slug,
    required this.imageUrl,
    this.order,
    this.isActive,
    this.isClickable,
    this.masterCategory, // ✅ ADD
    this.category = const [],
    this.subcategory = const [],
    this.isDeleted,
    this.mappings,
    this.createdAt,
    this.updatedAt,
    this.v,
  });

  factory SliderType.fromJson(Map<String, dynamic> json) =>
      _$SliderTypeFromJson(json);

  Map<String, dynamic> toJson() => _$SliderTypeToJson(this);
}
