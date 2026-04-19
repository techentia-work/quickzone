import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';
import 'package:quickzone_delivery/core/utils/utils.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/delivery_boy/delivery_boy_provider.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:quickzone_delivery/features/widgets/notification/notification_bell.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final String initialTab; // 'upcoming' or 'previous'
  const HomeScreen({super.key, required this.initialTab});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    final initialIndex = widget.initialTab == 'previous' ? 1 : 0;
    _tabController = TabController(length: 2, vsync: this, initialIndex: initialIndex);

    _tabController.addListener(() {
      setState(() {});
    });
  }


  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allOrdersState = ref.watch(allOrdersControllerProvider);
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            // Handle back or drawer
          },
        ),
        title: const Text(
          'My Orders',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          const NotificationBell(), // 🔔 Add notification bell
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Logout Confirmation'),
                  content: const Text('Are you sure you want to logout?'),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Cancel',
                          style: TextStyle(color: Colors.grey)),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ref.read(authControllerProvider.notifier).logout();
                      },
                      child: const Text('Logout',
                          style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const SizedBox(height: 16),

          // Tab Buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Expanded(
                  child: _buildTabButton(
                    'Upcoming', // left tab
                    isSelected: _tabController.index == 0,
                    onTap: () => _tabController.animateTo(0),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTabButton(
                    'Previous', // right tab
                    isSelected: _tabController.index == 1,
                    onTap: () => _tabController.animateTo(1),
                  ),
                ),
              ],
            ),
          ),


          const SizedBox(height: 24),

          // Orders List
          Expanded(
            child: allOrdersState.when(
              data: (orders) {
                if (orders.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text('No orders assigned yet',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                      ],
                    ),
                  );
                }

                final filteredOrders = _tabController.index == 0
                    ? orders.where((order) =>
                order.status != OrderStatus.DELIVERED &&
                    order.status != OrderStatus.CANCELLED).toList()
                    : orders.where((order) =>
                order.status == OrderStatus.DELIVERED ||
                    order.status == OrderStatus.CANCELLED).toList();

                if (filteredOrders.isEmpty) {
                  return Center(
                    child: Text(
                      _tabController.index == 0
                          ? 'No upcoming orders'
                          : 'No previous orders',
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    await ref.read(deliveryBoyOrdersControllerProvider.notifier).refreshOrders();
                    await ref.read(allOrdersControllerProvider.notifier).refreshOrders();
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: filteredOrders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final order = filteredOrders[index];
                      return _OrderCard(order: order);
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
                    const SizedBox(height: 16),
                    Text('Failed to load orders',
                        style: TextStyle(color: Colors.grey[600])),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () {
                        ref
                            .read(deliveryBoyOrdersControllerProvider.notifier)
                            .refreshOrders();
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),

        ],
      ),
    );
  }

  Widget _buildTabButton(
      String label, {
        required bool isSelected,
        required VoidCallback onTap,
      }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF5AC268) : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF757575),
          ),
        ),
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  final OrderType order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dateFormat = DateFormat('dd MMM, hh:mm a');
    final createdDate = order.createdAt != null
        ? dateFormat.format(order.createdAt!)
        : 'N/A';

    return GestureDetector(
      onTap: () {
        context.push('/order-details/${order.id}');
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Image
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: order.items.isNotEmpty && order.items.first.image != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              order.items.first.image!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.fastfood_outlined,
                                color: Color(0xFFBDBDBD),
                              ),
                            ),
                          )
                        : const Icon(
                            Icons.fastfood_outlined,
                            color: Color(0xFFBDBDBD),
                          ),
                  ),
                  const SizedBox(width: 16),

                  // Order Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '#${order.orderNumber}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Colors.black87,
                              ),
                            ),
                            _StatusBadge(status: order.status),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF757575)),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                order.shippingAddress.addressLine1,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF757575),
                                  height: 1.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.shopping_bag_outlined, size: 14, color: Color(0xFF757575)),
                            const SizedBox(width: 4),
                            Text(
                              '${order.items.length} Items • ${order.paymentMethod == PaymentMethod.COD ? "COD" : "Online"}',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF757575),
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

            // Divider
            const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),

            // Footer: Date & Price
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    createdDate,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    '₹${order.totalAmount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ),

            // Action Buttons (Only for Pending)
            if (order.status == OrderStatus.PENDING) ...[
              const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _showRejectDialog(context, ref),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: BorderSide(color: Colors.redAccent.withOpacity(0.5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Reject'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _acceptOrder(context, ref),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF5AC268),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Accept Order'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _acceptOrder(BuildContext context, WidgetRef ref) async {
    final payload = AcceptRejectOrderRequest(orderId: order.id);
    await ref
        .read(deliveryBoyOrdersControllerProvider.notifier)
        .acceptOrder(payload);
  }

  void _showRejectDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Order'),
        content: const Text(
          'Are you sure you want to reject this order? Please provide a reason.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              final payload = AcceptRejectOrderRequest(
                orderId: order.id,
                reason: 'Unable to deliver',
              );
              ref
                  .read(deliveryBoyOrdersControllerProvider.notifier)
                  .rejectOrder(payload);
            },
            child: const Text('Reject', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final OrderStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final (text, color) = OrderUtils.getStatusInfo(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}