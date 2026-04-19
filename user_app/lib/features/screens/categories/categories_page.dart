import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/category/category_model.dart';
import '../../../core/utils/cache_manager.dart';
import '../../providers/category/category_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// =======================================================
/// CATEGORY CARD
/// =======================================================
class CategoryCard extends StatelessWidget {
  final CategoryType category;

  const CategoryCard({
    super.key,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        context.push('/category/${category.slug}');
      },
      child: Column(
        children: [
          /// IMAGE
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.grey.shade100,
            ),
            clipBehavior: Clip.antiAlias,
            child: category.thumbnail != null
                ? Builder(
                    builder: (context) {
                      if (category.thumbnail!.isNotEmpty) {
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          precacheImage(
                            CachedNetworkImageProvider(category.thumbnail!, cacheManager: AppCacheManager.instance),
                            context,
                          );
                        });
                      }
                      return CachedNetworkImage(
                        imageUrl: category.thumbnail!,
                        cacheManager: AppCacheManager.instance,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) =>
                            const Icon(Icons.category, size: 40),
                      );
                    },
                  )
                : const Icon(Icons.category, size: 40),
          ),

          const SizedBox(height: 8),

          /// NAME
          Text(
            category.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// =======================================================
/// CATEGORY PAGE (ALL CATEGORIES – SIMPLE)
/// =======================================================
class CategoryPage extends ConsumerWidget {
  const CategoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);
    final masterTreeAsync = ref.watch(masterCategoryTreeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('All Categories'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.push('/'),
        ),
      ),
      body: masterTreeAsync.when(
        loading: _buildLoading,
        error: (_, __) => _buildEmpty('Failed to load categories'),
        data: (masterTree) {
          if (masterTree.isEmpty) {
            return _buildEmpty('No categories available');
          }

          /// 🔥 FILTERED BY MASTER
          final categories = extractCategories(
            masterTree: masterTree,
            selectedMasterId: selectedMasterId,
          );

          if (categories.isEmpty) {
            return _buildEmpty('No categories found');
          }

          return Padding(
            padding: const EdgeInsets.all(16),
            child: GridView.builder(
              itemCount: categories.length,
              gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.75,
              ),
              itemBuilder: (_, i) =>
                  CategoryCard(category: categories[i]),
            ),
          );
        },
      ),
    );
  }
}

/// =======================================================
/// 🔥 EXTRACT ACTIVE CATEGORIES (FILTERED)
/// =======================================================
List<CategoryType> extractCategories({
  required List<CategoryType> masterTree,
  String? selectedMasterId,
}) {
  final List<CategoryType> result = [];

  for (final master in masterTree) {
    // 🔍 Filter by selected master
    if (selectedMasterId != null && master.id != selectedMasterId) {
      continue;
    }

    final superCategories = master.children;
    if (superCategories == null) continue;

    for (final superCat in superCategories) {
      final categories = superCat.children;
      if (categories == null) continue;

      for (final cat in categories) {
        if (cat.isActive) {
          result.add(cat);
        }
      }
    }
  }

  return result;
}

/// =======================================================
/// LOADING STATE
/// =======================================================
Widget _buildLoading() {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: GridView.builder(
      itemCount: 8,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.75,
      ),
      itemBuilder: (_, __) => Column(
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 12,
            width: 60,
            color: Colors.grey.shade300,
          ),
        ],
      ),
    ),
  );
}

/// =======================================================
/// EMPTY STATE
/// =======================================================
Widget _buildEmpty(String text) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.category_outlined,
          size: 64,
          color: Colors.grey.shade400,
        ),
        const SizedBox(height: 16),
        Text(
          text,
          style: TextStyle(
            color: Colors.grey.shade500,
            fontSize: 14,
          ),
        ),
      ],
    ),
  );
}
