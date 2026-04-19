import 'dart:io';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/features/repositories/repositories.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';

/// 📸 AsyncNotifier-based Image Upload Controller
class ImageUploadController extends AsyncNotifier<String?> {
  @override
  FutureOr<String?> build() => null; // no initial upload data

  /// Upload a proof image using Dio + ApiClient
  Future<String?> uploadProofImage(File imageFile) async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(imageUploadRepositoryProvider);
      final response = await repo.uploadProofImage(imageFile);

      if (response.success && response.data != null) {
        final imageUrl = response.data!.imageUrl;

        ref
            .read(snackbarProvider.notifier)
            .showSuccess(response.message ?? 'Image uploaded successfully ✅');

        state = AsyncData(imageUrl);
        return imageUrl;
      } else {
        final msg = response.message ?? 'Failed to upload image';
        ref.read(snackbarProvider.notifier).showError(msg);
        state = AsyncError(msg, StackTrace.current);
        return null;
      }
    } catch (e, st) {
      ref.read(snackbarProvider.notifier).showError('Upload failed: $e');
      state = AsyncError(e, st);
      return null;
    }
  }

  /// Reset controller state
  void reset() => state = const AsyncData(null);
}

/// 🧩 Provider for ImageUploadController
final imageUploadControllerProvider =
AsyncNotifierProvider<ImageUploadController, String?>(() {
  return ImageUploadController();
});
