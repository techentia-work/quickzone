import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:get_storage/get_storage.dart';

/// Interceptor to automatically logout on 401 Unauthorized
class AuthInterceptor extends Interceptor {
  final Ref ref;
  final GlobalKey<NavigatorState> navigatorKey;
  bool _hasHandled401 = false;

  AuthInterceptor(this.ref, this.navigatorKey);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final statusCode = err.response?.statusCode;

    if (statusCode == 401 && !_hasHandled401) {
      final requestPath = err.requestOptions.path;

      // ✅ Don't trigger logout for auth endpoints
      final skipPaths = ['/delivery-boys/login', '/delivery-boys/register'];
      final shouldSkip = skipPaths.any((path) => requestPath.contains(path));

      if (!shouldSkip) {
        _hasHandled401 = true;

        try {
          // ✅ Check if user was actually logged in
          final wasLoggedIn = ref.read(authControllerProvider).value != null;

          // ✅ Clear local state
          final box = GetStorage();
          await box.remove('currentDeliveryBoy');

          // ✅ Update auth state
          ref.read(authControllerProvider.notifier).state =
          const AsyncValue.data(null);

          final context = navigatorKey.currentContext;
          if (context != null && context.mounted && wasLoggedIn) {
            // ✅ Get current route to avoid showing snackbar on auth pages
            final currentRoute = GoRouterState.of(context).uri.path;
            final authRoutes = ['/login', '/register', '/verify-otp'];
            final isOnAuthPage = authRoutes.any((r) => currentRoute.startsWith(r));

            // ✅ Only show snackbar if user was logged in and not on auth page
            if (!isOnAuthPage) {
              ref.read(snackbarProvider.notifier).showError(
                'Session expired. Please log in again.',
                duration: const Duration(seconds: 4),
              );

              // ✅ Redirect to login after a short delay
              Future.delayed(const Duration(milliseconds: 500), () {
                if (context.mounted) {
                  context.go('/login');
                }
              });
            }
          }
        } finally {
          // ✅ Reset flag after delay
          Future.delayed(const Duration(seconds: 3), () {
            _hasHandled401 = false;
          });
        }
      }
    }

    super.onError(err, handler);
  }
}