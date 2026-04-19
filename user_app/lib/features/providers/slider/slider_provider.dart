// lib/features/providers/slider/slider_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/slider/slider_model.dart';
import '../../repositories/slider/slider_repository.dart';
import '../category/category_provider.dart'; // ✅ ADD

class SliderController extends AsyncNotifier<List<SliderType>> {
  SliderRepository get _repository =>
      ref.read(sliderRepositoryProvider);

  @override
  Future<List<SliderType>> build() async {
    // 🔥 master category change → auto rebuild
    ref.watch(selectedMasterCategoryProvider);

    final selectedMasterId =
    ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'position': 'TOP', // ✅ same pattern as banner
    };

    // 🔥 master category filter
    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    return getAllSliders(queryParams: queryParams);
  }

  Future<List<SliderType>> getAllSliders({
    Map<String, dynamic>? queryParams,
  }) async {
    try {
      state = const AsyncValue.loading();

      final res = await _repository.getAll(
        queryParams: queryParams,
      );

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data!);
        return res.data!;
      }

      // fallback (safe)
      state = const AsyncValue.data([]);
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }
}

final sliderControllerProvider =
AsyncNotifierProvider<SliderController, List<SliderType>>(
  SliderController.new,
);
