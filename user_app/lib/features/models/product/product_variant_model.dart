import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_variant_model.g.dart';

@JsonSerializable()
class ProductVariantBase {
  final String? title;
  final String sku;
  final VariantQuantityType variantType;
  final double price;
  final double? mrp;
  final double? discountPercent;
  final double? discountedPrice;
  final int? stock;
  final VariantInventoryType? inventoryType;
  final VariantStatus? status;

  @JsonKey(defaultValue: [])
  final List<String> images;

  final double? measurement;
  final String? measurementUnit;

  ProductVariantBase({
    this.title,
    required this.sku,
    required this.variantType,
    required this.price,
    this.mrp,
    this.discountPercent,
    this.discountedPrice,
    this.stock,
    this.inventoryType,
    this.status,
    required this.images,
    this.measurement,
    this.measurementUnit,
  });

  factory ProductVariantBase.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantBaseFromJson(json);

  Map<String, dynamic> toJson() => _$ProductVariantBaseToJson(this);
}

@JsonSerializable()
class ProductVariantType extends ProductVariantBase {
  @JsonKey(name: '_id')
  final String id;

  ProductVariantType({
    required this.id,
    String? title,
    required String sku,
    required VariantQuantityType variantType,
    required double price,
    double? mrp,
    double? discountPercent,
    double? discountedPrice,
    int? stock,
    VariantInventoryType? inventoryType,
    VariantStatus? status,
    List<String>? images,
    double? measurement,
    String? measurementUnit,
  }) : super(
    title: title,
    sku: sku,
    variantType: variantType,
    price: price,
    mrp: mrp,
    discountPercent: discountPercent,
    discountedPrice: discountedPrice,
    stock: stock,
    inventoryType: inventoryType,
    status: status,
    images: images ?? [],
    measurement: measurement,
    measurementUnit: measurementUnit,
  );

  factory ProductVariantType.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantTypeFromJson(json);

  @override
  Map<String, dynamic> toJson() => _$ProductVariantTypeToJson(this);
}