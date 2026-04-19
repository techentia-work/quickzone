import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';
import 'package:quickzone_delivery/core/utils/utils.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:quickzone_delivery/features/widgets/widgets.dart';
import 'package:url_launcher/url_launcher.dart';

class OrderDetailsScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ✅ Watch BOTH providers to find the order
    final allOrdersState = ref.watch(allOrdersControllerProvider);

    return allOrdersState.when(
      data: (allOrders) {
        // ✅ Search in all orders (includes both upcoming and previous)
        final order = allOrders.firstWhere(
              (o) => o.id == orderId,
          orElse: () => throw Exception('Order not found'),
        );
        return _OrderDetailsView(order: order);
      },
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        appBar: AppBar(title: const Text('Order Details')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: ${error.toString()}'),
              TextButton(
                onPressed: () => context.pop(),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrderDetailsView extends ConsumerStatefulWidget {
  final OrderType order;

  const _OrderDetailsView({required this.order});

  @override
  ConsumerState<_OrderDetailsView> createState() => _OrderDetailsViewState();
}

class _OrderDetailsViewState extends ConsumerState<_OrderDetailsView> {
  final _deliveryNotesController = TextEditingController();
  final _rejectReasonController = TextEditingController();
  File? _deliveryProofFile;
  String? _uploadedImageUrl;

  @override
  void dispose() {
    _deliveryNotesController.dispose();
    _rejectReasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM, hh:mm a');
    final createdDate = widget.order.createdAt != null
        ? dateFormat.format(widget.order.createdAt!)
        : 'N/A';

    final (statusText, statusColor) =
        OrderUtils.getStatusInfo(widget.order.status);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Order Details',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w600,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 1. Status Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getStatusIcon(widget.order.status),
                            size: 20, color: statusColor),
                        const SizedBox(width: 8),
                        Text(
                          statusText,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Order #${widget.order.orderNumber}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.black87,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    createdDate,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 2. Action Buttons
                  _buildActionButtons(),
                  if (_buildActionButtons() is! SizedBox)
                    const SizedBox(height: 24),

                  // 3. Delivery Address
                  _buildSectionHeader('Delivery Location'),
                  const SizedBox(height: 12),
                  _buildAddressCard(widget.order.shippingAddress),
                  const SizedBox(height: 24),

                  // 4. Payment Info
                  _buildSectionHeader('Payment Details'),
                  const SizedBox(height: 12),
                  _buildPaymentCard(),
                  const SizedBox(height: 24),

                  // 5. Order Items
                  _buildSectionHeader(
                      'Order Items (${widget.order.items.length})'),
                  const SizedBox(height: 16),
                  ...widget.order.items.map((item) => _buildOrderItem(item)),
                  const SizedBox(height: 24),

                  // 6. Bill Summary
                  _buildSectionHeader('Bill Summary'),
                  const SizedBox(height: 12),
                  _buildBillSummary(),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    if (widget.order.status == OrderStatus.PROCESSING) {
      return Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _acceptOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.check_circle_outline),
              label: const Text(
                'Accept Order',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _showRejectDialog,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.redAccent,
                side: const BorderSide(color: Colors.redAccent, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.cancel_outlined),
              label: const Text(
                'Reject Order',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      );
    } else if (widget.order.status == OrderStatus.ACCEPTED) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: _markOutForDelivery,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF5AC268),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          icon: const Icon(Icons.local_shipping_outlined),
          label: const Text(
            'Mark Out for Delivery',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
      );
    } else if (widget.order.status == OrderStatus.OUT_FOR_DELIVERY) {
      if (widget.order.paymentMethod == PaymentMethod.COD &&
          widget.order.paymentStatus == PaymentStatus.PENDING) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 20, color: Colors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Collect ₹${widget.order.totalAmount.toStringAsFixed(0)} cash',
                      style: const TextStyle(
                        color: Colors.orange,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton.icon(
              onPressed: _showDeliveredDialog,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.check_circle_outline),
              label: const Text(
                'Complete Delivery',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      } else {
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _showDeliveredDialog,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF5AC268),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.check_circle_outline),
            label: const Text(
              'Complete Delivery',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        );
      }
    }

    return const SizedBox.shrink();
  }

  Widget _buildPaymentCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Method',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              const SizedBox(height: 4),
              Text(
                OrderUtils.getPaymentMethodText(widget.order.paymentMethod),
                style:
                    const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
            ],
          ),
          Container(height: 30, width: 1, color: Colors.grey[200]),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Status',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: widget.order.paymentStatus == PaymentStatus.PAID
                      ? Colors.green.withOpacity(0.1)
                      : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  OrderUtils.getPaymentStatusText(widget.order.paymentStatus),
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: widget.order.paymentStatus == PaymentStatus.PAID
                        ? Colors.green[700]
                        : Colors.orange[800],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBillSummary() {
    return _buildInfoCard([
      _buildInfoRow('Subtotal', '₹${widget.order.subTotal.toStringAsFixed(2)}'),
      if (widget.order.shippingCharges > 0)
        _buildInfoRow('Shipping Charges',
            '₹${widget.order.shippingCharges.toStringAsFixed(2)}'),
      if (widget.order.deliveryCharge != null &&
          widget.order.deliveryCharge! > 0)
        _buildInfoRow('Delivery Charges',
            '₹${widget.order.deliveryCharge!.toStringAsFixed(2)}'),
      if (widget.order.handlingCharge != null &&
          widget.order.handlingCharge! > 0)
        _buildInfoRow('Handling Charges',
            '₹${widget.order.handlingCharge!.toStringAsFixed(2)}'),
      if (widget.order.promoUsed != null && widget.order.promoUsed! > 0)
        _buildInfoRow('Promo Discount',
            '- ₹${widget.order.promoUsed!.toStringAsFixed(2)}',
            valueColor: Colors.green),
      if (widget.order.walletUsed != null && widget.order.walletUsed! > 0)
        _buildInfoRow('Wallet Used',
            '- ₹${widget.order.walletUsed!.toStringAsFixed(2)}',
            valueColor: Colors.green),
      const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Divider(height: 1, thickness: 1),
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Total Amount',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          Text(
            '₹${widget.order.totalAmount.toStringAsFixed(0)}',
            style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF5AC268)),
          ),
        ],
      ),
    ]);
  }

  // Helper Widgets
  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Colors.black87,
        letterSpacing: -0.5,
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildInfoRow(String label, String value,
      {bool isBold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
              fontSize: 15,
              color: valueColor ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }


  Future<void> _openMap(ShippingAddressType address) async {
    try {
      // 1. Try to use googleLocation (Coordinates or URL)
      if (address.googleLocation != null &&
          address.googleLocation!.isNotEmpty) {
        final loc = address.googleLocation!.trim();
        
        // Check if it's "lat,lng" format
        final coordRegex = RegExp(r'^-?([0-9]+\.?[0-9]*),\s*-?([0-9]+\.?[0-9]*)$');
        
        if (coordRegex.hasMatch(loc)) {
          final googleUrl = Uri.parse(
              'https://www.google.com/maps/search/?api=1&query=$loc');
          if (await canLaunchUrl(googleUrl)) {
            await launchUrl(googleUrl, mode: LaunchMode.externalApplication);
            return;
          }
        }

        // Check if it's a full URL
        final url = Uri.tryParse(loc);
        if (url != null && (url.scheme == 'http' || url.scheme == 'https')) {
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
            return;
          }
        }
      }

      // 2. Fallback to address text query
      String query;
      if (address.googleLocation != null &&
          address.googleLocation!.trim().isNotEmpty) {
        query =
            '${address.googleLocation!.trim()}, ${address.city}, ${address.pincode}';
      } else {
        query = '${address.addressLine1}, ${address.city}, ${address.pincode}';
      }

      final googleUrl = Uri.parse(
          'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}');

      if (await canLaunchUrl(googleUrl)) {
        await launchUrl(googleUrl, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open map application')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error opening map: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  // [... Existing methods ...]

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not launch dialer')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error making call: $e');
    }
  }

  Widget _buildAddressCard(ShippingAddressType address) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF5AC268).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.location_on_outlined,
                color: Color(0xFF5AC268), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  address.fullName,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                        child: _buildAddressDetail(
                            Icons.phone_outlined, address.phone)),
                    Container(
                      height: 32,
                      width: 32,
                      margin: const EdgeInsets.only(left: 8),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.call,
                            color: Colors.green, size: 18),
                        onPressed: () => _makePhoneCall(address.phone),
                        padding: EdgeInsets.zero,
                        tooltip: 'Call Customer',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                _buildAddressDetail(
                  Icons.home_outlined,
                  _buildFullAddressString(address),
                ),
                if (address.landmark != null) ...[
                  const SizedBox(height: 6),
                  _buildAddressDetail(
                      Icons.flag_outlined, 'Landmark: ${address.landmark!}'),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF5AC268).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              onPressed: () => _openMap(address),
              icon: const Icon(Icons.directions, color: Color(0xFF5AC268)),
              tooltip: 'Get Directions',
            ),
          ),
        ],
      ),
    );
  }

  String _buildFullAddressString(ShippingAddressType address) {
    List<String> parts = [];

    // Add googleLocation if it contains text (not just coords/url)
    if (address.googleLocation != null && address.googleLocation!.isNotEmpty) {
       final loc = address.googleLocation!.trim();
       final isCoord = RegExp(r'^-?[0-9.]+,\s*-?[0-9.]+$').hasMatch(loc);
       final isUrl = loc.startsWith('http');
       if (!isCoord && !isUrl) {
         parts.add(loc);
       }
    }

    if (address.addressLine1.isNotEmpty) parts.add(address.addressLine1);
    if (address.addressLine2 != null && address.addressLine2!.isNotEmpty) {
      parts.add(address.addressLine2!);
    }
    
    parts.add(address.city);
    parts.add('${address.state} - ${address.pincode}'); // State & Pincode

    // Remove duplicates (case insensitive check to avoid "Patel Nagar, patel nagar")
    final seen = <String>{};
    final uniqueParts = parts.where((part) {
      final lower = part.toLowerCase();
      if (seen.contains(lower)) return false;
      seen.add(lower);
      return true;
    }).toList();

    return uniqueParts.join(', ');
  }

  Widget _buildAddressDetail(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: Colors.grey[500]),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style:
                TextStyle(fontSize: 13, color: Colors.grey[700], height: 1.3),
          ),
        ),
      ],
    );
  }

  Widget _buildOrderItem(OrderItemType item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(12),
              image: item.image != null
                  ? DecorationImage(
                      image: NetworkImage(item.image!), fit: BoxFit.cover)
                  : null,
            ),
            child: item.image == null
                ? Icon(Icons.fastfood, color: Colors.grey[400])
                : null,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 16),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.variantTitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.variantTitle!,
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Qty: ${item.quantity}',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '₹${item.totalPrice.toStringAsFixed(0)}',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon(OrderStatus status) {
    switch (status) {
      case OrderStatus.PROCESSING:
        return Icons.pending_outlined;
      case OrderStatus.ACCEPTED:
        return Icons.check_circle_outline;
      case OrderStatus.OUT_FOR_DELIVERY:
        return Icons.local_shipping_outlined;
      case OrderStatus.DELIVERED:
        return Icons.done_all;
      case OrderStatus.REJECTED:
      case OrderStatus.CANCELLED:
        return Icons.cancel_outlined;
      default:
        return Icons.info_outline;
    }
  }

  // Actions

  void _acceptOrder() async {
    final payload = AcceptRejectOrderRequest(orderId: widget.order.id);
    await ref
        .read(deliveryBoyOrdersControllerProvider.notifier)
        .acceptOrder(payload);
    await ref.read(allOrdersControllerProvider.notifier).refreshOrders();
    if (mounted) context.pop();
  }

  void _showRejectDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Reject Order',
            style: TextStyle(fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Please provide a reason for rejecting this order:'),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _rejectReasonController,
              hintText: 'Enter rejection reason...',
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              if (_rejectReasonController.text.trim().isEmpty) {
                // Show toast/snackbar
                return;
              }
              Navigator.pop(context);
              final payload = AcceptRejectOrderRequest(
                orderId: widget.order.id,
                reason: _rejectReasonController.text.trim(),
              );
              await ref
                  .read(deliveryBoyOrdersControllerProvider.notifier)
                  .rejectOrder(payload);
              await ref
                  .read(allOrdersControllerProvider.notifier)
                  .refreshOrders();
              if (mounted) context.go('/');
            },
            child: const Text('Reject', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _markOutForDelivery() async {
    final payload = UpdateDeliveryStatusRequest(
      orderId: widget.order.id,
      status: 'OUT_FOR_DELIVERY',
    );
    await ref
        .read(deliveryBoyOrdersControllerProvider.notifier)
        .updateDeliveryStatus(payload);
    await ref.read(allOrdersControllerProvider.notifier).refreshOrders();
  }

  void _showDeliveredDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => _DeliveryConfirmationDialog(
        orderId: widget.order.id,
        deliveryNotesController: _deliveryNotesController,
        onFileSelected: (file) {
          setState(() {
            _deliveryProofFile = file;
          });
        },
        onImageUrlUpdated: (url) {
          setState(() {
            _uploadedImageUrl = url;
          });
        },
      ),
    );
  }

}

// [Delivery confirmation dialog remains the same]
class _DeliveryConfirmationDialog extends ConsumerStatefulWidget {
  final String orderId;
  final TextEditingController deliveryNotesController;
  final Function(File) onFileSelected;
  final Function(String) onImageUrlUpdated;

  const _DeliveryConfirmationDialog({
    required this.orderId,
    required this.deliveryNotesController,
    required this.onFileSelected,
    required this.onImageUrlUpdated,
  });

  @override
  ConsumerState<_DeliveryConfirmationDialog> createState() =>
      _DeliveryConfirmationDialogState();
}

class _DeliveryConfirmationDialogState
    extends ConsumerState<_DeliveryConfirmationDialog> {
  XFile? _capturedImage;
  String? _uploadedImageUrl;

  @override
  Widget build(BuildContext context) {
    final uploadState = ref.watch(imageUploadControllerProvider);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Confirm Delivery'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CustomTextField(
            controller: widget.deliveryNotesController,
            hintText: 'Delivery notes (optional)',
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          Text('Upload delivery proof:'),
          const SizedBox(height: 8),
          if (_capturedImage != null)
            Image.file(File(_capturedImage!.path), height: 150),
          if (_uploadedImageUrl != null)
            Image.network(_uploadedImageUrl!, height: 150),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: uploadState.isLoading ? null : _takePhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Capture Photo'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: (_capturedImage == null || uploadState.isLoading)
                      ? null
                      : _uploadPhoto,
                  icon: const Icon(Icons.upload_file),
                  label: const Text('Upload Photo'),
                ),
              ),
            ],
          ),
          if (uploadState.hasError)
            Text(
              'Upload failed. Try again.',
              style: TextStyle(color: Colors.red[700]),
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _uploadedImageUrl == null ? null : _confirmDelivery,
          child: const Text('Confirm Delivery'),
        ),
      ],
    );
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final XFile? photo = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (photo != null) {
      setState(() => _capturedImage = photo);
    }
  }

  Future<void> _uploadPhoto() async {
    if (_capturedImage == null) return;

    final url = await ref
        .read(imageUploadControllerProvider.notifier)
        .uploadProofImage(File(_capturedImage!.path));

    if (url != null) {
      setState(() => _uploadedImageUrl = url);
      widget.onImageUrlUpdated(url);
    }
  }

  void _confirmDelivery() async {
    if (_uploadedImageUrl == null) {
      ref.read(snackbarProvider.notifier).showError(
        'Please upload delivery proof before confirming!',
      );
      return;
    }

    final payload = UpdateDeliveryStatusRequest(
      orderId: widget.orderId,
      status: 'DELIVERED',
      deliveryNotes: widget.deliveryNotesController.text.trim(),
      deliveryProof: _uploadedImageUrl,
    );

    await ref
        .read(deliveryBoyOrdersControllerProvider.notifier)
        .updateDeliveryStatus(
      payload,
      onDelivered: () {
        // ✅ Refresh all orders after delivery
        ref.read(allOrdersControllerProvider.notifier).refreshOrders();
        context.go('/?tab=previous');
      },
    );

    Navigator.pop(context);
  }
}