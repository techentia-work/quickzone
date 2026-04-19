import 'package:json_annotation/json_annotation.dart';

/// =====================
/// ORDER STATUS
/// =====================
enum OrderStatus {
  @JsonValue('PENDING')
  PENDING,

  @JsonValue('CONFIRMED')
  CONFIRMED,

  @JsonValue('PROCESSING')
  PROCESSING,

  @JsonValue('SHIPPED')
  SHIPPED,

  @JsonValue('OUT_FOR_DELIVERY')
  OUT_FOR_DELIVERY,

  @JsonValue('DELIVERED')
  DELIVERED,

  @JsonValue('CANCELLED')
  CANCELLED,

  @JsonValue('REFUNDED')
  REFUNDED,

  @JsonValue('FAILED')
  FAILED,

  @JsonValue('ACCEPTED')
  ACCEPTED,

  @JsonValue('REJECTED')
  REJECTED,

  @JsonValue('RETURNED')
  RETURNED,
}

/// =====================
/// PAYMENT STATUS
/// =====================
enum PaymentStatus {
  @JsonValue('PENDING')
  PENDING,

  @JsonValue('PAID')
  PAID,

  @JsonValue('FAILED')
  FAILED,

  @JsonValue('REFUNDED')
  REFUNDED,
}

/// =====================
/// PAYMENT METHOD (BACKEND MATCHING)
//  ⚠️ LOWERCASE ONLY
/// =====================
enum PaymentMethod {
  /// Cash on Delivery
  @JsonValue('cod')
  COD,

  /// Online payment (UPI / Card / Netbanking)
  @JsonValue('online')
  ONLINE,

  /// Full wallet payment
  @JsonValue('wallet')
  WALLET,

  /// Wallet + Online
  @JsonValue('wallet_online')
  WALLET_ONLINE,

  /// Wallet + COD
  @JsonValue('wallet_cod')
  WALLET_COD,
}
