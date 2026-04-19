import 'package:flutter/material.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';

class OrderUtils {
  /// -------------------- ORDER STATUS --------------------
  static (String, Color) getStatusInfo(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING:
        return ('Pending', const Color(0xFFFB8C00)); // Orange
      case OrderStatus.CONFIRMED:
        return ('Confirmed', const Color(0xFF1E88E5)); // Blue
      case OrderStatus.PROCESSING:
        return ('Processing', const Color(0xFF1E88E5)); // Blue
      case OrderStatus.SHIPPED:
        return ('Shipped', const Color(0xFF7B1FA2)); // Purple
      case OrderStatus.OUT_FOR_DELIVERY:
        return ('Out for Delivery', const Color(0xFF5AC268)); // Greenish
      case OrderStatus.DELIVERED:
        return ('Delivered', const Color(0xFF4CAF50)); // Green
      case OrderStatus.ACCEPTED:
        return ('Accepted', const Color(0xFF4CAF50)); // Green
      case OrderStatus.CANCELLED:
        return ('Cancelled', Colors.redAccent);
      case OrderStatus.RETURNED:
        return ('Returned', Colors.redAccent);
      case OrderStatus.REFUNDED:
        return ('Refunded', Colors.redAccent);
      case OrderStatus.REJECTED:
        return ('Rejected', Colors.redAccent);
      case OrderStatus.FAILED:
        return ('Failed', Colors.redAccent);
    }
  }

  /// -------------------- PAYMENT METHOD --------------------
  static String getPaymentMethodText(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.COD:
        return 'Cash on Delivery';
      case PaymentMethod.ONLINE:
        return 'Online';
      case PaymentMethod.WALLET:
        return 'Wallet';
    }
  }

  /// -------------------- PAYMENT STATUS --------------------
  static String getPaymentStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.PAID:
        return 'Paid';
      case PaymentStatus.PENDING:
        return 'Pending';
      case PaymentStatus.REFUNDED:
        return 'Refunded';
      case PaymentStatus.FAILED:
        return 'Failed';
    }
  }
}
