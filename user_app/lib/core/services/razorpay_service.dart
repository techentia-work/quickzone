import 'package:razorpay_flutter/razorpay_flutter.dart';

class RazorpayService {
  late Razorpay _razorpay;

  void init({
    required Function(PaymentSuccessResponse) onSuccess,
    required Function(PaymentFailureResponse) onFailure,
    required Function(ExternalWalletResponse) onExternalWallet,
  }) {
    _razorpay = Razorpay();

    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, onFailure);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, onExternalWallet);
  }

  void openCheckout({
    required String key,
    required int amount, // ✅ INT ONLY
    required String orderId,
    required String name,
    required String description,
    String? email,
    String? contact,
  }) {
    final options = {
      'key': key,
      'amount': amount, // paise
      'currency': 'INR',
      'name': name,
      'description': description,
      'order_id': orderId,
      'prefill': {
        'email': email ?? '',
        'contact': contact ?? '',
      },
      'theme': {
        'color': '#16a34a',
      },
    };

    _razorpay.open(options);
  }

  void dispose() {
    _razorpay.clear();
  }
}
