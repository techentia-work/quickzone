import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:Quickzon/features/models/showcase_product/showcase_product_model.dart';
import 'package:Quickzon/features/repositories/showcase/showcase_product_repository.dart';
import '../category/category_provider.dart';

/// =======================================================
/// FEATURED WEEK PRODUCTS (SHOWCASE + MASTER CATEGORY)
/// =======================================================
final featuredWeekProductsProvider =
FutureProvider.family<List<ShowcaseProductItem>, String>(
      (ref, showcaseType) async {
    final repo = ref.read(showcaseProductRepositoryProvider);

    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'showcaseType': showcaseType,
      'isActive': true,
    };

    if (selectedMasterId != null) {
      queryParams['masterCategory'] = selectedMasterId;
    }

    final res = await repo.getAll(queryParams: queryParams);

    if (!res.success || res.data == null || res.data!.isEmpty) {
      return [];
    }

    final matches = res.data!
        .where(
          (e) =>
      e.showcaseType.toLowerCase().trim() ==
          showcaseType.toLowerCase().trim(),
    )
        .toList();

    if (matches.isEmpty) return [];

    return matches.first.products;
  },
);
