// features/repositories/cart/cart_repository.dart
import 'package:Quickzon/features/models/cart/cart_model.dart';
import 'package:Quickzon/features/models/cart/cart_payload.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return CartRepository(client);
});

class CartRepository {
  final ApiClient _client;
  CartRepository(this._client);

  /// Get current user's cart
  Future<ApiResponse<CartType>> getUserCart() async =>
      _client.get<CartType>('/cart', fromJson: (json) => CartType.fromJson(json['cart']));

  /// Add item to cart
  Future<ApiResponse<CartType>> addItem(AddToCartPayload payload) async =>
      _client.post<CartType>('/cart/add', data: payload.toJson(), fromJson: (json) => CartType.fromJson(json['cart']));

  /// Update item quantity
  Future<ApiResponse<CartType>> updateItemQuantity(UpdateCartQuantityPayload payload) async =>
      _client.patch<CartType>('/cart/update', data: payload.toJson(), fromJson: (json) => CartType.fromJson(json['cart']));

  /// Remove item from cart
  Future<ApiResponse<CartType>> removeItem(RemoveCartItemPayload payload) async =>
      _client.delete<CartType>('/cart/remove/${payload.variantId}', fromJson: (json) => CartType.fromJson(json['cart']));

  /// Clear entire cart
  Future<ApiResponse<CartType>> clearCart(ClearCartPayload payload) async =>
      _client.delete<CartType>('/cart/clear', data: payload.toJson(), fromJson: (json) => CartType.fromJson(json['cart']));
}
