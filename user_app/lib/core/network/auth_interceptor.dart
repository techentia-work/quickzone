import 'package:Quickzon/features/providers/providers.dart';
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

      // Skip handling for these paths:
      // 1. /auth/me - initial auth check (silent)
      // 2. /auth/login, /auth/register, etc. - auth endpoints
      final skipPaths = [
        '/auth/me',
        '/auth/login',
        '/auth/register',
        '/auth/verify-otp',
        '/auth/resend-otp',
        '/auth/forgot-password',
        '/auth/reset-password',
      ];

      final shouldSkip = skipPaths.any((path) => requestPath.contains(path));

      if (!shouldSkip) {
        _hasHandled401 = true;

        try {
          // Check if user was actually logged in
          final wasLoggedIn = ref.read(authControllerProvider).value != null;

          // Clear local state
          final box = GetStorage();
          await box.remove('currentUser');

          // Invalidate all user-specific providers
          ref.invalidate(authControllerProvider);
          ref.invalidate(cartControllerProvider);
          ref.invalidate(wishlistControllerProvider);
          // Add other user-specific providers here

          final context = navigatorKey.currentContext;
          if (context != null && context.mounted && wasLoggedIn) {
            // Get current route to avoid showing snackbar on auth pages
            final currentRoute = GoRouterState.of(context).uri.path;
            final authRoutes = ['/login', '/register', '/verify-otp'];
            final isOnAuthPage = authRoutes.any((r) => currentRoute.startsWith(r));

            // Only show snackbar if user was logged in and not on auth page
            if (!isOnAuthPage) {
              ScaffoldMessenger.of(context).clearSnackBars();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text(
                    'Session expired. Please log in again.',
                    style: TextStyle(color: Colors.white),
                  ),
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 3),
                  backgroundColor: Colors.redAccent,
                  margin: const EdgeInsets.all(16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              );

              // Redirect to login
              Future.delayed(const Duration(milliseconds: 300), () {
                if (context.mounted) {
                  context.go('/login');
                }
              });
            }
          }
        } finally {
          // Reset flag
          Future.delayed(const Duration(seconds: 2), () {
            _hasHandled401 = false;
          });
        }
      }
    }

    super.onError(err, handler);
  }
}