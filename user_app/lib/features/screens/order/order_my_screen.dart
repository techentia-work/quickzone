// lib/features/screens/order/my_orders_page.dart
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';

import '../../models/models.dart';
import '../../providers/providers.dart';

class MyOrdersPage extends ConsumerStatefulWidget {
  final int initialTabIndex;
  const MyOrdersPage({
    super.key,
    this.initialTabIndex = 0, // 0 = Previous, 1 = Upcoming
  });

  @override
  ConsumerState<MyOrdersPage> createState() => _MyOrdersPageState();
}

class _MyOrdersPageState extends ConsumerState<MyOrdersPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex, // 👈 IMPORTANT
    );

    /// ✅ VERY IMPORTANT: Trigger API call
    Future.microtask(() {
      ref.read(orderControllerProvider.notifier).fetchOrders();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    final ordersAsync = ref.watch(orderControllerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFEFF9F0),
      appBar: AppBar(
        title: const Text('My Orders'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              dividerColor: Colors.transparent,
              indicator: BoxDecoration(
                color: const Color(0xFF5AC268),
                borderRadius: BorderRadius.circular(12),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.black87,
              labelStyle: textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              tabs: const [
                Tab(text: 'Previous'),
                Tab(text: 'Upcoming'),
              ],
            ),
          ),
        ),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Failed to load orders', style: textTheme.bodyMedium),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  ref.read(orderControllerProvider.notifier).fetchOrders();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
          data: (orders) {
            if (orders == null || orders.isEmpty) {
              return _buildEmptyOrders(context, textTheme);
            }

            // Filter previous orders (completed/cancelled orders)
            final previousOrders = orders.where((o) =>
            o.status == OrderStatus.DELIVERED ||
                o.status == OrderStatus.CANCELLED ||
                o.status == OrderStatus.RETURNED ||
                o.status == OrderStatus.REFUNDED ||
                o.status == OrderStatus.FAILED
            ).toList();

            // Filter upcoming orders - include all upcoming statuses
            final upcomingOrders = orders.where((o) {
              // Debug: Print ALL orders with status and payment
              print('🔍 Order ${o.orderNumber}: status=${o.status}, payment=${o.paymentStatus}');

              // For CONFIRMED orders, only include if payment is PAID or PENDING
              if (o.status == OrderStatus.CONFIRMED) {
                final result = o.paymentStatus == PaymentStatus.PAID ||
                    o.paymentStatus == PaymentStatus.PENDING;
                print('   → CONFIRMED filter result: $result (payment=${o.paymentStatus})');
                return result;
              }

              // Include all other upcoming statuses regardless of payment
              return o.status == OrderStatus.PROCESSING ||
                     o.status==OrderStatus.ACCEPTED ||
                  o.status == OrderStatus.SHIPPED ||
                  o.status == OrderStatus.OUT_FOR_DELIVERY;
            }).toList();

            // Debug: Print final count
            print('📊 Total upcoming orders: ${upcomingOrders.length}');
            print('📦 Total orders from API: ${orders.length}');

            return TabBarView(
              controller: _tabController,
              children: [
                _OrdersList(
                  orders: previousOrders,
                  textTheme: textTheme,
                ),
                _OrdersList(
                  orders: upcomingOrders,
                  textTheme: textTheme,
                ),
              ],
            );
          }
      ),
    );
  }

  Widget _buildEmptyOrders(BuildContext context, TextTheme textTheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text('No orders yet', style: textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'Start shopping to see your orders here',
            style: textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF5AC268),
            ),
            child: const Text(
              'Start Shopping',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrdersList extends StatelessWidget {
  final List<OrderType> orders;
  final TextTheme textTheme;

  const _OrdersList({
    required this.orders,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'No orders in this category',
              style: textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        return _OrderCard(
          order: orders[index],
          textTheme: textTheme,
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderType order;
  final TextTheme textTheme;

  const _OrderCard({
    required this.order,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    final isDelivered = order.status == OrderStatus.DELIVERED;

    return InkWell(
      onTap: () => context.push('/orders/${order.id}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 60,
                    height: 60,
                    color: Colors.grey.shade100,
                    child: order.items.isNotEmpty &&
                        order.items.first.image?.isNotEmpty == true
                        ? CachedNetworkImage(
                      imageUrl: order.items.first.image!,
                      cacheManager: AppCacheManager.instance,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      errorWidget: (context, url, error) => const Icon(Icons.error),
                    )
                        : const Icon(Icons.shopping_bag_outlined),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '#${order.orderNumber}',
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${order.items.length} items',
                        style: textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Text(
                  _getStatusText(order.status),
                  style: textTheme.labelSmall?.copyWith(
                    color: isDelivered
                        ? Colors.grey
                        : const Color(0xFF5AC268),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order.createdAt != null
                      ? DateFormat('dd MMM yyyy').format(order.createdAt!)
                      : 'N/A',
                  style: textTheme.bodySmall,
                ),
                Text(
                  '₹${order.totalAmount.toStringAsFixed(0)}',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getStatusText(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for delivery';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      case OrderStatus.REFUNDED:
        return 'Refunded';
      case OrderStatus.FAILED:
        return 'Failed';
      case OrderStatus.ACCEPTED:
        return 'Accepted';
      case OrderStatus.REJECTED:
        return 'Rejected';
      case OrderStatus.RETURNED:
        return 'Returned';
    }
  }
}
