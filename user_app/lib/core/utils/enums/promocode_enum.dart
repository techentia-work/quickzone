import 'package:json_annotation/json_annotation.dart';

enum PromocodeDiscountType {
  @JsonValue('PERCENTAGE')
  PERCENTAGE,

  @JsonValue('FLAT')
  FLAT,
}

enum PromoCodeStatus {
  @JsonValue('active')
  ACTIVE,

  @JsonValue('inactive')
  INACTIVE,

  @JsonValue('scheduled')
  SCHEDULED,

  @JsonValue('expired')
  EXPIRED,

  @JsonValue('limit_reached')
  LIMIT_REACHED,
}