import 'package:Quickzon/features/providers/notications/socketService.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();

  ref.onDispose(() {
    service.disconnect();
  });

  return service;
});
