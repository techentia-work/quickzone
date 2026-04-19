import 'package:Quickzon/features/repositories/repositories.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_storage/get_storage.dart';
import 'package:Quickzon/features/models/auth/auth_model.dart';
import 'package:Quickzon/features/models/auth/auth_payload.dart';
import 'package:Quickzon/features/repositories/auth/auth_repository.dart';

final box = GetStorage();

class AuthController extends AsyncNotifier<AuthenticatedUser?> {
  @override
  Future<AuthenticatedUser?> build() async {
    // Always try to get current user first (via cookie)
    final user = await _fetchAndValidateUser();

    if (user != null) {
      // Cache user for future use
      box.write('currentUser', user.toJson());
      return user;
    }

    // If no user, ensure logout state
    await logout();
    return null;
  }
  Future<void> _saveFcmToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;

      await ref
          .read(userProfileRepositoryProvider)
          .saveFcmToken(token);
      print('✅ FCM token saved for user');
    } catch (e) {
      print('❌ FCM token save failed: $e');
    }
  }
  Future<AuthenticatedUser?> _fetchAndValidateUser() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.getCurrentUser();

      if (res.success && res.data != null) {
        // Valid user fetched via cookie
        return res.data;
      }

      return null;
    } catch (e, st) {
      // Network errors, etc.
      state = AsyncValue.error(e, st);
      return null;
    }
  }

  Future<bool> login(LoginRequest payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.login(payload);

      if (res.success) {
        // After successful login, get user via cookie
        final user = await _fetchAndValidateUser();
        if (user != null) {
          box.write('currentUser', user.toJson());
          state = AsyncValue.data(user);
          await _saveFcmToken();
          return true;
        }
      }
      throw res;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<RegisterResponse?> register(RegisterRequest payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.register(payload);

      if (res.success && res.data != null) {
        state = const AsyncValue.data(null);
        return res.data;
      } else {
        throw res;
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<bool> verifyOTP(VerifyOTPRequest payload) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(authRepositoryProvider);
      final res = await repository.verifyOTP(payload);

      if (res.success) {
        if (res.data?.user != null) {
          box.write('currentUser', res.data!.user!.toJson());
          state = AsyncValue.data(res.data!.user);
          await _saveFcmToken();
        } else {
          state = const AsyncValue.data(null);
        }
        return true;
      } else {
        throw res;
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<bool> resendOTP(ResendOTPRequest payload) async {
    final repository = ref.read(authRepositoryProvider);
    final res = await repository.resendOTP(payload);
    if (res.success) return true;
    throw res;
  }

  Future<void> logout() async {
    final repository = ref.read(authRepositoryProvider);
    try {
      await repository.logout();
    } catch (_) {}
    await box.remove('currentUser');
    state = const AsyncValue.data(null);
  }

  bool get isLoggedIn => state.hasValue && state.value != null;
}

/// Provider
final authControllerProvider =
AsyncNotifierProvider<AuthController, AuthenticatedUser?>(AuthController.new);
