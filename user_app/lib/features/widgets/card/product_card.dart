import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/cart/cart_provider.dart';
import 'package:Quickzon/features/providers/wishlist/wishlist_provider.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';

class ProductCard extends ConsumerWidget {
  final dynamic product;
  final bool showFavorite;
  final bool showAddButton;

  const ProductCard({
    super.key,
    required this.product,
    this.showFavorite = true,
    this.showAddButton = true,
  });

  bool get isProductType => product is ProductType;

  String get id => product.id;
  String get name => product.name;
  String get slug => product.slug;
  String? get image => product.mainImage;

  List<ProductVariantType> get variants =>
      isProductType ? product.variants : (product.variants ?? []);

  /// ================= VEG / NON-VEG =================
  ProductEatableType? get eatableType =>
      isProductType ? (product as ProductType).productType : null;

  Widget vegNonVegIndicator() {
    if (eatableType == null || eatableType == ProductEatableType.NONE) {
      return const SizedBox.shrink();
    }

    final color =
    eatableType == ProductEatableType.VEG ? Colors.green : Colors.red;

    return Container(
      height: 14,
      width: 14,
      decoration: BoxDecoration(
        border: Border.all(color: color, width: 1.4),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Center(
        child: Container(
          height: 6,
          width: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
      ),
    );
  }

  /// ================= VARIANT SHEET =================
  void _openVariantSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return DraggableScrollableSheet(
          initialChildSize: 0.45,
          minChildSize: 0.3,
          maxChildSize: 0.75,
          builder: (context, scrollController) {
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Column(
                children: [
                  /// DRAG HANDLE
                  Container(
                    height: 4,
                    width: 40,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),

                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),

                  /// VARIANT LIST
                  Expanded(
                    child: ListView.builder(
                      controller: scrollController,
                      itemCount: variants.length,
                      itemBuilder: (_, index) {
                        final v = variants[index];
                        final selling =
                            v.discountedPrice ?? v.price ?? 0;
                        final hasDiscount =
                            v.price != null && v.price! > selling;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border:
                            Border.all(color: Colors.grey.shade300),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              /// 🖼 VARIANT IMAGE
                              Container(
                                height: 56,
                                width: 56,
                                margin: const EdgeInsets.only(right: 10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  color: Colors.grey.shade100,
                                ),
                                child: Builder(
                                  builder: (context) {
                                    final imgUrl = v.images.isNotEmpty
                                        ? v.images.first
                                        : (image ?? '');
                                    
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
                                      fit: BoxFit.contain,
                                      errorWidget: (_, __, ___) =>
                                          const Icon(Icons.image, size: 24),
                                    );
                                  },
                                ),
                              ),

                              /// INFO
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                  CrossAxisAlignment.start,
                                  children: [
                                    if (v.title != null)
                                      Text(
                                        v.title!,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${v.measurement ?? ''} ${v.measurementUnit ?? ''}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.black54,
                                      ),
                                    ),
                                    const SizedBox(height: 4),

                                    /// PRICE ROW
                                    Row(
                                      children: [
                                        Text(
                                          '₹${selling.toStringAsFixed(0)}',
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        if (hasDiscount)
                                          Text(
                                            'MRP',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,

                                            ),
                                          ),
                                        Text(
                                          '₹${v.price!.toStringAsFixed(0)}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                            decoration:
                                            TextDecoration.lineThrough,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${v.discountPercent!.toStringAsFixed(0) ?? ''}%',
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: Colors.green,
                                            fontWeight: FontWeight.bold,

                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              /// ADD BUTTON
                              SizedBox(
                                height: 32,
                                width: 56,
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(
                                        cartControllerProvider.notifier)
                                        .addItem(
                                      AddToCartPayload(
                                        productId: id,
                                        variantId: v.id,
                                        quantity: 1,
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                    const Color(0xFF25AF37),
                                    elevation: 0,
                                    padding: EdgeInsets.zero,
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                      BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: const Text(
                                    'ADD',
                                    style: TextStyle(fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final cart = ref.watch(cartControllerProvider);
    final wishlist = ref.watch(wishlistControllerProvider);

    final cartNotifier = ref.read(cartControllerProvider.notifier);
    final wishlistNotifier = ref.read(wishlistControllerProvider.notifier);

    final variant = variants.isNotEmpty ? variants.first : null;
    if (variant == null) return const SizedBox.shrink();

    final hasMultipleVariants = variants.length > 1;
    final sellingPrice = variant.discountedPrice ?? variant.price;
    final price = variant.price;
    final hasDiscount = price != null && price > sellingPrice;

    int cartQty = 0;
    if (cart.value != null) {
      final match = cart.value!.items
          .where((i) => i.variantId == variant.id)
          .toList();
      if (match.isNotEmpty) cartQty = match.first.quantity;
    }

    final isFavorite = wishlist.value?.items
        .any((i) => i.productId.id == id) ??
        false;

    void addToCart() {
      if (auth.value == null) {
        context.push('/login');
        return;
      }
      cartNotifier.addItem(
        AddToCartPayload(
          productId: id,
          variantId: variant.id,
          quantity: 1,
        ),
      );
    }

    return GestureDetector(
      onTap: () => context.push('/product/$slug'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// IMAGE
            Stack(
              children: [
                SizedBox(
                  height: 125,
                  width: double.infinity,
                  child: Builder(
                    builder: (context) {
                      final imgUrl = image ?? ''; 
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
                        fit: BoxFit.contain,
                        placeholder: (context, url) => Container(
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                         decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.image_not_supported, color: Colors.grey),
                        ),
                      );
                    },
                  ),
                ),
                Positioned(top: 6, left: 6, child: vegNonVegIndicator()),
                if (showFavorite)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: InkWell(
                      onTap: () {
                        if (auth.value == null) {
                          context.push('/login');
                          return;
                        }
                        isFavorite
                            ? wishlistNotifier.removeItem(
                          RemoveWishlistItemPayload(
                              variantId: variant.id),
                        )
                            : wishlistNotifier.addItem(
                          AddToWishlistPayload(
                            productId: id,
                            variantId: variant.id,
                          ),
                        );
                      },
                      child: Icon(
                        isFavorite
                            ? Icons.favorite
                            : Icons.favorite_border,
                        size: 18,
                        color: isFavorite ? Colors.red : Colors.grey,
                      ),
                    ),
                  ),
              ],
            ),

            /// DETAILS
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${variant.measurement ?? ''} ${variant.measurementUnit ?? ''}',
                    style:
                    const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                  const SizedBox(height: 6),

                  /// PRICE + ADD
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '₹${sellingPrice.toStringAsFixed(0)}',
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold),
                          ),
                          if (hasDiscount)
                            Text(
                              '₹${price!.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontSize: 10,
                                decoration:
                                TextDecoration.lineThrough,
                              ),
                            ),
                        ],
                      ),

                      if (showAddButton)
                        cartQty > 0
                            ? Container(
                          padding:
                          const EdgeInsets.symmetric(horizontal: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF25AF37),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              InkWell(
                                onTap: () => cartNotifier
                                    .updateItemQuantity(
                                  UpdateCartQuantityPayload(
                                    productId: id,
                                    variantId: variant.id,
                                    quantity: cartQty - 1,
                                  ),
                                ),
                                child: const Icon(Icons.remove,
                                    size: 16,
                                    color: Colors.white),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '$cartQty',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(width: 6),
                              InkWell(
                                onTap: () => cartNotifier
                                    .updateItemQuantity(
                                  UpdateCartQuantityPayload(
                                    productId: id,
                                    variantId: variant.id,
                                    quantity: cartQty + 1,
                                  ),
                                ),
                                child: const Icon(Icons.add,
                                    size: 16,
                                    color: Colors.white),
                              ),
                            ],
                          ),
                        )
                            : SizedBox(
                          height:
                          hasMultipleVariants ? 38 : 30,
                          width: 56,
                          child: ElevatedButton(
                            onPressed: () {
                              if (hasMultipleVariants) {
                                _openVariantSheet(context, ref);
                              } else {
                                addToCart();
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                              const Color(0xFF25AF37),
                              elevation: 0,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(8),
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment:
                              MainAxisAlignment.center,
                              children: [
                                const Text(
                                  'ADD',
                                  style: TextStyle(
                                      fontSize: 12,
                                      fontWeight:
                                      FontWeight.w600),
                                ),
                                if (hasMultipleVariants)
                                  Text(
                                    '${variants.length} options',
                                    style: const TextStyle(
                                        fontSize: 9,
                                        color: Colors.white70),
                                  ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
