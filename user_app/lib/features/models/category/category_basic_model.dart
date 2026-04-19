import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:json_annotation/json_annotation.dart';
part 'category_basic_model.g.dart';

@JsonSerializable()
class CategoryBasic {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String? slug;

  // 🔥 NULLABLE BANAYA + FALLBACK ADD KIYA
  @JsonKey(
    unknownEnumValue: TypeOfCategory.MASTER,
  )
  final TypeOfCategory? type;

  final int? level;
  final String? fullSlug;

  CategoryBasic({
    required this.id,
    required this.name,
    this.slug,
    this.type, // 🔥 NULLABLE HAI AB
    this.level,
    this.fullSlug,
  });

  factory CategoryBasic.fromJson(Map<String, dynamic> json) =>
      _$CategoryBasicFromJson(json);

  Map<String, dynamic> toJson() => _$CategoryBasicToJson(this);
}