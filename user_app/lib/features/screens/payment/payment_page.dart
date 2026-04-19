import 'package:Quickzon/features/models/wallet/wallet_model.dart';
import 'package:Quickzon/features/repositories/order/order_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/core/services/razorpay_service.dart';
import '../../providers/providers.dart';
import '../../providers/wallet/wallet_provider.dart'; // Import wallet provider

class PaymentPage extends ConsumerStatefulWidget {
  final CartType cart;
  final AddressType address;

  const PaymentPage({
    super.key,
    required this.cart,
    required this.address,
  });

  @override
  ConsumerState<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends ConsumerState<PaymentPage> {
  PaymentMethod selectedMethod = PaymentMethod.COD;
  bool isLoading = false;
  bool useWallet = false;
  double walletAmountToUse = 0.0;

  late RazorpayService _razorpayService;
  String? _currentOrderId;

  @override
  void initState() {
    super.initState();

    _razorpayService = RazorpayService();
    _razorpayService.init(
      onSuccess: _onPaymentSuccess,
      onFailure: _onPaymentFailure,
      onExternalWallet: _onExternalWallet,
    );
  }

  @override
  void dispose() {
    _razorpayService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Watch walletProvider (returns WalletModel)
    final walletAsync = ref.watch(walletProvider);

    return walletAsync.when(
      data: (wallet) => _buildContent(context, wallet),
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        body: Center(child: Text('Error loading wallet: $error')),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WalletModel wallet) {
    final bool isOnline = selectedMethod == PaymentMethod.ONLINE;
    final double cartTotal = widget.cart.totalAmount;
    final double availableWalletBalance =
    selectedMethod == PaymentMethod.COD
        ? wallet.balance           // ❗ COD = ONLY REAL WALLET
        : wallet.balance + wallet.promoCash;

    // Calculate amounts
    if (!useWallet) {
      walletAmountToUse = 0;
    } else {
      if (selectedMethod == PaymentMethod.COD) {
        // ❗ COD → promoCash not allowed
        walletAmountToUse = wallet.balance >= cartTotal
            ? cartTotal
            : wallet.balance;
      } else {
        // ONLINE / WALLET
        final totalWallet = wallet.balance + wallet.promoCash;
        walletAmountToUse = totalWallet >= cartTotal
            ? cartTotal
            : totalWallet;
      }
    }

    final double remainingAmount = cartTotal - walletAmountToUse;
    final bool isFullyPaidByWallet = remainingAmount <= 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: isLoading ? null : _handlePlaceOrder,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: const Color(0xFF16a34a),
            ),
            child: isLoading
                ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            )
                : Text(
              _getButtonText(isFullyPaidByWallet, isOnline, remainingAmount),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Wallet Balance Card
            if (availableWalletBalance > 0) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xff16a34a), Color(0xff15803d)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Wallet Balance",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            SizedBox(height: 4),
                          ],
                        ),
                        Switch(
                          value: useWallet,
                          onChanged: isLoading ? null : (val) {
                            setState(() => useWallet = val);
                          },
                          activeColor: Colors.white,
                          activeTrackColor: Colors.white30,
                        ),
                      ],
                    ),
                    Text(
                      "₹${availableWalletBalance.toStringAsFixed(0)}",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Wallet",
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        Text(
                          "₹${wallet.balance.toStringAsFixed(0)}",
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Promo Cash",
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        Text(
                          "₹${wallet.promoCash.toStringAsFixed(0)}",
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ],
                    ),
                    if (useWallet) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          "Using ₹${walletAmountToUse.toStringAsFixed(0)} from wallet",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            const Text(
              'Choose Payment Method',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),

            // Only show other payment options if not fully paid by wallet
            if (!isFullyPaidByWallet) ...[
              /// COD
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: selectedMethod == PaymentMethod.COD
                        ? const Color(0xFF16a34a)
                        : Colors.grey.shade300,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                margin: const EdgeInsets.only(bottom: 12),
                child: RadioListTile<PaymentMethod>(
                  value: PaymentMethod.COD,
                  groupValue: selectedMethod,
                  onChanged: isLoading
                      ? null
                      : (_) {
                    setState(() => selectedMethod = PaymentMethod.COD);
                  },
                  title: const Text(
                    'Cash on Delivery',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  subtitle: Text(
                    useWallet
                        ? 'Pay ₹${remainingAmount.toStringAsFixed(0)} on delivery'
                        : 'Pay when you receive',
                  ),
                  activeColor: const Color(0xFF16a34a),
                ),
              ),

              /// ONLINE
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: selectedMethod == PaymentMethod.ONLINE
                        ? const Color(0xFF16a34a)
                        : Colors.grey.shade300,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: RadioListTile<PaymentMethod>(
                  value: PaymentMethod.ONLINE,
                  groupValue: selectedMethod,
                  onChanged: isLoading
                      ? null
                      : (_) {
                    setState(() => selectedMethod = PaymentMethod.ONLINE);
                  },
                  title: const Text(
                    'UPI / Card / Net Banking',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  subtitle: Text(
                    useWallet
                        ? 'Pay ₹${remainingAmount.toStringAsFixed(0)} via Razorpay'
                        : 'Pay securely via Razorpay',
                  ),
                  activeColor: const Color(0xFF16a34a),
                ),
              ),
            ] else ...[
              // Show info when fully paid by wallet
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  border: Border.all(color: Colors.green.shade200),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green.shade700),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Full amount will be paid using wallet balance',
                        style: TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Order Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Order Summary',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Cart Total:'),
                      Text('₹${cartTotal.toStringAsFixed(0)}'),
                    ],
                  ),
                  if (useWallet) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Wallet Amount:',
                          style: TextStyle(color: Colors.green),
                        ),
                        Text(
                          '- ₹${walletAmountToUse.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.green),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                  ],
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Amount to Pay:',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '₹${(useWallet ? remainingAmount : cartTotal).toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF16a34a),
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

  String _getButtonText(bool isFullyPaidByWallet, bool isOnline, double remainingAmount) {
    if (isFullyPaidByWallet) {
      return 'Place Order';
    } else if (isOnline) {
      return 'Pay ₹${remainingAmount.toStringAsFixed(0)}';
    } else {
      return 'Place Order';
    }
  }

  /// ===============================
  /// PLACE ORDER - WITH WALLET SUPPORT
  /// ===============================
  PaymentMethod resolvePaymentMethod({
    required PaymentMethod selected,
    required double walletAmount,
    required double totalAmount,
  }) {
    // ❌ NO wallet usage
    if (walletAmount <= 0) return selected;

    // ✅ FULL wallet
    if (walletAmount >= totalAmount) {
      return PaymentMethod.WALLET;
    }

    // ✅ PARTIAL wallet
    if (selected == PaymentMethod.ONLINE) {
      return PaymentMethod.WALLET_ONLINE;
    }

    if (selected == PaymentMethod.COD) {
      return PaymentMethod.WALLET_COD;
    }

    return selected;
  }

  Future<void> _handlePlaceOrder() async {
    if (widget.address.id == null) {
      _showError('Please select a valid address');
      return;
    }

    setState(() => isLoading = true);

    try {
      // Calculate final amounts
      final double cartTotal = widget.cart.totalAmount;
      final double remainingAmount = cartTotal - walletAmountToUse;
      final bool isFullyPaidByWallet = remainingAmount <= 0;

      // ✅ STEP 1: Create Order in Backend
      debugPrint('🔥 Step 1: Creating order...');
      debugPrint('💰 Cart Total: $cartTotal');
      debugPrint('💳 Wallet Amount: $walletAmountToUse');
      debugPrint('💵 Remaining: $remainingAmount');

      final resolvedPaymentMethod = resolvePaymentMethod(
        selected: selectedMethod,
        walletAmount: walletAmountToUse,
        totalAmount: cartTotal,
      );
      debugPrint('📦 FINAL METHOD: ${resolvedPaymentMethod.name}');

      final order = await ref
          .read(orderControllerProvider.notifier)
          .createOrderWithPayment(
        addressId: widget.address.id!,
        selectedMethod: resolvedPaymentMethod,
        walletAmount: walletAmountToUse,
      );

      if (!mounted || order == null) {
        _showError('Failed to create order. Please try again.');
        setState(() => isLoading = false);
        return;
      }

      _currentOrderId = order.id;
      debugPrint('✅ Order created: ${order.id}');

      /// ✅ If fully paid by wallet OR COD → Direct success
      if (resolvedPaymentMethod == PaymentMethod.COD ||
          resolvedPaymentMethod == PaymentMethod.WALLET ||
          resolvedPaymentMethod == PaymentMethod.WALLET_COD) {
        debugPrint('✅ Order paid - Clearing cart and redirecting');

        await _clearCartAfterOrder();

        if (mounted) {
          context.go('/order-success', extra: order);
        }
        return;
      }

      /// 🔥 ONLINE → Create Razorpay order for remaining amount
      debugPrint('🔥 Step 2: Creating Razorpay order for ₹$remainingAmount');

      final razorpayOrderResponse = await ref
          .read(orderRepositoryProvider)
          .createRazorpayOrder(order.id!);

      if (!mounted) {
        setState(() => isLoading = false);
        return;
      }

      if (!razorpayOrderResponse.success || razorpayOrderResponse.data == null) {
        _showError('Failed to initialize payment. Please try again.');
        setState(() => isLoading = false);
        return;
      }

      final razorpayData = razorpayOrderResponse.data!;
      final razorpayOrderId = razorpayData['razorpay_order_id'] as String?;
      final amount = razorpayData['amount'] as int?;
      final key = razorpayData['key'] as String?;

      if (razorpayOrderId == null || amount == null || key == null) {
        _showError('Invalid payment data received.');
        setState(() => isLoading = false);
        return;
      }

      debugPrint('✅ Razorpay order created: $razorpayOrderId');
      debugPrint('💰 Amount: $amount paise');

      // ✅ STEP 3: Open Razorpay Checkout
      _razorpayService.openCheckout(
        key: key,
        amount: amount,
        orderId: razorpayOrderId,
        name: 'Quickzon',
        description: 'Order #${order.orderNumber}',
        email: order.userId.email ?? '',
        contact: order.shippingAddress.phone ?? '',
      );

      setState(() => isLoading = false);

    } catch (e, stackTrace) {
      debugPrint('❌ Error placing order: $e');
      debugPrint('Stack: $stackTrace');
      _showError('Something went wrong. Please try again.');
      setState(() => isLoading = false);
    }
  }

  /// ===============================
  /// PAYMENT SUCCESS - VERIFY + CLEAR CART
  /// ===============================
  void _onPaymentSuccess(PaymentSuccessResponse response) async {
    debugPrint('✅ Payment Success!');
    debugPrint('Payment ID: ${response.paymentId}');
    debugPrint('Order ID: ${response.orderId}');
    debugPrint('Signature: ${response.signature}');

    if (!mounted || _currentOrderId == null) return;

    setState(() => isLoading = true);

    try {
      debugPrint('🔥 Step 4: Verifying payment...');

      final verifiedOrder = await ref
          .read(orderControllerProvider.notifier)
          .verifyPayment(
        orderId: _currentOrderId!,
        razorpayPaymentId: response.paymentId ?? '',
        razorpayOrderId: response.orderId ?? '',
        razorpaySignature: response.signature ?? '',
      );

      if (!mounted) return;

      if (verifiedOrder != null) {
        debugPrint('✅ Payment verified successfully');
        _showSuccess('Payment successful!');

        await _clearCartAfterOrder();

        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          context.go('/order-success', extra: verifiedOrder);
        }
      } else {
        debugPrint('❌ Payment verification failed');
        _showError('Payment verification failed. Please contact support.');
      }

    } catch (e) {
      debugPrint('❌ Verification error: $e');
      _showError('Payment verification failed. Please contact support.');
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  /// ===============================
  /// CLEAR CART AFTER ORDER
  /// ===============================
  Future<void> _clearCartAfterOrder() async {
    try {
      debugPrint('🧹 Clearing cart after successful order...');

      final authState = ref.read(authControllerProvider);
      final userId = authState.value?.id;

      if (userId == null) {
        debugPrint('⚠️ No user ID found, skipping cart clear');
        return;
      }

      await ref.read(cartControllerProvider.notifier).clearCart(
        ClearCartPayload(userId: userId),
      );

      debugPrint('✅ Cart cleared successfully');
    } catch (e) {
      debugPrint('⚠️ Error clearing cart: $e');
    }
  }

  /// ===============================
  /// PAYMENT FAILURE
  /// ===============================
  void _onPaymentFailure(PaymentFailureResponse response) {
    debugPrint('❌ Payment Failed!');
    debugPrint('Code: ${response.code}');
    debugPrint('Message: ${response.message}');

    if (!mounted) return;

    String errorMessage = 'Payment failed';

    if (response.code == 0) {
      errorMessage = 'Payment cancelled by user';
    } else if (response.code == 2) {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = response.message ?? 'Payment failed. Please try again.';
    }

    _showError(errorMessage);
  }

  /// ===============================
  /// EXTERNAL WALLET
  /// ===============================
  void _onExternalWallet(ExternalWalletResponse response) {
    debugPrint('💳 External Wallet: ${response.walletName}');

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Opening ${response.walletName ?? "wallet"}...'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  /// ===============================
  /// HELPER METHODS
  /// ===============================
  void _showError(String message) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade600,
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccess(String message) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green.shade600,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}