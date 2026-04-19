// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'featured_product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeaturedProductItem _$FeaturedProductItemFromJson(Map<String, dynamic> json) =>
    FeaturedProductItem(
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

Map<String, dynamic> _$FeaturedProductItemToJson(
  FeaturedProductItem instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'mainImage': instance.mainImage,
  'variants': instance.variants.map((e) => e.toJson()).toList(),
};
