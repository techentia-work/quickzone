// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductType _$ProductTypeFromJson(Map<String, dynamic> json) => ProductType(
  id: json['_id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  sellerId: json['sellerId'] as String?,
  brand: json['brand'] as String?,
  categoryId: CategoryBasic.fromJson(
    json['categoryId'] as Map<String, dynamic>,
  ),
  categoryHierarchy:
      (json['categoryPath'] as List<dynamic>?)
          ?.map((e) => CategoryBasic.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  tags:
      (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      [],
  mainImage: json['mainImage'] as String?,
  description: json['description'] as String?,
  shortDescription: json['shortDescription'] as String?,
  metaTitle: json['metaTitle'] as String?,
  metaDescription: json['metaDescription'] as String?,
  metaKeywords: json['metaKeywords'] as String?,
  productType: $enumDecode(_$ProductEatableTypeEnumMap, json['productType']),
  manufacturer: json['manufacturer'] as String?,
  madeIn: json['madeIn'] as String?,
  fssaiNumber: json['fssaiNumber'] as String?,
  barcode: json['barcode'] as String?,
  maxQtyPerUser: (json['maxQtyPerUser'] as num).toInt(),
  isReturnable: json['isReturnable'] as bool,
  isCOD: json['isCOD'] as bool,
  isCancelable: json['isCancelable'] as bool,
  status: $enumDecode(_$ProductStatusEnumMap, json['status']),
  variants:
      (json['variants'] as List<dynamic>?)
          ?.map((e) => ProductVariantType.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  ratingsAvg: ProductType._ratingsAvgFromJson(json['ratings']),
  popularity: (json['popularity'] as num?)?.toInt() ?? 0,
  searchKeywords:
      (json['searchKeywords'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      [],
  taxRate: $enumDecodeNullable(_$TaxRateTypeEnumMap, json['taxRate']),
  isApproved: json['isApproved'] as bool,
  isActive: json['isActive'] as bool,
  isDeleted: json['isDeleted'] as bool,
  deletedAt: json['deletedAt'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  v: (json['__v'] as num?)?.toInt(),
);

Map<String, dynamic> _$ProductTypeToJson(
  ProductType instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'sellerId': instance.sellerId,
  'brand': instance.brand,
  'categoryId': instance.categoryId.toJson(),
  'categoryPath': instance.categoryHierarchy.map((e) => e.toJson()).toList(),
  'tags': instance.tags,
  'images': instance.images,
  'mainImage': instance.mainImage,
  'description': instance.description,
  'shortDescription': instance.shortDescription,
  'metaTitle': instance.metaTitle,
  'metaDescription': instance.metaDescription,
  'metaKeywords': instance.metaKeywords,
  'productType': _$ProductEatableTypeEnumMap[instance.productType]!,
  'manufacturer': instance.manufacturer,
  'madeIn': instance.madeIn,
  'fssaiNumber': instance.fssaiNumber,
  'barcode': instance.barcode,
  'maxQtyPerUser': instance.maxQtyPerUser,
  'isReturnable': instance.isReturnable,
  'isCOD': instance.isCOD,
  'isCancelable': instance.isCancelable,
  'status': _$ProductStatusEnumMap[instance.status]!,
  'variants': instance.variants.map((e) => e.toJson()).toList(),
  'ratings': instance.ratingsAvg,
  'popularity': instance.popularity,
  'searchKeywords': instance.searchKeywords,
  'taxRate': _$TaxRateTypeEnumMap[instance.taxRate],
  'isApproved': instance.isApproved,
  'isActive': instance.isActive,
  'isDeleted': instance.isDeleted,
  'deletedAt': instance.deletedAt,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  '__v': instance.v,
};

const _$ProductEatableTypeEnumMap = {
  ProductEatableType.VEG: 'VEG',
  ProductEatableType.NON_VEG: 'NON_VEG',
  ProductEatableType.NONE: 'NONE',
};

const _$ProductStatusEnumMap = {
  ProductStatus.APPROVED: 'APPROVED',
  ProductStatus.NOT_APPROVED: 'NOT_APPROVED',
  ProductStatus.REJECTED: 'REJECTED',
  ProductStatus.PENDING: 'PENDING',
};

const _$TaxRateTypeEnumMap = {
  TaxRateType.GST_5: 'gst_5',
  TaxRateType.GST_12: 'gst_12',
  TaxRateType.GST_18: 'gst_18',
  TaxRateType.GST_28: 'gst_28',
  TaxRateType.GST_40: 'gst_40',
};
