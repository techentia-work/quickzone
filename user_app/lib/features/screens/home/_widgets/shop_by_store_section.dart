import 'package:Quickzon/features/providers/featured/shop_by_store_controller.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:Quickzon/features/models/featured/shop_by_store_model.dart';

/// =======================================================
/// SHOP BY STORE SECTION
/// =======================================================
class ShopByStoreSection extends ConsumerWidget {
  const ShopByStoreSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storesAsync = ref.watch(shopByStoreControllerProvider);

    return storesAsync.when(
      loading: () => const SizedBox(height: 240),
      error: (_, __) => const SizedBox.shrink(),
      data: (items) {
        if (items.isEmpty) return const SizedBox.shrink();

        // 🔥 PRECACHE STORE IMAGES
        WidgetsBinding.instance.addPostFrameCallback((_) {
          for (final store in items) {
            if (store.thumbnail != null && store.thumbnail!.isNotEmpty) {
              precacheImage(CachedNetworkImageProvider(store.thumbnail!), context);
            }
          }
        });

        // 🔥 SCREEN WIDTH
        final screenWidth = MediaQuery.of(context).size.width;
        const spacing = 16.0;

        // 🔥 4 ITEMS PER ROW (SAME AS GRID)
        final itemWidth =
            (screenWidth - (spacing * 2) - (spacing * 3)) / 4;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// ===============================
            /// TITLE
            /// ===============================
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Shop by store',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),

            const SizedBox(height: 14),

            /// ===============================
            /// WRAP (🔥 REPLACED GRID)
            /// ===============================
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: spacing,
                runSpacing: spacing,
                children: items.map((store) {
                  return SizedBox(
                    width: itemWidth,
                    child: _ShopByStoreCard(store: store),
                  );
                }).toList(),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// =======================================================
/// SHOP BY STORE CARD
/// =======================================================
class _ShopByStoreCard extends StatelessWidget {
  final ShopByStore store;

  const _ShopByStoreCard({
    required this.store,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push(
          '/shop-by-store/${store.slug}',
          extra: store,
        );
      },
      child: Column(
        children: [
          /// IMAGE
          Container(
            height: 90,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              color: Colors.grey.shade100,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: store.thumbnail != null
                  ? CachedNetworkImage(
                imageUrl: store.thumbnail!,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: Colors.grey.shade100),
                errorWidget: (context, url, error) => const Icon(Icons.store, size: 32),
              )
                  : const Icon(Icons.store, size: 32),
            ),
          ),

          const SizedBox(height: 10),

          /// TEXT
          Column(
            children: [
              Text(
                store.name.replaceAll(RegExp(r'\s*Store$'), ''),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
              Text(
                store.name.endsWith('Store') ? 'Store' : '',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
