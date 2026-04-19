import 'package:Quickzon/features/providers/category/category_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../providers/featured/featured_provider.dart';
import '../../../../core/utils/cache_manager.dart';
import '../../../models/featured/featured_model.dart';
import 'package:url_launcher/url_launcher.dart';
import 'home_navbar.dart';
import 'home_master_categories.dart';

/// =======================================================
/// FEATURED SECTION (APP ONLY)
/// =======================================================
class FeaturedSection extends ConsumerWidget {
  const FeaturedSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredControllerProvider);

    return featuredAsync.maybeWhen(
      data: (sections) {
        final hasHero = sections.any((s) => s.appLayout == 'HERO');

        if (!hasHero) {
          // Render Fallback Navbar Area + All sections as banners
          return Column(
            children: [
              const _FallbackHeroArea(),
              ...sections.map((section) => _FeaturedBanner(
                key: ValueKey(section.id),
                section: section,
              )),
            ],
          );
        }

        // Render sections, preserving HERO layout for those that have it
        return Column(
          children: sections.map((section) {
            if (section.appLayout == 'HERO') {
              return _HeroLayout(section: section);
            }
            return _FeaturedBanner(
              key: ValueKey(section.id),
              section: section,
            );
          }).toList(),
        );
      },
      orElse: () => const _FallbackHeroArea(),
    );
  }
}

/// =======================================================
/// FALLBACK HERO AREA (NAVBAR + CATEGORIES ONLY)
/// =======================================================
class _FallbackHeroArea extends StatelessWidget {
  const _FallbackHeroArea();

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: statusBarHeight),
            child: const HomeNavBar(),
          ),
          const HomeMasterCategories(),
        ],
      ),
    );
  }
}

/// =======================================================
/// HERO LAYOUT (INTEGRATED WITH NAVBAR)
/// =======================================================
class _HeroLayout extends StatelessWidget {
  final FeaturedType section;

  const _HeroLayout({required this.section});

  Color _hexToColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final bannerUrl = section.imageUrl1?.isNotEmpty == true
        ? section.imageUrl1!
        : (section.imageUrl ?? '');

    final statusBarHeight = MediaQuery.of(context).padding.top;
    final bgColor = section.color != null
        ? _hexToColor(section.color!)
        : Colors.white;

    final mappings = section.mappings ?? [];

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: bgColor),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: statusBarHeight),
            child: const HomeNavBar(),
          ),
          if (bannerUrl.isNotEmpty) ...[
            CachedNetworkImage(
              imageUrl: bannerUrl,
              cacheManager: AppCacheManager.instance,
              width: double.infinity,
              height: 120,
              fit: BoxFit.cover,
            ),
          ],
          const HomeMasterCategories(),
          if (mappings.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
              child: _SubCategoryGrid(
                items: mappings,
                section: section,
                color: section.color,
              ),
            ),
           const SizedBox(height: 12),
        ],
      ),
    );
  }
}



/// =======================================================
/// FEATURED BANNER + GRID
/// =======================================================
class _FeaturedBanner extends StatelessWidget {
  final FeaturedType section;

  const _FeaturedBanner({
    super.key,
    required this.section,
  });

  Color _hexToColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final bannerUrl = section.imageUrl1?.isNotEmpty == true
        ? section.imageUrl1!
        : (section.imageUrl ?? '');

    // 🔥 Use mappings directly to preserve 'type'
    final mappings = section.mappings
        ?.where((e) => e.productData != null)
        .toList() ??
        [];

    if (bannerUrl.isEmpty && mappings.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (bannerUrl.isNotEmpty)
          SizedBox(
            width: double.infinity,
            height: 200,
            child: Builder(
              builder: (context) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  try {
                    precacheImage(
                      CachedNetworkImageProvider(bannerUrl, cacheManager: AppCacheManager.instance),
                      context,
                    );
                  } catch (_) {}
                });

                return CachedNetworkImage(
                  imageUrl: bannerUrl,
                  cacheManager: AppCacheManager.instance,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Center(
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                );
              },
            ),

          ),

        if (mappings.isNotEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
             decoration: BoxDecoration(
              color: section.color != null
                  ? _hexToColor(section.color!)
                  : Colors.grey.shade100,
            ),
            child: _SubCategoryGrid(
              items: mappings,
              section: section,
              color: section.color,
            ),
          ),
      ],
    );
  }
}


/// =======================================================
/// SUBCATEGORY GRID
/// =======================================================
class _SubCategoryGrid extends StatelessWidget {
  final List<FeaturedMapping> items;
  final FeaturedType section;
  final String? color;

  const _SubCategoryGrid({
    required this.items,
    required this.section,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final count = items.length;
    final gridCount = section.gridCount ?? 6;

    if (gridCount == 5 && count >= 5) {
      return Column(
        children: [
          Row(
            children: [
              Expanded(child: _BigTile(items[0], section, color)),
              const SizedBox(width: 8),
              Expanded(child: _BigTile(items[1], section, color)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _SmallTile(items[2], section, color)),
              const SizedBox(width: 8),
              Expanded(child: _SmallTile(items[3], section, color)),
              const SizedBox(width: 8),
              Expanded(child: _SmallTile(items[4], section, color)),
            ],
          ),
        ],
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: count.clamp(0, gridCount),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: gridCount == 5 ? 2 : 3, // Fallback if not specifically 5 stagger
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemBuilder: (_, i) => _SmallTile(items[i], section, color),
    );
  }
}


/// =======================================================
/// TILE VARIANTS
/// =======================================================
class _BigTile extends StatelessWidget {
  final FeaturedMapping mapping;
  final FeaturedType section;
  final String? color;

  const _BigTile(this.mapping, this.section, this.color);

  @override
  Widget build(BuildContext context) {
    return _BaseTile(
      mapping: mapping,
      section: section,
      size: 110,
      fontSize: 11,
      color: color,
    );
  }
}

class _SmallTile extends StatelessWidget {
  final FeaturedMapping mapping;
  final FeaturedType section;
  final String? color;

  const _SmallTile(this.mapping, this.section, this.color);

  @override
  Widget build(BuildContext context) {
    return _BaseTile(
      mapping: mapping,
      section: section,
      size: 78,
      fontSize: 11,
      color: color,
    );
  }
}

/// =======================================================
/// BASE TILE
/// =======================================================
class _BaseTile extends StatelessWidget {
  final FeaturedMapping mapping;
  final FeaturedType section;
  final double size;
  final double fontSize;
  final String? color;

  const _BaseTile({
    required this.mapping,
    required this.section,
    required this.size,
    required this.fontSize,
    this.color,
  });

  Color _hexToColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final shadowColor = color != null
        ? _hexToColor(color!).withOpacity(0.35)
        : Colors.black.withOpacity(0.15);

    // 🔥 Precache the image for smooth loading
    if (mapping.productData?.thumbnail != null && mapping.productData!.thumbnail!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        precacheImage(CachedNetworkImageProvider(mapping.productData!.thumbnail!, cacheManager: AppCacheManager.instance), context);
      });
    }

    return GestureDetector(
      onTap: () async {
        // 🔥 Handle URL Redirection
        if (mapping.type == 'URL') {
           final url = mapping.externalUrl;
           if (url != null && url.isNotEmpty) {
             final uri = Uri.parse(url);
             if (await canLaunchUrl(uri)) {
               await launchUrl(uri, mode: LaunchMode.externalApplication);
             }
           }
           return;
        }

        // 🔥 Handle CATEGORY navigation
        if (mapping.type == 'CATEGORY') {
           final slug = mapping.refId; // Or from productData if fully populated
           if (slug.isNotEmpty) {
             context.push('/category/$slug');
           }
           return;
        }

        // ⤵️ Existing logic for SUBCATEGORY (requires parent)
        final parent = section.category?.slug;
        if (parent == null) return;

        final sub = mapping.refId;
        context.push(
          sub.isNotEmpty ? '/category/$parent/$sub' : '/category/$parent',
        );
      },
        child: AspectRatio(
          aspectRatio: 1,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: (mapping.productData?.thumbnail != null && mapping.productData!.thumbnail!.isNotEmpty)
                ? CachedNetworkImage(
                    imageUrl: mapping.productData!.thumbnail!,
                    cacheManager: AppCacheManager.instance,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    placeholder: (context, url) => Container(
                      color: Colors.grey.shade200,
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.category),
                    ),
                  )
                : Container(
                    color: Colors.white,
                    child: Center(
                      child: Icon(
                        mapping.type == 'URL' ? Icons.link : Icons.category,
                        color: Colors.grey.shade400,
                      ),
                    ),
                  ),
          ),
        ),
    );
  }
}


