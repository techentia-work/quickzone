import 'dart:async';
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/models/models.dart';
import '../../providers/providers.dart';

class PaymentProcessingPage extends ConsumerStatefulWidget {
  final OrderType order;

  const PaymentProcessingPage({
    super.key,
    required this.order,
  });

  @override
  ConsumerState<PaymentProcessingPage> createState() =>
      _PaymentProcessingPageState();
}

class _PaymentProcessingPageState
    extends ConsumerState<PaymentProcessingPage> {
  Timer? _timer;
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    _startPolling();
  }

  void _startPolling() {
    _timer = Timer.periodic(
      const Duration(seconds: 4),
          (_) => _checkPaymentStatus(),
    );
  }

  Future<void> _checkPaymentStatus() async {
    if (_isChecking) return;
    _isChecking = true;

    try {
      final updatedOrder = await ref
          .read(orderControllerProvider.notifier)
          .getOrderById(widget.order.id);

      if (updatedOrder == null) return;

      /// ✅ PAYMENT SUCCESS
      if (updatedOrder.paymentStatus == PaymentStatus.PAID) {
        _timer?.cancel();
        if (mounted) {
          context.go('/order-success', extra: updatedOrder);
        }
      }

      /// ❌ PAYMENT FAILED
      if (updatedOrder.paymentStatus == PaymentStatus.FAILED) {
        _timer?.cancel();
        if (mounted) {
          context.go('/payment-failed', extra: updatedOrder);
        }
      }
    } finally {
      _isChecking = false;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Processing Payment'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(strokeWidth: 3),
              const SizedBox(height: 24),

              Text(
                'Processing your payment',
                style: textTheme.titleLarge,
              ),

              const SizedBox(height: 8),

              Text(
                'Please don’t close the app.\nThis may take a few seconds.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium?.copyWith(
                  color: Colors.black54,
                ),
              ),

              const SizedBox(height: 32),

              /// ORDER INFO
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _infoRow(
                      'Order ID',
                      widget.order.orderNumber,
                      textTheme,
                    ),
                    const SizedBox(height: 8),
                    _infoRow(
                      'Amount',
                      '₹${widget.order.totalAmount.toStringAsFixed(0)}',
                      textTheme,
                    ),
                    const SizedBox(height: 8),
                    _infoRow(
                      'Payment Method',
                      widget.order.paymentMethod.name,
                      textTheme,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value, TextTheme textTheme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: textTheme.bodyMedium),
        Text(
          value,
          style: textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
