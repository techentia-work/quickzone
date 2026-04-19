import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:Quickzon/features/models/featured/featured_week_brand_model.dart';
import 'package:Quickzon/features/repositories/featured_section/featured_week_brand_repository.dart';

import '../category/category_provider.dart';

/// =======================================================
/// FEATURED WEEK BRAND CONTROLLER
/// =======================================================
class FeaturedWeekBrandController
    extends AsyncNotifier<List<FeaturedWeekBrand>> {

  FeaturedWeekBrandRepository get _repository =>
      ref.read(featuredWeekBrandRepositoryProvider);

  @override
  Future<List<FeaturedWeekBrand>> build() async {
    // ✅ PROVIDER KO ZINDA RAKHO
    ref.keepAlive();

    // ✅ master category change → auto rebuild
    final selectedMasterId =
    ref.watch(selectedMasterCategoryProvider);

    return _fetchForApp(selectedMasterId);
  }

  // ===================================================
  // FETCH FOR APP
  // ===================================================
  Future<List<FeaturedWeekBrand>> _fetchForApp(
      String? selectedMasterId,
      ) async {

    final queryParams = <String, dynamic>{
      'isActive': true,
    };

    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    final res = await _repository.getAll(
      queryParams: queryParams,
    );

    if (res.success && res.data != null) {
      final sorted = [...res.data!]
        ..sort(
              (a, b) => a.createdAt.compareTo(b.createdAt),
        );

      return sorted;
    }

    return [];
  }

  // ===================================================
  // MANUAL REFRESH (OPTIONAL)
  // ===================================================
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = AsyncValue.data(
      await _fetchForApp(
        ref.read(selectedMasterCategoryProvider),
      ),
    );
  }

  // ===================================================
  // CLEAR (OPTIONAL)
  // ===================================================
  void clear() {
    state = const AsyncValue.data([]);
  }
}


/// =======================================================
/// PROVIDER
/// =======================================================
final featuredWeekBrandControllerProvider =
AsyncNotifierProvider<
    FeaturedWeekBrandController,
    List<FeaturedWeekBrand>>(
  FeaturedWeekBrandController.new,
);
