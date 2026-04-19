import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/banner/banner_provider.dart';
import '../../../../core/utils/cache_manager.dart';
import '../../../providers/category/category_provider.dart'; // ✅ ADD

class BannerCarousel extends ConsumerWidget {
  const BannerCarousel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bannersAsync = ref.watch(bannerControllerProvider);

    // 🔥 SAME AS FEATURED WEEK
    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

    return bannersAsync.when(
      loading: () => const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (banners) {
        if (banners == null || banners.isEmpty) {
          return const SizedBox.shrink();
        }

        /// =====================================================
        /// 🔥 MASTER CATEGORY FILTER (KEY PART)
        /// =====================================================
        final filteredBanners = selectedMasterId == null
            ? banners
            : banners.where((b) {
          // banner.masterCategory?.id same pattern as Featured
          return b.masterCategory?.id == selectedMasterId;
        }).toList();

        if (filteredBanners.isEmpty) {
          return const SizedBox.shrink();
        }

        /// =====================================================
        /// CASE 1: EXACTLY 3 → ZOMATO STYLE
        /// =====================================================
        if (filteredBanners.length == 3) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                /// LEFT BIG
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 3 / 4,
                    child: GestureDetector(
                      onTap: () =>
                          _onBannerTap(context, filteredBanners[0]),
                      child: _BannerCard(banner: filteredBanners[0]),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                /// RIGHT STACKED
                Expanded(
                  child: Column(
                    children: [
                      AspectRatio(
                        aspectRatio: 3 / 2,
                        child: GestureDetector(
                          onTap: () =>
                              _onBannerTap(context, filteredBanners[1]),
                          child: _BannerCard(banner: filteredBanners[1]),
                        ),
                      ),
                      const SizedBox(height: 12),
                      AspectRatio(
                        aspectRatio: 3 / 2,
                        child: GestureDetector(
                          onTap: () =>
                              _onBannerTap(context, filteredBanners[2]),
                          child: _BannerCard(banner: filteredBanners[2]),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        /// =====================================================
        /// CASE 2: 4+ → 2x2 GRID
        /// =====================================================
        if (filteredBanners.length >= 4) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 4,
              gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.25,
              ),
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () =>
                      _onBannerTap(context, filteredBanners[index]),
                  child: _BannerCard(banner: filteredBanners[index]),
                );
              },
            ),
          );
        }

        /// =====================================================
        /// CASE 3: 1–2 → HORIZONTAL SCROLL
        /// =====================================================
        return SizedBox(
          height: 190,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: filteredBanners.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.75,
                  child: GestureDetector(
                    onTap: () =>
                        _onBannerTap(context, filteredBanners[index]),
                    child:
                    _BannerCard(banner: filteredBanners[index]),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  /// =====================================================
  /// SAME NAVIGATION LOGIC
  /// =====================================================
  void _onBannerTap(BuildContext context, dynamic item) {
    final category = item.category;       // CategoryBasic?
    final subcategory = item.subcategory; // List<CategoryBasic>

    // ✅ ONLY when BOTH exist
    if (category != null &&
        category.slug != null &&
        subcategory is List &&
        subcategory.isNotEmpty) {
      context.push(
        '/category/${category.slug}/${subcategory.first.slug}',
      );
    }

    // ❌ else → kuch nahi karega
  }


}

/// =====================================================
/// BANNER CARD (NO CROP)
/// =====================================================
class _BannerCard extends StatelessWidget {
  final dynamic banner;

  const _BannerCard({required this.banner});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Container(
        color: Colors.transparent,
        child: FittedBox(
          fit: BoxFit.contain,
          alignment: Alignment.center,
          child: Builder(
            builder: (context) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
               try {
                 precacheImage(
                   CachedNetworkImageProvider(banner.imageUrl),
                   context,
                 );
               } catch (e) {
                 debugPrint('Banner precache error: $e');
               }
              });

              return CachedNetworkImage(
                imageUrl: banner.imageUrl,
                cacheManager: AppCacheManager.instance,
                errorWidget: (_, __, ___) => Container(
                  width: 100,
                  height: 100,
                  color: Colors.grey[300],
                  alignment: Alignment.center,
                  child: const Icon(Icons.broken_image, size: 40),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
