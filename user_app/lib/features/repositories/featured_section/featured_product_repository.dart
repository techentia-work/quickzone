import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/featured/featured_product_section.dart';

final featuredProductRepositoryProvider =
Provider<FeaturedProductRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return FeaturedProductRepository(client);
});

class FeaturedProductRepository {
  final ApiClient _client;
  FeaturedProductRepository(this._client);

  Future<ApiResponse<List<FeaturedProductSection>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async {
    return _client.get<List<FeaturedProductSection>>(
      '/featured',
      queryParameters: queryParams,
      fromJson: (json) => (json['items'] as List)
          .map((e) => FeaturedProductSection.fromJson(e))
          .toList(),
    );
  }
}
