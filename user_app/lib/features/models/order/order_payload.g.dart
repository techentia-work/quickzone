// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateOrderPayload _$CreateOrderPayloadFromJson(Map<String, dynamic> json) =>
    CreateOrderPayload(
      shippingAddressId: json['shippingAddressId'] as String,
      paymentMethod: $enumDecode(_$PaymentMethodEnumMap, json['paymentMethod']),
      walletAmount: (json['walletAmount'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$CreateOrderPayloadToJson(CreateOrderPayload instance) =>
    <String, dynamic>{
      'shippingAddressId': instance.shippingAddressId,
      'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
      'walletAmount': instance.walletAmount,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.COD: 'cod',
  PaymentMethod.ONLINE: 'online',
  PaymentMethod.WALLET: 'wallet',
  PaymentMethod.WALLET_ONLINE: 'wallet_online',
  PaymentMethod.WALLET_COD: 'wallet_cod',
};

CancelOrderPayload _$CancelOrderPayloadFromJson(Map<String, dynamic> json) =>
    CancelOrderPayload(reason: json['reason'] as String?);

Map<String, dynamic> _$CancelOrderPayloadToJson(CancelOrderPayload instance) =>
    <String, dynamic>{'reason': instance.reason};
