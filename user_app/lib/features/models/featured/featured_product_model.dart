import 'package:json_annotation/json_annotation.dart';
import '../product/product_variant_model.dart';

part 'featured_product_model.g.dart';

@JsonSerializable(explicitToJson: true)
class FeaturedProductItem {
  @JsonKey(name: '_id')
  final String id;

  final String name;
  final String slug;

  final String? mainImage;

  @JsonKey(defaultValue: [])
  final List<ProductVariantType> variants;

  FeaturedProductItem({
    required this.id,
    required this.name,
    required this.slug,
    this.mainImage,
    this.variants = const [],
  });

  ProductVariantType? get firstVariant =>
      variants.isNotEmpty ? variants.first : null;

  double get price =>
      firstVariant?.discountedPrice ??
          firstVariant?.price ??
          0;

  double get mrp => firstVariant?.mrp ?? 0;

  bool get hasDiscount =>
      firstVariant != null &&
          (firstVariant!.discountedPrice ?? 0) <
              (firstVariant!.mrp ?? 0);

  factory FeaturedProductItem.fromJson(Map<String, dynamic> json) =>
      _$FeaturedProductItemFromJson(json);

  Map<String, dynamic> toJson() =>
      _$FeaturedProductItemToJson(this);
}
