import 'package:Quickzon/features/models/notication/notification_model.dart';
import 'package:Quickzon/features/providers/notications/navigation_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'notification_provider.dart';
import 'package:flutter/material.dart';

class NotificationController {
  static void addFromSocket(
      WidgetRef ref,
      Map<String, dynamic> data,
      ) {
    final notification = AppNotification.fromJson(data);

    // 1️⃣ List update
    ref.read(notificationListProvider.notifier).state = [
      notification,
      ...ref.read(notificationListProvider),
    ];

    // 2️⃣ Unread count
    if (!notification.read) {
      ref.read(notificationUnreadCountProvider.notifier).state++;
    }

    // 3️⃣ Snackbar (website toast jaisa)
    _showSnackbar(ref, notification);
  }

  static void markAllRead(WidgetRef ref) {
    final list = ref.read(notificationListProvider);

    ref.read(notificationListProvider.notifier).state =
        list.map((n) => n.copyWith(read: true)).toList();

    ref.read(notificationUnreadCountProvider.notifier).state = 0;
  }

  static void _showSnackbar(WidgetRef ref, AppNotification n) {
    final messenger =
    ScaffoldMessenger.of(ref.read(navigatorKeyProvider).currentContext!);

    messenger.showSnackBar(
      SnackBar(
        content: Text('${n.title}\n${n.body}'),
        backgroundColor: _colorByType(n.type),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  static Color _colorByType(String type) {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return Colors.blue;
      case 'ORDER_DELIVERED':
        return Colors.green;
      case 'PAYMENT_SUCCESS':
        return Colors.green;
      case 'PAYMENT_FAILED':
        return Colors.red;
      default:
        return Colors.black87;
    }
  }
}
