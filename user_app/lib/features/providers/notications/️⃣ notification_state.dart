import 'package:Quickzon/features/models/notication/notification_model.dart';



class NotificationState {
  final List<AppNotification> notifications;
  final int unreadCount;

  const NotificationState({
    required this.notifications,
    required this.unreadCount,
  });

  factory NotificationState.initial() {
    return const NotificationState(
      notifications: [],
      unreadCount: 0,
    );
  }
}
