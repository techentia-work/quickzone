// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_by_store_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShopByStore _$ShopByStoreFromJson(Map<String, dynamic> json) => ShopByStore(
  id: json['_id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  banner: json['banner'] as String?,
  thumbnail: json['thumbnail'] as String?,
  masterCategory: json['masterCategory'] == null
      ? null
      : ShopByStoreMasterCategory.fromJson(
          json['masterCategory'] as Map<String, dynamic>,
        ),
  isActive: json['isActive'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$ShopByStoreToJson(ShopByStore instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'banner': instance.banner,
      'thumbnail': instance.thumbnail,
      'masterCategory': instance.masterCategory?.toJson(),
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

ShopByStoreMasterCategory _$ShopByStoreMasterCategoryFromJson(
  Map<String, dynamic> json,
) => ShopByStoreMasterCategory(
  id: json['_id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
);

Map<String, dynamic> _$ShopByStoreMasterCategoryToJson(
  ShopByStoreMasterCategory instance,
) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
};

CreateShopByStorePayload _$CreateShopByStorePayloadFromJson(
  Map<String, dynamic> json,
) => CreateShopByStorePayload(
  name: json['name'] as String,
  slug: json['slug'] as String?,
  banner: json['banner'] as String?,
  thumbnail: json['thumbnail'] as String?,
  masterCategory: json['masterCategory'] as String?,
  isActive: json['isActive'] as bool?,
);

Map<String, dynamic> _$CreateShopByStorePayloadToJson(
  CreateShopByStorePayload instance,
) => <String, dynamic>{
  'name': instance.name,
  'slug': instance.slug,
  'banner': instance.banner,
  'thumbnail': instance.thumbnail,
  'masterCategory': instance.masterCategory,
  'isActive': instance.isActive,
};

UpdateShopByStorePayload _$UpdateShopByStorePayloadFromJson(
  Map<String, dynamic> json,
) => UpdateShopByStorePayload(
  name: json['name'] as String?,
  slug: json['slug'] as String?,
  banner: json['banner'] as String?,
  thumbnail: json['thumbnail'] as String?,
  masterCategory: json['masterCategory'] as String?,
  isActive: json['isActive'] as bool?,
);

Map<String, dynamic> _$UpdateShopByStorePayloadToJson(
  UpdateShopByStorePayload instance,
) => <String, dynamic>{
  'name': instance.name,
  'slug': instance.slug,
  'banner': instance.banner,
  'thumbnail': instance.thumbnail,
  'masterCategory': instance.masterCategory,
  'isActive': instance.isActive,
};
