// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'showcase_product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShowcaseProductType _$ShowcaseProductTypeFromJson(Map<String, dynamic> json) =>
    ShowcaseProductType(
      id: json['_id'] as String,
      showcaseType: json['showcaseType'] as String,
      products:
          (json['products'] as List<dynamic>?)
              ?.map(
                (e) => ShowcaseProductItem.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      masterCategory: ShowcaseCategory.fromJson(
        json['masterCategory'] as Map<String, dynamic>,
      ),
      subCategories:
          (json['subCategories'] as List<dynamic>?)
              ?.map((e) => ShowcaseCategory.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      displayOrder: (json['displayOrder'] as num?)?.toInt(),
      isActive: json['isActive'] as bool,
      isDeleted: json['isDeleted'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$ShowcaseProductTypeToJson(
  ShowcaseProductType instance,
) => <String, dynamic>{
  '_id': instance.id,
  'showcaseType': instance.showcaseType,
  'products': instance.products.map((e) => e.toJson()).toList(),
  'masterCategory': instance.masterCategory.toJson(),
  'subCategories': instance.subCategories.map((e) => e.toJson()).toList(),
  'displayOrder': instance.displayOrder,
  'isActive': instance.isActive,
  'isDeleted': instance.isDeleted,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

ShowcaseProductItem _$ShowcaseProductItemFromJson(Map<String, dynamic> json) =>
    ShowcaseProductItem(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      mainImage: json['mainImage'] as String?,
      variants:
          (json['variants'] as List<dynamic>?)
              ?.map(
                (e) => ProductVariantType.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
    );

Map<String, dynamic> _$ShowcaseProductItemToJson(
  ShowcaseProductItem instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'mainImage': instance.mainImage,
  'variants': instance.variants.map((e) => e.toJson()).toList(),
};

ShowcaseCategory _$ShowcaseCategoryFromJson(Map<String, dynamic> json) =>
    ShowcaseCategory(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
    );

Map<String, dynamic> _$ShowcaseCategoryToJson(ShowcaseCategory instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
    };
