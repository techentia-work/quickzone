import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_storage/get_storage.dart';
import 'package:device_preview/device_preview.dart';
import 'package:quickzone_delivery/core/services/services.dart';
import 'core/routes/app_routes.dart';
import 'core/themes/app_theme.dart';
import 'features/widgets/snackbar/snackbar_listener.dart';
import 'features/providers/providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await GetStorage.init();

  // ✅ Initialize notifications
  await PushNotificationService.init();
  await PushNotificationService.requestPermission();

  runApp(
    ProviderScope(
      child: DevicePreview(
        enabled: false,
        builder: (context) => const MyApp(),
      ),
    ),
  );
}

class MyApp extends ConsumerStatefulWidget {
  const MyApp({super.key});

  @override
  ConsumerState<MyApp> createState() => _MyAppState();
}

class _MyAppState extends ConsumerState<MyApp> {
  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    // ✅ Use ref.listen inside build method
    ref.listen(authControllerProvider, (previous, next) {
      next.whenData((user) {
        if (user != null) {
          _initializeSocket(user.id ?? '');
        } else {
          final socketService = ref.read(socketServiceProvider);
          socketService.disconnect();
        }
      });
    });

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Quickzon',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      builder: (context, child) {
        return SnackbarListener(
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }

  void _initializeSocket(String userId) {
    final socketService = ref.read(socketServiceProvider);

    if (!socketService.isConnected) {
      socketService.connect(
        userId: userId,
        userType: 'driver',
      );

      // ✅ Listen for notifications and show push notification
      socketService.addNotificationListener((notification) async {
        debugPrint('🔔 Notification received: ${notification['title']}');

        // Add to notification list
        ref.read(notificationControllerProvider.notifier).addNotification(notification);

        final title = notification['title'] as String? ?? 'New notification';
        final body = notification['body'] as String? ?? '';
        final notificationType = notification['type'] as String?;

        // ✅ Show local push notification
        await PushNotificationService.show(
          title: title,
          body: body,
          payload: {
            'type': notificationType ?? 'unknown',
            'orderId': notification['order']?.toString() ?? '',
            'notificationId': notification['_id']?.toString() ?? '',
          },
        );

        // Show in-app snackbar based on type
        if (!mounted) return;

        if (notificationType == 'SYSTEM_ALERT') {
          ref.read(snackbarProvider.notifier).showWarning(
            '$title: $body',
            duration: const Duration(seconds: 6),
          );
        } else if (notificationType == 'ORDER_CONFIRMED') {
          ref.read(snackbarProvider.notifier).showSuccess(
            '$title: $body',
            duration: const Duration(seconds: 5),
          );
        } else if (notificationType == 'ORDER_DISPATCHED') {
          ref.read(snackbarProvider.notifier).showInfo(
            '$title: $body',
            duration: const Duration(seconds: 5),
          );
        } else if (notificationType == 'ORDER_DELIVERED') {
          ref.read(snackbarProvider.notifier).showSuccess(
            '$title: $body',
            duration: const Duration(seconds: 4),
          );
        } else {
          ref.read(snackbarProvider.notifier).showInfo(
            '$title: $body',
            duration: const Duration(seconds: 4),
          );
        }
      });

      socketService.addConnectionListener((isConnected) {
        if (isConnected) {
          debugPrint('✅ Socket connected successfully');
        } else {
          debugPrint('❌ Socket disconnected');
        }
      });
    }
  }
}