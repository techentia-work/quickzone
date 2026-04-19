import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:Quickzon/features/providers/wishlist/wishlist_provider.dart';
import 'package:Quickzon/features/widgets/global_cart_bar.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/cart/cart_provider.dart';
import 'package:Quickzon/features/providers/product/product_provider.dart';
import './_widgets/_widgets.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;

  const ProductDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String? selectedVariantId;
  final ScrollController _scrollController = ScrollController();
  bool _showFloatingBar = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.offset > 400 && !_showFloatingBar) {
      setState(() => _showFloatingBar = true);
    } else if (_scrollController.offset <= 400 && _showFloatingBar) {
      setState(() => _showFloatingBar = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productBySlugProvider(widget.slug));
    final cartAsync = ref.watch(cartControllerProvider);
    final wishlistAsync = ref.watch(wishlistControllerProvider);
    final authState = ref.watch(authControllerProvider); // ✅ Watch auth

    return productAsync.when(
      data: (product) {
        if (product == null) return _buildNotFoundScreen();

        if (selectedVariantId == null && product.variants.isNotEmpty) {
          selectedVariantId = product.variants.first.id;
        }

        final selectedVariant = product.variants.firstWhere(
              (v) => v.id == selectedVariantId,
          orElse: () => product.variants.first,
        );

        bool isFavorite = false;
        if (wishlistAsync.hasValue && wishlistAsync.value != null) {
          isFavorite = wishlistAsync.value!.items.any(
                (item) => item.productId.id == product.id,
          );
        }

        int cartQuantity = 0;
        if (cartAsync.hasValue && cartAsync.value != null) {
          try {
            final cartItem = cartAsync.value!.items.firstWhere(
                  (item) => item.variantId == selectedVariantId,
            );
            cartQuantity = cartItem.quantity;
          } catch (_) {}
        }

        return Scaffold(
          backgroundColor: Colors.white,

          body: Stack(
            children: [
              /// MAIN PRODUCT CONTENT
              CustomScrollView(
                controller: _scrollController,
                slivers: [
                  SliverAppBar(
                    expandedHeight: 400,
                    pinned: true,
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black87,
                    elevation: 0,
                    leading: const ProductAppBarBackButton(),
                    actions: [
                      ProductAppBarFavoriteButton(
                        isFavorite: isFavorite,
                        onToggle: () => _handleToggleWishlist(product, authState),
                      ),
                      const ProductAppBarShareButton(),
                    ],
                    flexibleSpace: FlexibleSpaceBar(
                      background: ProductImageCarousel(
                        images: [
                          if (product.mainImage != null) product.mainImage!,
                          ...product.images,
                        ],
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ProductInfoSection(
                          product: product,
                          selectedVariant: selectedVariant,
                        ),
                        const SectionDivider(),

                        if (product.variants.length > 1)
                          ProductVariantSelector(
                            variants: product.variants,
                            selectedVariantId: selectedVariantId!,
                            onVariantSelected: (variantId) {
                              setState(() => selectedVariantId = variantId);
                            },
                          ),

                        const SectionDivider(),

                        if (product.tags.isNotEmpty)
                          ProductFeaturesSection(tags: product.tags),

                        const SectionDivider(),

                        if (product.description != null ||
                            product.shortDescription != null)
                          ProductDescriptionSection(
                            description: product.description,
                            shortDescription: product.shortDescription,
                            brand: product.brand,
                            manufacturer: product.manufacturer,
                            madeIn: product.madeIn,
                          ),

                        const SectionDivider(),
                      const SizedBox(height: 20),
                        SimilarProductsSection(
                          categoryId: product.categoryId.id,
                          currentProductId: product.id,
                        ),

                        const SizedBox(height: 120), // 👈 cart bar ke liye space
                      ],
                    ),
                  ),
                ],
              ),

              /// 🛒 GLOBAL CART BAR (SAME AS HOME / CATEGORY)
              const Positioned(
                left: 12,
                right: 12,
                bottom: 10, // bottom nav ke upar
                child: GlobalCartBar(),
              ),
            ],
          ),

          /// PRODUCT PAGE KA APNA BOTTOM BAR
          bottomNavigationBar: ProductBottomBar(
            product: product,
            selectedVariant: selectedVariant,
            cartQuantity: cartQuantity,
            onAddToCart: () => _handleAddToCart(product.id, authState),
            onUpdateQuantity: (quantity) =>
                _handleUpdateQuantity(product.id, quantity, authState),
          ),
        );

      },
      loading: _buildLoadingScreen,
      error: (error, _) => _buildErrorScreen(error),
    );
  }

  /// ✅ Show login snackbar
  void _showLoginRequired(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Please login to continue'),
        action: SnackBarAction(
          label: 'Login',
          onPressed: () => context.push('/login'),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// ✅ Add to cart only if logged in
  void _handleAddToCart(String productId, AsyncValue authState) {
    if (!authState.hasValue || authState.value == null) {
      _showLoginRequired(context);
      return;
    }

    ref.read(cartControllerProvider.notifier).addItem(
      AddToCartPayload(
        productId: productId,
        variantId: selectedVariantId!,
        quantity: 1,
      ),
    );
  }

  /// ✅ Update quantity only if logged in
  void _handleUpdateQuantity(String productId, int quantity, AsyncValue authState) {
    if (!authState.hasValue || authState.value == null) {
      _showLoginRequired(context);
      return;
    }

    final notifier = ref.read(cartControllerProvider.notifier);
    if (quantity == 0) {
      notifier.removeItem(RemoveCartItemPayload(variantId: selectedVariantId!));
    } else {
      notifier.updateItemQuantity(
        UpdateCartQuantityPayload(
          productId: productId,
          variantId: selectedVariantId!,
          quantity: quantity,
        ),
      );
    }
  }

  /// ✅ Toggle wishlist only if logged in
  void _handleToggleWishlist(ProductType product, AsyncValue authState) {
    if (!authState.hasValue || authState.value == null) {
      _showLoginRequired(context);
      return;
    }

    final wishlistNotifier = ref.read(wishlistControllerProvider.notifier);
    final wishlistState = ref.read(wishlistControllerProvider);

    final isFavorite = wishlistState.hasValue &&
        wishlistState.value != null &&
        wishlistState.value!.items.any(
              (item) => item.productId.id == product.id,
        );

    if (isFavorite) {
      wishlistNotifier.removeItem(
        RemoveWishlistItemPayload(variantId: product.variants[0].id),
      );
    } else {
      wishlistNotifier.addItem(
        AddToWishlistPayload(
          productId: product.id,
          variantId: product.variants[0].id,
        ),
      );
    }
  }

  Widget _buildNotFoundScreen() => Scaffold(
    appBar: AppBar(
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => context.pop(),
      ),
      backgroundColor: Colors.white,
      foregroundColor: Colors.black87,
      elevation: 0,
    ),
    body: const Center(child: Text('Product not found')),
  );

  Widget _buildLoadingScreen() =>
      const Scaffold(body: Center(child: CircularProgressIndicator()));

  Widget _buildErrorScreen(Object error) =>
      Scaffold(body: Center(child: Text('Error: $error')));
}

class SectionDivider extends StatelessWidget {
  const SectionDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return const Divider(
      height: 1,
      thickness: 8,
      color: Color(0xFFF5F5F5),
    );
  }
}