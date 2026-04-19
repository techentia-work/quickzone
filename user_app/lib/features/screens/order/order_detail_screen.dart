// lib/features/screens/order/order_detail_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/models.dart';
import '../../providers/providers.dart';
import '../../providers/settings/admin_setting_provider.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:geocoding/geocoding.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailPage({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  OrderType? _order;
  bool _isLoading = true;
  
  // Shop location - Quickzon Store Agra
  final LatLng shopLatLng = const LatLng(27.1759, 78.0423);

  // Customer location - will be set based on order's shipping address
  LatLng? _customerLatLng;
  
  Set<Polyline> _polylines = {};
  GoogleMapController? _mapController;
  
  @override
  void initState() {
    super.initState();
    _loadOrder();
  }


  Future<void> _loadOrder() async {
    final order = await ref.read(orderControllerProvider.notifier).getOrderById(widget.orderId);
    if (mounted) {
      setState(() {
        _order = order;
        _isLoading = false;
      });
      
      // Geocode shipping address to get coordinates
      if (order != null) {
        _geocodeAddress(order.shippingAddress);
      }
    }
  }

  Future<void> _geocodeAddress(ShippingAddressType address) async {
    try {
      // Build full address string
      final fullAddress = '${address.addressLine1}, ${address.addressLine2 ?? ""}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}';
      
      // Use geocoding package to convert address to coordinates
      final locations = await locationFromAddress(fullAddress);
      
      if (locations.isNotEmpty && mounted) {
        setState(() {
          _customerLatLng = LatLng(
            locations.first.latitude,
            locations.first.longitude,
          );
        });
      }
    } catch (e) {
      print('❌ Geocoding error: $e');
      // Fallback to approximate location near Agra
      if (mounted) {
        setState(() {
          _customerLatLng = const LatLng(27.1803, 78.0396);
        });
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_order == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Order Details'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Order not found', style: textTheme.bodyMedium),
              TextButton(
                onPressed: () => context.pop(),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final order = _order!;

    return Scaffold(
      backgroundColor: const Color(0xFFEFF9F0),
      appBar: AppBar(
        title: const Text('Order Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ⭐ Checkout Ads Image (from Admin Settings)
                  // ⭐ Checkout Ads Carousels (from Admin Settings)
                  Consumer(
                    builder: (context, ref, child) {
                      final adminSettingAsync = ref.watch(adminSettingProvider);
                      
                      return adminSettingAsync.when(
                        data: (adminSetting) {
                          // 🔥 Construct valid images list
                          List<String> images = [];
                          if (adminSetting.checkoutAdsImages.isNotEmpty) {
                            images = adminSetting.checkoutAdsImages;
                          } else if (adminSetting.checkoutAdsImage.isNotEmpty) {
                            images = [adminSetting.checkoutAdsImage];
                          }

                          if (images.isNotEmpty) {
                            return _CheckoutAdsBanner(images: images);
                          }
                          return const SizedBox.shrink();
                        },
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const SizedBox.shrink(),
                      );
                    },
                  ),
                  
                  // =======================
                  // 🗺️ DELIVERY ROUTE MAP (Zepto-Style - Top Priority)
                  // Show only when order is NOT delivered AND customer location is ready
                  // =======================
                  if (_customerLatLng != null &&
                      order.status != OrderStatus.DELIVERED &&
                      order.status != OrderStatus.CANCELLED)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: SizedBox(
                                height: 220,
                                child: GestureDetector(
                                  onVerticalDragUpdate: (_) {}, // Block scroll when touching map
                                  child: GoogleMap(
                                    onMapCreated: (controller) {
                                    _mapController = controller;
                                    _fitCameraBounds();
                                    // Route direction based on order status:
                                    // - Always: Shop/Rider → Customer
                                    // (Driver starts from shop, so route is same)
                                    if (_customerLatLng != null) {
                                      startPolylineAnimation(shopLatLng, _customerLatLng!);
                                    }
                                  },
                                  initialCameraPosition: CameraPosition(
                                    target: shopLatLng,
                                    zoom: 13,
                                  ),
                                  polylines: _polylines,
                                  markers: {
                                    // Shop marker (Green) - ONLY show when order NOT accepted yet
                                    if (order.assignedDeliveryBoy == null ||
                                        order.status == OrderStatus.PENDING ||
                                        order.status == OrderStatus.CONFIRMED)
                                      Marker(
                                        markerId: const MarkerId('shop'),
                                        position: shopLatLng,
                                        icon: BitmapDescriptor.defaultMarkerWithHue(
                                          BitmapDescriptor.hueGreen,
                                        ),
                                        infoWindow: const InfoWindow(
                                          title: '🏪 Shop',
                                          snippet: 'Quickzon Store',
                                        ),
                                      ),
                                    
                                    // Customer marker (Red) - ALWAYS show as destination
                                    Marker(
                                      markerId: const MarkerId('customer'),
                                      position: _customerLatLng!,
                                      icon: BitmapDescriptor.defaultMarkerWithHue(
                                        BitmapDescriptor.hueRed,
                                      ),
                                      infoWindow: InfoWindow(
                                        title: '📍 Your Location',
                                        snippet: order.shippingAddress.landmark ?? 'Delivery address',
                                      ),
                                    ),
                                    
                                    // Delivery rider marker (Bike icon) - Show when assigned
                                    // Driver starts from shop → customer
                                    if (order.assignedDeliveryBoy != null &&
                                        (order.status == OrderStatus.ACCEPTED ||
                                            order.status == OrderStatus.OUT_FOR_DELIVERY))
                                      Marker(
                                        markerId: const MarkerId('rider'),
                                        position: shopLatLng, // Driver at shop initially
                                        icon: BitmapDescriptor.defaultMarkerWithHue(
                                          BitmapDescriptor.hueViolet, // Purple/bike-like color
                                        ),
                                        infoWindow: InfoWindow(
                                          title: '🏍️ ${order.assignedDeliveryBoy!.name}',
                                          snippet: 'On the way',
                                        ),
                                      ),
                                  },
                                  zoomControlsEnabled: true,
                                  zoomGesturesEnabled: true,
                                  scrollGesturesEnabled: true,
                                  rotateGesturesEnabled: true,
                                  tiltGesturesEnabled: true,
                                  myLocationButtonEnabled: false,
                                  mapToolbarEnabled: false,
                                  compassEnabled: false,
                                ),
                              ),
                            ),
                            ),
                            const SizedBox(height: 16),
                            // Distance & Time info - Improved Design
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.04),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    // Distance
                                    Expanded(
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(10),
                                            decoration: BoxDecoration(
                                              gradient: const LinearGradient(
                                                colors: [
                                                  Color(0xFF5AC268),
                                                  Color(0xFF4AAD58),
                                                ],
                                              ),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(
                                              Icons.route,
                                              color: Colors.white,
                                              size: 20,
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Distance',
                                                style: textTheme.bodySmall?.copyWith(
                                                  color: Colors.grey.shade600,
                                                  fontSize: 11,
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                getDistanceText(shopLatLng, _customerLatLng!),
                                                style: textTheme.titleMedium?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  color: const Color(0xFF5AC268),
                                                  fontSize: 16,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Divider
                                    Container(
                                      width: 1,
                                      height: 40,
                                      color: Colors.grey.shade200,
                                    ),
                                    // Time estimate
                                    Expanded(
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(10),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF5AC268).withOpacity(0.1),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(
                                              Icons.access_time,
                                              color: Color(0xFF5AC268),
                                              size: 20,
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Flexible(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Delivery',
                                                  style: textTheme.bodySmall?.copyWith(
                                                    color: Colors.grey.shade600,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  'Few minutes',
                                                  style: textTheme.titleMedium?.copyWith(
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.black87,
                                                    fontSize: 14,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 16),
                  
                  // =======================
                  // 👤 DELIVERY PARTNER (Right below map, Zepto-style)
                  // =======================
                  if (order.assignedDeliveryBoy != null &&
                      (order.status == OrderStatus.ACCEPTED ||
                          order.status == OrderStatus.OUT_FOR_DELIVERY))
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Avatar circle
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                color: const Color(0xFF5AC268).withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.person,
                                color: Color(0xFF5AC268),
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Name and phone
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Delivery Partner',
                                    style: textTheme.labelSmall?.copyWith(
                                      color: Colors.grey.shade600,
                                      fontSize: 11,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    order.assignedDeliveryBoy!.name,
                                    style: textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    order.assignedDeliveryBoy!.phone,
                                    style: textTheme.bodySmall?.copyWith(
                                      color: Colors.grey.shade600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Call button
                            InkWell(
                              borderRadius: BorderRadius.circular(30),
                              onTap: () async {
                                final phone = order.assignedDeliveryBoy!.phone;
                                final uri = Uri.parse('tel:$phone');
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri);
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Could not launch dialer')),
                                  );
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF5AC268),
                                      Color(0xFF4AAD58),
                                    ],
                                  ),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF5AC268).withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.call,
                                  color: Colors.white,
                                  size: 22,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Order Status Banner - REMOVED (status shown in Order Info instead)
                  
                  const SizedBox(height: 16),

                  // Order Info Card
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
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
                          Text(
                            'Order Information',
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _InfoRow(
                            label: 'Order Number',
                            value: order.orderNumber,
                            textTheme: textTheme,
                          ),
                          const SizedBox(height: 8),
                          _InfoRow(
                            label: 'Order Date',
                            value: order.createdAt != null
                                ? _formatDateTime(order.createdAt!)
                                : 'N/A',
                            textTheme: textTheme,
                          ),
                          const SizedBox(height: 8),
                          _InfoRow(
                            label: 'Payment Method',
                            value: _getPaymentMethodText(order.paymentMethod),
                            textTheme: textTheme,
                          ),
                          const SizedBox(height: 8),
                          _InfoRow(
                            label: 'Status',
                            value: _getStatusText(order.status),
                            textTheme: textTheme,
                            valueColor: const Color(0xFF5AC268),
                          ),
                        ],
                      ),

                    ),
                  ),

                  // (Delivery Partner moved to top - removed duplicate)
                  const SizedBox(height: 16),
                  // Order Items
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Items (${order.items.length})',
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  Container(
                    color: Colors.white,
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: order.items.length,
                      separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade200),
                      itemBuilder: (context, index) {
                        final item = order.items[index];
                        return _OrderItemTile(
                          item: item,
                          textTheme: textTheme,
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Delivery Address
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
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
                              const Icon(Icons.location_on, color: Color(0xFF5AC268), size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'Delivery Address',
                                style: textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
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
                  ),
                  // (Map moved to top - removed duplicate)

                  const SizedBox(height: 16),

                  // Price Breakdown
                  // Price Breakdown
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
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
                          Text(
                            'Price Details',
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),

                          /// Subtotal
                          _PriceRow(
                            label: 'Subtotal',
                            value: '₹${order.subTotal.toStringAsFixed(2)}',
                            textTheme: textTheme,
                          ),

                          /// Discount (only if > 0)
                          if (order.appliedPromo?.discountAmount != null &&
                              order.appliedPromo!.discountAmount! > 0) ...[
                            const SizedBox(height: 8),
                            _PriceRow(
                              label: 'Discount',
                              value:
                              '-₹${order.appliedPromo!.discountAmount!.toStringAsFixed(2)}',
                              textTheme: textTheme,
                              valueColor: const Color(0xFF5AC268),
                            ),
                          ],

                          /// Handling Charges
                          if (order.handlingCharge > 0) ...[
                            const SizedBox(height: 8),
                            _PriceRow(
                              label: 'Handling Charges',
                              value: '₹${order.handlingCharge.toStringAsFixed(2)}',
                              textTheme: textTheme,
                            ),
                          ],

                          /// Delivery Charges
                          if (order.deliveryCharge > 0) ...[
                            const SizedBox(height: 8),
                            _PriceRow(
                              label: 'Delivery Charges',
                              value: '₹${order.deliveryCharge.toStringAsFixed(2)}',
                              textTheme: textTheme,
                            ),
                          ],

                          const Divider(height: 24),

                          /// Total
                          _PriceRow(
                            label: 'Total Amount',
                            value: '₹${order.totalAmount.toStringAsFixed(2)}',
                            textTheme: textTheme,
                            isTotal: true,
                          ),
                        ],
                      ),
                    ),
                  ),


                  const SizedBox(height: 24),

                  // =======================
                  // 🎧 HELP & SUPPORT
                  // =======================
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF5AC268).withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.headset_mic,
                              color: Color(0xFF5AC268),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Need help with this order?',
                                  style: textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Chat with our support team',
                                  style: textTheme.bodySmall?.copyWith(
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              context.push('/help-support');
                            },
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF5AC268),
                              textStyle: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            child: const Text('Chat'),
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

          // Bottom Action Bar
          if (order.status == OrderStatus.PENDING || order.status == OrderStatus.CONFIRMED || order.status == OrderStatus.PROCESSING)
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

            ),
        ],
      ),
    );
  }
  void startPolylineAnimation(LatLng from, LatLng to) {
    // Simple solid blue line - Zepto style
    setState(() {
      _polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [from, to],
          color: Colors.blue,
          width: 4,
          // No patterns - solid line
        ),
      };
    });
  }
  void _fitCameraBounds() {
    if (_mapController == null || _customerLatLng == null) return;

    final bounds = LatLngBounds(
      southwest: LatLng(
        shopLatLng.latitude < _customerLatLng!.latitude
            ? shopLatLng.latitude
            : _customerLatLng!.latitude,
        shopLatLng.longitude < _customerLatLng!.longitude
            ? shopLatLng.longitude
            : _customerLatLng!.longitude,
      ),
      northeast: LatLng(
        shopLatLng.latitude > _customerLatLng!.latitude
            ? shopLatLng.latitude
            : _customerLatLng!.latitude,
        shopLatLng.longitude > _customerLatLng!.longitude
            ? shopLatLng.longitude
            : _customerLatLng!.longitude,
      ),
    );


    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 80),
    );
  }

  String getDistanceText(LatLng from, LatLng to) {
    final meters = Geolocator.distanceBetween(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );

    if (meters < 1000) {
      return '${meters.toInt()} m';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
  }

  String _formatDateTime(DateTime dateTime) {
    // Day, Month, and Year
    final day = dateTime.day.toString().padLeft(2, '0');
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    final month = months[dateTime.month - 1];
    final year = dateTime.year;

    // Time (12-hour format with AM/PM)
    int hour = dateTime.hour;
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 == 0 ? 12 : hour % 12;
    final hourStr = hour.toString().padLeft(2, '0');

    // Combine into desired format: "03 Nov 2025, 09:45 PM"
    return '$day $month $year, $hourStr:$minute $ampm';
  }


  void _showCancelDialog(BuildContext context, WidgetRef ref, String orderId) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    String? reason;

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Cancel Order?', style: textTheme.titleLarge),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Are you sure you want to cancel this order?',
              style: textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Reason (Optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
              onChanged: (value) => reason = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(dialogContext).pop();

              // Show loading
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (_) => const Center(child: CircularProgressIndicator()),
              );

              final cancelledOrder = await ref
                  .read(orderControllerProvider.notifier)
                  .cancelOrder(orderId, reason: reason);

              if (context.mounted) {
                Navigator.of(context).pop(); // Close loading

                if (cancelledOrder != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order cancelled successfully'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  _loadOrder(); // Reload order
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Failed to cancel order'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Yes, Cancel', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING:
        return Icons.schedule;
      case OrderStatus.CONFIRMED:
        return Icons.fact_check;
      case OrderStatus.PROCESSING:
        return Icons.hourglass_empty;
      case OrderStatus.SHIPPED:
        return Icons.local_shipping;
      case OrderStatus.OUT_FOR_DELIVERY:
        return Icons.delivery_dining;
      case OrderStatus.DELIVERED:
        return Icons.check_circle;
      case OrderStatus.CANCELLED:
        return Icons.cancel;
      case OrderStatus.REFUNDED:
        return Icons.attach_money;
      case OrderStatus.FAILED:
        return Icons.error;
      case OrderStatus.ACCEPTED:
        return Icons.thumb_up;
      case OrderStatus.REJECTED:
        return Icons.thumb_down;
      case OrderStatus.RETURNED:
        return Icons.assignment_return;
    }
  }

  String _getStatusTitle(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Order Pending';
      case OrderStatus.CONFIRMED:
        return 'Order Confirmed';
      case OrderStatus.PROCESSING:
        return 'Processing Order';
      case OrderStatus.SHIPPED:
        return 'Order Shipped';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case OrderStatus.DELIVERED:
        return 'Order Delivered';
      case OrderStatus.CANCELLED:
        return 'Order Cancelled';
      case OrderStatus.REFUNDED:
        return 'Order Refunded';
      case OrderStatus.FAILED:
        return 'Order Failed';
      case OrderStatus.ACCEPTED:
        return 'Order Accepted';
      case OrderStatus.REJECTED:
        return 'Order Rejected';
      case OrderStatus.RETURNED:
        return 'Order Returned';
    }
  }

  String _getStatusSubtitle(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Your order is being confirmed';
      case OrderStatus.CONFIRMED:
        return 'Your order has been confirmed';
      case OrderStatus.PROCESSING:
        return 'We are preparing your order';
      case OrderStatus.SHIPPED:
        return 'Your order is on the way';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Our delivery partner is on the way';
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered';
      case OrderStatus.CANCELLED:
        return 'This order has been cancelled';
      case OrderStatus.REFUNDED:
        return 'Your payment has been refunded';
      case OrderStatus.FAILED:
        return 'Order failed to process';
      case OrderStatus.ACCEPTED:
        return 'Order has been accepted';
      case OrderStatus.REJECTED:
        return 'Order has been rejected';
      case OrderStatus.RETURNED:
        return 'Order has been returned';
    }
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
        return 'Out for Delivery';
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

  String _getPaymentMethodText(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.COD:
        return 'Cash on Delivery';

      case PaymentMethod.ONLINE:
        return 'Online Payment';

      case PaymentMethod.WALLET:
        return 'Wallet Payment';

      case PaymentMethod.WALLET_ONLINE:
        return 'Wallet + Online Payment';

      case PaymentMethod.WALLET_COD:
        return 'Wallet + Cash on Delivery';
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

class _OrderItemTile extends StatelessWidget {
  final OrderItemType item;
  final TextTheme textTheme;

  const _OrderItemTile({
    required this.item,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 70,
              height: 70,
              color: Colors.grey.shade100,
              child: item.image?.isNotEmpty == true
                  ? CachedNetworkImage(
                imageUrl: item.image!,
                cacheManager: AppCacheManager.instance,
                fit: BoxFit.cover,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                errorWidget: (_, __, ___) => Icon(
                  Icons.shopping_bag_outlined,
                  color: Colors.grey[400],
                  size: 30,
                ),
              )
                  : Icon(Icons.shopping_bag_outlined, color: Colors.grey[400], size: 30),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.variantTitle?.isNotEmpty == true) ...[
                  const SizedBox(height: 2),
                  Text(
                    item.variantTitle!,
                    style: textTheme.bodySmall?.copyWith(color: const Color(0xFF757575)),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  'Qty: ${item.quantity}',
                  style: textTheme.bodySmall?.copyWith(color: const Color(0xFF757575)),
                ),
              ],
            ),
          ),
          Text(
            '₹${item.totalPrice.toStringAsFixed(0)}',
            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final TextTheme textTheme;
  final Color? valueColor;

  const _InfoRow({
    required this.label,
    required this.value,
    required this.textTheme,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: textTheme.bodyMedium?.copyWith(color: const Color(0xFF757575)),
        ),
        Text(
          value,
          style: textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final TextTheme textTheme;
  final Color? valueColor;
  final bool isTotal;

  const _PriceRow({
    required this.label,
    required this.value,
    required this.textTheme,
    this.valueColor,
    this.isTotal = false,
  });

  @override
  Widget build(BuildContext context) {
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
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _CheckoutAdsBanner extends StatefulWidget {
  final List<String> images;
  const _CheckoutAdsBanner({super.key, required this.images});

  @override
  State<_CheckoutAdsBanner> createState() => _CheckoutAdsBannerState();
}

class _CheckoutAdsBannerState extends State<_CheckoutAdsBanner> {
  late PageController _pageController;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    
    // Precache all images
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      for (var url in widget.images) {
        try {
          precacheImage(CachedNetworkImageProvider(url, cacheManager: AppCacheManager.instance), context);
        } catch (_) {}
      }
    });

    if (widget.images.length > 1) {
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_pageController.hasClients && mounted) {
        int nextPage = (_currentPage + 1) % widget.images.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 320, // Match Map Height
              child: Stack(
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: widget.images.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return CachedNetworkImage(
                        imageUrl: widget.images[index],
                        cacheManager: AppCacheManager.instance,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const SizedBox.shrink(),
                        placeholder: (_, __) => Container(
                          color: Colors.grey[100],
                          alignment: Alignment.center,
                          child: const CircularProgressIndicator(),
                        ),
                      );
                    },
                  ),
                  
                  // Dots Indicator
                  if (widget.images.length > 1)
                    Positioned(
                      bottom: 12,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          widget.images.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: _currentPage == index ? 24 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _currentPage == index 
                                ? const Color(0xFF5AC268) 
                                : Colors.white.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}