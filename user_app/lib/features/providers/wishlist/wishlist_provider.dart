import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/wishlist/wishlist_model.dart';
import 'package:Quickzon/features/models/wishlist/wishlist_payload.dart';
import 'package:Quickzon/features/repositories/wishlist/wishlist_repository.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';

class WishlistController extends AsyncNotifier<WishlistType?> {
  @override
  Future<WishlistType?> build() async {
    final authState = ref.watch(authControllerProvider);

    // If user logs out, clear wishlist automatically
    if (authState.hasValue && authState.value == null) {
      state = const AsyncValue.data(null);
      return null;
    }

    // Only load wishlist if logged in
    if (authState.hasValue && authState.value != null) {
      return await fetchWishlist();
    }

    return null;
  }

  Future<WishlistType?> fetchWishlist() async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(wishlistRepositoryProvider);
      final res = await repository.getUserWishlist();

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
        return res.data;
      }

      state = const AsyncValue.data(null);
      return null;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }

  Future<void> addItem(AddToWishlistPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(wishlistRepositoryProvider);
      final res = await repository.addItem(payload);

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
      } else {
          state = const AsyncValue.data(null);
        }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> removeItem(RemoveWishlistItemPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(wishlistRepositoryProvider);
      final res = await repository.removeItem(payload);

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
      } else {
          state = const AsyncValue.data(null);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> clearWishlist() async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(wishlistRepositoryProvider);
      final res = await repository.clearWishlist();

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
      } else {
          state = const AsyncValue.data(null);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final wishlistControllerProvider =
AsyncNotifierProvider<WishlistController, WishlistType?>(
  WishlistController.new,
);
