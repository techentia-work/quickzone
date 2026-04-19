import 'package:Quickzon/core/network/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/settings/admin_setting_model.dart';
import '../../repositories/settings/admin_setting_repository.dart';

/// Repository Provider
final adminSettingRepositoryProvider =
Provider<AdminSettingRepository>((ref) {
  final apiClient = ref.read(apiClientProvider);
  return AdminSettingRepository(apiClient);
});

/// Settings Provider
final adminSettingProvider = FutureProvider<AdminSetting>((ref) async {
  final repo = ref.read(adminSettingRepositoryProvider);
  return repo.getPublicSettings();
});
