// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'featured_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeaturedProductData _$FeaturedProductDataFromJson(Map<String, dynamic> json) =>
    FeaturedProductData(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      thumbnail: json['thumbnail'] as String?,
      variants: (json['variants'] as List<dynamic>?)
          ?.map((e) => ProductVariantType.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$FeaturedProductDataToJson(
  FeaturedProductData instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'thumbnail': instance.thumbnail,
  'variants': instance.variants?.map((e) => e.toJson()).toList(),
};

FeaturedMapping _$FeaturedMappingFromJson(Map<String, dynamic> json) =>
    FeaturedMapping(
      type: json['type'] as String,
      refId: json['refId'] as String,
      externalUrl: json['externalUrl'] as String?,
      productData: FeaturedMapping._productFromJson(json['data']),
    );

Map<String, dynamic> _$FeaturedMappingToJson(FeaturedMapping instance) =>
    <String, dynamic>{
      'type': instance.type,
      'refId': instance.refId,
      'externalUrl': instance.externalUrl,
      'data': instance.productData?.toJson(),
    };

FeaturedType _$FeaturedTypeFromJson(Map<String, dynamic> json) => FeaturedType(
  id: json['_id'] as String,
  title: json['title'] as String,
  slug: json['slug'] as String?,
  description: json['description'] as String?,
  imageUrl: json['imageUrl'] as String?,
  imageUrl1: json['imageUrl1'] as String?,
  color: json['color'] as String?,
  position: json['position'] as String?,
  order: (json['order'] as num?)?.toInt(),
  appLayout: json['appLayout'] as String?,
  gridCount: (json['gridCount'] as num?)?.toInt(),
  metaTitle: json['metaTitle'] as String?,
  metaDescription: json['metaDescription'] as String?,
  isActive: json['isActive'] as bool?,
  isClickable: json['isClickable'] as bool?,
  mappings: (json['mappings'] as List<dynamic>?)
      ?.map((e) => FeaturedMapping.fromJson(e as Map<String, dynamic>))
      .toList(),
  masterCategory: FeaturedType._categoryFromJson(json['masterCategory']),
  category: FeaturedType._categoryFromJson(json['category']),
  subcategory: json['subcategory'] == null
      ? []
      : FeaturedType._subcategoryFromJson(json['subcategory']),
  isDeleted: json['isDeleted'] as bool?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  v: (json['__v'] as num?)?.toInt(),
);

Map<String, dynamic> _$FeaturedTypeToJson(FeaturedType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'imageUrl1': instance.imageUrl1,
      'color': instance.color,
      'position': instance.position,
      'order': instance.order,
      'appLayout': instance.appLayout,
      'gridCount': instance.gridCount,
      'metaTitle': instance.metaTitle,
      'metaDescription': instance.metaDescription,
      'isActive': instance.isActive,
      'isClickable': instance.isClickable,
      'mappings': instance.mappings?.map((e) => e.toJson()).toList(),
      'masterCategory': instance.masterCategory?.toJson(),
      'category': instance.category?.toJson(),
      'subcategory': instance.subcategory.map((e) => e.toJson()).toList(),
      'isDeleted': instance.isDeleted,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      '__v': instance.v,
    };
