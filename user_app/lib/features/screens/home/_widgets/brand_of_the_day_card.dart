import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/cache_manager.dart';

import '../../../providers/brand_of_the_day/brand_of_the_day_provider.dart';

class BrandOfTheDaySection extends ConsumerWidget {
  const BrandOfTheDaySection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync =
    ref.watch(brandOfTheDayControllerProvider);

    return brandsAsync.when(
      loading: () => const SizedBox(height: 260),
      error: (_, __) => const SizedBox.shrink(),
      data: (brands) {
        if (brands.isEmpty) return const SizedBox.shrink();

        final brand = brands.first;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GestureDetector(
            onTap: () async {
              final url = brand.websiteUrl;
              if (url.isEmpty) return;

              await launchUrl(
                Uri.parse(url),
                mode: LaunchMode.externalApplication,
              );
            },
            child: Container(
              height: 260,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),

                /// 🔥 BANNER AS BACKGROUND
                image: brand.banner != null
                    ? DecorationImage(
                  image: CachedNetworkImageProvider(brand.banner!, cacheManager: AppCacheManager.instance),
                  fit: BoxFit.cover, // ✅ IMPORTANT
                  alignment: Alignment.center,
                )
                    : null,

                /// 🔥 SOFT GRADIENT OVERLAY (READABILITY)
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withOpacity(0.05),
                    Colors.black.withOpacity(0.35),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Stack(
                children: [
                  /// TOP LEFT


                  /// TOP RIGHT
                  const Positioned(
                    top: 12,
                    right: 12,
                    child: _Pill(text: 'Ad', dark: true),

                  ),

                  /// 🔥 BOTTOM CARD (OVERLAY)
                  Positioned(
                    left: 12,
                    right: 12,
                    bottom: 12,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.54),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 8,
                            offset: Offset(0, 4),
                          )
                        ],
                      ),
                      child: Row(
                        children: [
                          /// LOGO
                          ClipRRect(
                            borderRadius: BorderRadius.circular(40),
                            child: brand.thumbnail != null
                                ? CachedNetworkImage(
                              imageUrl: brand.thumbnail!,
                              cacheManager: AppCacheManager.instance,
                              width: 40,
                              height: 40,
                              fit: BoxFit.cover,
                              alignment: Alignment.center,
                              placeholder: (context, url) => Container(
                                color: Colors.grey[200],
                                child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                              ),
                              errorWidget: (context, url, error) => const Icon(Icons.error),
                            )
                                : Container(
                              width: 48,
                              height: 48,
                              color: Colors.black,
                            ),
                          ),
                          const SizedBox(width: 12),

                          /// TEXT
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  brand.name,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  brand.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.black,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          /// CTA
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius:
                              BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Shop now',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}


/// SMALL PILL
class _Pill extends StatelessWidget {
  final String text;
  final bool dark;

  const _Pill({
    required this.text,
    this.dark = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: dark
            ? Colors.black.withOpacity(0.6) // ✅ Ad pill
            : Colors.white.withOpacity(0.85),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: dark ? Colors.white : Colors.black,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

