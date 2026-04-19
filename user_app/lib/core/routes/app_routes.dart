// core/routes/app_routes.dart
import 'package:Quickzon/core/network/dio_client.dart';
import 'package:Quickzon/features/models/featured/featured_week_brand_model.dart';
import 'package:Quickzon/features/models/featured/shop_by_store_model.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/models/showcase_product/showcase_product_model.dart';
import 'package:Quickzon/features/providers/providers.dart';
import 'package:Quickzon/features/screens/about/about_us_page.dart';
import 'package:Quickzon/features/screens/categories/categories_page.dart';
import 'package:Quickzon/features/screens/help/help_support_page.dart';
import 'package:Quickzon/features/screens/home/_widgets/featured_week_products_screen.dart';
import 'package:Quickzon/features/screens/home/_widgets/shop_by_store_products_screen.dart';
import 'package:Quickzon/features/screens/order/repeat_order_loader_page.dart';
import 'package:Quickzon/features/screens/payment/payment_page.dart';
import 'package:Quickzon/features/screens/payment/payment_processing_page.dart';
import 'package:Quickzon/features/screens/privacy/privacy_policy_page.dart';
import 'package:Quickzon/features/screens/return/return_policy_page.dart';
import 'package:Quickzon/features/screens/terms/terms_conditions_page.dart';
import 'package:Quickzon/features/screens/wallet/wallet_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:get_storage/get_storage.dart';

import 'package:Quickzon/features/widgets/shell/main_shell.dart';
import 'package:Quickzon/core/utils/enums/auth_enum.dart';
import '../../features/screens/screens.dart';      // <-- Optional
import '../../features/screens/error/no_internet_screen.dart';
import '../../core/services/connectivity_service.dart';

final box = GetStorage();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: '/splash',
    routes: [
      // ==================== MAIN SHELL (with bottom nav) ====================
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),

          GoRoute(
            path: '/wishlist',
            builder: (context, state) => const WishlistScreen(),
          ),

          GoRoute(
            path: '/repeat',
            name: 'repeat-order',
            builder: (context, state) {
              return const RepeatOrderPage();
            },
          ),

          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),

          GoRoute(
            path: '/categories',
            builder: (context, state) => const CategoryPage(),
          ),

          GoRoute(
            path: '/help-support',
            builder: (context, state) => const HelpSupportPage(),
          ),
        ],
      ),

      // ==================== NON-SHELL ROUTES (no bottom nav) ====================

      GoRoute(
        path: '/cart',
        builder: (context, state) => const CartPage(),
      ),

      // No Internet Screen
      GoRoute(
        path: '/no-internet',
        builder: (context, state) => const NoInternetScreen(),
      ),



      GoRoute(
        path: '/wallet',
        name: 'wallet',
        builder: (context, state) => const WalletPage(),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/category/:categoryId',
        builder: (context, state) {
          final categoryId = state.pathParameters['categoryId']!;
          return CategoryProductsScreen(categoryId: categoryId);
        },
      ),
      GoRoute(
        path: '/category/:categoryId/:subcategoryId',
        builder: (context, state) {
          final categoryId = state.pathParameters['categoryId']!;
          final subcategoryId = state.pathParameters['subcategoryId']!;
          return CategoryProductsScreen(
            categoryId: categoryId,
            subcategoryId: subcategoryId,
          );
        },
      ),
      GoRoute(
        path: '/product/:slug',
        builder: (context, state) {
          final slug = state.pathParameters['slug']!;
          return ProductDetailScreen(slug: slug);
        },
      ),
      GoRoute(
        path: '/order-success',
        builder: (context, state) {
          final order = state.extra as OrderType;
          return OrderSuccessPage(order: order);
        },
      ),

      GoRoute(
        path: '/my-orders',
        builder: (context, state) {
          final tabIndex = state.extra as int? ?? 0;
          return MyOrdersPage(initialTabIndex: tabIndex);
        },
      ),

      GoRoute(
        path: '/orders/:orderId',
        builder: (context, state) {
          final orderId = state.pathParameters['orderId']!;
          return OrderDetailPage(orderId: orderId,);
        },
      ),

      GoRoute(
        path: '/payment',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return PaymentPage(
            cart: extra['cart'] as CartType,
            address: extra['address'] as AddressType,
          );
        },
      ),
      GoRoute(
        path: '/privacy-policy',
        builder: (context, state) => const PrivacyPolicyPage(),
      ),
      GoRoute(
        path: '/about-us',
        builder: (context, state) => const AboutUsPage(),
      ),
      GoRoute(
        path: '/return-policy',
        builder: (context, state) => const ReturnPolicyPage(),
      ),
      GoRoute(
        path: '/terms-conditions',
        builder: (context, state) => const TermsConditionsPage(),
      ),


      // ==================== CHECKOUT FLOW ROUTES ====================

      GoRoute(
        path: '/address',
        builder: (context, state) => const AddressSelectionScreen(),
      ),

      GoRoute(
        path: '/address/location',
        builder: (context, state) => const LocationSelectionScreen(),
      ),

      GoRoute(
        path: '/address/create',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return CreateAddressScreen(
            locationData: extra?['latitude'] != null
                ? {
              'latitude': extra!['latitude'],
              'longitude': extra['longitude'],
              'address': extra['address'],
            }
                : null,
            addressId: extra?['addressId'] as String?,
          );
        },
      ),
      // Payment Method (create this screen or replace with yours)
      // GoRoute(
      //   path: '/payment-method',
      //   builder: (context, state) => const PaymentMethodScreen(), // Placeholder
      // ),
      //
      // Promo Code
      GoRoute(
        path: '/promocode',
        builder: (context, state) => const PromoCodeScreen(), // Placeholder
      ),

      // ==================== AUTH FLOW ROUTES ====================
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return VerifyOTPScreen(
            identifier: extra?['identifier'] as String,
            purpose: extra?['purpose'] as OtpPurpose,
            verificationType: extra?['verificationType'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/featured-week/:slug',
        builder: (context, state) {
          final brand = state.extra as FeaturedWeekBrand;

          return FeaturedWeekProductsScreen(
            featuredBrand: brand,
          );
        },
      ),
      GoRoute(
        path: '/shop-by-store/:slug',
        builder: (context, state) {
          final store = state.extra as ShopByStore;
          return ShopByStoreProductsScreen(
            store: store,
          );
        },
      ),
    ],

    // ==================== REDIRECT LOGIC ====================
    redirect: (context, state) {
      final currentUser = box.read('currentUser');

      final isLogin = state.matchedLocation == '/login';
      final isRegister = state.matchedLocation == '/register';
      final isOtp = state.matchedLocation == '/verify-otp';
      final isSplash = state.matchedLocation == '/splash';

      final isAuthRoute = isLogin || isRegister || isOtp || isSplash;

      // ❌ User NOT logged in → force login
      if (currentUser == null && !isAuthRoute) {
        return '/login';
      }

      // ✅ User logged in → block auth screens
      if (currentUser != null && isAuthRoute && !isSplash) {
        return '/';
      }

      return null;
    },
  );
});