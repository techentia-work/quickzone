import 'package:Quickzon/core/utils/responsive/responsive.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/utils/cache_manager.dart';
import '../../../providers/category/category_provider.dart';

/// =======================================================
/// SHOP BY CATEGORY (RESPONSIVE GRID – FINAL)
/// =======================================================
class ShopByCategorySection extends ConsumerWidget {
  final int maxSuperCategories;

  const ShopByCategorySection({
    super.key,
    this.maxSuperCategories = 5,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final superCategories = ref.watch(superCategoriesProvider);

    if (superCategories.isEmpty) {
      return const SizedBox.shrink();
    }

    final displayCategories =
    superCategories.take(maxSuperCategories).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: displayCategories
          .map(
            (superCategory) =>
            _SuperCategoryGrid(superCategory: superCategory),
      )
          .toList(),
    );
  }
}

/// =======================================================
/// SUPER CATEGORY GRID (TIGHT & CLEAN)
/// =======================================================
class _SuperCategoryGrid extends ConsumerWidget {
  final dynamic superCategory;

  const _SuperCategoryGrid({required this.superCategory});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final r = Responsive(context);
    final categories =
    ref.watch(categoriesOfSuperProvider(superCategory.id));

    if (categories.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 8), // tight gap
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// TITLE
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Text(
              superCategory.name,
              style: TextStyle(
                fontSize: r.sp(20),
                color:Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          /// 🔥 WRAP INSTEAD OF GRIDVIEW
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 12,
              children: categories.map<Widget>((cat) {
                return SizedBox(
                  width: _itemWidth(context),
                  child: _CategoryTile(category: cat),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  double _itemWidth(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    const horizontalPadding = 32; // 16 + 16
    const spacing = 8;

    if (width >= 1024) {
      return (width - horizontalPadding - (7 * spacing)) / 8;
    }
    if (width >= 768) {
      return (width - horizontalPadding - (5 * spacing)) / 6;
    }
    if (width >= 430) {
      return (width - horizontalPadding - (4 * spacing)) / 5;
    }

    // 🔥 PHONE → EXACT 4 PER ROW
    return (width - horizontalPadding - (3 * spacing)) / 4;
  }

}


/// =======================================================
/// CATEGORY TILE (RESPONSIVE & SAFE)
/// =======================================================
class _CategoryTile extends StatelessWidget {
  final dynamic category;

  const _CategoryTile({required this.category});

  @override
  Widget build(BuildContext context) {
    final r = Responsive(context);
    final double imageSize = r.isTablet ? 84 : 72;

    // 🔥 Precache the image
    if (category.thumbnail != null && category.thumbnail!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        precacheImage(CachedNetworkImageProvider(category.thumbnail!, cacheManager: AppCacheManager.instance), context);
      });
    }

    return GestureDetector(
      onTap: () {
        context.push('/category/${category.slug}');
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          /// IMAGE
          Container(
            height: imageSize,
            width: imageSize,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF7F6),
              borderRadius: BorderRadius.circular(14),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: category.thumbnail != null && category.thumbnail!.isNotEmpty
                  ? CachedNetworkImage(
                imageUrl: category.thumbnail!,
                cacheManager: AppCacheManager.instance,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: const Color(0xFFEFF7F6),
                  child: const Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
                errorWidget: (context, url, error) => const Icon(
                  Icons.category_outlined,
                  size: 28,
                ),
              )
                  : const Icon(
                Icons.category_outlined,
                size: 28,
              ),
            ),
          ),

          const SizedBox(height: 8),

          /// NAME
          SizedBox(
            height: r.isTablet ? 40 : 32,
            child: Text(
              category.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: r.sp(12),
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

