import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../repositories/featured_section/featured_repository.dart';
import '../../models/featured/featured_model.dart';
import '../category/category_provider.dart';

class FeaturedController extends AsyncNotifier<List<FeaturedType>> {
  FeaturedRepository get _repository =>
      ref.read(featuredRepositoryProvider);

  @override
  Future<List<FeaturedType>> build() async {
    ref.keepAlive();

    final selectedMaster =
    ref.watch(selectedMasterCategoryProvider);

    final data = await _fetch();

    if (selectedMaster == null) return data;

    return data
        .where(
          (s) => s.masterCategory?.id == selectedMaster,
    )
        .toList();
  }

  Future<List<FeaturedType>> _fetch() async {
    final res = await _repository.getAll(
      queryParams: {
        'position': 'APP',
        'mapType': 'SUBCATEGORY',
      },
    );

    if (res.success && res.data != null) {
      final sorted = [...res.data!]
        ..sort((a, b) => (a.order ?? 0).compareTo(b.order ?? 0));
      return sorted;
    }

    return [];
  }
}




final featuredControllerProvider =
AsyncNotifierProvider<FeaturedController, List<FeaturedType>>(
  FeaturedController.new,
);



