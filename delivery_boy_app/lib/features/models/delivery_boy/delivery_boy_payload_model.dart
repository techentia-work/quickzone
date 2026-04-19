import 'package:json_annotation/json_annotation.dart';
import 'package:quickzone_delivery/features/models/order/order_model.dart';

part 'delivery_boy_payload_model.g.dart';

/// 🧑‍💼 DELIVERY BOY — REQUEST PAYLOADS

/// Login payload
@JsonSerializable()
class DeliveryBoyLoginRequest {
  final String email;
  final String password;

  DeliveryBoyLoginRequest({
    required this.email,
    required this.password,
  });

  factory DeliveryBoyLoginRequest.fromJson(Map<String, dynamic> json) =>
      _$DeliveryBoyLoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$DeliveryBoyLoginRequestToJson(this);
}

/// Accept / Reject assigned order payload
@JsonSerializable()
class AcceptRejectOrderRequest {
  final String orderId;
  final String? reason;

  AcceptRejectOrderRequest({
    required this.orderId,
    this.reason,
  });

  factory AcceptRejectOrderRequest.fromJson(Map<String, dynamic> json) =>
      _$AcceptRejectOrderRequestFromJson(json);
  Map<String, dynamic> toJson() => _$AcceptRejectOrderRequestToJson(this);
}

@JsonSerializable()
class UpdateDeliveryStatusRequest {
  final String orderId;
  final String status;
  final String? deliveryNotes;
  final String? deliveryProof;

  UpdateDeliveryStatusRequest({
    required this.orderId,
    required this.status,
    this.deliveryNotes,
    this.deliveryProof,
  });

  factory UpdateDeliveryStatusRequest.fromJson(Map<String, dynamic> json) =>
      _$UpdateDeliveryStatusRequestFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateDeliveryStatusRequestToJson(this);
}

@JsonSerializable(explicitToJson: true)
class DeliveryBoyLoginResponseData {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String status;
  final String deliveryCode;
  final int assignedOrdersCount;

  DeliveryBoyLoginResponseData({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.status,
    required this.deliveryCode,
    required this.assignedOrdersCount,
  });

  factory DeliveryBoyLoginResponseData.fromJson(Map<String, dynamic> json) =>
      _$DeliveryBoyLoginResponseDataFromJson(json);
  Map<String, dynamic> toJson() => _$DeliveryBoyLoginResponseDataToJson(this);
}

/// -------- ASSIGNED ORDERS RESPONSE --------
/// Endpoint: GET /delivery-boy/orders/assigned
@JsonSerializable(explicitToJson: true)
class AssignedOrdersResponseData {
  final List<OrderType> orders;
  final int count;

  AssignedOrdersResponseData({
    required this.orders,
    required this.count,
  });

  factory AssignedOrdersResponseData.fromJson(Map<String, dynamic> json) =>
      _$AssignedOrdersResponseDataFromJson(json);
  Map<String, dynamic> toJson() => _$AssignedOrdersResponseDataToJson(this);
}

/// -------- ACCEPT / REJECT ORDER RESPONSE --------
/// Endpoint: POST /delivery-boy/orders/accept or /reject
@JsonSerializable(explicitToJson: true)
class OrderActionResponseData {
  final OrderActionOrder order;
  final OrderActionDeliveryBoy deliveryBoy;

  OrderActionResponseData({
    required this.order,
    required this.deliveryBoy,
  });

  factory OrderActionResponseData.fromJson(Map<String, dynamic> json) =>
      _$OrderActionResponseDataFromJson(json);
  Map<String, dynamic> toJson() => _$OrderActionResponseDataToJson(this);
}

@JsonSerializable()
class OrderActionOrder {
  final String id;
  final String orderNumber;
  final String status;
  final DateTime? deliveredAt;

  OrderActionOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.deliveredAt,
  });

  factory OrderActionOrder.fromJson(Map<String, dynamic> json) =>
      _$OrderActionOrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderActionOrderToJson(this);
}

@JsonSerializable()
class OrderActionDeliveryBoy {
  final String id;
  final String name;
  final String status;
  final int activeOrders;

  OrderActionDeliveryBoy({
    required this.id,
    required this.name,
    required this.status,
    required this.activeOrders,
  });

  factory OrderActionDeliveryBoy.fromJson(Map<String, dynamic> json) =>
      _$OrderActionDeliveryBoyFromJson(json);
  Map<String, dynamic> toJson() => _$OrderActionDeliveryBoyToJson(this);
}
