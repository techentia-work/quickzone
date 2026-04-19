import 'package:json_annotation/json_annotation.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';

part 'notification_model.g.dart';

/// Notification Model
@JsonSerializable(explicitToJson: true)
class QCNotification {
  @JsonKey(name: '_id')
  final String? id;
  final String? userId;
  final String? vendorId;
  final String? driverId;
  final bool isForAdmin;
  final String title;
  final String body;
  final QCNotificationType type;
  final String? orderId;
  final Map<String, dynamic>? meta;
  final bool read;
  final DateTime createdAt;

  QCNotification({
    this.id,
    this.userId,
    this.vendorId,
    this.driverId,
    this.isForAdmin = false,
    required this.title,
    required this.body,
    required this.type,
    this.orderId,
    this.meta,
    this.read = false,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory QCNotification.fromJson(Map<String, dynamic> json) =>
      _$QCNotificationFromJson(json);

  Map<String, dynamic> toJson() => _$QCNotificationToJson(this);
}

extension QCNotificationCopy on QCNotification {
  QCNotification copyWith({
    String? id,
    String? userId,
    String? vendorId,
    String? driverId,
    bool? isForAdmin,
    String? title,
    String? body,
    QCNotificationType? type,
    String? orderId,
    Map<String, dynamic>? meta,
    bool? read,
    DateTime? createdAt,
  }) {
    return QCNotification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      vendorId: vendorId ?? this.vendorId,
      driverId: driverId ?? this.driverId,
      isForAdmin: isForAdmin ?? this.isForAdmin,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      orderId: orderId ?? this.orderId,
      meta: meta ?? this.meta,
      read: read ?? this.read,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
