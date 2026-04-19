import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/screens/screens.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // ✅ Create a notifier to rebuild router when auth state changes
  final authState = ValueNotifier<AsyncValue<DeliveryBoyProfileData?>>(
    ref.read(authControllerProvider),
  );

  ref.listen(authControllerProvider, (previous, next) {
    authState.value = next;
  });

  return GoRouter(
    initialLocation: '/',
    refreshListenable: authState,
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) {
          final tab = state.uri.queryParameters['tab'] ?? 'upcoming';
          return HomeScreen(initialTab: tab);
        },
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/order-details/:orderId',
        name: 'order-details',
        builder: (context, state) {
          final orderId = state.pathParameters['orderId']!;
          return OrderDetailsScreen(orderId: orderId);
        },
      ),
    ],
    redirect: (context, state) {
      // ✅ Get the current auth state
      final auth = authState.value;

      // ✅ Check if we're still loading initial auth state
      if (auth.isLoading && !auth.hasValue) {
        // Show loading screen or return null to stay on current route
        return null;
      }

      // ✅ Check if user is logged in
      final isLoggedIn = auth.hasValue && auth.value != null;

      // ✅ Define auth routes
      final isAuthRoute = [
        '/login',
        '/register',
        '/verify-otp',
        '/forgot-password',
      ].contains(state.matchedLocation);

      // ✅ Logged in → block auth screens
      if (isLoggedIn && isAuthRoute) {
        return '/?tab=upcoming';
      }

      // ✅ Not logged in → redirect to login (except for auth routes)
      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }

      // ✅ No redirect needed
      return null;
    },
  );
});