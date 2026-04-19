import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:json_annotation/json_annotation.dart';

part 'category_model.g.dart';

@JsonSerializable(explicitToJson: true)
class CategoryType extends CategoryBase {
  @JsonKey(name: '_id')
  final String id;
  final List<CategoryType>? children;
  final DateTime createdAt;
  final DateTime updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  CategoryType({
    required this.id,
    this.children,
    required this.createdAt,
    required this.updatedAt,
    this.v,
    required super.name,
    required super.slug,
    super.subtitle,
    super.thumbnail,
    super.banner,
    super.metaTitle,
    super.metaKeywords,
    super.metaDescription,
    super.markup,
    required super.type,
    super.ancestors,
    super.path,
    super.fullSlug,
    super.level,
    required super.order,
    required super.isActive,
    required super.isDeleted,
    super.deletedAt,
  });

  factory CategoryType.fromJson(Map<String, dynamic> json) =>
      _$CategoryTypeFromJson(json);

  Map<String, dynamic> toJson() => _$CategoryTypeToJson(this);
}
