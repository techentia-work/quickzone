// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CategoryType _$CategoryTypeFromJson(Map<String, dynamic> json) => CategoryType(
  id: json['_id'] as String,
  children: (json['children'] as List<dynamic>?)
      ?.map((e) => CategoryType.fromJson(e as Map<String, dynamic>))
      .toList(),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  v: (json['__v'] as num?)?.toInt(),
  name: json['name'] as String,
  slug: json['slug'] as String,
  subtitle: json['subtitle'] as String?,
  thumbnail: json['thumbnail'] as String?,
  metaTitle: json['metaTitle'] as String?,
  metaKeywords: json['metaKeywords'] as String?,
  metaDescription: json['metaDescription'] as String?,
  markup: json['markup'] as String?,
  type: $enumDecode(_$TypeOfCategoryEnumMap, json['type']),
  ancestors: (json['ancestors'] as List<dynamic>?)
      ?.map((e) => CategoryBasic.fromJson(e as Map<String, dynamic>))
      .toList(),
  path: (json['path'] as List<dynamic>?)?.map((e) => e as String).toList(),
  fullSlug: json['fullSlug'] as String?,
  level: (json['level'] as num?)?.toInt(),
  order: (json['order'] as num).toInt(),
  isActive: json['isActive'] as bool,
  isDeleted: json['isDeleted'] as bool,
  deletedAt: json['deletedAt'] as String?,
);

Map<String, dynamic> _$CategoryTypeToJson(CategoryType instance) =>
    <String, dynamic>{
      'name': instance.name,
      'slug': instance.slug,
      'subtitle': instance.subtitle,
      'thumbnail': instance.thumbnail,
      'metaTitle': instance.metaTitle,
      'metaKeywords': instance.metaKeywords,
      'metaDescription': instance.metaDescription,
      'markup': instance.markup,
      'type': _$TypeOfCategoryEnumMap[instance.type]!,
      'ancestors': instance.ancestors?.map((e) => e.toJson()).toList(),
      'path': instance.path,
      'fullSlug': instance.fullSlug,
      'level': instance.level,
      'order': instance.order,
      'isActive': instance.isActive,
      'isDeleted': instance.isDeleted,
      'deletedAt': instance.deletedAt,
      '_id': instance.id,
      'children': instance.children?.map((e) => e.toJson()).toList(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      '__v': instance.v,
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
