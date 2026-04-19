import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/network/api_client.dart';
import 'package:quickzone_delivery/core/network/api_response.dart';
import 'package:quickzone_delivery/features/models/models.dart';

/// 🔌 Provider for DeliveryBoyRepository
final deliveryBoyRepositoryProvider = Provider<DeliveryBoyRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return DeliveryBoyRepository(client);
});

/// 🧑‍💼 Repository for all Delivery Boy related API calls
class DeliveryBoyRepository {
  final ApiClient _client;
  DeliveryBoyRepository(this._client);

  /// 📦 Get assigned orders for delivery boy
  Future<ApiResponse<AssignedOrdersResponseData>> getAssignedOrders() async =>
      _client.get<AssignedOrdersResponseData>('/delivery-boys/orders/assigned', fromJson: (json) => AssignedOrdersResponseData.fromJson(json));

 /// 📦 Get all orders for delivery boy
  Future<ApiResponse<AssignedOrdersResponseData>> getAllOrders() async =>
      _client.get<AssignedOrdersResponseData>('/delivery-boys/orders/all', fromJson: (json) => AssignedOrdersResponseData.fromJson(json));

  /// ✅ Accept assigned order
  Future<ApiResponse<OrderActionResponseData>> acceptAssignedOrder(AcceptRejectOrderRequest payload) async =>
      _client.post<OrderActionResponseData>('/delivery-boys/orders/accept', data: payload.toJson(), fromJson: (json) => OrderActionResponseData.fromJson(json));

  /// ❌ Reject assigned order
  Future<ApiResponse<OrderActionResponseData>> rejectAssignedOrder(AcceptRejectOrderRequest payload) async =>
      _client.post<OrderActionResponseData>('/delivery-boys/orders/reject', data: payload.toJson(), fromJson: (json) => OrderActionResponseData.fromJson(json));

  /// 🚚 Update delivery status (OUT_FOR_DELIVERY / DELIVERED)
  Future<ApiResponse<OrderActionResponseData>> updateDeliveryStatus(UpdateDeliveryStatusRequest payload) async =>
      _client.patch<OrderActionResponseData>('/delivery-boys/orders/status', data: payload.toJson(), fromJson: (json) => OrderActionResponseData.fromJson(json));
}
