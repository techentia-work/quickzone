// features/models/cart/cart_model.dart
import 'package:Quickzon/core/utils/enums/cart_enum.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cart_model.g.dart';

/// =======================================================
/// CART ITEM
/// =======================================================
@JsonSerializable(explicitToJson: true)
class CartItemType {
  final CartProductRef productId;
  final String variantId;
  final String? title;
  final double price; // 🔥 MRP (per item)
  final int quantity;
  final double? discountPercent;
  final double? discountedPrice; // 🔥 discounted price (per item)
  final TaxRateType taxRate;
  final double? totalPrice;
  final CartProduct? product;

  CartItemType({
    required this.productId,
    required this.variantId,
    this.title,
    required this.price,
    required this.quantity,
    this.discountPercent,
    this.discountedPrice,
    required this.taxRate,
    this.totalPrice,
    this.product,
  });

  /// 🔥 ITEM MRP TOTAL (price * qty)
  double get mrpTotal => price * quantity;

  /// 🔥 ITEM DISCOUNTED TOTAL
  double get discountedTotal =>
      (discountedPrice ?? price) * quantity;

  factory CartItemType.fromJson(Map<String, dynamic> json) =>
      _$CartItemTypeFromJson(json);

  Map<String, dynamic> toJson() => _$CartItemTypeToJson(this);
}

/// =======================================================
/// PRODUCT REF (LIGHTWEIGHT)
/// =======================================================
@JsonSerializable()
class CartProductRef {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;
  final String categoryId;
  final String mainImage;

  CartProductRef({
    required this.id,
    required this.name,
    required this.slug,
    required this.categoryId,
    required this.mainImage,
  });

  factory CartProductRef.fromJson(Map<String, dynamic> json) =>
      _$CartProductRefFromJson(json);

  Map<String, dynamic> toJson() => _$CartProductRefToJson(this);
}

/// =======================================================
/// OPTIONAL FULL PRODUCT
/// =======================================================
@JsonSerializable()
class CartProduct {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String? thumbnail;
  final double price;

  CartProduct({
    required this.id,
    required this.name,
    this.thumbnail,
    required this.price,
  });

  factory CartProduct.fromJson(Map<String, dynamic> json) =>
      _$CartProductFromJson(json);

  Map<String, dynamic> toJson() => _$CartProductToJson(this);
}

/// =======================================================
/// CART ROOT
/// =======================================================
@JsonSerializable(explicitToJson: true)
class CartType {
  @JsonKey(name: '_id')
  final String? id;
  final String userId;
  final List<CartItemType> items;

  /// Backend values
  final double subTotal;     // discounted total
  final double totalTax;
  final double totalAmount;
  final Promo? appliedPromo;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  CartType({
    this.id,
    required this.userId,
    required this.items,
    required this.subTotal,
    required this.totalTax,
    required this.totalAmount,
    this.appliedPromo,
    this.createdAt,
    this.updatedAt,
  });

  /// 🔥 TOTAL MRP (before discount)
  double get mrpTotal {
    return items.fold(
      0,
          (sum, item) => sum + item.mrpTotal,
    );
  }

  /// 🔥 TOTAL DISCOUNT (MRP - discounted)
  double get discountTotal {
    return mrpTotal - subTotal;
  }

  /// 🔥 TOTAL ITEMS COUNT
  int get totalItems {
    return items.fold(
      0,
          (sum, item) => sum + item.quantity,
    );
  }

  factory CartType.fromJson(Map<String, dynamic> json) =>
      _$CartTypeFromJson(json);

  Map<String, dynamic> toJson() => _$CartTypeToJson(this);
}

/// =======================================================
/// PROMO
/// =======================================================
@JsonSerializable()
class Promo {
  final String? code;
  final double? discountAmount;

  Promo({this.code, this.discountAmount});

  factory Promo.fromJson(Map<String, dynamic> json) =>
      _$PromoFromJson(json);

  Map<String, dynamic> toJson() => _$PromoToJson(this);
}
