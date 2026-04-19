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

class ProductCard1 extends ConsumerWidget {
  final dynamic product;
  final bool showFavorite;
  final bool showAddButton;

  const ProductCard1({
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

  // ================= VEG / NON-VEG =================
  ProductEatableType? get eatableType =>
      isProductType ? (product as ProductType).productType : null;

  Widget vegNonVegIndicator() {
    // FORCE SHOW GREEN INDICATOR FOR TESTING
    // TODO: Remove this and uncomment the code below once backend is fixed
    return Container(
      height: 14,
      width: 14,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.green, width: 1.4),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Center(
        child: Container(
          height: 6,
          width: 6,
          decoration: BoxDecoration(color: Colors.green, shape: BoxShape.circle),
        ),
      ),
    );

    /* UNCOMMENT THIS WHEN BACKEND IS FIXED:
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
    */
  }

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
                        final selling = v.discountedPrice ?? v.price ?? 0;
                        final hasDiscount = v.price != null && v.price! > selling;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              /// VARIANT IMAGE
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
                                    final imgUrl = (v.images.isNotEmpty ? v.images.first : image) ?? '';
                                    
                                    if (imgUrl.isNotEmpty) {
                                      WidgetsBinding.instance.addPostFrameCallback((_) {
                                        try {
                                          precacheImage(
                                            CachedNetworkImageProvider(imgUrl),
                                            context,
                                          );
                                        } catch (_) {}
                                      });
                                    }

                                    return CachedNetworkImage(
                                      imageUrl: imgUrl,
                                      fit: BoxFit.contain,
                                      placeholder: (context, url) =>
                                          Container(color: Colors.grey.shade200),
                                      errorWidget: (context, url, error) =>
                                          const Icon(Icons.image, size: 24),
                                    );
                                  },
                                ),
                              ),


                              /// INFO
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
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
                                        if (hasDiscount) ...[
                                          const SizedBox(width: 6),
                                          const Text(
                                            'MRP',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                            ),
                                          ),
                                          Text(
                                            '₹${v.price!.toStringAsFixed(0)}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                              decoration: TextDecoration.lineThrough,
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          if (v.discountPercent != null)
                                            Text(
                                              '${v.discountPercent!.toStringAsFixed(0)}%',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: Colors.green,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                        ],
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
                                        .read(cartControllerProvider.notifier)
                                        .addItem(
                                      AddToCartPayload(
                                        productId: id,
                                        variantId: v.id,
                                        quantity: 1,
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF25AF37),
                                    elevation: 0,
                                    padding: EdgeInsets.zero,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
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
    final authState = ref.watch(authControllerProvider);
    final wishlistState = ref.watch(wishlistControllerProvider);
    final cartState = ref.watch(cartControllerProvider);

    final cartNotifier = ref.read(cartControllerProvider.notifier);
    final wishlistNotifier = ref.read(wishlistControllerProvider.notifier);

    final variant = variants.isNotEmpty ? variants.first : null;
    if (variant == null) return const SizedBox.shrink();

    final bool hasMultipleVariants = variants.length > 1;

    /// PRICE LOGIC
    final double sellingPrice = variant.discountedPrice ?? variant.price;
    final double? price = variant.price;
    final bool hasDiscount = price != null && price > sellingPrice;
    final int savedAmount = hasDiscount ? (price! - sellingPrice).round() : 0;

    final int maxLimit =
    isProductType ? (product as ProductType).maxQtyPerUser : 5;

    final bool isFavorite = wishlistState.hasValue &&
        wishlistState.value?.items.any((item) => item.productId.id == id) == true;

    int cartQty = 0;
    if (cartState.hasValue && cartState.value != null) {
      final match = cartState.value!.items
          .where((i) => i.variantId == variant.id)
          .toList();
      if (match.isNotEmpty) cartQty = match.first.quantity;
    }

    void showLoginSnack() {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please login to continue'),
          action: SnackBarAction(
            label: 'Login',
            onPressed: () => context.push('/login'),
          ),
        ),
      );
    }

    void addToCart() {
      if (!authState.hasValue || authState.value == null) {
        showLoginSnack();
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

    void updateQty(int newQty) {
      if (!authState.hasValue || authState.value == null) {
        showLoginSnack();
        return;
      }
      if (newQty == 0) {
        cartNotifier.removeItem(
          RemoveCartItemPayload(variantId: variant.id),
        );
      } else if (newQty <= maxLimit) {
        cartNotifier.updateItemQuantity(
          UpdateCartQuantityPayload(
            productId: id,
            variantId: variant.id,
            quantity: newQty,
          ),
        );
      }
    }

    return GestureDetector(
      onTap: () => context.push('/product/$slug'),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.84),
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
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// IMAGE
            Stack(
              children: [
                Container(
                  height: 135,
                  padding: const EdgeInsets.all(6),
                  alignment: Alignment.center,
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
                          child: const Icon(Icons.image, size: 40),
                        ),
                      );
                    },
                  ),
                ),


                // VEG/NON-VEG indicator ab image se hata diya

                if (hasDiscount)
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.yellow,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'SAVE ₹$savedAmount',
                        style: const TextStyle(
                          color: Colors.black54,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),

                if (showFavorite)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: InkWell(
                      onTap: () {
                        if (!authState.hasValue || authState.value == null) {
                          showLoginSnack();
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
                      child: CircleAvatar(
                        radius: 13,
                        backgroundColor: Colors.white,
                        child: Icon(
                          isFavorite
                              ? Icons.favorite
                              : Icons.favorite_border,
                          size: 15,
                          color: isFavorite ? Colors.red : Colors.black,
                        ),
                      ),
                    ),
                  ),

                if (showAddButton)
                  Positioned(
                    bottom: 6,
                    right: 6,
                    child: cartQty > 0
                        ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF5AC268),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => updateQty(cartQty - 1),
                            child: const Icon(Icons.remove,
                                size: 16, color: Colors.white),
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
                            onTap: () => updateQty(cartQty + 1),
                            child: const Icon(Icons.add,
                                size: 16, color: Colors.white),
                          ),
                        ],
                      ),
                    )
                        : SizedBox(
                      height: hasMultipleVariants ? 38 : 30,
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
                          backgroundColor: const Color(0xFF25AF37),
                          elevation: 0,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'ADD',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            if (hasMultipleVariants)
                              Text(
                                '${variants.length} options',
                                style: const TextStyle(
                                  fontSize: 9,
                                  color: Colors.white70,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            /// DETAILS (NAME + MEASUREMENT + PRICE)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// PRODUCT NAME (without veg indicator here, it's on image now)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          variant.title ?? name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.black,
                          ),
                        ),
                      ),

                    ],
                  ),


                  /// MEASUREMENT
                  if (variant.measurement != null &&
                      variant.measurementUnit != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        '${variant.measurement} ${variant.measurementUnit}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.black54,
                        ),
                      ),
                    ),

                  const SizedBox(height: 2),

                  /// PRICE ROW
                  Row(
                    children: [
                      Text(
                        '₹${sellingPrice.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                        ),
                      ),
                      if (hasDiscount) ...[
                        const SizedBox(width: 6),
                        const Text(
                          'MRP',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.black54,
                          ),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '₹${price!.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.black54,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
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