import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_payload.g.dart';

/// ✅ Create Order Payload
@JsonSerializable(explicitToJson: true)
class CreateOrderPayload {
  final String shippingAddressId;
  final PaymentMethod paymentMethod;
  final double walletAmount;

  CreateOrderPayload({
    required this.shippingAddressId,
    required this.paymentMethod,
    this.walletAmount = 0,
  });

  Map<String, dynamic> toJson() {
    return {
      'shippingAddressId': shippingAddressId,
      'paymentMethod': _mapPaymentMethod(paymentMethod, walletAmount),
      "walletAmount": walletAmount
    };
  }

  String _mapPaymentMethod(PaymentMethod method, double walletAmount) {
    final hasWallet = walletAmount > 0;

    switch (method) {
      case PaymentMethod.COD:
        return hasWallet ? 'wallet_cod' : 'cod';

      case PaymentMethod.ONLINE:
        return hasWallet ? 'wallet_online' : 'online';

      case PaymentMethod.WALLET:
        return 'wallet';

      case PaymentMethod.WALLET_ONLINE:
        return 'wallet_online';

      case PaymentMethod.WALLET_COD:
        return 'wallet_cod';
    }
  }


}

/// 🚫 Cancel Order Payload
@JsonSerializable()
class CancelOrderPayload {
  final String? reason;

  CancelOrderPayload({this.reason});

  factory CancelOrderPayload.fromJson(Map<String, dynamic> json) =>
      _$CancelOrderPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$CancelOrderPayloadToJson(this);
}
