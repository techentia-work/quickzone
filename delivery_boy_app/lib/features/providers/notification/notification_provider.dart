import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:quickzone_delivery/features/repositories/repositories.dart';

class NotificationController extends AsyncNotifier<NotificationListResponse> {
  @override
  Future<NotificationListResponse> build() async {
    return _fetchNotifications();
  }

  Future<NotificationListResponse> _fetchNotifications() async {
    try {
      final repository = ref.read(notificationRepositoryProvider);
      final res = await repository.getNotifications();
      return res.success && res.data != null
          ? res.data!
          : NotificationListResponse(notifications: [], unreadCount: 0);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return NotificationListResponse(notifications: [], unreadCount: 0);
    }
  }

  /// Add new notification (from socket)
  void addNotification(Map<String, dynamic> notificationJson) {
    final newNotification = QCNotification.fromJson(notificationJson);
    final current = state.value ?? NotificationListResponse(notifications: [], unreadCount: 0);

    final updatedNotifications = [newNotification, ...current.notifications];
    final updatedUnreadCount = current.unreadCount + (newNotification.read ? 0 : 1);

    state = AsyncValue.data(
      NotificationListResponse(
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount,
      ),
    );

    // Optional: show snackbar based on type
    final type = newNotification.type.name; // or string conversion
    final title = newNotification.title;
    final body = newNotification.body;

    if (type == 'SYSTEM_ALERT') {
      ref.read(snackbarProvider.notifier).showWarning('$title: $body', duration: const Duration(seconds: 6));
    } else if (type == 'ORDER_CONFIRMED') {
      ref.read(snackbarProvider.notifier).showSuccess('$title: $body', duration: const Duration(seconds: 5));
    } else if (type == 'ORDER_DISPATCHED') {
      ref.read(snackbarProvider.notifier).showInfo('$title: $body', duration: const Duration(seconds: 5));
    } else if (type == 'ORDER_DELIVERED') {
      ref.read(snackbarProvider.notifier).showSuccess('$title: $body', duration: const Duration(seconds: 4));
    } else {
      ref.read(snackbarProvider.notifier).showInfo('$title: $body', duration: const Duration(seconds: 4));
    }

    refreshNotifications();
  }

  /// Mark a single notification as read
  Future<void> markAsRead(String notificationId) async {
    final current = state.value;
    if (current == null) return;

    final updatedNotifications = current.notifications.map((n) {
      if (n.id == notificationId && !n.read) return n.copyWith(read: true);
      return n;
    }).toList();

    final unreadCount = updatedNotifications.where((n) => !n.read).length;

    state = AsyncValue.data(NotificationListResponse(
      notifications: updatedNotifications,
      unreadCount: unreadCount,
    ));

    ref.read(snackbarProvider.notifier).showSuccess('Notification marked as read', duration: const Duration(seconds: 2));
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    final current = state.value;
    if (current == null) return;

    final updatedNotifications = current.notifications.map((n) => n.copyWith(read: true)).toList();

    state = AsyncValue.data(NotificationListResponse(
      notifications: updatedNotifications,
      unreadCount: 0,
    ));

    ref.read(snackbarProvider.notifier).showSuccess('All notifications marked as read', duration: const Duration(seconds: 2));
  }

  /// Refresh notifications manually
  Future<void> refreshNotifications() async {
    state = const AsyncValue.loading();
    final data = await _fetchNotifications();
    state = AsyncValue.data(data);
  }
}

final notificationControllerProvider = AsyncNotifierProvider<NotificationController, NotificationListResponse>(NotificationController.new);
