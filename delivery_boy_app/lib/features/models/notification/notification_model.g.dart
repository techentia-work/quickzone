// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

QCNotification _$QCNotificationFromJson(Map<String, dynamic> json) =>
    QCNotification(
      id: json['_id'] as String?,
      userId: json['userId'] as String?,
      vendorId: json['vendorId'] as String?,
      driverId: json['driverId'] as String?,
      isForAdmin: json['isForAdmin'] as bool? ?? false,
      title: json['title'] as String,
      body: json['body'] as String,
      type: $enumDecode(_$QCNotificationTypeEnumMap, json['type']),
      orderId: json['orderId'] as String?,
      meta: json['meta'] as Map<String, dynamic>?,
      read: json['read'] as bool? ?? false,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$QCNotificationToJson(QCNotification instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'vendorId': instance.vendorId,
      'driverId': instance.driverId,
      'isForAdmin': instance.isForAdmin,
      'title': instance.title,
      'body': instance.body,
      'type': _$QCNotificationTypeEnumMap[instance.type]!,
      'orderId': instance.orderId,
      'meta': instance.meta,
      'read': instance.read,
      'createdAt': instance.createdAt.toIso8601String(),
    };

const _$QCNotificationTypeEnumMap = {
  QCNotificationType.orderPlaced: 'ORDER_PLACED',
  QCNotificationType.orderConfirmed: 'ORDER_CONFIRMED',
  QCNotificationType.orderDispatched: 'ORDER_DISPATCHED',
  QCNotificationType.orderDelivered: 'ORDER_DELIVERED',
  QCNotificationType.orderCancelled: 'ORDER_CANCELLED',
  QCNotificationType.refundInitiated: 'REFUND_INITIATED',
  QCNotificationType.promotion: 'PROMOTION',
  QCNotificationType.systemAlert: 'SYSTEM_ALERT',
};
