// features/providers/bootstrap_provider.dart
import 'package:Quickzon/core/services/push_notification_service.dart';
import 'package:Quickzon/features/providers/category/category_provider.dart';
import 'package:Quickzon/features/repositories/cart/cart_repository.dart';
import 'package:Quickzon/features/repositories/wishlist/wishlist_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/banner/banner_repository.dart';
import '../repositories/category/category_repository.dart';
import '../repositories/featured_section/featured_repository.dart';
import '../repositories/product/product_repository.dart';
import '../repositories/slider/slider_repository.dart';

/// Bootstrap provider that prefetches all essential data on app startup
final bootstrapProvider = FutureProvider<void>((ref) async {
  try {
    /// 🔔 FCM TOKEN (ADD THIS)
    final token = await PushNotificationService.getToken();
    print('🔥 FCM TOKEN: $token');

    // TODO: yahin backend API call karni hai
    // await ref.read(authRepositoryProvider).saveFcmToken(token);

    // 👇 tumhara existing bootstrap
    await Future.wait([
      _fetchCategories(ref),
      _fetchProducts(ref),
      _fetchFeaturedSections(ref),
      _fetchSliders(ref),
      _fetchBanners(ref),
      _fetchCart(ref),
      _fetchWishlist(ref),
    ]);

    print('✅ Bootstrap completed successfully');
  } catch (e, st) {
    rethrow;
  }
});


/// Fetch all category data (MASTER, SUPER, CATEGORY trees)
Future<void> _fetchCategories(Ref ref) async {
  final repository = ref.read(categoryRepositoryProvider);

  // Fetch all three category trees in parallel
  final results = await Future.wait([
    repository.getTree(queryParams: {'type': 'MASTER'}),
    repository.getTree(queryParams: {'type': 'SUPER'}),
    repository.getAll(queryParams: {'type': 'CATEGORY'}),
  ]);

  final masterTree = results[0];
  final superTree = results[1];
  final categoryList = results[2];

  // print('📦 Categories fetched:');
  // print('  - MASTER: ${masterTree.data?.length ?? 0} categories');
  // print('  - SUPER: ${superTree.data?.length ?? 0} categories');
  // print('  - CATEGORY: ${categoryList.data?.length ?? 0} items');

  // Trigger the providers to cache the data
  ref.read(masterCategoryTreeProvider.future);
  ref.read(superCategoryTreeProvider.future);
  ref.read(categoryListProvider.future);
}

/// Fetch all products
Future<void> _fetchProducts(Ref ref) async {
  final products = await ref.read(productRepositoryProvider).getAll();
  // print('📦 Products fetched: ${products.data?.length ?? 0} items');
}

/// Fetch featured sections
Future<void> _fetchFeaturedSections(Ref ref) async {
  final featured = await ref.read(featuredRepositoryProvider).getAll();
  // print('📦 Featured sections fetched: ${featured.data?.length ?? 0} items');
}

/// Fetch sliders
Future<void> _fetchSliders(Ref ref) async {
  final sliders = await ref.read(sliderRepositoryProvider).getAll();
  // print('📦 Sliders fetched: ${sliders.data?.length ?? 0} items');
}

/// Fetch banners
Future<void> _fetchBanners(Ref ref) async {
  final banners = await ref.read(bannerRepositoryProvider).getAll();
  // print('📦 Banners fetched: ${banners.data?.length ?? 0} items');
}

/// Fetch cart
Future<void> _fetchCart(Ref ref) async {
  final banners = await ref.read(cartRepositoryProvider).getUserCart();
  // print('📦 Banners fetched: ${banners.data?.length ?? 0} items');
}

/// Fetch wishlist
Future<void> _fetchWishlist(Ref ref) async {
  final banners = await ref.read(wishlistRepositoryProvider).getUserWishlist();
  // print('📦 Banners fetched: ${banners.data?.length ?? 0} items');
}