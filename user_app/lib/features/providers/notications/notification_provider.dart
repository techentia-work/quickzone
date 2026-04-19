import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/notication/notification_model.dart';
import 'package:flutter_riverpod/legacy.dart';

final notificationListProvider =
StateProvider<List<AppNotification>>((ref) => []);

final notificationUnreadCountProvider =
StateProvider<int>((ref) => 0);