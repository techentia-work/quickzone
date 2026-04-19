import 'package:Quickzon/features/models/order/delivery_boy.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

part 'order_model.g.dart';

/// =======================
/// ORDER
/// =======================
@JsonSerializable(explicitToJson: true)
class OrderType {
  @JsonKey(name: '_id')
  final String id;

  /// userId can be String OR Object
  @JsonKey(fromJson: _userFromJson)
  final UserInfoType userId;

  final String orderNumber;

  @JsonKey(defaultValue: [])
  final List<OrderItemType> items;

  final double subTotal;

  @JsonKey(defaultValue: 0)
  final double totalTax;

  @JsonKey(defaultValue: 0)
  final double shippingCharges;

  @JsonKey(defaultValue: 0)
  final double handlingCharge;

  @JsonKey(defaultValue: 0)
  final double deliveryCharge;

  final double totalAmount;

  /// Assigned delivery boy (can be null / object / sometimes string)
  @JsonKey(
    name: 'assignedDeliveryBoy',
    fromJson: _deliveryBoyFromJson,
  )
  final DeliveryBoy? assignedDeliveryBoy;

  @JsonKey(fromJson: _addressFromJson)
  final ShippingAddressType shippingAddress;

  @JsonKey(fromJson: _billingAddressFromJson)
  final ShippingAddressType? billingAddress;


  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
  final OrderStatus status;

  @JsonKey(defaultValue: [])
  final List<OrderTrackingType> tracking;

  @JsonKey(fromJson: _promoFromJson)
  final OrderPromo? appliedPromo;

  final DateTime? expectedDeliveryDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  @JsonKey(name: '__v')
  final int? v;

  final String? notes;
  final String? cancellationReason;
  final String? cancelledBy;
  final DateTime? cancelledAt;
  final DateTime? deliveredAt;

  /// Payment info
  final String? paymentId;
  final String? transactionId;

  /// Razorpay
  final RazorpayDetailsType? razorpayDetails;

  OrderType({
    required this.id,
    required this.userId,
    required this.orderNumber,
    required this.items,
    required this.subTotal,
    required this.totalTax,
    required this.shippingCharges,
    required this.handlingCharge,
    required this.deliveryCharge,
    required this.totalAmount,
    required this.shippingAddress,
    this.billingAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.assignedDeliveryBoy,
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
    this.razorpayDetails,
  });

  factory OrderType.fromJson(Map<String, dynamic> json) =>
      _$OrderTypeFromJson(json);

  Map<String, dynamic> toJson() => _$OrderTypeToJson(this);

  /// ✅ Computed total
  double get computedTotal =>
      subTotal +
          handlingCharge +
          deliveryCharge +
          shippingCharges -
          (appliedPromo?.discountAmount ?? 0);

  /// ✅ Razorpay Order ID
  String? get razorpayOrderId => razorpayDetails?.razorpay_order_id;

  /// =======================
  /// SAFE JSON HELPERS
  /// =======================

  static UserInfoType _userFromJson(dynamic json) {
    if (json is String) {
      return UserInfoType(id: json);
    }
    return UserInfoType.fromJson(json as Map<String, dynamic>);
  }
  static ShippingAddressType _addressFromJson(dynamic json) {
    if (json is String) {
      throw Exception('shippingAddress should not be String');
    }
    return ShippingAddressType.fromJson(json as Map<String, dynamic>);
  }
  static ShippingAddressType? _billingAddressFromJson(dynamic json) {
    if (json == null) return null;
    if (json is String) return null;
    return ShippingAddressType.fromJson(json as Map<String, dynamic>);
  }
  static OrderPromo? _promoFromJson(dynamic json) {
    if (json == null) return null;
    if (json is String) return null;
    return OrderPromo.fromJson(json as Map<String, dynamic>);
  }

  static DeliveryBoy? _deliveryBoyFromJson(dynamic json) {
    if (json == null) return null;
    if (json is String) return null;
    return DeliveryBoy.fromJson(json as Map<String, dynamic>);
  }
}

/// =======================
/// RAZORPAY DETAILS
/// =======================
@JsonSerializable()
class RazorpayDetailsType {
  final String? razorpay_order_id;
  final String? razorpay_payment_id;
  final String? razorpay_signature;

  RazorpayDetailsType({
    this.razorpay_order_id,
    this.razorpay_payment_id,
    this.razorpay_signature,
  });

  factory RazorpayDetailsType.fromJson(Map<String, dynamic> json) =>
      _$RazorpayDetailsTypeFromJson(json);

  Map<String, dynamic> toJson() => _$RazorpayDetailsTypeToJson(this);
}

/// =======================
/// PRODUCT SUMMARY
/// =======================
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

/// =======================
/// ORDER ITEM
/// =======================
@JsonSerializable(explicitToJson: true)
class OrderItemType {
  final ProductSummary productId;
  final String variantId;
  final String productName;
  final String? variantTitle;
  final String sku;
  final double price;
  final int quantity;
  final double discountPercent;
  final double discountedPrice;
  final TaxRateType taxRate;

  @JsonKey(defaultValue: 0)
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

/// =======================
/// USER INFO
/// =======================
@JsonSerializable()
class UserInfoType {
  @JsonKey(name: '_id')
  final String id;
  final String? email;
  final String? phone;
  final String? fullName;
  final bool? isLocked;

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

/// =======================
/// ADDRESS
/// =======================
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

/// =======================
/// ORDER TRACKING
/// =======================
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

/// =======================
/// PROMO
/// =======================
@JsonSerializable()
class OrderPromo {
  final String? code;

  @JsonKey(defaultValue: 0)
  final double? discountAmount;

  OrderPromo({
    this.code,
    this.discountAmount,
  });

  factory OrderPromo.fromJson(Map<String, dynamic> json) =>
      _$OrderPromoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderPromoToJson(this);
}
