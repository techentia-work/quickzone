import 'package:Quickzon/features/providers/cart/cart_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/utils/cache_manager.dart';
import 'package:go_router/go_router.dart';

class GlobalCartBar extends ConsumerWidget {
  const GlobalCartBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartControllerProvider);

    if (!cartState.hasValue ||
        cartState.value == null ||
        cartState.value!.items.isEmpty) {
      return const SizedBox.shrink();
    }

    final items = cartState.value!.items;
    final itemCount =
    items.fold<int>(0, (sum, item) => sum + item.quantity);
    final totalAmount = cartState.value!.totalAmount;

    /// max 3 images hi dikhani hain
    final previewItems = items.take(3).toList();

    return Material(

      elevation: 8,
      borderRadius: BorderRadius.circular(16),
      color: const Color(0xFF1FAA59),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.go('/cart'),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              /// 🖼 STACKED PRODUCT IMAGES
              SizedBox(
                height: 40,
                width: 50,
                child: Stack(
                  children: [
                    for (int i = 0; i < previewItems.length; i++)
                      Positioned(
                        left: i * 14.0,
                        child: Container(
                          height: 36,
                          width: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white,
                              width: 2,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Builder(
                            builder: (context) {
                              final imgUrl = previewItems[i].productId.mainImage ?? '';
                              if (imgUrl.isNotEmpty) {
                                WidgetsBinding.instance.addPostFrameCallback((_) {
                                  try {
                                    precacheImage(
                                      CachedNetworkImageProvider(imgUrl, cacheManager: AppCacheManager.instance),
                                      context,
                                    );
                                  } catch (_) {}
                                });
                              }

                              return CachedNetworkImage(
                                imageUrl: imgUrl,
                                cacheManager: AppCacheManager.instance,
                                fit: BoxFit.cover,
                                errorWidget: (_, __, ___) =>
                                    const Icon(Icons.image, size: 16),
                              );
                            },
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              /// TEXT
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'View cart',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      '$itemCount item${itemCount > 1 ? 's' : ''}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),

              /// TOTAL
              Text(
                '₹${totalAmount.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward_ios,
                  size: 14, color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}
