import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_core/firebase_core.dart';

class PushNotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
  FlutterLocalNotificationsPlugin();

  /// 🔥 Background handler
  @pragma('vm:entry-point')
  static Future<void> firebaseBackgroundHandler(RemoteMessage message) async {
    await Firebase.initializeApp();
  }

  /// Init Firebase Messaging
  static Future<void> init() async {
    // Permission
    await FirebaseMessaging.instance.requestPermission();

    // Android local notification init
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);

    await _localNotifications.initialize(initSettings);

    // Foreground notification
    FirebaseMessaging.onMessage.listen((message) {
      _showLocal(message);
    });

    // App opened from notification
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      print('➡️ Notification tapped: ${message.data}');
    });
  }

  /// Show local notification
  static Future<void> _showLocal(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const androidDetails = AndroidNotificationDetails(
      'order_channel',
      'Order Updates',
      importance: Importance.max,
      priority: Priority.high,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(android: androidDetails),
    );
  }

  /// 🔥 Get FCM token
  static Future<String?> getToken() async {
    return FirebaseMessaging.instance.getToken();
  }
}
