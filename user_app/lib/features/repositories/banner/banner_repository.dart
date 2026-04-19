import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/banner/banner_model.dart';

final bannerRepositoryProvider = Provider<BannerRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return BannerRepository(client);
});

class BannerRepository {
  final ApiClient _client;
  BannerRepository(this._client);

  Future<ApiResponse<List<BannerType>>> getAll({Map<String, dynamic>? queryParams,}) async =>
      _client.get<List<BannerType>>('/banner', queryParameters: queryParams, fromJson: (json) => (json['items'] as List).map((e) => (BannerType.fromJson(e))).toList());
}
