// features/providers/category/category_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/enums/enums.dart';
import '../../models/category/category_model.dart';
import '../../repositories/category/category_repository.dart';

class CategoryController extends AsyncNotifier<List<CategoryType>> {
  @override
  Future<List<CategoryType>> build() async {
    final repository = ref.read(categoryRepositoryProvider);
    final res = await repository.getAll();

    if (res.success && res.data != null) {
      return res.data!;
    }
    return [];
  }

  // ❌ remove loading state mutation
  Future<List<CategoryType>> getAllCategories({
    Map<String, dynamic>? queryParams,
  }) async {
    final repository = ref.read(categoryRepositoryProvider);
    final res = await repository.getAll(queryParams: queryParams);

    if (res.success && res.data != null) {
      return res.data!;
    }
    return [];
  }
}


final categoryControllerProvider =
AsyncNotifierProvider<CategoryController, List<CategoryType>>(
  CategoryController.new,
);

// ============================================================================
// DEFAULT PROVIDERS FOR CATEGORY TREES
// ============================================================================

/// Provider for MASTER category tree
final masterCategoryTreeProvider = FutureProvider<List<CategoryType>>((ref) async {
  final repository = ref.read(categoryRepositoryProvider);
  final res = await repository.getTree(queryParams: {'type': 'MASTER'});

  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});

/// Provider for SUPER category tree
final superCategoryTreeProvider = FutureProvider<List<CategoryType>>((ref) async {
  final repository = ref.read(categoryRepositoryProvider);
  final res = await repository.getTree(queryParams: {'type': 'SUPER'});

  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});

/// Provider for all CATEGORY type items (flat list)
final categoryListProvider = FutureProvider<List<CategoryType>>((ref) async {
  final repository = ref.read(categoryRepositoryProvider);
  final res = await repository.getAll(queryParams: {'type': 'CATEGORY'});

  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});

// ============================================================================
// SELECTION & FILTERING PROVIDERS (LATEST RIVERPOD)
// ============================================================================

/// Notifier for selected master category (Latest Riverpod)
class SelectedMasterCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void select(String? masterId) {
    state = masterId;
  }

  void clear() {
    state = null;
  }
}

final selectedMasterCategoryProvider =
NotifierProvider<SelectedMasterCategoryNotifier, String?>(
  SelectedMasterCategoryNotifier.new,
);

/// Provider for filtered MASTER categories (active only, sorted by order)
final masterCategoriesProvider = Provider<List<CategoryType>>((ref) {
  final categoriesAsync = ref.watch(masterCategoryTreeProvider);

  return categoriesAsync.when(
    data: (data) => data
        .where((cat) => cat.isActive)
        .toList()
      ..sort((a, b) => a.order.compareTo(b.order)),
    loading: () => [],
    error: (_, __) => [],
  );
});

/// Provider for filtered SUPER categories based on selected MASTER
/// When a master is selected, show its children (SUPER categories)
/// When no master is selected, show top 4 SUPER categories
final superCategoriesProvider = Provider<List<CategoryType>>((ref) {
  final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

  // If a master category is selected, get its children from the tree
  if (selectedMasterId != null) {
    final masterTreeAsync = ref.watch(masterCategoryTreeProvider);

    return masterTreeAsync.when(
      data: (masterTree) {
        // Find the selected master category
        try {
          final selectedMaster = masterTree.firstWhere(
                (cat) => cat.id == selectedMasterId,
          );

          // Return its children (SUPER categories), filtered and sorted
          if (selectedMaster.children != null && selectedMaster.children!.isNotEmpty) {
            return selectedMaster.children!
                .where((cat) => cat.type == TypeOfCategory.SUPER && cat.isActive)
                .toList()
              ..sort((a, b) => a.order.compareTo(b.order));
          }
        } catch (_) {
          // If master not found, return empty list
        }
        return [];
      },
      loading: () => [],
      error: (_, __) => [],
    );
  }

  // No master selected: show top 4 SUPER categories
  final superTreeAsync = ref.watch(superCategoryTreeProvider);

  return superTreeAsync.when(
    data: (superTree) {
      final filtered = superTree
          .where((cat) => cat.isActive)
          .toList()
        ..sort((a, b) => a.order.compareTo(b.order));

      return filtered.take(4).toList();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

/// Provider for CATEGORY children of a specific SUPER category
/// This will look up the SUPER category in the tree and return its children
final categoriesOfSuperProvider = Provider.family<List<CategoryType>, String>((ref, superCategoryId) {
  final superTreeAsync = ref.watch(superCategoryTreeProvider);

  return superTreeAsync.when(
    data: (superTree) {
      // Find the super category in the tree
      try {
        final superCategory = superTree.firstWhere(
              (cat) => cat.id == superCategoryId,
        );

        // Return its children (CATEGORY type), filtered and sorted
        if (superCategory.children != null && superCategory.children!.isNotEmpty) {
          return superCategory.children!
              .where((cat) => cat.type == TypeOfCategory.CATEGORY && cat.isActive)
              .toList()
            ..sort((a, b) => a.order.compareTo(b.order));
        }
      } catch (_) {
        // Super category not found
      }

      return [];
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

// ============================================================================
// UTILITY PROVIDERS
// ============================================================================

/// Provider to get a specific category by ID from any of the trees
final categoryByIdProvider = Provider.family<CategoryType?, String>((ref, categoryId) {
  // Try to find in master tree first
  final masterTree = ref.watch(masterCategoryTreeProvider);
  if (masterTree.hasValue) {
    final found = _findCategoryInTree(masterTree.value!, categoryId);
    if (found != null) return found;
  }

  // Try super tree
  final superTree = ref.watch(superCategoryTreeProvider);
  if (superTree.hasValue) {
    final found = _findCategoryInTree(superTree.value!, categoryId);
    if (found != null) return found;
  }

  // Try category list
  final categoryList = ref.watch(categoryListProvider);
  if (categoryList.hasValue) {
    try {
      return categoryList.value!.firstWhere((cat) => cat.id == categoryId);
    } catch (_) {
      return null;
    }
  }

  return null;
});

/// Provider to get a specific category by SLUG from any of the trees
final categoryBySlugProvider = FutureProvider.family<CategoryType?, String>((ref, slug) async {
  final repository = ref.read(categoryRepositoryProvider);
  final res = await repository.getBySlug(slug);

  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});

/// Helper function to recursively search for a category in a tree
CategoryType? _findCategoryInTree(List<CategoryType> tree, String categoryId) {
  for (final category in tree) {
    if (category.id == categoryId) {
      return category;
    }

    if (category.children != null && category.children!.isNotEmpty) {
      final found = _findCategoryInTree(category.children!, categoryId);
      if (found != null) return found;
    }
  }
  return null;
}
