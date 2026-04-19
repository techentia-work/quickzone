import 'package:Quickzon/features/providers/category/category_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/banner/banner_model.dart';
import '../../repositories/banner/banner_repository.dart';

class BannerController extends AsyncNotifier<List<BannerType>?> {
  BannerRepository get _repository =>
      ref.read(bannerRepositoryProvider);

  @override
  Future<List<BannerType>?> build() async {
    // 🔥 master category change → auto rebuild (same as FeaturedWeek)
    ref.watch(selectedMasterCategoryProvider);

    final selectedMasterId =
    ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'position': 'APP', // ✅ same as before
    };

    // 🔥 SIRF YAHI CHANGE HAI
    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    return getAll(queryParams: queryParams);
  }

  Future<List<BannerType>?> getAll({
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

      // same fallback as before
      state = const AsyncValue.data([]);
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }
}

final bannerControllerProvider =
AsyncNotifierProvider<BannerController, List<BannerType>?>(
  BannerController.new,
);
