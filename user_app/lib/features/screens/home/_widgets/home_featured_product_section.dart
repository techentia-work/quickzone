import 'package:Quickzon/features/providers/featured/featured_product_provider.dart';
import 'package:Quickzon/features/widgets/card/product_card.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/cache_manager.dart';

import '../../../models/featured/featured_product_section.dart';
import '../../../models/featured/featured_product_model.dart';

import '../../../widgets/card/product_card1.dart';
import 'featured_products_page.dart';

/// =======================================================
/// 🔥 REUSABLE FEATURED PRODUCT SECTION
/// =======================================================
class HomeFeaturedProductSection extends ConsumerWidget {
  final Provider<List<FeaturedProductSection>> sectionsProvider;

  const HomeFeaturedProductSection({
    super.key,
    required this.sectionsProvider,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sections = ref.watch(sectionsProvider);
    final asyncState = ref.watch(featuredProductControllerProvider);

    // 🔥 Loading state
    if (asyncState.isLoading) {
      return const SizedBox(
        height: 280,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    // 🔥 Error state
    if (asyncState.hasError) {
      return const SizedBox.shrink();
    }

    // 🔥 No sections
    if (sections.isEmpty) {
      return const SizedBox.shrink();
    }

    // 🔥 Render all sections for this position
    return Column(
      children: sections.map((section) {
        final products = section.mappings
            .map((m) => m.product)
            .whereType<FeaturedProductItem>()
            .toList();

        if (products.isEmpty) {
          return const SizedBox.shrink();
        }

        // 🔥 PRECACHE SECTION BANNERS & PRODUCTS
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (section.imageUrl != null && section.imageUrl!.isNotEmpty) {
            precacheImage(CachedNetworkImageProvider(section.imageUrl!, cacheManager: AppCacheManager.instance), context);
          }
          for (final p in products) {
            if (p.mainImage != null && p.mainImage!.isNotEmpty) {
              precacheImage(CachedNetworkImageProvider(p.mainImage!, cacheManager: AppCacheManager.instance), context);
            }
          }
        });

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            /// ================= BANNER =================
            if ((section.imageUrl ?? '').isNotEmpty)
              CachedNetworkImage(
                imageUrl: section.imageUrl!,
                cacheManager: AppCacheManager.instance,
                width: double.infinity,
                fit: BoxFit.fitWidth,
                placeholder: (context, url) => Container(
                  width: double.infinity,
                  height: 200,
                  color: Colors.grey.shade200,
                ),
                errorWidget: (context, url, error) => Container(
                  width: double.infinity,
                  height: 200,
                  color: Colors.grey.shade300,
                  child: Icon(Icons.image),
                ),
              ),

            /// ================= FEATURED PRODUCTS =================
            _HorizontalProductList(
              products: products,
              backgroundColor: section.bgColor,
              title: section.title,
            ),

            const SizedBox(height: 16), // Spacing between sections
          ],
        );
      }).toList(),
    );
  }
}

/// =======================================================
/// HORIZONTAL PRODUCT LIST WITH ARROWS + SEE ALL
/// =======================================================
class _HorizontalProductList extends StatefulWidget {
  final List<FeaturedProductItem> products;
  final Color? backgroundColor;
  final String title;

  const _HorizontalProductList({
    required this.products,
    this.backgroundColor,
    required this.title,
  });

  @override
  State<_HorizontalProductList> createState() =>
      _HorizontalProductListState();
}

class _HorizontalProductListState extends State<_HorizontalProductList> {
  final ScrollController _controller = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _scrollLeft() {
    _controller.animateTo(
      (_controller.offset - 200)
          .clamp(0.0, _controller.position.maxScrollExtent),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  void _scrollRight() {
    _controller.animateTo(
      (_controller.offset + 200)
          .clamp(0.0, _controller.position.maxScrollExtent),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: widget.backgroundColor ?? Colors.transparent,
      padding: const EdgeInsets.only(top: 12),
      child: Stack(
        children: [
          /// ================= PRODUCT LIST =================
          SizedBox(
            height: 280,
            child: ListView.separated(
              controller: _controller,
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 64),
              itemCount: widget.products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, i) {
                return SizedBox(
                  width: 180,
                  child: ProductCard1(
                    product: widget.products[i],
                    showFavorite: true,
                    showAddButton: true,
                  ),
                );
              },
            ),
          ),

          /// ================= LEFT ARROW =================
          Positioned(
            left: 4,
            top: 0,
            bottom: 44,
            child: _ArrowButton(
              icon: Icons.chevron_left,
              onTap: _scrollLeft,
            ),
          ),

          /// ================= RIGHT ARROW =================
          Positioned(
            right: 4,
            top: 0,
            bottom: 44,
            child: _ArrowButton(
              icon: Icons.chevron_right,
              onTap: _scrollRight,
            ),
          ),

          /// ================= SEE ALL =================
          Positioned(
            left: 16,
            right: 16,
            bottom: 6,
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FeaturedProductsPage(
                      title: widget.title,
                      products: widget.products,
                    ),
                  ),
                );
              },
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.75),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text(
                        'See all products',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(width: 6),
                      Icon(Icons.arrow_forward_ios, size: 14),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// =======================================================
/// ARROW BUTTON
/// =======================================================
class _ArrowButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _ArrowButton({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 6,
              ),
            ],
          ),
          child: Icon(icon, size: 24),
        ),
      ),
    );
  }
}