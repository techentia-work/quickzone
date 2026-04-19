// lib/features/repositories/slider/slider_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/slider/slider_model.dart';

final sliderRepositoryProvider = Provider<SliderRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return SliderRepository(client);
});

class SliderRepository {
  final ApiClient _client;
  SliderRepository(this._client);

  Future<ApiResponse<List<SliderType>>> getAll({Map<String, dynamic>? queryParams}) async =>
      _client.get<List<SliderType>>('/slider', queryParameters: queryParams, fromJson: (json) => (json['items'] as List).map((e) => (SliderType.fromJson(e))).toList());


  Future<ApiResponse<SliderType>> getById(String id) async =>
      _client.get<SliderType>('/slider/$id', fromJson: (json) => SliderType.fromJson(json));
}
