import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/featured/featured_product_section.dart';
import '../../repositories/featured_section/featured_product_repository.dart';
import '../category/category_provider.dart';

class FeaturedProductController
    extends AsyncNotifier<List<FeaturedProductSection>> {
  FeaturedProductRepository get _repository =>
      ref.read(featuredProductRepositoryProvider);

  @override
  Future<List<FeaturedProductSection>> build() async {
    // 🔥 master category change hone par auto rebuild
    ref.watch(selectedMasterCategoryProvider);

    return await getAllFeaturedSections();
  }

  // ===================================================
  // GET ALL FEATURED SECTIONS (APP1-APP5)
  // ===================================================
  Future<List<FeaturedProductSection>> getAllFeaturedSections() async {
    final selectedMasterId = ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'mapType': 'PRODUCT',
      // 🔥 NO position filter - sab fetch karo
    };

    print('🔥 Fetching ALL sections (APP1-APP5)');

    return _fetch(queryParams, selectedMasterId);
  }

  // ===================================================
  // GET SPECIFIC POSITION SECTIONS
  // ===================================================
  Future<List<FeaturedProductSection>> getSectionsByPosition(
      String position,
      ) async {
    final selectedMasterId = ref.read(selectedMasterCategoryProvider);

    final queryParams = <String, dynamic>{
      'position': position,
      'mapType': 'PRODUCT',
    };

    print('🔥 Fetching $position sections');

    return _fetch(queryParams, selectedMasterId);
  }

  // ===================================================
  // INTERNAL FETCH (CLIENT-SIDE FILTERING)
  // ===================================================
  Future<List<FeaturedProductSection>> _fetch(
      Map<String, dynamic> queryParams,
      String? selectedMasterId,
      ) async {
    try {
      final res = await _repository.getAll(
        queryParams: queryParams,
      );

      if (res.success && res.data != null && res.data!.isNotEmpty) {
        print('🔥 Got ${res.data!.length} total sections');

        var filtered = res.data!;

        // 🔥 Master category filter
        if (selectedMasterId != null) {
          filtered = res.data!
              .where((s) => s.masterCategory?.id == selectedMasterId)
              .toList();
          print('🔥 Filtered to ${filtered.length} sections for master: $selectedMasterId');
        }

        // 🔥 Sort by order
        final sorted = [...filtered]
          ..sort((a, b) => a.order.compareTo(b.order));

        return sorted;
      }

      print('🔥 No data from backend');
      return [];
    } catch (e, st) {
      print('🔥 Error: $e');
      Error.throwWithStackTrace(e, st);
    }
  }

  void clear() {
    state = const AsyncValue.data([]);
  }
}

final featuredProductControllerProvider =
AsyncNotifierProvider<FeaturedProductController,
    List<FeaturedProductSection>>(
  FeaturedProductController.new,
);

// ===================================================
// 🔥 DERIVED PROVIDERS FOR EACH POSITION
// ===================================================
final app1SectionsProvider = Provider<List<FeaturedProductSection>>((ref) {
  final allSections = ref.watch(featuredProductControllerProvider).value ?? [];
  return allSections.where((s) => s.position == 'APP1').toList();
});

final app2SectionsProvider = Provider<List<FeaturedProductSection>>((ref) {
  final allSections = ref.watch(featuredProductControllerProvider).value ?? [];
  return allSections.where((s) => s.position == 'APP2').toList();
});

final app3SectionsProvider = Provider<List<FeaturedProductSection>>((ref) {
  final allSections = ref.watch(featuredProductControllerProvider).value ?? [];
  return allSections.where((s) => s.position == 'APP3').toList();
});

final app4SectionsProvider = Provider<List<FeaturedProductSection>>((ref) {
  final allSections = ref.watch(featuredProductControllerProvider).value ?? [];
  return allSections.where((s) => s.position == 'APP4').toList();
});

final app5SectionsProvider = Provider<List<FeaturedProductSection>>((ref) {
  final allSections = ref.watch(featuredProductControllerProvider).value ?? [];
  return allSections.where((s) => s.position == 'APP5').toList();
});