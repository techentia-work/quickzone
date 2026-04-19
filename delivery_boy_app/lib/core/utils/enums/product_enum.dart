import 'package:json_annotation/json_annotation.dart';

enum VariantQuantityType {
  @JsonValue('packet')
  PACKET,
  @JsonValue('loose')
  LOOSE,
}

enum VariantInventoryType {
  @JsonValue('LIMITED')
  LIMITED,
  @JsonValue('UNLIMITED')
  UNLIMITED,
}

enum VariantStatus {
  @JsonValue('AVAILABLE')
  AVAILABLE,
  @JsonValue('SOLD_OUT')
  SOLD_OUT,
}

enum ProductEatableType {
  @JsonValue('VEG')
  VEG,
  @JsonValue('NON_VEG')
  NON_VEG,
  @JsonValue('NONE')
  NONE,
}

enum ProductStatus {
  @JsonValue('APPROVED')
  APPROVED,
  @JsonValue('NOT_APPROVED')
  NOT_APPROVED,
  @JsonValue('REJECTED')
  REJECTED,
  @JsonValue('PENDING')
  PENDING,
}

enum TaxRateType {
  @JsonValue('gst_5')
  GST_5,
  @JsonValue('gst_12')
  GST_12,
  @JsonValue('gst_18')
  GST_18,
  @JsonValue('gst_28')
  GST_28,
  @JsonValue('gst_40')
  GST_40,
}
