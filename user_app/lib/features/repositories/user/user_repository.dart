// features/repositories/user_profile/user_profile_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../models/user/user_model.dart';

final userProfileRepositoryProvider = Provider<UserProfileRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return UserProfileRepository(client);
});

class UserProfileRepository {
  final ApiClient _client;
  UserProfileRepository(this._client);

  /// Get detailed profile
  Future<ApiResponse<UserProfileType>> getProfile() =>
      _client.get('/user/profile', fromJson: (json) => UserProfileType.fromJson(json));

  Future<ApiResponse<void>> saveFcmToken(String token) {
    return _client.post(
      'api/user/save-fcm-token',
      data: {
        'token': token,
      },
    );
  }
  /// Update profile
  // Future<ApiResponse<UserProfileType>> updateProfile(PartialUserProfile data) =>
  //     _client.put('/user/profile', data: data.toJson(), fromJson: (json) => UserProfileType.fromJson(json));
}
