// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'brand_of_the_day_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BrandOfTheDayType _$BrandOfTheDayTypeFromJson(Map<String, dynamic> json) =>
    BrandOfTheDayType(
      id: json['_id'] as String,
      name: json['name'] as String,
      title: json['title'] as String,
      websiteUrl: json['websiteUrl'] as String,
      banner: json['banner'] as String?,
      thumbnail: json['thumbnail'] as String?,
      masterCategory: BrandOfTheDayType._categoryFromJson(
        json['masterCategory'],
      ),
      isActive: json['isActive'] as bool,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$BrandOfTheDayTypeToJson(BrandOfTheDayType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'title': instance.title,
      'websiteUrl': instance.websiteUrl,
      'banner': instance.banner,
      'thumbnail': instance.thumbnail,
      'masterCategory': instance.masterCategory?.toJson(),
      'isActive': instance.isActive,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
