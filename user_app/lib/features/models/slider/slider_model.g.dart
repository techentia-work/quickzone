// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'slider_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SliderType _$SliderTypeFromJson(Map<String, dynamic> json) => SliderType(
  id: json['_id'] as String,
  title: json['title'] as String,
  slug: json['slug'] as String?,
  imageUrl: json['imageUrl'] as String,
  order: (json['order'] as num?)?.toInt(),
  isActive: json['isActive'] as bool?,
  isClickable: json['isClickable'] as bool?,
  masterCategory: json['masterCategory'] == null
      ? null
      : CategoryBasic.fromJson(json['masterCategory'] as Map<String, dynamic>),
  category:
      (json['category'] as List<dynamic>?)
          ?.map((e) => CategoryBasic.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  subcategory:
      (json['subcategory'] as List<dynamic>?)
          ?.map((e) => CategoryBasic.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  isDeleted: json['isDeleted'] as bool?,
  mappings: json['mappings'] as List<dynamic>?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  v: (json['__v'] as num?)?.toInt(),
);

Map<String, dynamic> _$SliderTypeToJson(SliderType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'imageUrl': instance.imageUrl,
      'order': instance.order,
      'isActive': instance.isActive,
      'isClickable': instance.isClickable,
      'masterCategory': instance.masterCategory?.toJson(),
      'category': instance.category.map((e) => e.toJson()).toList(),
      'subcategory': instance.subcategory.map((e) => e.toJson()).toList(),
      'isDeleted': instance.isDeleted,
      'mappings': instance.mappings,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      '__v': instance.v,
    };
