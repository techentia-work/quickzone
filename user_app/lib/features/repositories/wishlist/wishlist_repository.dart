// features/repositories/wishlist/wishlist_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import 'package:Quickzon/features/models/wishlist/wishlist_model.dart';
import 'package:Quickzon/features/models/wishlist/wishlist_payload.dart';

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return WishlistRepository(client);
});

class WishlistRepository {
  final ApiClient _client;
  WishlistRepository(this._client);

  /// Get user wishlist
  Future<ApiResponse<WishlistType>> getUserWishlist() async =>
      _client.get<WishlistType>('/wishlist', fromJson: (json) => WishlistType.fromJson(json));

  /// Add item to wishlist
  Future<ApiResponse<WishlistType>> addItem(AddToWishlistPayload payload) async =>
      _client.post<WishlistType>('/wishlist', data: payload.toJson(), fromJson: (json) => WishlistType.fromJson(json));

  /// Remove item from wishlist
  Future<ApiResponse<WishlistType>> removeItem(RemoveWishlistItemPayload payload) async =>
      _client.delete<WishlistType>('/wishlist/${payload.variantId}', fromJson: (json) => WishlistType.fromJson(json));

  /// Clear wishlist
  Future<ApiResponse<WishlistType>> clearWishlist() async =>
      _client.delete<WishlistType>('/wishlist', fromJson: (json) => WishlistType.fromJson(json));
}
