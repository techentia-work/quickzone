// features/screens/category/category_products_screen.dart
import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../widgets/global_cart_bar.dart';
import '../../providers/category/category_provider.dart';
import '../../providers/product/product_provider.dart';
import '../../../core/utils/cache_manager.dart';
import '../../models/category/category_model.dart';
import '../../models/product/product_model.dart';

/// Complete Category Products Screen with Sidebar and Products Grid
class CategoryProductsScreen extends ConsumerStatefulWidget {
  final String categoryId; // This is the slug
  final String? subcategoryId; // This is also slug if provided

  const CategoryProductsScreen({
    super.key,
    required this.categoryId,
    this.subcategoryId,
  });

  @override
  ConsumerState<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends ConsumerState<CategoryProductsScreen> {
  String? selectedSubcategorySlug;
  String? selectedSubcategoryId; // Actual MongoDB ID
  String? selectedBanner;
  bool _showSkeleton = false;
  bool _subcategoryResolved = false;
  @override
  void initState() {
    super.initState();
    selectedSubcategorySlug = widget.subcategoryId;
  }

  @override
  void didUpdateWidget(CategoryProductsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.subcategoryId != widget.subcategoryId) {
      setState(() {
        selectedSubcategorySlug = widget.subcategoryId;
        selectedSubcategoryId = null;
        selectedBanner = null;
        _subcategoryResolved = false;
      });
    }
  }

  void _handleBack() {
    // 🔥 Always go to Home
    context.go('/');
  }

  Future<void> _switchSubcategory(CategoryType? subcategory) async {
    // Show skeleton
    setState(() => _showSkeleton = true);

    // Wait for 100ms
    await Future.delayed(const Duration(milliseconds: 100));

    if (subcategory != null) {
      setState(() {
        selectedSubcategorySlug = subcategory.slug;
        selectedSubcategoryId = subcategory.id;
        selectedBanner = subcategory.banner;
        _showSkeleton = false;
      });
      context.go('/category/${widget.categoryId}/${subcategory.slug}');
    } else {
      setState(() {
        selectedSubcategorySlug = null;
        selectedSubcategoryId = null;
        selectedBanner = null;
        _showSkeleton = false;
      });
      context.go('/category/${widget.categoryId}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryAsync = ref.watch(categoryBySlugProvider(widget.categoryId));

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (!didPop) {
          _handleBack();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFEFF9F0),
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => _handleBack(),
          ),
          title: categoryAsync.when(
            data: (category) => Text(
              category?.name ?? 'Products',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            loading: () => const Text('Loading...'),
            error: (_, __) => const Text('Category'),
          ),
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () => context.push('/search'),
            ),
          ],
        ),
        body: categoryAsync.when(
          data: (category) {
            if (category == null) {
              return const Center(
                child: Text(
                  'Category not found',
                  style: TextStyle(fontSize: 16),
                ),
              );
            }

            // Update selectedSubcategoryId when category data loads
            // Resolve subcategory ID once when category loads
            if (!_subcategoryResolved &&
                selectedSubcategoryId == null) {

              final children = (category.children ?? [])
                  .where((child) => child.isActive)
                  .toList()
                ..sort((a, b) => a.order.compareTo(b.order));

              CategoryType? subcategory;

              if (children.isNotEmpty) {
                if (selectedSubcategorySlug != null) {
                  subcategory = children.firstWhere(
                        (child) => child.slug == selectedSubcategorySlug,
                    orElse: () => children.first,
                  );
                } else {
                  subcategory = children.first;
                }
              }

              _subcategoryResolved = true;

              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (!mounted) return;
                setState(() {
                  selectedSubcategoryId = subcategory?.id;
                  selectedSubcategorySlug = subcategory?.slug;
                  selectedBanner = subcategory?.banner ?? category.banner;
                });
              });
            }

            return Stack(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sidebar with subcategories
                    _CategorySidebar(
                      category: category,
                      selectedSubcategorySlug: selectedSubcategorySlug ?? widget.subcategoryId,
                      onSubcategorySelected: _switchSubcategory,
                    ),

                    // Products grid
                    Expanded(
                      child: _showSkeleton
                          ? _buildProductsSkeleton()
                          : Column(
                              children: [
                                if (selectedBanner != null && selectedBanner!.isNotEmpty)
                                  Container(
                                    width: double.infinity,
                                    margin: const EdgeInsets.only(left: 16, right: 16, top: 16),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: CachedNetworkImage(
                                        imageUrl: selectedBanner!,
                                        fit: BoxFit.cover,
                                        errorWidget: (_, __, ___) => const SizedBox.shrink(),
                                      ),
                                    ),
                                  ),
                                Expanded(
                                  child: _ProductsGrid(
                                    categoryId: selectedSubcategoryId ?? category.id,
                                    categoryName: category.name,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ],
                ),

                /// 🛒 GLOBAL CART BAR
                const Positioned(
                  left: 12,
                  right: 12,
                  bottom: 15,
                  child: GlobalCartBar(),
                ),
              ],
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF5AC268)),
            ),
          ),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                const SizedBox(height: 16),
                Text(
                  'Error loading category',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProductsSkeleton() {
    return GridView.builder(
      primary: false,
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.68,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => _AnimatedProductSkeleton(),
    );
  }
}

/// ✨ Animated shimmer skeleton (top-left → bottom-right)
class _AnimatedProductSkeleton extends StatefulWidget {
  const _AnimatedProductSkeleton();

  @override
  State<_AnimatedProductSkeleton> createState() =>
      _AnimatedProductSkeletonState();
}

class _AnimatedProductSkeletonState extends State<_AnimatedProductSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1, milliseconds: 200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final shimmerGradient = LinearGradient(
          begin: const Alignment(-1.0, -1.0),
          end: const Alignment(1.0, 1.0),
          colors: [
            Colors.grey.shade300,
            Colors.grey.shade100,
            Colors.grey.shade300,
          ],
          stops: [
            (_controller.value - 0.3).clamp(0.0, 1.0),
            _controller.value.clamp(0.0, 1.0),
            (_controller.value + 0.3).clamp(0.0, 1.0),
          ],
        );

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              // --- Image area shimmer ---
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: shimmerGradient,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  ),
                ),
              ),


              // --- Text and buttons area ---
              Padding(
                padding: const EdgeInsets.all(8),
                child: SizedBox(
                  height: 100, // 👈 FIXED SAFE HEIGHT (important)
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _shimmerBox(
                        height: 14,
                        width: double.infinity,
                        gradient: shimmerGradient,
                      ),
                      const SizedBox(height: 6),
                      _shimmerBox(
                        height: 20,
                        width: 100,
                        gradient: shimmerGradient,
                      ),
                      const SizedBox(height: 6),
                      _shimmerBox(
                        height: 12,
                        width: 60,
                        gradient: shimmerGradient,
                      ),
                      const SizedBox(height: 10),

                      // --- Price and button ---
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _shimmerBox(
                                height: 16,
                                width: 50,
                                gradient: shimmerGradient,
                              ),
                              const SizedBox(height: 4),
                              _shimmerBox(
                                height: 11,
                                width: 40,
                                gradient: shimmerGradient,
                              ),
                            ],
                          ),
                          _shimmerBox(
                            height: 32, // 👈 thoda chhota
                            width: 56,
                            radius: 8,
                            gradient: shimmerGradient,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _shimmerBox({
    required double height,
    required double width,
    required Gradient gradient,
    double radius = 4,
  }) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

// ============================================================================
// CATEGORY SIDEBAR
// ============================================================================

class _CategorySidebar extends StatelessWidget {
  final CategoryType category;
  final String? selectedSubcategorySlug;
  final Function(CategoryType?) onSubcategorySelected;

  const _CategorySidebar({
    required this.category,
    required this.selectedSubcategorySlug,
    required this.onSubcategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    final ScrollController sidebarController = ScrollController();

    final subcategories = (category.children ?? [])
        .where((child) => child.isActive)
        .toList()
      ..sort((a, b) => a.order.compareTo(b.order));

    return Container(
      width: 75,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          right: BorderSide(color: Colors.grey[300]!, width: 1),
        ),
      ),
      child: Column(
        children: [

          if (subcategories.isNotEmpty)
            Divider(height: 1, color: Colors.grey[200]),

          Expanded(
            child: Scrollbar(
              controller: sidebarController, // ✅ ADD THIS
              thumbVisibility: true,
              thickness: 3,
              radius: const Radius.circular(2),
              child: ListView.separated(
                controller: sidebarController, // ✅ ADD THIS
                primary: false,                // ✅ ADD THIS
                padding: const EdgeInsets.only(bottom: 80),
                itemCount: subcategories.length,
                separatorBuilder: (_, __) =>
                    Divider(height: 1, color: Colors.grey[200]),
                itemBuilder: (context, index) {
                  final subcategory = subcategories[index];
                  
                  // Precaching subcategory image
                  if (subcategory.thumbnail != null && subcategory.thumbnail!.isNotEmpty) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      try {
                        precacheImage(
                          CachedNetworkImageProvider(subcategory.thumbnail!),
                          context,
                        );
                      } catch (_) {}
                    });
                  }

                  return _SubcategoryTile(
                    name: subcategory.name,
                    thumbnail: subcategory.thumbnail,
                    isSelected:
                    selectedSubcategorySlug == subcategory.slug,
                    onTap: () =>
                        onSubcategorySelected(subcategory),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}


// ============================================================================
// SUBCATEGORY TILE
// ============================================================================

// ============================================================================
// SUBCATEGORY TILE (OVERFLOW FIXED – NO MORE 6 PIXELS ERROR)
/// ============================================================================

// ============================================================================
// SUBCATEGORY TILE (FINAL OVERFLOW FIX – NO MORE ERRORS)
// ============================================================================

// ============================================================================
// SUBCATEGORY TILE (FINAL FIX – NO OVERFLOW EVER – TESTED)
// ============================================================================

// ============================================================================
// SUBCATEGORY TILE (ULTIMATE FIX – NO OVERFLOW – INTRINSIC HEIGHT)
// ============================================================================

class _SubcategoryTile extends StatelessWidget {
  final String name;
  final String? thumbnail;
  final bool isSelected;
  final VoidCallback onTap;

  const _SubcategoryTile({
    required this.name,
    this.thumbnail,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6), // 👈 thoda kam
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF5AC268).withOpacity(0.08)
              : Colors.transparent,
          border: Border(
            left: BorderSide(
              color: isSelected ? const Color(0xFF5AC268) : Colors.transparent,
              width: 3,
            ),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min, // ✅ IMPORTANT
          children: [
            SizedBox(
              width: 40,
              height: 40,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: thumbnail != null && thumbnail!.isNotEmpty
                    ? CachedNetworkImage(
                  imageUrl: thumbnail!,
                  cacheManager: AppCacheManager.instance,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: Colors.grey[100],
                    child: const Center(
                      child: SizedBox(
                        width: 15,
                        height: 15,
                        child: CircularProgressIndicator(strokeWidth: 1.5),
                      ),
                    ),
                  ),
                  errorWidget: (_, __, ___) =>
                  const Icon(Icons.category_outlined, size: 20),
                )
                    : const Icon(Icons.category_outlined, size: 20),
              ),
            ),

            const SizedBox(height: 4),

            // ✅ NO Flexible
            Text(
              name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 9,
                height: 1.1, // 👈 line height kam
                fontWeight:
                isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected
                    ? const Color(0xFF5AC268)
                    : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// PRODUCTS GRID

class _ProductsGrid extends ConsumerWidget {
  final String categoryId; // MongoDB ID
  final String categoryName;

  const _ProductsGrid({
    required this.categoryId,
    required this.categoryName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(
      productsByCategoryProvider(
        CategoryProductsParams(
          categoryId: categoryId,
          queryParams: {
            'includeSubcategories': true,
            'limit': '1000'
          },
        ),
      ),
    );

    return productsAsync.when(
      data: (products) {
        if (products.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.inventory_2_outlined,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'No products found',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Check back later for new items',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          );
        }

        return GridView.builder(
          primary: false,
          padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 80),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.60,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: products.length,
          itemBuilder: (context, index) {
            return ProductCard1(product: products[index]);
          },
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF5AC268)),
        ),
      ),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Error loading products',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(productsByCategoryProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}