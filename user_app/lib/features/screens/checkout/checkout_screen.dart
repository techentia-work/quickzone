// lib/features/screens/cart/cart_page.dart - COMPLETE IMPLEMENTATION
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/settings/admin_setting_provider.dart';
import 'package:Quickzon/features/screens/home/_widgets/ShowcaseGridSection.dart';
import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:Quickzon/features/widgets/widgets.dart';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../models/address/address_model.dart';
import '../../models/cart/cart_model.dart';
import '../../models/cart/cart_payload.dart';
import '../../models/product/product_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    final cartAsync = ref.watch(cartControllerProvider);
    final selectedAddress = ref.watch(selectedAddressProvider);
    final adminSettingAsync = ref.watch(adminSettingProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: cartAsync.when(
        data: (cart) {
          if (cart == null || cart.items.isEmpty) {
            return _buildEmptyCart(context, textTheme);
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Cart Items
                      Container(
                        color: colorScheme.surface,
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: cart.items.length,
                          separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade300),
                          itemBuilder: (context, index) {
                            final item = cart.items[index];
                            return _CartItemTile(item: item);
                          },
                        ),
                      ),



                      // Before you Checkout
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'You Might Also Like',
                          style: textTheme.headlineMedium?.copyWith(
                            fontSize: 18,
                            color: Colors.black,
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      if (cart.items.isNotEmpty)
                        _RecommendedProductsSection(firstCartItem: cart.items.first),

                      const SizedBox(height: 24),

                      // Hot Deals (Showcase)
                      const ShowcaseSection(showcaseType: 'HOT_DEALS'),

                      const SizedBox(height: 12),

                      // Apply Coupon
                      _buildApplyCouponSection(context, cart, colorScheme, textTheme),

                      const SizedBox(height: 12),

                      // Bill Details
                      Container(
                        color: colorScheme.surface,
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Item Total',
                                  style: textTheme.bodyMedium,
                                ),
                                Row(
                                  children: [
                                    /// 🔥 MRP TOTAL (CUT)
                                    Text(
                                      '₹${cart.mrpTotal.toStringAsFixed(0)}',
                                      style: textTheme.bodySmall?.copyWith(
                                        decoration: TextDecoration.lineThrough,
                                        color: Colors.black54,
                                      ),
                                    ),
                                    const SizedBox(width: 8),

                                    /// 🔥 DISCOUNTED TOTAL
                                    Text(
                                      '₹${cart.subTotal.toStringAsFixed(0)}',
                                      style: textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            _BillRow(
                              label: 'Discount',
                              value: cart.appliedPromo?.discountAmount != null
                                  ? '-₹${cart.appliedPromo!.discountAmount!.toStringAsFixed(0)}'
                                  : '-₹0',
                              valueColor: colorScheme.primary,
                            ),
                            const SizedBox(height: 12),
                            adminSettingAsync.when(
                              data: (setting) {
                                /// DELIVERY CHARGE CALCULATION
                                double deliveryCharge = 0;
                                for (final rule in setting.deliveryCharges) {
                                  final inRange = cart.subTotal >= rule.minAmount &&
                                      (rule.maxAmount == 0 || cart.subTotal <= rule.maxAmount);
                                  if (inRange) {
                                    deliveryCharge = rule.charge;
                                    break;
                                  }
                                }

                                /// HANDLING
                                final handlingCharge = setting.handlingCharges;

                                /// FINAL TOTAL
                                /// PROMO DISCOUNT
                                final promoDiscount = cart.appliedPromo?.discountAmount ?? 0;

                                /// FINAL TOTAL (AFTER COUPON)
                                final finalTotal =
                                    cart.subTotal + deliveryCharge + handlingCharge - promoDiscount;


                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 12),

                                    /// HANDLING
                                    _BillRow(
                                      label: 'Handling Charges',
                                      value: handlingCharge == 0
                                          ? 'Free'
                                          : '₹${handlingCharge.toStringAsFixed(0)}',
                                    ),

                                    const SizedBox(height: 6),

                                    /// DELIVERY
                                    _BillRow(
                                      label: 'Delivery Fee',
                                      value: deliveryCharge == 0
                                          ? 'Free'
                                          : '₹${deliveryCharge.toStringAsFixed(0)}',
                                      valueColor: colorScheme.primary,
                                    ),

                                    const Divider(height: 24),

                                    /// GRAND TOTAL
                                    _BillRow(
                                      label: 'Grand Total',
                                      value: '₹${finalTotal.toStringAsFixed(0)}',
                                      isTotal: true,
                                    ),
                                  ],
                                );
                              },
                              loading: () => const SizedBox(),
                              error: (_, __) => const SizedBox(),
                            ),

                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Delivery Address
                      InkWell(
                        onTap: () async {
                          final result = await context.push('/address');
                          if (result is String && result.isNotEmpty) {
                            final addresses = ref.read(addressControllerProvider).value ?? [];
                            final chosen = addresses.firstWhere(
                                  (a) => a.id == result,
                              orElse: () => addresses.first,
                            );
                            ref.read(selectedAddressProvider.notifier).select(chosen);
                          }
                        },
                        child: Container(
                          color: colorScheme.surface,
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: colorScheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(Icons.home_outlined, color: colorScheme.primary, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: selectedAddress == null
                                    ? Text(
                                  'Select delivery address',
                                  style: textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey.shade600,
                                  ),
                                )
                                    : Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(selectedAddress.fullName, style: textTheme.titleMedium),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              // Line 1
                                              Text(
                                                selectedAddress.addressLine1,
                                                style: textTheme.bodySmall,
                                              ),

                                              if (selectedAddress.addressLine2 != null &&
                                                  selectedAddress.addressLine2!.isNotEmpty)
                                                Text(
                                                  selectedAddress.addressLine2!,
                                                  style: textTheme.bodySmall,
                                                ),

                                              // Line 3
                                              Text(
                                                '${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}',
                                                style: textTheme.bodySmall,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    )


                                  ],
                                ),
                              ),
                              Text(
                                selectedAddress == null ? 'Add' : 'Change',
                                style: textTheme.labelLarge?.copyWith(fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),

              // Bottom Payment Bar
              Container(
                decoration: BoxDecoration(
                  color: colorScheme.surface,
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -2)),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: SafeArea(
                  child: Row(
                    children: [
                      // Payment Method


                      const SizedBox(width: 12),

                      // Place Order
                      Expanded(
                        child: ElevatedButton(
                          onPressed: selectedAddress == null
                              ? null
                              : () {
                            context.push(
                              '/payment',
                              extra: {
                                'cart': cart,
                                'address': selectedAddress,
                              },
                            );
                          },
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('₹${cart.totalAmount.toStringAsFixed(0)}',
                                  style: textTheme.labelLarge?.copyWith(color: Colors.white)),
                              const SizedBox(width: 8),
                              const Text('Place Order',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),

                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Failed to load cart', style: textTheme.bodyMedium),
              TextButton(
                onPressed: () => ref.refresh(cartControllerProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }



  String _formatFullAddress(AddressType addr) {
    final parts = [
      addr.addressLine1,
      if (addr.addressLine2?.isNotEmpty == true) addr.addressLine2!,
      addr.city,
      addr.state,
      addr.pincode,
    ];

    return parts.where((e) => e.isNotEmpty).join(', ');
  }

  Widget _buildEmptyCart(BuildContext context, TextTheme textTheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text('Your cart is empty', style: textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('Add items to get started', style: textTheme.bodyMedium),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/'),
            child: const Text('Start Shopping'),
          ),
        ],
      ),
    );
  }
}

/// Cart item row
class _CartItemTile extends ConsumerWidget {
  final CartItemType item;
  static const int maxQuantity = 10;

  const _CartItemTile({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    final product = item.productId;
    final productName = product.name;
    final productImage = product.mainImage;
    final itemTitle = item.title ?? '';

    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => context.push('/product/${product.slug}'),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 70,
                height: 70,
                color: colorScheme.surfaceVariant,
                child: productImage.isNotEmpty
                    ? CachedNetworkImage(
                  imageUrl: productImage,
                  cacheManager: AppCacheManager.instance,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colorScheme.primary.withOpacity(0.5),
                    ),
                  ),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                )
                    : Icon(Icons.shopping_bag_outlined, color: Colors.grey[400], size: 30),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  productName,
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (itemTitle.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      itemTitle,
                      style: textTheme.bodySmall?.copyWith(color: Colors.black54),
                    ),
                  ),

              ],
            ),
          ),
          const SizedBox(width: 12),

          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              /// ADD / QUANTITY BUTTON
              Container(
                decoration: BoxDecoration(
                  color: colorScheme.primary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    InkWell(
                      onTap: () {
                        if (item.quantity > 1) {
                          ref.read(cartControllerProvider.notifier).updateItemQuantity(
                            UpdateCartQuantityPayload(
                              productId: item.productId.id,
                              variantId: item.variantId,
                              quantity: item.quantity - 1,
                            ),
                          );
                        } else {
                          _showRemoveItemDialog(context, ref, item);
                        }
                      },
                      child: const Padding(
                        padding: EdgeInsets.all(8),
                        child: Icon(Icons.remove, size: 16, color: Colors.white),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        '${item.quantity}',
                        style: textTheme.labelLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    InkWell(
                      onTap: () {
                        if (item.quantity < maxQuantity) {
                          ref.read(cartControllerProvider.notifier).updateItemQuantity(
                            UpdateCartQuantityPayload(
                              productId: item.productId.id,
                              variantId: item.variantId,
                              quantity: item.quantity + 1,
                            ),
                          );
                        }
                      },
                      child: const Padding(
                        padding: EdgeInsets.all(8),
                        child: Icon(Icons.add, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 6),

              /// PRICE BLOCK (EK SAATH)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  /// MRP (STRIKE THROUGH)
                  Text(
                    'MRP',
                    style: textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.normal,
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                  Text(
                    '₹${item.price.toStringAsFixed(0)}',
                    style: textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.normal,
                      fontSize: 14,
                      decoration: TextDecoration.lineThrough,
                      color: Colors.black54,
                    ),
                  ),

                  const SizedBox(width: 6),

                  /// DISCOUNTED PRICE
                  Text(
                    '₹${item.discountedPrice?.toStringAsFixed(0)}',
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),

            ],
          ),

        ],
      ),
    );
  }

  void _showRemoveItemDialog(BuildContext context, WidgetRef ref, CartItemType item) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Remove Item', style: textTheme.titleLarge),
                const SizedBox(height: 16),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 60,
                        height: 60,
                        color: colorScheme.surfaceVariant,
                        child: item.productId.mainImage.isNotEmpty
                            ? CachedNetworkImage(
                          imageUrl: item.productId.mainImage,
                          cacheManager: AppCacheManager.instance,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          errorWidget: (context, url, error) => const Icon(Icons.error),
                        )
                            : Icon(Icons.shopping_bag_outlined, color: Colors.grey[400], size: 25),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productId.name,
                            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${item.price.toStringAsFixed(0)}',
                            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(dialogContext).pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: BorderSide(color: Colors.grey.shade300),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: Text('Cancel', style: textTheme.labelLarge?.copyWith(color: Colors.black87)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          ref.read(cartControllerProvider.notifier).removeItem(
                            RemoveCartItemPayload(variantId: item.variantId),
                          );
                          Navigator.of(dialogContext).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Item removed from cart',
                                  style: textTheme.bodyMedium?.copyWith(color: Colors.white)),
                              duration: const Duration(seconds: 2),
                              backgroundColor: colorScheme.primary,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                        ),
                        child: Text('Remove', style: textTheme.labelLarge?.copyWith(color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Apply Coupon Section
Widget _buildApplyCouponSection(BuildContext context, CartType cart, ColorScheme colorScheme, TextTheme textTheme) {
  final hasAppliedPromo = cart.appliedPromo?.code?.isNotEmpty == true;

  return InkWell(
    onTap: () => context.push('/promocode'),
    child: Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: hasAppliedPromo
            ? colorScheme.primary.withOpacity(0.1)
            : colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: hasAppliedPromo
              ? colorScheme.primary
              : Colors.grey.shade300,
        ),
      ),
      child: hasAppliedPromo
          ? Row(
        children: [
          Icon(Icons.check_circle, color: colorScheme.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${cart.appliedPromo!.code!} APPLIED',
                  style: textTheme.labelLarge?.copyWith(
                    color: colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (cart.appliedPromo!.discountAmount != null)
                  Text(
                    'You saved ₹${cart.appliedPromo!.discountAmount!.toStringAsFixed(0)}',
                    style: textTheme.bodySmall?.copyWith(
                      color: colorScheme.primary,
                    ),
                  ),
              ],
            ),
          ),
          Text(
            'Change',
            style: textTheme.labelMedium?.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 4),
          Icon(Icons.arrow_forward_ios, size: 14, color: colorScheme.primary),
        ],
      )
          : Row(
        children: [
          Icon(Icons.local_offer_outlined, color: colorScheme.primary, size: 22),
          const SizedBox(width: 12),
          Text('APPLY COUPON', style: textTheme.labelLarge),
          const Spacer(),
          Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey.shade600),
        ],
      ),
    ),
  );
}

/// Recommended Products Section
class _RecommendedProductsSection extends ConsumerWidget {
  final CartItemType firstCartItem;

  const _RecommendedProductsSection({required this.firstCartItem});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    final similarProductsAsync = ref.watch(
      productsByCategoryProvider(
        CategoryProductsParams(
          categoryId: firstCartItem.productId.categoryId,
          queryParams: {'limit': '6'},
        ),
      ),
    );

    return SizedBox(
      height: 220,
      child: similarProductsAsync.when(
        data: (products) {
          final filteredProducts = products.where((p) => p.id != firstCartItem.productId.id).toList();
          if (filteredProducts.isEmpty) {
            return Center(
              child: Text('No recommendations',
                  style: textTheme.bodyMedium?.copyWith(color: Colors.black54)),
            );
          }
          return ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: filteredProducts.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final product = filteredProducts[index];
              return AspectRatio(
                aspectRatio: 0.68,
                child: ProductCard1(product: product),
              );
            },
          );
        },
        loading: () => ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: 3,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, __) => const _RecommendedProductSkeleton(),
        ),
        error: (error, stack) => Center(
          child: Text('Failed to load recommendations',
              style: textTheme.bodyMedium?.copyWith(color: Colors.red[400])),
        ),
      ),
    );
  }
}

/// Skeleton placeholder
class _RecommendedProductSkeleton extends StatelessWidget {
  const _RecommendedProductSkeleton();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      width: 140,
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}

/// Bill Row Widget
class _BillRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final bool isTotal;

  const _BillRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.isTotal = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: textTheme.bodyMedium?.copyWith(
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            fontSize: isTotal ? 16 : 14,
          ),
        ),
        Text(
          value,
          style: textTheme.titleMedium?.copyWith(
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
            fontSize: isTotal ? 17 : 14,
            color: valueColor ?? theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}