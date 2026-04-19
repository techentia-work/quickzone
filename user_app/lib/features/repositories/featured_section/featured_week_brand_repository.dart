import 'package:Quickzon/features/models/featured/featured_week_brand_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

/// =======================================================
/// PROVIDER
/// =======================================================
final featuredWeekBrandRepositoryProvider =
Provider<FeaturedWeekBrandRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return FeaturedWeekBrandRepository(client);
});

/// =======================================================
/// REPOSITORY
/// =======================================================
class FeaturedWeekBrandRepository {
  final ApiClient _client;
  FeaturedWeekBrandRepository(this._client);

  /// ---------------- GET ALL ----------------
  Future<ApiResponse<List<FeaturedWeekBrand>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async =>
      _client.get<List<FeaturedWeekBrand>>(
        '/featured-week-brand',
        queryParameters: queryParams,
        fromJson: (json) => (json['items'] as List)
            .map((e) => FeaturedWeekBrand.fromJson(e))
            .toList(),
      );

  /// ---------------- GET BY ID ----------------
  Future<ApiResponse<FeaturedWeekBrand>> getById(String id) async {
    final res =
    await _client.get<Map<String, dynamic>>('/featured-week-brand/$id');

    if (res.success && res.data != null) {
      return ApiResponse<FeaturedWeekBrand>(
        success: true,
        message: res.message,
        data: FeaturedWeekBrand.fromJson(res.data!['data']),
      );
    }

    return ApiResponse<FeaturedWeekBrand>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }
}
