import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:json_annotation/json_annotation.dart';
part 'category_base_model.g.dart';

@JsonSerializable(explicitToJson: true)
class CategoryBase {
  final String name;
  final String slug;
  final String? subtitle;
  final String? thumbnail;
  final String? banner;
  final String? metaTitle;
  final String? metaKeywords;
  final String? metaDescription;
  final String? markup;
  final TypeOfCategory type;
  final CategoryBasic? parent;           // ID reference
  final List<CategoryBasic>? ancestors;  // list of ancestor IDs
  final List<String>? path;
  final String? fullSlug;
  final int? level;
  final int order;
  final bool isActive;
  final bool isDeleted;
  final String? deletedAt;

  CategoryBase({
    required this.name,
    required this.slug,
    this.subtitle,
    this.thumbnail,
    this.banner,
    this.metaTitle,
    this.metaKeywords,
    this.metaDescription,
    this.markup,
    required this.type,
    this.parent,
    this.ancestors,
    this.path,
    this.fullSlug,
    this.level,
    required this.order,
    required this.isActive,
    required this.isDeleted,
    this.deletedAt,
  });

  factory CategoryBase.fromJson(Map<String, dynamic> json) =>
      _$CategoryBaseFromJson(json);

  Map<String, dynamic> toJson() => _$CategoryBaseToJson(this);
}
