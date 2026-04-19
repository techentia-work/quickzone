import 'package:json_annotation/json_annotation.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

part 'promocode_model.g.dart';

@JsonSerializable()
class PromoCodeType {
  @JsonKey(name: '_id')
  final String? id;
  final String code;
  final String? description;
  final PromocodeDiscountType discountType;
  final double discountValue;
  final double? maxDiscountAmount;
  final double? minCartValue;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? usageLimit;
  final int? usedCount;
  final int? perUserLimit;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  PromoCodeType({
    this.id,
    required this.code,
    this.description,
    required this.discountType,
    required this.discountValue,
    this.maxDiscountAmount,
    this.minCartValue,
    this.startDate,
    this.endDate,
    this.usageLimit,
    this.usedCount,
    this.perUserLimit,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory PromoCodeType.fromJson(Map<String, dynamic> json) =>
      _$PromoCodeTypeFromJson(json);

  Map<String, dynamic> toJson() => _$PromoCodeTypeToJson(this);
}
