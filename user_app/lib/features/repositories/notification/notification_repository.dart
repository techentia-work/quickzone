import 'package:Quickzon/core/network/api_client.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/features/models/notication/notification_model.dart';

class NotificationRepository {
  final ApiClient client;

  NotificationRepository(this.client);

  /// 📥 Get user notifications
  Future<ApiResponse<List<AppNotification>>> getUserNotifications() {
    return client.get<List<AppNotification>>(
      '/notifications?role=user',
      fromJson: (json) {
        final list = (json['notifications'] ?? []) as List;

        return list
            .map(
              (e) => AppNotification.fromJson(
            e as Map<String, dynamic>,
          ),
        )
            .toList();
      },
    );
  }
}
