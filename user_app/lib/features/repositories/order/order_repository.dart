import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/core/network/api_client.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/features/models/models.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return OrderRepository(client);
});

class OrderRepository {
  final ApiClient _client;
  OrderRepository(this._client);

  /// 🛒 Create order (COD / ONLINE)
  Future<ApiResponse<OrderType>> createOrder(
      Map<String, dynamic> payload,
      ) async =>
      _client.post<OrderType>(
        '/order/create',
        data: payload,
        fromJson: (json) => OrderType.fromJson(json['order']),
      );

  /// 📦 Get all orders
  Future<ApiResponse<List<OrderType>>> getAllOrders({int limit = 100}) async =>
      _client.get<List<OrderType>>(
        '/order',
        queryParameters: {
          'limit': limit,
        },
        fromJson: (json) => (json['orders'] as List)
            .map((o) => OrderType.fromJson(o))
            .toList(),
      );

  /// 🔍 Get order by ID
  Future<ApiResponse<OrderType>> getOrderById(String orderId) async =>
      _client.get<OrderType>(
        '/order/$orderId',
        fromJson: (json) => OrderType.fromJson(json['order']),
      );

  /// 🔍 Get order by number
  Future<ApiResponse<OrderType>> getOrderByNumber(String orderNumber) async =>
      _client.get<OrderType>(
        '/order/number/$orderNumber',
        fromJson: (json) => OrderType.fromJson(json['order']),
      );

  /// ❌ Cancel order
  Future<ApiResponse<OrderType>> cancelOrder(
      String orderId, {
        String? reason,
      }) async =>
      _client.patch<OrderType>(
        '/order/$orderId/cancel',
        data: {'reason': reason},
        fromJson: (json) => OrderType.fromJson(json['order']),
      );

  /// 🔥 CREATE RAZORPAY ORDER - FIXED
  Future<ApiResponse<Map<String, dynamic>>> createRazorpayOrder(
      String orderId,
      ) async {
    return _client.post<Map<String, dynamic>>(
      '/order/razorpay/create-order',
      data: {'orderId': orderId},
      // ✅ FIX: Backend directly returns data object, not nested
      fromJson: (json) => json as Map<String, dynamic>,
    );
  }

  /// ✅ VERIFY RAZORPAY PAYMENT
  Future<ApiResponse<OrderType>> verifyRazorpayPayment(
      Map<String, dynamic> payload,
      ) async =>
      _client.post<OrderType>(
        '/order/razorpay/verify-payment',
        data: payload,
        fromJson: (json) => OrderType.fromJson(json['order']),
      );
}