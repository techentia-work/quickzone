// core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_response.dart';
import 'error_handler.dart';
import 'dio_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  final dio = ref.read(dioProvider);
  return ApiClient(dio);
});

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  Future<ApiResponse<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, T Function(dynamic json)? fromJson}) async {
    return safeApiCall<T>(() async {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _mapAndParse<T>(response, fromJson);
    });
  }

  Future<ApiResponse<T>> post<T>(String path, {dynamic data, T Function(dynamic json)? fromJson,}) async {
    return safeApiCall<T>(() async {
      final response = await _dio.post(path, data: data);
      return _mapAndParse<T>(response, fromJson);
    });
  }

  Future<ApiResponse<T>> put<T>(
      String path, {
        dynamic data,
        T Function(dynamic json)? fromJson,
      }) async {
    return safeApiCall<T>(() async {
      final response = await _dio.put(path, data: data);
      return _mapAndParse<T>(response, fromJson);
    });
  }

  Future<ApiResponse<T>> delete<T>(
      String path, {
        dynamic data,
        T Function(dynamic json)? fromJson,
      }) async {
    return safeApiCall<T>(() async {
      final response = await _dio.delete(path, data: data);
      return _mapAndParse<T>(response, fromJson);
    });
  }

  Future<ApiResponse<T>> patch<T>(
      String path, {
        dynamic data,
        T Function(dynamic json)? fromJson,
      }) async {
    return safeApiCall<T>(() async {
      final response = await _dio.patch(path, data: data);
      return _mapAndParse<T>(response, fromJson);
    });
  }

  ApiResponse<T> _mapAndParse<T>(Response response, T Function(dynamic json)? fromJson) {
    final apiResponse = _mapResponse<dynamic>(response);

    if (apiResponse.success && apiResponse.data != null && fromJson != null) {
      try {
        // The data is already the correct nested object from _mapResponse
        // Just ensure it's a proper Map<String, dynamic>
        dynamic dataToPass = apiResponse.data;

        if (dataToPass is Map) {
          dataToPass = Map<String, dynamic>.from(dataToPass);
        }

        // print('Data to pass to fromJson: $dataToPass');
        final parsedData = fromJson(dataToPass);

        return ApiResponse<T>(
          success: true,
          message: apiResponse.message,
          data: parsedData,
        );
      } catch (e, stackTrace) {
        print('❌ Parsing error: $e');
        print('❌ Stack trace: $stackTrace');
        return ApiResponse<T>(
          success: false,
          message: 'Failed to parse response',
          error: e.toString(),
        );
      }
    }

    // fallback: raw data
    return ApiResponse<T>(
      success: apiResponse.success,
      message: apiResponse.message,
      data: apiResponse.data as T?,
      error: apiResponse.error,
    );
  }

  ApiResponse<T> _mapResponse<T>(Response response) {
    final data = response.data;
    // print("data:$data,${data['success']}");

    if (data is Map && data['success'] == true) {
      return ApiResponse<T>(success: true, message: data['message'] ?? 'Success', data: data['data']);
    }

    if (data is Map && data['success'] == false) {
      return ApiResponse<T>(success: false, message: data['message'] ?? 'Operation failed', error: data['error']);
    }

    return ApiResponse<T>(success: false, message: 'Unexpected response format', error: data);
  }
}
