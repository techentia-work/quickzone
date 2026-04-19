// lib/core/services/push_notification_service.dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';
import 'package:flutter/foundation.dart';

class PushNotificationService {
  static final FlutterLocalNotificationsPlugin _local = FlutterLocalNotificationsPlugin();
  static int _notificationId = 0; // ✅ Auto-increment for unique IDs

  static Future<void> init() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(android: android, iOS: ios);

    await _local.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    debugPrint('✅ Push Notification Service Initialized');
  }

  static Future<bool> requestPermission() async {
    if (Platform.isIOS) {
      final ios = await _local
          .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return ios ?? false;
    }

    if (Platform.isAndroid) {
      final status = await Permission.notification.request();
      debugPrint('📱 Notification Permission: ${status.isGranted ? "Granted" : "Denied"}');
      return status.isGranted;
    }

    return false;
  }

  /// ✅ Show local notification
  static Future<void> show({
    required String title,
    required String body,
    Map<String, String>? payload,
  }) async {
    final id = _notificationId++;

    const androidDetails = AndroidNotificationDetails(
      'quickzone_order_alert_v2', // Changed ID to ensure channel update
      'Order Alerts',
      channelDescription: 'Loud alerts for new orders',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      sound: RawResourceAndroidNotificationSound('order_alert'),
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      sound: 'default',
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _local.show(
      id,
      title,
      body,
      details,
      payload: payload?.entries.map((e) => '${e.key}:${e.value}').join('|'),
    );

    debugPrint('📬 Push notification shown: $title');
  }

  /// ✅ Handle notification tap
  static void _onNotificationTapped(NotificationResponse response) {
    debugPrint('🔔 Notification tapped: ${response.payload}');

    if (response.payload != null) {
      final payloadMap = <String, String>{};
      for (var entry in response.payload!.split('|')) {
        final parts = entry.split(':');
        if (parts.length == 2) {
          payloadMap[parts[0]] = parts[1];
        }
      }

      // ✅ Navigate to order details or notification screen
      // You can use a global navigator key or deep linking here
      debugPrint('📦 Payload: $payloadMap');

      // Example: Navigate to order screen
      // final orderId = payloadMap['orderId'];
      // if (orderId != null && orderId.isNotEmpty) {
      //   navigatorKey.currentState?.pushNamed('/order-details', arguments: orderId);
      // }
    }
  }

  /// ✅ Cancel all notifications
  static Future<void> cancelAll() async {
    await _local.cancelAll();
    debugPrint('🗑️ All notifications cancelled');
  }

  /// ✅ Cancel specific notification
  static Future<void> cancel(int id) async {
    await _local.cancel(id);
    debugPrint('🗑️ Notification $id cancelled');
  }
}