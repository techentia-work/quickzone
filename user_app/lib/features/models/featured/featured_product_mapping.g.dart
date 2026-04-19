// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'featured_product_mapping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeaturedProductMapping _$FeaturedProductMappingFromJson(
  Map<String, dynamic> json,
) => FeaturedProductMapping(
  type: json['type'] as String,
  refId: json['refId'] as String,
  externalUrl: json['externalUrl'] as String?,
  product: json['data'] == null
      ? null
      : FeaturedProductItem.fromJson(json['data'] as Map<String, dynamic>),
);

Map<String, dynamic> _$FeaturedProductMappingToJson(
  FeaturedProductMapping instance,
) => <String, dynamic>{
  'type': instance.type,
  'refId': instance.refId,
  'externalUrl': instance.externalUrl,
  'data': instance.product?.toJson(),
};
