import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/product/product_model.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return ProductRepository(client);
});

class ProductRepository {
  final ApiClient _client;
  ProductRepository(this._client);

  /// Get all products with optional query params
  Future<ApiResponse<List<ProductType>>> getAll({Map<String, dynamic>? queryParams}) =>
      _client.get<List<ProductType>>('/product', queryParameters: queryParams, fromJson: (json) => (json['products'] as List).map((e) => ProductType.fromJson(e)).toList(),
      );

  /// Get product by ID
  Future<ApiResponse<ProductType>> getById(String id) =>
      _client.get<ProductType>('/product/$id',fromJson: (json) => ProductType.fromJson(json));

  /// Get product by slug
  Future<ApiResponse<ProductType>> getBySlug(String slug) =>
      _client.get<ProductType>('/product/slug/$slug',fromJson: (json) => ProductType.fromJson(json));

  /// Get products by category with optional query params
  Future<ApiResponse<List<ProductType>>> getByCategory(String categoryId, {Map<String, dynamic>? queryParams,  }) =>
      _client.get<List<ProductType>>('/product/category/$categoryId', queryParameters: queryParams, fromJson: (json) => (json['products'] as List).map((e) => ProductType.fromJson(e)).toList(),
  );
}
