import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/brand_of_the_day/brand_of_the_day_model.dart';
import '../../repositories/brand_of_the_day/brand_of_the_day_repository.dart';
import '../category/category_provider.dart';

class BrandOfTheDayController
    extends AsyncNotifier<List<BrandOfTheDayType>> {
  BrandOfTheDayRepository get _repository =>
      ref.read(brandOfTheDayRepositoryProvider);

  @override
  Future<List<BrandOfTheDayType>> build() async {
    // 🔥 master category change → auto rebuild
    ref.watch(selectedMasterCategoryProvider);

    final selectedMasterId =
    ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{};

    // 🔥 ONLY FILTER (no position here)
    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    return getAll(queryParams: queryParams);
  }

  Future<List<BrandOfTheDayType>> getAll({
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

      state = const AsyncValue.data([]);
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }
}

final brandOfTheDayControllerProvider =
AsyncNotifierProvider<BrandOfTheDayController,
    List<BrandOfTheDayType>>(
  BrandOfTheDayController.new,
);
