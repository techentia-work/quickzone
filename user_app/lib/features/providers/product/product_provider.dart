// features/providers/product/product_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/product/product_model.dart';
import '../../repositories/product/product_repository.dart';

// ============================================================================
// PRODUCT CONTROLLER
// ============================================================================

class ProductController extends AsyncNotifier<List<ProductType>> {
  @override
  Future<List<ProductType>> build() async {
    return await getAllProducts();
  }

  Future<List<ProductType>> getAllProducts({Map<String, dynamic>? queryParams}) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(productRepositoryProvider);
      final res = await repository.getAll(queryParams: queryParams);

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data!);
        return res.data!;
      } else {
        state = const AsyncValue.data([]);
        return [];
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }

  Future<ProductType?> getProductById(String id) async {
    try {
      final repository = ref.read(productRepositoryProvider);
      final res = await repository.getById(id);

      if (res.success && res.data != null) {
        return res.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<ProductType?> getProductBySlug(String slug) async {
    try {
      final repository = ref.read(productRepositoryProvider);
      final res = await repository.getBySlug(slug);

      if (res.success && res.data != null) {
        return res.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<List<ProductType>> getProductsByCategory(
      String categoryId, {
        Map<String, dynamic>? queryParams,
      }) async {
    try {
      final repository = ref.read(productRepositoryProvider);
      final res = await repository.getByCategory(categoryId, queryParams: queryParams);

      if (res.success && res.data != null) {
        return res.data!;
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}

final productControllerProvider = AsyncNotifierProvider<ProductController, List<ProductType>>(
  ProductController.new,
);

// ============================================================================
// CATEGORY PRODUCTS PROVIDER
// ============================================================================

class CategoryProductsParams {
  final String categoryId;
  final Map<String, dynamic> queryParams;

  CategoryProductsParams({
    required this.categoryId,
    this.queryParams = const {},
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
          other is CategoryProductsParams &&
              runtimeType == other.runtimeType &&
              categoryId == other.categoryId &&
              queryParams.toString() == other.queryParams.toString();

  @override
  int get hashCode => categoryId.hashCode ^ queryParams.toString().hashCode;
}

final productsByCategoryProvider = FutureProvider.family<List<ProductType>, CategoryProductsParams>(
      (ref, params) async {
    final repository = ref.read(productRepositoryProvider);
    final res = await repository.getByCategory(
      params.categoryId,
      queryParams: params.queryParams,
    );

    if (res.success && res.data != null) {
      return res.data!;
    }
    return [];
  },
);

// ============================================================================
// UTILITY PROVIDERS
// ============================================================================

/// Provider to get a product by ID
final productByIdProvider = FutureProvider.family<ProductType?, String>((ref, productId) async {
  final repository = ref.read(productRepositoryProvider);
  final res = await repository.getById(productId);

  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});

/// Provider to get a product by slug
final productBySlugProvider = FutureProvider.family<ProductType?, String>((ref, slug) async {
  final repository = ref.read(productRepositoryProvider);
  final res = await repository.getBySlug(slug);

  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});