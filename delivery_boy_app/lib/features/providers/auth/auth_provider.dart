// AUTH CONTROLLER - features/providers/auth/auth_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_storage/get_storage.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:quickzone_delivery/features/repositories/repositories.dart';

final box = GetStorage();

class AuthController extends AsyncNotifier<DeliveryBoyProfileData?> {
  @override
  Future<DeliveryBoyProfileData?> build() async {
    // ✅ On app start, verify session with backend
    final deliveryBoy = await _fetchAndValidateDeliveryBoy();

    if (deliveryBoy != null) {
      box.write('currentDeliveryBoy', deliveryBoy.toJson());
      return deliveryBoy;
    }

    // ✅ Clear stale local data if backend session invalid
    await box.remove('currentDeliveryBoy');
    return null;
  }

  /// 🔄 Fetch current delivery boy from backend and validate
  Future<DeliveryBoyProfileData?> _fetchAndValidateDeliveryBoy() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.getCurrentDeliveryBoy();

      if (res.success && res.data != null) {
        return res.data;
      }

      return null;
    } catch (e) {
      // Silent fail on app start - user just isn't logged in
      return null;
    }
  }

  /// 🔐 Login delivery boy - returns success status and message
  Future<({bool success, String message})> login(DeliveryBoyLoginRequest payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.login(payload);

      if (res.success && res.data != null) {
        // ✅ Fetch fresh profile after login
        final deliveryBoy = await _fetchAndValidateDeliveryBoy();
        if (deliveryBoy != null) {
          box.write('currentDeliveryBoy', deliveryBoy.toJson());
          state = AsyncValue.data(deliveryBoy);

          await ref.read(deliveryBoyOrdersControllerProvider.notifier).refreshOrders();
          await ref.read(allOrdersControllerProvider.notifier).refreshOrders();
          await ref.read(notificationControllerProvider.notifier).refreshNotifications();

          return (
          success: true,
          message: 'Login successful! Welcome back 👋'
          );
        } else {
          // ✅ Login succeeded but couldn't fetch profile
          state = const AsyncValue.data(null);
          return (
          success: false,
          message: 'Login succeeded but failed to load profile. Please try again.'
          );
        }
      }

      // ✅ Login API returned success: false
      state = const AsyncValue.data(null);
      return (
      success: false,
      message: res.message ?? 'Login failed. Please try again.'
      );
    } catch (e, stackTrace) {
      state = const AsyncValue.data(null);

      // ✅ Extract user-friendly error message
      String errorMessage = 'Login failed. Please check your credentials.';

      // ✅ Parse DioException for better error messages
      if (e.toString().contains('DioException')) {
        if (e.toString().contains('SocketException') || e.toString().contains('Connection')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (e.toString().contains('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }

      print('❌ Login error: $e');
      print('Stack trace: $stackTrace');

      return (
      success: false,
      message: errorMessage
      );
    }
  }

  /// 🚪 Logout delivery boy
  Future<void> logout() async {
    final repository = ref.read(authRepositoryProvider);
    try {
      await repository.logout();
    } catch (_) {
      // Silent fail - clear local state anyway
    }

    await box.remove('currentDeliveryBoy');
    state = const AsyncValue.data(null);

    ref.read(snackbarProvider.notifier).showInfo(
      'Logged out successfully',
    );
  }

  /// 🔁 Refresh delivery boy profile (used on app resume or profile screen)
  Future<void> refreshProfile() async {
    try {
      final deliveryBoy = await _fetchAndValidateDeliveryBoy();
      if (deliveryBoy != null) {
        box.write('currentDeliveryBoy', deliveryBoy.toJson());
        state = AsyncValue.data(deliveryBoy);
      } else {
        // ✅ Session expired - clear state
        await box.remove('currentDeliveryBoy');
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      // ✅ On error, mark as logged out
      await box.remove('currentDeliveryBoy');
      state = const AsyncValue.data(null);
    }
  }

  bool get isLoggedIn => state.hasValue && state.value != null;
}

final authControllerProvider =
AsyncNotifierProvider<AuthController, DeliveryBoyProfileData?>(
    AuthController.new);