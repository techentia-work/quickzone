// lib/features/screens/order/order_success_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/models.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

class OrderSuccessPage extends ConsumerWidget {
  final OrderType order;

  const OrderSuccessPage({super.key, required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: const Color(0xFFEFF9F0),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const SizedBox(height: 40),

                      // Success Icon
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: const Color(0xFF5AC268).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check_circle,
                          size: 80,
                          color: Color(0xFF5AC268),
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Success Message
                      Text(
                        'Order Placed Successfully!',
                        style: textTheme.headlineSmall?.copyWith(
                          fontSize: 23,
                          fontWeight: FontWeight.w700,
                        ),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 8),

                      Text(
                        'Your order has been placed and will be delivered soon',
                        style: textTheme.bodyMedium?.copyWith(
                          color: const Color(0xFF757575),
                        ),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 32),

                      // Order Details Card
                      Container(
                        padding: const EdgeInsets.all(20),
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
                          children: [
                            _DetailRow(
                              label: 'Order Number',
                              value: order.orderNumber,
                              textTheme: textTheme,
                              valueStyle: textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF5AC268),
                              ),
                            ),
                            const Divider(height: 24),
                            _DetailRow(
                              label: 'Total Items',
                              value: '${order.items.length}',
                              textTheme: textTheme,
                            ),
                            const SizedBox(height: 12),
                            _DetailRow(
                              label: 'Total Amount',
                              value: '₹${order.totalAmount.toStringAsFixed(2)}',
                              textTheme: textTheme,
                              valueStyle: textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _DetailRow(
                              label: 'Payment Method',
                              value: _getPaymentMethodText(order.paymentMethod),
                              textTheme: textTheme,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Delivery Address Card
                      Container(
                        padding: const EdgeInsets.all(20),
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
                                const Icon(
                                  Icons.location_on,
                                  color: Color(0xFF5AC268),
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Delivery Address',
                                  style: textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              order.shippingAddress.fullName,
                              style: textTheme.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              order.shippingAddress.phone,
                              style: textTheme.bodyMedium?.copyWith(
                                color: const Color(0xFF757575),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _formatAddress(order.shippingAddress),
                              style: textTheme.bodyMedium?.copyWith(
                                color: const Color(0xFF757575),
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom Buttons
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.push('/orders/${order.id}'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5AC268),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Track Order',
                        style: textTheme.labelLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF5AC268)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Continue Shopping',
                        style: textTheme.labelLarge?.copyWith(
                          color: const Color(0xFF5AC268),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getPaymentMethodText(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.COD:
        return 'Cash on Delivery';

      case PaymentMethod.ONLINE:
        return 'Online Payment';

      case PaymentMethod.WALLET:
        return 'Wallet';

      case PaymentMethod.WALLET_ONLINE:
        return 'Wallet + Online';

      case PaymentMethod.WALLET_COD:
        return 'Wallet + COD';
    }

  }

  String _formatAddress(ShippingAddressType address) {
    final parts = [
      address.addressLine1,
      if (address.addressLine2?.isNotEmpty == true) address.addressLine2,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ];
    return parts.join(', ');
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final TextTheme textTheme;
  final TextStyle? valueStyle;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.textTheme,
    this.valueStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF757575),
          ),
        ),
        Text(
          value,
          style: valueStyle ??
              textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}