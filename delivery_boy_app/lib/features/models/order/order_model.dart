import 'package:json_annotation/json_annotation.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';

part 'order_model.g.dart';


@JsonSerializable(explicitToJson: true)
class OrderType {
  @JsonKey(name: '_id')
  final String id;
  final UserInfoType userId;
  final String orderNumber;
  final List<OrderItemType> items;
  final double subTotal;
  final double totalTax;
  final double shippingCharges;
  final double? deliveryCharge;
  final double? handlingCharge;
  final double? promoUsed;
  final double? walletUsed;
  final double totalAmount;
  final ShippingAddressType shippingAddress;
  final ShippingAddressType billingAddress;
  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
  final OrderStatus status;
  final List<OrderTrackingType> tracking;
  final OrderPromo? appliedPromo;
  final DateTime? expectedDeliveryDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int? v; // JSON field: "__v"
  final String? notes;
  final String? cancellationReason;
  final String? cancelledBy;
  final DateTime? cancelledAt;
  final DateTime? deliveredAt;
  final String? paymentId;
  final String? transactionId;

  OrderType({
    required this.id,
    required this.userId,
    required this.orderNumber,
    required this.items,
    required this.subTotal,
    required this.totalTax,
    required this.shippingCharges,
    this.deliveryCharge,
    this.handlingCharge,
    this.promoUsed,
    this.walletUsed,
    required this.totalAmount,
    required this.shippingAddress,
    required this.billingAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.status,
    required this.tracking,
    this.appliedPromo,
    this.expectedDeliveryDate,
    this.createdAt,
    this.updatedAt,
    this.v,
    this.notes,
    this.cancellationReason,
    this.cancelledBy,
    this.cancelledAt,
    this.deliveredAt,
    this.paymentId,
    this.transactionId,
  });

  factory OrderType.fromJson(Map<String, dynamic> json) =>
      _$OrderTypeFromJson(json);

  Map<String, dynamic> toJson() => _$OrderTypeToJson(this);
}

@JsonSerializable()
class ProductSummary {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;
  final String? mainImage;

  ProductSummary({
    required this.id,
    required this.name,
    required this.slug,
    this.mainImage,
  });

  factory ProductSummary.fromJson(Map<String, dynamic> json) =>
      _$ProductSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$ProductSummaryToJson(this);
}

@JsonSerializable(explicitToJson: true)
class OrderItemType {
  final ProductSummary productId; // ✅ nested object
  final String variantId;
  final String productName;
  final String? variantTitle;
  final String sku;
  final double price;
  final int quantity;
  final double discountPercent;
  final double discountedPrice;
  final TaxRateType taxRate;
  final double tax;
  final double totalPrice;
  final String? image;

  OrderItemType({
    required this.productId,
    required this.variantId,
    required this.productName,
    this.variantTitle,
    required this.sku,
    required this.price,
    required this.quantity,
    required this.discountPercent,
    required this.discountedPrice,
    required this.taxRate,
    required this.tax,
    required this.totalPrice,
    this.image,
  });

  factory OrderItemType.fromJson(Map<String, dynamic> json) =>
      _$OrderItemTypeFromJson(json);

  Map<String, dynamic> toJson() => _$OrderItemTypeToJson(this);
}

@JsonSerializable()
class UserInfoType {
  @JsonKey(name: '_id')
  final String id;
  final String? email;
  final String? phone;
  final String? fullName;
  final bool? isLocked;

  // There’s also a redundant `id` key in the JSON (duplicate of _id)
  // We can safely ignore it since @JsonKey(name: '_id') already captures it.

  UserInfoType({
    required this.id,
    this.email,
    this.phone,
    this.fullName,
    this.isLocked,
  });

  factory UserInfoType.fromJson(Map<String, dynamic> json) =>
      _$UserInfoTypeFromJson(json);

  Map<String, dynamic> toJson() => _$UserInfoTypeToJson(this);
}

@JsonSerializable()
class ShippingAddressType {
  final String fullName;
  final String phone;
  final String? alternatePhone;
  final String addressLine1;
  final String? addressLine2;
  final String? googleLocation;
  final String city;
  final String state;
  final String pincode;
  final String country;
  final String? landmark;

  ShippingAddressType({
    required this.fullName,
    required this.phone,
    this.alternatePhone,
    required this.addressLine1,
    this.addressLine2,
    this.googleLocation,
    required this.city,
    required this.state,
    required this.pincode,
    required this.country,
    this.landmark,
  });

  factory ShippingAddressType.fromJson(Map<String, dynamic> json) =>
      _$ShippingAddressTypeFromJson(json);

  Map<String, dynamic> toJson() => _$ShippingAddressTypeToJson(this);
}

@JsonSerializable()
class OrderTrackingType {
  final OrderStatus status;
  final DateTime timestamp;
  final String? comment;
  final String? updatedBy;

  OrderTrackingType({
    required this.status,
    required this.timestamp,
    this.comment,
    this.updatedBy,
  });

  factory OrderTrackingType.fromJson(Map<String, dynamic> json) =>
      _$OrderTrackingTypeFromJson(json);

  Map<String, dynamic> toJson() => _$OrderTrackingTypeToJson(this);
}

@JsonSerializable()
class OrderPromo {
  final String? code;
  final double? discountAmount;

  OrderPromo({
    this.code,
    this.discountAmount,
  });

  factory OrderPromo.fromJson(Map<String, dynamic> json) =>
      _$OrderPromoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderPromoToJson(this);
}
