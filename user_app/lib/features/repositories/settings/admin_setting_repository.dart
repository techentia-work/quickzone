import 'package:Quickzon/core/network/api_client.dart';

import '../../models/settings/admin_setting_model.dart';

class AdminSettingRepository {
  final ApiClient _apiClient;

  AdminSettingRepository(this._apiClient);

  /// PUBLIC SETTINGS (NO AUTH)
  Future<AdminSetting> getPublicSettings() async {
    final response = await _apiClient.get('/admin-settings/public');
    return AdminSetting.fromJson(response.data);
  }
}
