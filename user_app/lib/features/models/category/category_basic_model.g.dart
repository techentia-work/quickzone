// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_basic_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CategoryBasic _$CategoryBasicFromJson(Map<String, dynamic> json) =>
    CategoryBasic(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String?,
      type: $enumDecodeNullable(
        _$TypeOfCategoryEnumMap,
        json['type'],
        unknownValue: TypeOfCategory.MASTER,
      ),
      level: (json['level'] as num?)?.toInt(),
      fullSlug: json['fullSlug'] as String?,
    );

Map<String, dynamic> _$CategoryBasicToJson(CategoryBasic instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'type': _$TypeOfCategoryEnumMap[instance.type],
      'level': instance.level,
      'fullSlug': instance.fullSlug,
    };

const _$TypeOfCategoryEnumMap = {
  TypeOfCategory.MASTER: 'MASTER',
  TypeOfCategory.SUPER: 'SUPER',
  TypeOfCategory.CATEGORY: 'CATEGORY',
  TypeOfCategory.SUBCATEGORY: 'SUBCATEGORY',
  TypeOfCategory.LEVEL_5: 'LEVEL_5',
  TypeOfCategory.LEVEL_6: 'LEVEL_6',
  TypeOfCategory.LEVEL_7: 'LEVEL_7',
};
