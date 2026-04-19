import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/featured/featured_model.dart';

final featuredRepositoryProvider = Provider<FeaturedRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return FeaturedRepository(client);
});

class FeaturedRepository {
  final ApiClient _client;
  FeaturedRepository(this._client);

  Future<ApiResponse<List<FeaturedType>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async =>
      _client.get<List<FeaturedType>>(
        '/featured',
        queryParameters: queryParams,
        fromJson: (json) => (json['items'] as List)
            .map((e) => FeaturedType.fromJson(e))
            .toList(),
      );

  Future<ApiResponse<FeaturedType>> getById(String id) async {
    final res = await _client.get<Map<String, dynamic>>('/featured/$id');

    if (res.success && res.data != null) {
      return ApiResponse<FeaturedType>(
        success: true,
        message: res.message,
        data: FeaturedType.fromJson(res.data!['data']),
      );
    }

    return ApiResponse<FeaturedType>(
      success: false,
      message: res.message,
      error: res.error,
    );
  }
}