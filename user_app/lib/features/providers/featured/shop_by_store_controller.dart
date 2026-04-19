import 'package:Quickzon/features/models/featured/shop_by_store_model.dart';
import 'package:Quickzon/features/repositories/featured_section/shop_by_store_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


import '../category/category_provider.dart';

/// =======================================================
/// SHOP BY STORE CONTROLLER
/// =======================================================
class ShopByStoreController
    extends AsyncNotifier<List<ShopByStore>> {
  ShopByStoreRepository get _repository =>
      ref.read(shopByStoreRepositoryProvider);

  @override
  Future<List<ShopByStore>> build() async {
    // 🔥 master category change → auto rebuild
    ref.watch(selectedMasterCategoryProvider);

    return getShopByStoresForApp();
  }

  // ===================================================
  // APP SHOP BY STORES
  // ===================================================
  Future<List<ShopByStore>> getShopByStoresForApp() async {
    final selectedMasterId =
    ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'isActive': true,
    };

    // 🔥 SAME MASTER CATEGORY FILTER
    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    return _fetch(queryParams);
  }

  // ===================================================
  // INTERNAL FETCH
  // ===================================================
  Future<List<ShopByStore>> _fetch(
      Map<String, dynamic> queryParams,
      ) async {
    try {
      state = const AsyncValue.loading();

      final res = await _repository.getAll(
        queryParams: queryParams,
      );

      if (res.success && res.data != null) {
        /// 🔥 SORT BY OLDEST FIRST (SAME AS FEATURED)
        final sorted = [...res.data!]
          ..sort(
                (a, b) => a.createdAt.compareTo(b.createdAt),
          );

        state = AsyncValue.data(sorted);
        return sorted;
      }

      state = const AsyncValue.data([]);
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }

  // ===================================================
  // CLEAR
  // ===================================================
  void clear() {
    state = const AsyncValue.data([]);
  }
}

/// =======================================================
/// PROVIDER
/// =======================================================
final shopByStoreControllerProvider =
AsyncNotifierProvider<
    ShopByStoreController,
    List<ShopByStore>>(
  ShopByStoreController.new,
);
