// core/network/error_handler.dart
import 'package:quickzone_delivery/core/network/api_response.dart';
import 'package:dio/dio.dart';

Future<ApiResponse<T>> safeApiCall<T>(Future<ApiResponse<T>> Function() apiCall) async {
  try {
    return await apiCall();
  } on DioException catch (e) {
    return _handleDioException<T>(e);
  } catch (e) {
    return ApiResponse<T>(success: false, message: 'An unexpected error occurred', error: e);
  }
}

ApiResponse<T> _handleDioException<T>(DioException e) {
  String message;
  dynamic error;

  switch (e.type) {
    case DioExceptionType.connectionTimeout:
      message = 'Connection timeout. Please check your internet connection.';
      break;

    case DioExceptionType.sendTimeout:
      message = 'Request timeout. Please try again.';
      break;

    case DioExceptionType.receiveTimeout:
      message = 'Server took too long to respond. Please try again.';
      break;

    case DioExceptionType.badCertificate:
      message = 'Security certificate error. Please contact support.';
      break;

    case DioExceptionType.connectionError:
      message = 'Cannot connect to server. Please check your internet connection.';
      break;

    case DioExceptionType.cancel:
      message = 'Request was cancelled.';
      break;

    case DioExceptionType.badResponse:
    // Handle HTTP error responses (4xx, 5xx)
      return _handleBadResponse<T>(e);

    case DioExceptionType.unknown:
      message = 'An unexpected network error occurred. Please try again.';
      break;

    default:
      message = 'Network error occurred. Please try again.';
  }

  return ApiResponse<T>(
    success: false,
    message: message,
    error: error ?? e,
  );
}

ApiResponse<T> _handleBadResponse<T>(DioException e) {
  final response = e.response;
  final statusCode = response?.statusCode ?? 0;
  String message;
  dynamic error;

  // Try to extract error message from response body
  if (response?.data is Map) {
    final data = response!.data as Map;
    message = data['message'] ?? _getDefaultErrorMessage(statusCode);
    error = data['error'];
  } else {
    message = _getDefaultErrorMessage(statusCode);
  }

  return ApiResponse<T>(
    success: false,
    message: message,
    error: error ?? {'statusCode': statusCode},
  );
}

String _getDefaultErrorMessage(int statusCode) {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'Access denied. You don\'t have permission.';
    case 404:
      return 'Resource not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 409:
      return 'Conflict occurred. Please refresh and try again.';
    case 422:
      return 'Invalid data provided.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. Please try again later.';
    default:
      if (statusCode >= 500) {
        return 'Server error occurred. Please try again later.';
      } else if (statusCode >= 400) {
        return 'Request failed. Please try again.';
      }
      return 'An error occurred. Please try again.';
  }
}