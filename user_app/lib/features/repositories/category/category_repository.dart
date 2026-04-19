// features/repositories/category_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/category/category_model.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return CategoryRepository(client);
});

class CategoryRepository {
  final ApiClient _client;
  CategoryRepository(this._client);

  /// Get all categories with optional query params
  Future<ApiResponse<List<CategoryType>>> getAll({Map<String, dynamic>? queryParams}) async =>
    _client.get<List<CategoryType>>('/category', queryParameters: queryParams, fromJson: (json) => (json['categories'] as List).map((e) => CategoryType.fromJson(e)).toList());

  /// Get category by ID
  Future<ApiResponse<CategoryType>> getById(String id) async =>
    _client.get<CategoryType>('/category/$id', fromJson: (json) => CategoryType.fromJson(json));

  /// Get category by ISlugD
  Future<ApiResponse<CategoryType>> getBySlug(String slug) async =>
    _client.get<CategoryType>('/category/slug/$slug', fromJson: (json) => CategoryType.fromJson(json));

  /// Get category tree
  Future<ApiResponse<List<CategoryType>>> getTree({Map<String, dynamic>? queryParams}) async =>
    _client.get<List<CategoryType>>('/category/tree', queryParameters: queryParams,fromJson: (json) => (json as List).map((e)=>CategoryType.fromJson(e)).toList());
}