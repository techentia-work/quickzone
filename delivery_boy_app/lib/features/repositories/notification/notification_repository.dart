import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/network/api_client.dart';
import 'package:quickzone_delivery/core/network/api_response.dart';
import 'package:quickzone_delivery/features/models/models.dart';

/// 🔌 Provider for NotificationRepository
final notificationRepositoryProvider =
Provider<NotificationRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return NotificationRepository(client);
});

/// 📬 Repository for delivery boy notifications
class NotificationRepository {
  final ApiClient _client;
  NotificationRepository(this._client);

  /// 📥 Fetch notifications for driver
  Future<ApiResponse<NotificationListResponse>> getNotifications() async =>
      _client.get<NotificationListResponse>('/notifications?role=driver', fromJson: (json) => NotificationListResponse.fromJson(json),);

  /// ✅ Mark all notifications as read
  Future<ApiResponse<void>> markAllAsRead() async =>
      _client.patch<void>('/notifications/mark-all-read?role=driver');
}