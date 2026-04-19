import 'package:json_annotation/json_annotation.dart';
import 'featured_product_model.dart';

part 'featured_product_mapping.g.dart';

@JsonSerializable(explicitToJson: true)
class FeaturedProductMapping {
  final String type; // PRODUCT
  final String refId;
  final String? externalUrl;

  /// 🔥 FIX: nullable because backend may send null
  @JsonKey(name: 'data')
  final FeaturedProductItem? product;

  FeaturedProductMapping({
    required this.type,
    required this.refId,
    this.externalUrl,
    this.product,
  });

  factory FeaturedProductMapping.fromJson(
      Map<String, dynamic> json,
      ) {
    return FeaturedProductMapping(
      type: json['type'] as String,
      refId: json['refId'] as String,
      externalUrl: json['externalUrl'] as String?,
      product: json['data'] == null
          ? null
          : FeaturedProductItem.fromJson(
        json['data'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() =>
      _$FeaturedProductMappingToJson(this);
}
