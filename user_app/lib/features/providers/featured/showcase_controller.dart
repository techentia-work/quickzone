import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/showcase_product/showcase_product_model.dart';
import '../../repositories/showcase/showcase_product_repository.dart';
import '../category/category_provider.dart';

/// =======================================================
/// SHOWCASE PROVIDER (FAMILY)
/// =======================================================
final showcaseProvider =
FutureProvider.family<List<ShowcaseProductItem>, String>(
      (ref, showcaseType) async {
    final repository =
    ref.read(showcaseProductRepositoryProvider);

    /// 🔥 master category change → auto refresh
    final selectedMasterId =
    ref.watch(selectedMasterCategoryProvider);

    final res = await repository.getAll(
      queryParams: {
        'isActive': true,
        'isDeleted': false,
        'limit': 100,
      },
    );

    if (!res.success || res.data == null) return [];

    /// 1️⃣ FILTER BY SHOWCASE TYPE
    final filteredByType = res.data!.where(
          (s) =>
      s.showcaseType.toUpperCase() ==
          showcaseType.toUpperCase() &&
          s.isActive &&
          !s.isDeleted &&
          s.products.isNotEmpty,
    );

    /// 2️⃣ FILTER BY MASTER CATEGORY
    final filteredByMaster = selectedMasterId == null
        ? filteredByType
        : filteredByType.where(
          (s) => s.masterCategory?.id == selectedMasterId,
    );

    /// 3️⃣ FLATTEN PRODUCTS
    return filteredByMaster
        .expand((s) => s.products)
        .toList();
  },
);
