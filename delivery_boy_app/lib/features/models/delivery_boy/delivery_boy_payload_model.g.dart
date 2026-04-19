// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery_boy_payload_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeliveryBoyLoginRequest _$DeliveryBoyLoginRequestFromJson(
  Map<String, dynamic> json,
) => DeliveryBoyLoginRequest(
  email: json['email'] as String,
  password: json['password'] as String,
);

Map<String, dynamic> _$DeliveryBoyLoginRequestToJson(
  DeliveryBoyLoginRequest instance,
) => <String, dynamic>{'email': instance.email, 'password': instance.password};

AcceptRejectOrderRequest _$AcceptRejectOrderRequestFromJson(
  Map<String, dynamic> json,
) => AcceptRejectOrderRequest(
  orderId: json['orderId'] as String,
  reason: json['reason'] as String?,
);

Map<String, dynamic> _$AcceptRejectOrderRequestToJson(
  AcceptRejectOrderRequest instance,
) => <String, dynamic>{'orderId': instance.orderId, 'reason': instance.reason};

UpdateDeliveryStatusRequest _$UpdateDeliveryStatusRequestFromJson(
  Map<String, dynamic> json,
) => UpdateDeliveryStatusRequest(
  orderId: json['orderId'] as String,
  status: json['status'] as String,
  deliveryNotes: json['deliveryNotes'] as String?,
  deliveryProof: json['deliveryProof'] as String?,
);

Map<String, dynamic> _$UpdateDeliveryStatusRequestToJson(
  UpdateDeliveryStatusRequest instance,
) => <String, dynamic>{
  'orderId': instance.orderId,
  'status': instance.status,
  'deliveryNotes': instance.deliveryNotes,
  'deliveryProof': instance.deliveryProof,
};

DeliveryBoyLoginResponseData _$DeliveryBoyLoginResponseDataFromJson(
  Map<String, dynamic> json,
) => DeliveryBoyLoginResponseData(
  id: json['id'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String,
  status: json['status'] as String,
  deliveryCode: json['deliveryCode'] as String,
  assignedOrdersCount: (json['assignedOrdersCount'] as num).toInt(),
);

Map<String, dynamic> _$DeliveryBoyLoginResponseDataToJson(
  DeliveryBoyLoginResponseData instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'phone': instance.phone,
  'status': instance.status,
  'deliveryCode': instance.deliveryCode,
  'assignedOrdersCount': instance.assignedOrdersCount,
};

AssignedOrdersResponseData _$AssignedOrdersResponseDataFromJson(
  Map<String, dynamic> json,
) => AssignedOrdersResponseData(
  orders: (json['orders'] as List<dynamic>)
      .map((e) => OrderType.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: (json['count'] as num).toInt(),
);

Map<String, dynamic> _$AssignedOrdersResponseDataToJson(
  AssignedOrdersResponseData instance,
) => <String, dynamic>{
  'orders': instance.orders.map((e) => e.toJson()).toList(),
  'count': instance.count,
};

OrderActionResponseData _$OrderActionResponseDataFromJson(
  Map<String, dynamic> json,
) => OrderActionResponseData(
  order: OrderActionOrder.fromJson(json['order'] as Map<String, dynamic>),
  deliveryBoy: OrderActionDeliveryBoy.fromJson(
    json['deliveryBoy'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$OrderActionResponseDataToJson(
  OrderActionResponseData instance,
) => <String, dynamic>{
  'order': instance.order.toJson(),
  'deliveryBoy': instance.deliveryBoy.toJson(),
};

OrderActionOrder _$OrderActionOrderFromJson(Map<String, dynamic> json) =>
    OrderActionOrder(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      status: json['status'] as String,
      deliveredAt: json['deliveredAt'] == null
          ? null
          : DateTime.parse(json['deliveredAt'] as String),
    );

Map<String, dynamic> _$OrderActionOrderToJson(OrderActionOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderNumber': instance.orderNumber,
      'status': instance.status,
      'deliveredAt': instance.deliveredAt?.toIso8601String(),
    };

OrderActionDeliveryBoy _$OrderActionDeliveryBoyFromJson(
  Map<String, dynamic> json,
) => OrderActionDeliveryBoy(
  id: json['id'] as String,
  name: json['name'] as String,
  status: json['status'] as String,
  activeOrders: (json['activeOrders'] as num).toInt(),
);

Map<String, dynamic> _$OrderActionDeliveryBoyToJson(
  OrderActionDeliveryBoy instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'status': instance.status,
  'activeOrders': instance.activeOrders,
};
