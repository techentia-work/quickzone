// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promocode_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PromoCodeType _$PromoCodeTypeFromJson(Map<String, dynamic> json) =>
    PromoCodeType(
      id: json['_id'] as String?,
      code: json['code'] as String,
      description: json['description'] as String?,
      discountType: $enumDecode(
        _$PromocodeDiscountTypeEnumMap,
        json['discountType'],
      ),
      discountValue: (json['discountValue'] as num).toDouble(),
      maxDiscountAmount: (json['maxDiscountAmount'] as num?)?.toDouble(),
      minCartValue: (json['minCartValue'] as num?)?.toDouble(),
      startDate: json['startDate'] == null
          ? null
          : DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] == null
          ? null
          : DateTime.parse(json['endDate'] as String),
      usageLimit: (json['usageLimit'] as num?)?.toInt(),
      usedCount: (json['usedCount'] as num?)?.toInt(),
      perUserLimit: (json['perUserLimit'] as num?)?.toInt(),
      isActive: json['isActive'] as bool,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$PromoCodeTypeToJson(PromoCodeType instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'code': instance.code,
      'description': instance.description,
      'discountType': _$PromocodeDiscountTypeEnumMap[instance.discountType]!,
      'discountValue': instance.discountValue,
      'maxDiscountAmount': instance.maxDiscountAmount,
      'minCartValue': instance.minCartValue,
      'startDate': instance.startDate?.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
      'usageLimit': instance.usageLimit,
      'usedCount': instance.usedCount,
      'perUserLimit': instance.perUserLimit,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

const _$PromocodeDiscountTypeEnumMap = {
  PromocodeDiscountType.PERCENTAGE: 'PERCENTAGE',
  PromocodeDiscountType.FLAT: 'FLAT',
};
