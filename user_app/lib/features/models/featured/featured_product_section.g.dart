// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'featured_product_section.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeaturedProductSection _$FeaturedProductSectionFromJson(
  Map<String, dynamic> json,
) => FeaturedProductSection(
  id: json['_id'] as String,
  title: json['title'] as String,
  imageUrl: json['imageUrl'] as String?,
  color: json['color'] as String?,
  position: json['position'] as String,
  order: (json['order'] as num).toInt(),
  masterCategory: json['masterCategory'] == null
      ? null
      : CategoryBasic.fromJson(json['masterCategory'] as Map<String, dynamic>),
  mappings:
      (json['mappings'] as List<dynamic>?)
          ?.map(
            (e) => FeaturedProductMapping.fromJson(e as Map<String, dynamic>),
          )
          .toList() ??
      [],
);

Map<String, dynamic> _$FeaturedProductSectionToJson(
  FeaturedProductSection instance,
) => <String, dynamic>{
  '_id': instance.id,
  'title': instance.title,
  'imageUrl': instance.imageUrl,
  'color': instance.color,
  'position': instance.position,
  'order': instance.order,
  'masterCategory': instance.masterCategory?.toJson(),
  'mappings': instance.mappings.map((e) => e.toJson()).toList(),
};
