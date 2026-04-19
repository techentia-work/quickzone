import 'package:json_annotation/json_annotation.dart';
import './notification_model.dart';

part 'notification_payload.g.dart';

@JsonSerializable()
class NotificationListResponse {
  final List<QCNotification> notifications;
  final int unreadCount;

  NotificationListResponse({required this.notifications, required this.unreadCount});

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) =>
      NotificationListResponse(
        notifications: (json['notifications'] as List)
            .map((e) => QCNotification.fromJson(e as Map<String, dynamic>))
            .toList(),
        unreadCount: json['unreadCount'] as int,
      );

  Map<String, dynamic> toJson() => {
    'notifications': notifications.map((e) => e.toJson()).toList(),
    'unreadCount': unreadCount,
  };
}