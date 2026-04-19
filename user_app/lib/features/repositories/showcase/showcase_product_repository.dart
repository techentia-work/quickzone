import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/showcase_product/showcase_product_model.dart';

/// =======================================================
/// PROVIDER
/// =======================================================
final showcaseProductRepositoryProvider =
Provider<ShowcaseProductRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return ShowcaseProductRepository(client);
});

/// =======================================================
/// REPOSITORY
/// =======================================================
class ShowcaseProductRepository {
  final ApiClient _client;
  ShowcaseProductRepository(this._client);

  /// 🔥 BACKEND CORRECT PATH
  static const String _basePath = '/showcase-products';

  /// ===============================
  /// GET ALL SHOWCASES
  /// ===============================
  Future<ApiResponse<List<ShowcaseProductType>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async =>
      _client.get<List<ShowcaseProductType>>(
        _basePath,
        queryParameters: queryParams,
        fromJson: (json) {
          final List list = json['showcases'] ?? [];
          return list
              .map(
                (e) => ShowcaseProductType.fromJson(
              e as Map<String, dynamic>,
            ),
          )
              .toList();
        },
      );

  /// ===============================
  /// GET BY ID
  /// ===============================
  Future<ApiResponse<ShowcaseProductType>> getById(String id) async {
    final res =
    await _client.get<Map<String, dynamic>>('$_basePath/$id');

    if (res.success && res.data != null) {
      return ApiResponse<ShowcaseProductType>(
        success: true,
        message: res.message,
        data: ShowcaseProductType.fromJson(
          res.data!['data'] as Map<String, dynamic>,
        ),
      );
    }

    return ApiResponse<ShowcaseProductType>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ===============================
  /// CREATE
  /// ===============================
  Future<ApiResponse<ShowcaseProductType>> create(
      Map<String, dynamic> payload,
      ) async {
    final res = await _client.post<Map<String, dynamic>>(
      _basePath,
      data: payload,
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShowcaseProductType>(
        success: true,
        message: res.message,
        data: ShowcaseProductType.fromJson(
          res.data!['data'] as Map<String, dynamic>,
        ),
      );
    }

    return ApiResponse<ShowcaseProductType>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ===============================
  /// UPDATE
  /// ===============================
  Future<ApiResponse<ShowcaseProductType>> update(
      String id,
      Map<String, dynamic> payload,
      ) async {
    final res = await _client.put<Map<String, dynamic>>(
      '$_basePath/$id',
      data: payload,
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShowcaseProductType>(
        success: true,
        message: res.message,
        data: ShowcaseProductType.fromJson(
          res.data!['data'] as Map<String, dynamic>,
        ),
      );
    }

    return ApiResponse<ShowcaseProductType>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ===============================
  /// DELETE
  /// ===============================
  Future<ApiResponse<bool>> delete(String id) async {
    final res =
    await _client.delete<Map<String, dynamic>>('$_basePath/$id');

    if (res.success) {
      return ApiResponse<bool>(
        success: true,
        message: res.message,
        data: true,
      );
    }

    return ApiResponse<bool>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }

  /// ===============================
  /// TOGGLE STATUS
  /// ===============================
  Future<ApiResponse<ShowcaseProductType>> toggleStatus(String id) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '$_basePath/$id/toggle-status',
    );

    if (res.success && res.data != null) {
      return ApiResponse<ShowcaseProductType>(
        success: true,
        message: res.message,
        data: ShowcaseProductType.fromJson(
          res.data!['data'] as Map<String, dynamic>,
        ),
      );
    }

    return ApiResponse<ShowcaseProductType>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }
}
