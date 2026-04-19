// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promocode_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApplyPromoResponse _$ApplyPromoResponseFromJson(Map<String, dynamic> json) =>
    ApplyPromoResponse(
      appliedPromo: json['appliedPromo'] == null
          ? null
          : AppliedPromo.fromJson(json['appliedPromo'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ApplyPromoResponseToJson(ApplyPromoResponse instance) =>
    <String, dynamic>{'appliedPromo': instance.appliedPromo};

AppliedPromo _$AppliedPromoFromJson(Map<String, dynamic> json) => AppliedPromo(
  code: json['code'] as String?,
  discountAmount: (json['discountAmount'] as num?)?.toDouble(),
);

Map<String, dynamic> _$AppliedPromoToJson(AppliedPromo instance) =>
    <String, dynamic>{
      'code': instance.code,
      'discountAmount': instance.discountAmount,
    };
