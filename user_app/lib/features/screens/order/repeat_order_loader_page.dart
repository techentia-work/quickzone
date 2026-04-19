import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';

import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/models/cart/cart_payload.dart';
import 'package:Quickzon/features/providers/providers.dart';

class RepeatOrderPage extends ConsumerWidget {
  const RepeatOrderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(orderControllerProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/');
            }
          },
        ),
        title: const Text('Repeat Order'),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) =>
        const Center(child: Text('Failed to load orders')),
        data: (orders) {
          if (orders == null || orders.isEmpty) {
            return const Center(child: Text('No orders found'));
          }

          /// 🔥 Sirf DELIVERED orders
          final deliveredOrders = orders
              .where((o) => o.status == OrderStatus.DELIVERED)
              .toList();

          if (deliveredOrders.isEmpty) {
            return const Center(
              child: Text('No delivered orders yet'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: deliveredOrders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (_, index) {
              final order = deliveredOrders[index];
              return _DeliveredOrderCard(order: order);
            },
          );
        },
      ),
    );
  }
}
class _DeliveredOrderCard extends ConsumerWidget {
  final OrderType order;

  const _DeliveredOrderCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// 🧾 Order header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Order #${order.orderNumber}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                '₹${order.totalAmount.toStringAsFixed(0)}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),

          const SizedBox(height: 8),


          /// 📦 Products inside order
          ...order.items.map(
                (item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  item.image != null
                      ? CachedNetworkImage(
                    imageUrl: item.image!,
                    cacheManager: AppCacheManager.instance,
                    width: 44,
                    height: 44,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    errorWidget: (context, url, error) => const Icon(Icons.error),
                  )
                      : const Icon(Icons.shopping_bag),

                  const SizedBox(width: 10),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.productId.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Qty: ${item.quantity}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 12),

          /// 🔁 Repeat Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                await _repeatOrder(context, ref, order);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
              ),
              child: const Text(
                'Repeat Order',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _repeatOrder(
      BuildContext context,
      WidgetRef ref,
      OrderType order,
      ) async {
    final auth = ref.read(authControllerProvider).value;
    if (auth == null) return;

    final cart = ref.read(cartControllerProvider.notifier);

    /// Clear cart
    await cart.clearCart(
      ClearCartPayload(userId: auth.id),
    );

    /// Add all products again
    for (final item in order.items) {
      await cart.addItem(
        AddToCartPayload(
          productId: item.productId.id,
          variantId: item.variantId,
          quantity: item.quantity,
        ),
      );
    }

    /// Go to cart / checkout
    context.go('/cart');
  }
}
