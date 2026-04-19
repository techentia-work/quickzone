import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/cart/cart_model.dart';
import 'package:Quickzon/features/models/cart/cart_payload.dart';
import 'package:Quickzon/features/repositories/cart/cart_repository.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';

class CartController extends AsyncNotifier<CartType?> {
  @override
  Future<CartType?> build() async {
    final authState = ref.watch(authControllerProvider);

    // If user logs out, clear cart automatically
    if (authState.hasValue && authState.value == null) {
      state = const AsyncValue.data(null);
      return null;
    }

    // Only load cart if logged in
    if (authState.hasValue && authState.value != null) {
      return await fetchCart();
    }

    return null;
  }

  Future<CartType?> fetchCart() async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(cartRepositoryProvider);
      final res = await repository.getUserCart();

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

  Future<void> addItem(AddToCartPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(cartRepositoryProvider);
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

  Future<void> updateItemQuantity(UpdateCartQuantityPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(cartRepositoryProvider);
      final res = await repository.updateItemQuantity(payload);

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
      } else {
          state = const AsyncValue.data(null);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> removeItem(RemoveCartItemPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(cartRepositoryProvider);
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

  Future<void> clearCart(ClearCartPayload payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(cartRepositoryProvider);
      final res = await repository.clearCart(payload);

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

final cartControllerProvider =
AsyncNotifierProvider<CartController, CartType?>(CartController.new);
