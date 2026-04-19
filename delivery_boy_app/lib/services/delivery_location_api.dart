import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DeliveryLocationAPI {
  final Dio _dio;
  final String baseUrl;

  DeliveryLocationAPI({Dio? dio})
      : _dio = dio ?? Dio(),
        baseUrl = dotenv.env['API_URL'] ?? 'http://localhost:8000/api';

  /// Update delivery boy's location to backend
  Future<bool> updateLocation({
    required String orderId,
    required double latitude,
    required double longitude,
    double? accuracy,
    double? speed,
    double? heading,
  }) async {
    try {
      final response = await _dio.post(
        '$baseUrl/delivery/location',
        data: {
          'orderId': orderId,
          'latitude': latitude,
          'longitude': longitude,
          'accuracy': accuracy,
          'speed': speed,
          'heading': heading,
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        print('✅ Location updated: $latitude, $longitude');
        return true;
      }
      return false;
    } catch (e) {
      print('❌ Error updating location: $e');
      return false;
    }
  }

  /// Get current delivery location for an order
  Future<Map<String, dynamic>?> getDeliveryLocation(String orderId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/delivery/location/$orderId',
      );

      if (response.statusCode == 200 && response.data['success']) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      print('❌ Error fetching location: $e');
      return null;
    }
  }
}
