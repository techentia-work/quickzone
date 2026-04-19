import 'package:json_annotation/json_annotation.dart';

/// Notification Action Enum
@JsonEnum(alwaysCreate: true)
enum NotificationAction {
  @JsonValue('order_placed')
  orderPlaced,

  @JsonValue('order_cancelled')
  orderCancelled,

  @JsonValue('order_completed')
  orderCompleted,

  @JsonValue('admin_new_order')
  adminNewOrder,

  @JsonValue('user_order_status_updated')
  userOrderStatusUpdated,

  @JsonValue('user_refund_initiated')
  userRefundInitiated,

  @JsonValue('delivery_boy_unassigned')
  deliveryBoyUnassigned,

  @JsonValue('delivery_boy_created')
  deliveryBoyCreated,

  @JsonValue('order_accepted_by_delivery_boy')
  orderAcceptedByDeliveryBoy,

  @JsonValue('order_rejected_by_delivery_boy')
  orderRejectedByDeliveryBoy,

  @JsonValue('delivery_partner_assigned')
  deliveryPartnerAssigned,

  @JsonValue('order_dispatched')
  orderDispatched,

  @JsonValue('order_delivered_confirmation')
  orderDeliveredConfirmation,

  @JsonValue('delivery_partner_changed')
  deliveryPartnerChanged,

  @JsonValue('order_assignment_confirmation')
  orderAssignmentConfirmation,
}

/// Notification Type Enum
@JsonEnum(alwaysCreate: true)
enum QCNotificationType {
  @JsonValue('ORDER_PLACED')
  orderPlaced,

  @JsonValue('ORDER_CONFIRMED')
  orderConfirmed,

  @JsonValue('ORDER_DISPATCHED')
  orderDispatched,

  @JsonValue('ORDER_DELIVERED')
  orderDelivered,

  @JsonValue('ORDER_CANCELLED')
  orderCancelled,

  @JsonValue('REFUND_INITIATED')
  refundInitiated,

  @JsonValue('PROMOTION')
  promotion,

  @JsonValue('SYSTEM_ALERT')
  systemAlert,
}