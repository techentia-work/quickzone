// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'featured_week_brand_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeaturedWeekBrand _$FeaturedWeekBrandFromJson(Map<String, dynamic> json) =>
    FeaturedWeekBrand(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      banner: json['banner'] as String?,
      thumbnail: json['thumbnail'] as String?,
      masterCategory: json['masterCategory'] == null
          ? null
          : MasterCategory.fromJson(
              json['masterCategory'] as Map<String, dynamic>,
            ),
      isActive: json['isActive'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$FeaturedWeekBrandToJson(FeaturedWeekBrand instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'banner': instance.banner,
      'thumbnail': instance.thumbnail,
      'masterCategory': instance.masterCategory,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

MasterCategory _$MasterCategoryFromJson(Map<String, dynamic> json) =>
    MasterCategory(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
    );

Map<String, dynamic> _$MasterCategoryToJson(MasterCategory instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
    };
