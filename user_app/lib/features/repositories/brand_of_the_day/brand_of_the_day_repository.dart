import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/brand_of_the_day/brand_of_the_day_model.dart';

final brandOfTheDayRepositoryProvider =
Provider<BrandOfTheDayRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return BrandOfTheDayRepository(client);
});

class BrandOfTheDayRepository {
  final ApiClient _client;
  BrandOfTheDayRepository(this._client);

  Future<ApiResponse<List<BrandOfTheDayType>>> getAll({
    Map<String, dynamic>? queryParams,
  }) async {
    return _client.get<List<BrandOfTheDayType>>(
      '/brand-of-the-day',
      queryParameters: queryParams,
      fromJson: (json) => (json['items'] as List)
          .map((e) => BrandOfTheDayType.fromJson(e))
          .toList(),
    );
  }
}
