// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_variant_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductVariantBase _$ProductVariantBaseFromJson(
  Map<String, dynamic> json,
) => ProductVariantBase(
  title: json['title'] as String?,
  sku: json['sku'] as String,
  variantType: $enumDecode(_$VariantQuantityTypeEnumMap, json['variantType']),
  price: (json['price'] as num).toDouble(),
  mrp: (json['mrp'] as num?)?.toDouble(),
  discountPercent: (json['discountPercent'] as num?)?.toDouble(),
  discountedPrice: (json['discountedPrice'] as num?)?.toDouble(),
  stock: (json['stock'] as num?)?.toInt(),
  inventoryType: $enumDecodeNullable(
    _$VariantInventoryTypeEnumMap,
    json['inventoryType'],
  ),
  status: $enumDecodeNullable(_$VariantStatusEnumMap, json['status']),
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      [],
  measurement: (json['measurement'] as num?)?.toDouble(),
  measurementUnit: json['measurementUnit'] as String?,
);

Map<String, dynamic> _$ProductVariantBaseToJson(ProductVariantBase instance) =>
    <String, dynamic>{
      'title': instance.title,
      'sku': instance.sku,
      'variantType': _$VariantQuantityTypeEnumMap[instance.variantType]!,
      'price': instance.price,
      'mrp': instance.mrp,
      'discountPercent': instance.discountPercent,
      'discountedPrice': instance.discountedPrice,
      'stock': instance.stock,
      'inventoryType': _$VariantInventoryTypeEnumMap[instance.inventoryType],
      'status': _$VariantStatusEnumMap[instance.status],
      'images': instance.images,
      'measurement': instance.measurement,
      'measurementUnit': instance.measurementUnit,
    };

const _$VariantQuantityTypeEnumMap = {
  VariantQuantityType.PACKET: 'packet',
  VariantQuantityType.LOOSE: 'loose',
};

const _$VariantInventoryTypeEnumMap = {
  VariantInventoryType.LIMITED: 'LIMITED',
  VariantInventoryType.UNLIMITED: 'UNLIMITED',
};

const _$VariantStatusEnumMap = {
  VariantStatus.AVAILABLE: 'AVAILABLE',
  VariantStatus.SOLD_OUT: 'SOLD_OUT',
};

ProductVariantType _$ProductVariantTypeFromJson(
  Map<String, dynamic> json,
) => ProductVariantType(
  id: json['_id'] as String,
  title: json['title'] as String?,
  sku: json['sku'] as String,
  variantType: $enumDecode(_$VariantQuantityTypeEnumMap, json['variantType']),
  price: (json['price'] as num).toDouble(),
  mrp: (json['mrp'] as num?)?.toDouble(),
  discountPercent: (json['discountPercent'] as num?)?.toDouble(),
  discountedPrice: (json['discountedPrice'] as num?)?.toDouble(),
  stock: (json['stock'] as num?)?.toInt(),
  inventoryType: $enumDecodeNullable(
    _$VariantInventoryTypeEnumMap,
    json['inventoryType'],
  ),
  status: $enumDecodeNullable(_$VariantStatusEnumMap, json['status']),
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      [],
  measurement: (json['measurement'] as num?)?.toDouble(),
  measurementUnit: json['measurementUnit'] as String?,
);

Map<String, dynamic> _$ProductVariantTypeToJson(ProductVariantType instance) =>
    <String, dynamic>{
      'title': instance.title,
      'sku': instance.sku,
      'variantType': _$VariantQuantityTypeEnumMap[instance.variantType]!,
      'price': instance.price,
      'mrp': instance.mrp,
      'discountPercent': instance.discountPercent,
      'discountedPrice': instance.discountedPrice,
      'stock': instance.stock,
      'inventoryType': _$VariantInventoryTypeEnumMap[instance.inventoryType],
      'status': _$VariantStatusEnumMap[instance.status],
      'images': instance.images,
      'measurement': instance.measurement,
      'measurementUnit': instance.measurementUnit,
      '_id': instance.id,
    };
