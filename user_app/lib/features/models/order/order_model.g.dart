// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderType _$OrderTypeFromJson(Map<String, dynamic> json) => OrderType(
  id: json['_id'] as String,
  userId: OrderType._userFromJson(json['userId']),
  orderNumber: json['orderNumber'] as String,
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemType.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  subTotal: (json['subTotal'] as num).toDouble(),
  totalTax: (json['totalTax'] as num?)?.toDouble() ?? 0,
  shippingCharges: (json['shippingCharges'] as num?)?.toDouble() ?? 0,
  handlingCharge: (json['handlingCharge'] as num?)?.toDouble() ?? 0,
  deliveryCharge: (json['deliveryCharge'] as num?)?.toDouble() ?? 0,
  totalAmount: (json['totalAmount'] as num).toDouble(),
  shippingAddress: OrderType._addressFromJson(json['shippingAddress']),
  billingAddress: OrderType._billingAddressFromJson(json['billingAddress']),
  paymentMethod: $enumDecode(_$PaymentMethodEnumMap, json['paymentMethod']),
  paymentStatus: $enumDecode(_$PaymentStatusEnumMap, json['paymentStatus']),
  assignedDeliveryBoy: OrderType._deliveryBoyFromJson(
    json['assignedDeliveryBoy'],
  ),
  status: $enumDecode(_$OrderStatusEnumMap, json['status']),
  tracking:
      (json['tracking'] as List<dynamic>?)
          ?.map((e) => OrderTrackingType.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  appliedPromo: OrderType._promoFromJson(json['appliedPromo']),
  expectedDeliveryDate: json['expectedDeliveryDate'] == null
      ? null
      : DateTime.parse(json['expectedDeliveryDate'] as String),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  v: (json['__v'] as num?)?.toInt(),
  notes: json['notes'] as String?,
  cancellationReason: json['cancellationReason'] as String?,
  cancelledBy: json['cancelledBy'] as String?,
  cancelledAt: json['cancelledAt'] == null
      ? null
      : DateTime.parse(json['cancelledAt'] as String),
  deliveredAt: json['deliveredAt'] == null
      ? null
      : DateTime.parse(json['deliveredAt'] as String),
  paymentId: json['paymentId'] as String?,
  transactionId: json['transactionId'] as String?,
  razorpayDetails: json['razorpayDetails'] == null
      ? null
      : RazorpayDetailsType.fromJson(
          json['razorpayDetails'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$OrderTypeToJson(OrderType instance) => <String, dynamic>{
  '_id': instance.id,
  'userId': instance.userId.toJson(),
  'orderNumber': instance.orderNumber,
  'items': instance.items.map((e) => e.toJson()).toList(),
  'subTotal': instance.subTotal,
  'totalTax': instance.totalTax,
  'shippingCharges': instance.shippingCharges,
  'handlingCharge': instance.handlingCharge,
  'deliveryCharge': instance.deliveryCharge,
  'totalAmount': instance.totalAmount,
  'assignedDeliveryBoy': instance.assignedDeliveryBoy?.toJson(),
  'shippingAddress': instance.shippingAddress.toJson(),
  'billingAddress': instance.billingAddress?.toJson(),
  'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
  'paymentStatus': _$PaymentStatusEnumMap[instance.paymentStatus]!,
  'status': _$OrderStatusEnumMap[instance.status]!,
  'tracking': instance.tracking.map((e) => e.toJson()).toList(),
  'appliedPromo': instance.appliedPromo?.toJson(),
  'expectedDeliveryDate': instance.expectedDeliveryDate?.toIso8601String(),
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  '__v': instance.v,
  'notes': instance.notes,
  'cancellationReason': instance.cancellationReason,
  'cancelledBy': instance.cancelledBy,
  'cancelledAt': instance.cancelledAt?.toIso8601String(),
  'deliveredAt': instance.deliveredAt?.toIso8601String(),
  'paymentId': instance.paymentId,
  'transactionId': instance.transactionId,
  'razorpayDetails': instance.razorpayDetails?.toJson(),
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.COD: 'cod',
  PaymentMethod.ONLINE: 'online',
  PaymentMethod.WALLET: 'wallet',
  PaymentMethod.WALLET_ONLINE: 'wallet_online',
  PaymentMethod.WALLET_COD: 'wallet_cod',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.PENDING: 'PENDING',
  PaymentStatus.PAID: 'PAID',
  PaymentStatus.FAILED: 'FAILED',
  PaymentStatus.REFUNDED: 'REFUNDED',
};

const _$OrderStatusEnumMap = {
  OrderStatus.PENDING: 'PENDING',
  OrderStatus.CONFIRMED: 'CONFIRMED',
  OrderStatus.PROCESSING: 'PROCESSING',
  OrderStatus.SHIPPED: 'SHIPPED',
  OrderStatus.OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  OrderStatus.DELIVERED: 'DELIVERED',
  OrderStatus.CANCELLED: 'CANCELLED',
  OrderStatus.REFUNDED: 'REFUNDED',
  OrderStatus.FAILED: 'FAILED',
  OrderStatus.ACCEPTED: 'ACCEPTED',
  OrderStatus.REJECTED: 'REJECTED',
  OrderStatus.RETURNED: 'RETURNED',
};

RazorpayDetailsType _$RazorpayDetailsTypeFromJson(Map<String, dynamic> json) =>
    RazorpayDetailsType(
      razorpay_order_id: json['razorpay_order_id'] as String?,
      razorpay_payment_id: json['razorpay_payment_id'] as String?,
      razorpay_signature: json['razorpay_signature'] as String?,
    );

Map<String, dynamic> _$RazorpayDetailsTypeToJson(
  RazorpayDetailsType instance,
) => <String, dynamic>{
  'razorpay_order_id': instance.razorpay_order_id,
  'razorpay_payment_id': instance.razorpay_payment_id,
  'razorpay_signature': instance.razorpay_signature,
};

ProductSummary _$ProductSummaryFromJson(Map<String, dynamic> json) =>
    ProductSummary(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      mainImage: json['mainImage'] as String?,
    );

Map<String, dynamic> _$ProductSummaryToJson(ProductSummary instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'mainImage': instance.mainImage,
    };

OrderItemType _$OrderItemTypeFromJson(Map<String, dynamic> json) =>
    OrderItemType(
      productId: ProductSummary.fromJson(
        json['productId'] as Map<String, dynamic>,
      ),
      variantId: json['variantId'] as String,
      productName: json['productName'] as String,
      variantTitle: json['variantTitle'] as String?,
      sku: json['sku'] as String,
      price: (json['price'] as num).toDouble(),
      quantity: (json['quantity'] as num).toInt(),
      discountPercent: (json['discountPercent'] as num).toDouble(),
      discountedPrice: (json['discountedPrice'] as num).toDouble(),
      taxRate: $enumDecode(_$TaxRateTypeEnumMap, json['taxRate']),
      tax: (json['tax'] as num?)?.toDouble() ?? 0,
      totalPrice: (json['totalPrice'] as num).toDouble(),
      image: json['image'] as String?,
    );

Map<String, dynamic> _$OrderItemTypeToJson(OrderItemType instance) =>
    <String, dynamic>{
      'productId': instance.productId.toJson(),
      'variantId': instance.variantId,
      'productName': instance.productName,
      'variantTitle': instance.variantTitle,
      'sku': instance.sku,
      'price': instance.price,
      'quantity': instance.quantity,
      'discountPercent': instance.discountPercent,
      'discountedPrice': instance.discountedPrice,
      'taxRate': _$TaxRateTypeEnumMap[instance.taxRate]!,
      'tax': instance.tax,
      'totalPrice': instance.totalPrice,
      'image': instance.image,
    };

const _$TaxRateTypeEnumMap = {
  TaxRateType.GST_5: 'gst_5',
  TaxRateType.GST_12: 'gst_12',
  TaxRateType.GST_18: 'gst_18',
  TaxRateType.GST_28: 'gst_28',
  TaxRateType.GST_40: 'gst_40',
};

UserInfoType _$UserInfoTypeFromJson(Map<String, dynamic> json) => UserInfoType(
  id: json['_id'] as String,
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  fullName: json['fullName'] as String?,
  isLocked: json['isLocked'] as bool?,
);

Map<String, dynamic> _$UserInfoTypeToJson(UserInfoType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'email': instance.email,
      'phone': instance.phone,
      'fullName': instance.fullName,
      'isLocked': instance.isLocked,
    };

ShippingAddressType _$ShippingAddressTypeFromJson(Map<String, dynamic> json) =>
    ShippingAddressType(
      fullName: json['fullName'] as String,
      phone: json['phone'] as String,
      alternatePhone: json['alternatePhone'] as String?,
      addressLine1: json['addressLine1'] as String,
      addressLine2: json['addressLine2'] as String?,
      googleLocation: json['googleLocation'] as String?,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      country: json['country'] as String,
      landmark: json['landmark'] as String?,
    );

Map<String, dynamic> _$ShippingAddressTypeToJson(
  ShippingAddressType instance,
) => <String, dynamic>{
  'fullName': instance.fullName,
  'phone': instance.phone,
  'alternatePhone': instance.alternatePhone,
  'addressLine1': instance.addressLine1,
  'addressLine2': instance.addressLine2,
  'googleLocation': instance.googleLocation,
  'city': instance.city,
  'state': instance.state,
  'pincode': instance.pincode,
  'country': instance.country,
  'landmark': instance.landmark,
};

OrderTrackingType _$OrderTrackingTypeFromJson(Map<String, dynamic> json) =>
    OrderTrackingType(
      status: $enumDecode(_$OrderStatusEnumMap, json['status']),
      timestamp: DateTime.parse(json['timestamp'] as String),
      comment: json['comment'] as String?,
      updatedBy: json['updatedBy'] as String?,
    );

Map<String, dynamic> _$OrderTrackingTypeToJson(OrderTrackingType instance) =>
    <String, dynamic>{
      'status': _$OrderStatusEnumMap[instance.status]!,
      'timestamp': instance.timestamp.toIso8601String(),
      'comment': instance.comment,
      'updatedBy': instance.updatedBy,
    };

OrderPromo _$OrderPromoFromJson(Map<String, dynamic> json) => OrderPromo(
  code: json['code'] as String?,
  discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
);

Map<String, dynamic> _$OrderPromoToJson(OrderPromo instance) =>
    <String, dynamic>{
      'code': instance.code,
      'discountAmount': instance.discountAmount,
    };
