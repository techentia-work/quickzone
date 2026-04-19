import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/repositories/order/order_repository.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

class OrderController extends AsyncNotifier<List<OrderType>?> {
  @override
  Future<List<OrderType>?> build() async {
    return null;
  }

  /// 🧾 Fetch all user orders
  Future<List<OrderType>?> fetchOrders() async {
    try {
      final repository = ref.read(orderRepositoryProvider);
      final res = await repository.getAllOrders();

      if (res.success && res.data != null) {
        state = AsyncValue.data(res.data);
        return res.data;
      }

      state = const AsyncValue.data(null);
      return null;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }

  /// 🛒 CREATE ORDER (COD / ONLINE)
  Future<OrderType?> createOrderWithPayment({
    required String addressId,
    required PaymentMethod selectedMethod,
    double walletAmount = 0, // ✅ ADD THIS
  }) async {
    try {
      state = const AsyncValue.loading();
      final repository = ref.read(orderRepositoryProvider);

      final payload = CreateOrderPayload(
        shippingAddressId: addressId,
        paymentMethod: selectedMethod,
        walletAmount: walletAmount, // ✅ ADD THIS
      );

      final res = await repository.createOrder(payload.toJson());

      if (res.success && res.data != null) {
        await fetchOrders();
        return res.data;
      }

      state = const AsyncValue.data(null);
      return null;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }


  /// 💳 VERIFY RAZORPAY PAYMENT
  Future<OrderType?> verifyPayment({
    required String orderId,
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
  }) async {
    try {
      final repository = ref.read(orderRepositoryProvider);

      final payload = {
        'orderId': orderId,
        'razorpay_payment_id': razorpayPaymentId,
        'razorpay_order_id': razorpayOrderId,
        'razorpay_signature': razorpaySignature,
      };

      final res = await repository.verifyRazorpayPayment(payload);

      if (res.success && res.data != null) {
        await fetchOrders();
        return res.data;
      }

      return null;
    } catch (e) {

      return null;
    }
  }

  /// ❌ Cancel order
  Future<OrderType?> cancelOrder(String orderId, {String? reason}) async {
    try {
      final repository = ref.read(orderRepositoryProvider);
      final res = await repository.cancelOrder(orderId, reason: reason);

      if (res.success && res.data != null) {
        await fetchOrders();
        return res.data;
      }

      return null;
    } catch (_) {
      return null;
    }
  }

  /// 🔍 Get order by ID
  Future<OrderType?> getOrderById(String orderId) async {
    try {
      final repository = ref.read(orderRepositoryProvider);
      final res = await repository.getOrderById(orderId);
      return res.data;
    } catch (_) {
      return null;
    }
  }

  /// 🔍 Get order by number
  Future<OrderType?> getOrderByNumber(String orderNumber) async {
    try {
      final repository = ref.read(orderRepositoryProvider);
      final res = await repository.getOrderByNumber(orderNumber);
      return res.data;
    } catch (_) {
      return null;
    }
  }
}


/// 🪄 Provider
final orderControllerProvider =
AsyncNotifierProvider<OrderController, List<OrderType>?>(
  OrderController.new,
);

final singleOrderProvider =
FutureProvider.family<OrderType?, String>((ref, orderId) async {
  final controller = ref.read(orderControllerProvider.notifier);
  return controller.getOrderById(orderId);
});