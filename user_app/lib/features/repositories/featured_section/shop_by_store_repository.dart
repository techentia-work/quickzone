import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:Quickzon/features/models/featured/shop_by_store_model.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

/// =======================================================
/// PROVIDER
/// =======================================================
final shopByStoreRepositoryProvider =
Provider<ShopByStoreRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return ShopByStoreRepository(client);
});

/// =======================================================
/// REPOSITORY
/// =======================================================
class ShopByStoreRepository {
  final ApiClient _client;
  ShopByStoreRepository(this._client);

  /// ---------------- GET ALL ----------------
  /// Backend response:
  /// {
  ///   success: true,
  ///   data: {
  ///     items: [],
  ///     pagination: {}
  ///   }
  /// }
  Future<ApiResponse<List<ShopByStore>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async =>
      _client.get<List<ShopByStore>>(
        '/shop-by-store',
        queryParameters: queryParams,
        fromJson: (json) => (json['items'] as List)
            .map(
              (e) => ShopByStore.fromJson(
            e as Map<String, dynamic>,
          ),
        )
            .toList(),
      );

  /// ---------------- GET BY ID ----------------
  Future<ApiResponse<ShopByStore>> getById(String id) async {
    final res =
    await _client.get<Map<String, dynamic>>('/shop-by-store/$id');

    if (res.success && res.data != null) {
      return ApiResponse<ShopByStore>(
        success: true,
        message: res.message,
        data: ShopByStore.fromJson(
          res.data!['data'] ?? res.data!,
        ),
      );
    }

    return ApiResponse<ShopByStore>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ---------------- CREATE ----------------
  Future<ApiResponse<ShopByStore>> create(
      CreateShopByStorePayload payload,
      ) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/shop-by-store',
      data: payload.toJson(),
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShopByStore>(
        success: true,
        message: res.message,
        data: ShopByStore.fromJson(
          res.data!['data'] ?? res.data!,
        ),
      );
    }

    return ApiResponse<ShopByStore>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ---------------- UPDATE ----------------
  Future<ApiResponse<ShopByStore>> update(
      String id,
      UpdateShopByStorePayload payload,
      ) async {
    final res = await _client.put<Map<String, dynamic>>(
      '/shop-by-store/$id',
      data: payload.toJson(),
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShopByStore>(
        success: true,
        message: res.message,
        data: ShopByStore.fromJson(
          res.data!['data'] ?? res.data!,
        ),
      );
    }

    return ApiResponse<ShopByStore>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ---------------- DELETE ----------------
  Future<ApiResponse<void>> delete(String id) async {
    final res = await _client.delete<void>(
      '/shop-by-store/$id',
    );

    if (res.success) {
      return ApiResponse<void>(
        success: true,
        message: res.message,
      );
    }

    return ApiResponse<void>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ---------------- TOGGLE STATUS ----------------
  Future<ApiResponse<ShopByStore>> toggleStatus(String id) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '/shop-by-store/$id/toggle-status',
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShopByStore>(
        success: true,
        message: res.message,
        data: ShopByStore.fromJson(
          res.data!['data'] ?? res.data!,
        ),
      );
    }

    return ApiResponse<ShopByStore>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }
}
