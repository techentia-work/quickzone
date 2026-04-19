import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:Quickzon/features/models/showcase_product/showcase_product_model.dart';
import 'package:Quickzon/features/repositories/showcase/showcase_product_repository.dart';
import '../category/category_provider.dart';

/// =======================================================
/// SHOP BY STORE PRODUCTS (SHOWCASE + MASTER CATEGORY)
/// =======================================================
final shopByStoreProductsProvider =
FutureProvider.family<List<ShowcaseProductItem>, String>(
      (ref, storeSlug) async {
    final repo = ref.read(showcaseProductRepositoryProvider);
    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'mapType': 'SHOP_BY_STORE',
      'isActive': true,
    };

    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    final res = await repo.getAll(queryParams: queryParams);

    if (!res.success || res.data == null || res.data!.isEmpty) {
      return [];
    }

    /// 🔥 SAME FLOW AS FEATURED WEEK
    final normalizedStore = storeSlug
        .toLowerCase()
        .replaceAll('-', '')
        .replaceAll(' ', '')
        .trim();

    final matches = res.data!
        .where(
          (e) =>
      e.showcaseType
          .toLowerCase()
          .replaceAll('-', '')
          .replaceAll(' ', '')
          .trim() ==
          normalizedStore,
    )
        .toList();

    if (matches.isEmpty) return [];

    return matches.first.products;
  },
);
