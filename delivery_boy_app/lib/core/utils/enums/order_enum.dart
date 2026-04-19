import 'package:json_annotation/json_annotation.dart';

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

enum PaymentMethod {
  @JsonValue('cod')
  COD,

  @JsonValue('online')
  ONLINE,

  @JsonValue('wallet')
  WALLET,
}