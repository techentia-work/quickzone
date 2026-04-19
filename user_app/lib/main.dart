import 'package:Quickzon/features/providers/bootstrap_provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_storage/get_storage.dart';
import 'package:device_preview/device_preview.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'core/routes/app_routes.dart';
import 'core/themes/app_theme.dart';
import 'core/services/push_notification_service.dart';

/// 🔔 BACKGROUND NOTIFICATION HANDLER (VERY IMPORTANT)
@pragma('vm:entry-point')
Future<void> firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}


Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ENV + STORAGE
  await dotenv.load(fileName: ".env");
  await GetStorage.init();

  // 🔥 FIREBASE INIT
  await Firebase.initializeApp();

  // 🔔 Background notifications
  FirebaseMessaging.onBackgroundMessage(firebaseBackgroundHandler);

  // 🔔 Foreground / local notifications init
  await PushNotificationService.init();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      systemNavigationBarColor: Colors.white,
      systemNavigationBarDividerColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(
    const ProviderScope(
      child: BootstrapGate(),
    ),
  );
}
class BootstrapGate extends ConsumerStatefulWidget {
  const BootstrapGate({super.key});

  @override
  ConsumerState<BootstrapGate> createState() => _BootstrapGateState();
}

class _BootstrapGateState extends ConsumerState<BootstrapGate> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(bootstrapProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    return const MyApp();
  }
}


class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.read(routerProvider);

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Quickzon',
      useInheritedMediaQuery: true,
      locale: DevicePreview.locale(context),
      builder: DevicePreview.appBuilder,
      theme: AppTheme.lightTheme.copyWith(
        scaffoldBackgroundColor: Colors.white,
      ),
      routerConfig: router,
    );
  }
}
