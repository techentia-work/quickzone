// 4. lib/features/widgets/notification_bell.dart
// ============================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';

class NotificationBell extends ConsumerWidget {
  const NotificationBell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationState = ref.watch(notificationControllerProvider);
    final unreadCount = notificationState.value?.unreadCount??0;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () {
            _showNotificationPanel(context, ref);
          },
        ),
        if (unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 18,
                minHeight: 18,
              ),
              child: Center(
                child: Text(
                  unreadCount > 99 ? '99+' : '$unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  void _showNotificationPanel(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const NotificationPanel(),
    );
  }
}

class NotificationPanel extends ConsumerWidget {
  const NotificationPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationState = ref.watch(notificationControllerProvider);
    final notifications = notificationState.value?.notifications??[];

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey[200]!),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Notifications',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (notifications.isNotEmpty)
                  TextButton(
                    onPressed: () {
                      ref.read(notificationControllerProvider.notifier).markAllAsRead();
                    },
                    child: const Text('Mark all as read'),
                  ),
              ],
            ),
          ),

          // Notifications list
          Expanded(
            child: notifications.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none,
                      size: 64,
                      color: Colors.grey[400]
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No notifications yet',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            )
                : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final notification = notifications[index];
                final isRead = notification.read;

                return InkWell(
                  onTap: () {
                    if (!isRead) {
                      ref.read(notificationControllerProvider.notifier).markAllAsRead();
                    }
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isRead ? Colors.white : Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _getNotificationIcon(notification.type.name), // adjust if type is enum
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notification.title,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: isRead ? FontWeight.w500 : FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                notification.body,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey[600],
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _formatTime(notification.createdAt),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.blue,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                  ),
                );

              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _getNotificationIcon(String? type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'ORDER_CONFIRMED':
        icon = Icons.check_circle_outline;
        color = Colors.green;
        break;
      case 'ORDER_DISPATCHED':
        icon = Icons.local_shipping_outlined;
        color = Colors.blue;
        break;
      case 'ORDER_DELIVERED':
        icon = Icons.done_all;
        color = Colors.green;
        break;
      case 'SYSTEM_ALERT':
        icon = Icons.warning_amber_outlined;
        color = Colors.orange;
        break;
      default:
        icon = Icons.notifications_outlined;
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  String _formatTime(dynamic timestamp) {
    if (timestamp == null) return '';

    try {
      final DateTime time = timestamp is DateTime
          ? timestamp
          : DateTime.parse(timestamp.toString());

      final now = DateTime.now();
      final difference = now.difference(time);

      if (difference.inMinutes < 1) {
        return 'Just now';
      } else if (difference.inHours < 1) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inDays < 1) {
        return '${difference.inHours}h ago';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}d ago';
      } else {
        return '${time.day}/${time.month}/${time.year}';
      }
    } catch (e) {
      return '';
    }
  }
}