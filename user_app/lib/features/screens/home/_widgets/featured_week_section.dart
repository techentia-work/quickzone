import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/cache_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:Quickzon/features/models/featured/featured_week_brand_model.dart';
import 'package:Quickzon/features/providers/featured/featured_week_brand_controller.dart';

/// =======================================================
/// FEATURED THIS WEEK (SIMPLE ROW – NO BANNER)
/// =======================================================
class FeaturedWeekSection extends ConsumerWidget {
  const FeaturedWeekSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync =
    ref.watch(featuredWeekBrandControllerProvider);

    return featuredAsync.when(
      loading: () => const SizedBox(height: 140),
      error: (_, __) => const SizedBox.shrink(),
      data: (items) {
        if (items.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// ===============================
            /// TITLE
            /// ===============================
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Featured This Week',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.2,
                  color: Colors.black,
                ),
              ),
            ),

            const SizedBox(height: 12),

            /// ===============================
            /// HORIZONTAL LIST
            /// ===============================
            SizedBox(
              height: 155,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: items.length,
                separatorBuilder: (_, __) =>
                const SizedBox(width: 12),
                itemBuilder: (_, i) => _FeaturedWeekCard(
                  item: items[i],
                  isFirst: i == 0, // ✅ FIRST CARD GOLDEN
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// =======================================================
/// CARD (FULL IMAGE | FIRST = GOLDEN, REST = BLUE)
/// =======================================================
class _FeaturedWeekCard extends StatelessWidget {
  final FeaturedWeekBrand item;
  final bool isFirst;

  const _FeaturedWeekCard({
    required this.item,
    required this.isFirst,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor =
    isFirst ? const Color(0xFFFFC107) : Colors.blue.shade500;

    // 🔥 Pre-cache the image
    if (item.thumbnail != null && item.thumbnail!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        precacheImage(CachedNetworkImageProvider(item.thumbnail!, cacheManager: AppCacheManager.instance), context);
      });
    }

    return GestureDetector(
      onTap: () {
        context.push(
          '/featured-week/${item.slug}',
          extra: item,
        );
      },
      child: Container(
        width: 130,
        height: 115,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: borderColor,
            width: 3.5,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: item.thumbnail != null && item.thumbnail!.isNotEmpty
              ? CachedNetworkImage(
            imageUrl: item.thumbnail!,
            cacheManager: AppCacheManager.instance,
            fit: BoxFit.cover,
            // 🔹 Loader removed, grey box only
            placeholder: (context, url) => Container(
              color: Colors.grey.shade200,
            ),
            errorWidget: (context, url, error) => Container(
              color: Colors.grey.shade200,
              child: const Icon(Icons.image),
            ),
          )
              : Container(
            color: Colors.grey.shade200,
            child: const Icon(Icons.image),
          ),
        ),
      ),
    );
  }
}


