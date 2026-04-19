import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/network/api_client.dart';
import 'package:quickzone_delivery/core/network/api_response.dart';
import 'package:quickzone_delivery/features/models/models.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return AuthRepository(client);
});

class AuthRepository {
  final ApiClient _client;
  AuthRepository(this._client);

  /// 🔐 Login delivery boy
  Future<ApiResponse<DeliveryBoyLoginResponseData>> login(DeliveryBoyLoginRequest payload) async =>
      _client.post<DeliveryBoyLoginResponseData>('/delivery-boys/login', data: payload.toJson(), fromJson: (json) => DeliveryBoyLoginResponseData.fromJson(json));

  /// 🚪 Logout delivery boy
  Future<ApiResponse<void>> logout() async =>
      _client.post<void>('/delivery-boys/logout', fromJson: (_) {});

  /// 👤 Get delivery boy profile (/profile)
  Future<ApiResponse<DeliveryBoyProfileData>> getProfile() async =>
      _client.get<DeliveryBoyProfileData>('/delivery-boys/profile', fromJson: (json) => DeliveryBoyProfileData.fromJson(json));

  /// 👤 Get current delivery boy details (/me)
  Future<ApiResponse<DeliveryBoyProfileData>> getCurrentDeliveryBoy() async =>
      _client.get<DeliveryBoyProfileData>('/delivery-boys/me', fromJson: (json) => DeliveryBoyProfileData.fromJson(json));

}
