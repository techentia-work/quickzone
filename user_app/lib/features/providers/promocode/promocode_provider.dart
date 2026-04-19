import 'package:Quickzon/features/models/models.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/promocode/promocode_model.dart';
import 'package:Quickzon/features/repositories/repositories.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:Quickzon/features/providers/cart/cart_provider.dart'; // <-- import your CartController
import 'package:Quickzon/core/network/api_response.dart';

class PromoController extends AsyncNotifier<String?> {

  @override
  Future<String?> build() async {
    final authState = ref.watch(authControllerProvider);

    // Clear promo when logged out
    if (authState.hasValue && authState.value == null) {
      state = const AsyncValue.data(null);
      return null;
    }

    // Optional: preload promo if backend supports it
    return null;
  }

  /// 🎯 Apply promo code and refresh cart if successful
  Future<String?> applyPromo(String code) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(promoRepositoryProvider);
      final ApiResponse<ApplyPromoResponse> res = await repository.applyPromo(code);

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data?.appliedPromo?.code);
        await _refreshCart();
        return null;
      } else {
        state = AsyncValue.error(
          res.message.isNotEmpty ? res.message : 'Failed to apply promo',
          StackTrace.current,
        );
        return res.message;
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return e.toString();
    }
  }

  /// ✅ Validate promo before applying (optional)
  Future<bool> validatePromo(String code) async {
    try {
      final repository = ref.read(promoRepositoryProvider);
      final res = await repository.validatePromo(code);
      return res.success && res.data != null;
    } catch (_) {
      return false;
    }
  }

  /// 🧹 Remove promo and refresh cart if successful
  Future<void> removePromo() async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(promoRepositoryProvider);

      final ApiResponse<void> res = await repository.removePromo();

      if (res.success) {
        state = const AsyncValue.data(null);
        await _refreshCart();
      } else {
        state = AsyncValue.error(
          res.message.isNotEmpty ? res.message : 'Failed to remove promo',
          StackTrace.current,
        );
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// 📜 Fetch all available promos (for display)
  Future<List<PromoCodeType>> fetchPromos() async {
    try {
      final repository = ref.read(promoRepositoryProvider);
      final res = await repository.fetchPromos();
      return res.success && res.data != null ? res.data! : [];
    } catch (_) {
      return [];
    }
  }

  /// 🔁 Helper: refresh cart when promo changes
  Future<void> _refreshCart() async {
    final cartController = ref.read(cartControllerProvider.notifier);
    await cartController.fetchCart();
  }
}

/// 🪄 Riverpod provider
final promoControllerProvider =
AsyncNotifierProvider<PromoController, String?>(PromoController.new);  // ✅ Changed to String?