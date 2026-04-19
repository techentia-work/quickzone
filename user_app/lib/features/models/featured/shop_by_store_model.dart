import 'package:json_annotation/json_annotation.dart';

part 'shop_by_store_model.g.dart';

/// =======================================================
/// SHOP BY STORE MAIN MODEL
/// =======================================================
@JsonSerializable(explicitToJson: true)
class ShopByStore {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;

  final String? banner;
  final String? thumbnail;

  final ShopByStoreMasterCategory? masterCategory;

  final bool isActive;

  final DateTime createdAt;
  final DateTime updatedAt;

  ShopByStore({
    required this.id,
    required this.name,
    required this.slug,
    this.banner,
    this.thumbnail,
    this.masterCategory,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ShopByStore.fromJson(Map<String, dynamic> json) =>
      _$ShopByStoreFromJson(json);

  Map<String, dynamic> toJson() => _$ShopByStoreToJson(this);
}

/// =======================================================
/// MASTER CATEGORY (EMBEDDED OBJECT)
/// =======================================================
@JsonSerializable()
class ShopByStoreMasterCategory {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;

  ShopByStoreMasterCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory ShopByStoreMasterCategory.fromJson(Map<String, dynamic> json) =>
      _$ShopByStoreMasterCategoryFromJson(json);

  Map<String, dynamic> toJson() =>
      _$ShopByStoreMasterCategoryToJson(this);
}

/// =======================================================
/// CREATE PAYLOAD
/// =======================================================
@JsonSerializable()
class CreateShopByStorePayload {
  final String name;
  final String? slug;
  final String? banner;
  final String? thumbnail;
  final String? masterCategory; // masterCategory _id
  final bool? isActive;

  CreateShopByStorePayload({
    required this.name,
    this.slug,
    this.banner,
    this.thumbnail,
    this.masterCategory,
    this.isActive,
  });

  factory CreateShopByStorePayload.fromJson(Map<String, dynamic> json) =>
      _$CreateShopByStorePayloadFromJson(json);

  Map<String, dynamic> toJson() =>
      _$CreateShopByStorePayloadToJson(this);
}

/// =======================================================
/// UPDATE PAYLOAD
/// =======================================================
@JsonSerializable()
class UpdateShopByStorePayload {
  final String? name;
  final String? slug;
  final String? banner;
  final String? thumbnail;
  final String? masterCategory;
  final bool? isActive;

  UpdateShopByStorePayload({
    this.name,
    this.slug,
    this.banner,
    this.thumbnail,
    this.masterCategory,
    this.isActive,
  });

  factory UpdateShopByStorePayload.fromJson(Map<String, dynamic> json) =>
      _$UpdateShopByStorePayloadFromJson(json);

  Map<String, dynamic> toJson() =>
      _$UpdateShopByStorePayloadToJson(this);
}
