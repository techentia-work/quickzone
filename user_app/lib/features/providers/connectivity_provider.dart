// lib/features/providers/connectivity_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../core/services/connectivity_service.dart';

/// Provider for connectivity service
final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

/// Stream provider for connectivity status
final connectivityStreamProvider = StreamProvider<List<ConnectivityResult>>((ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.connectivityStream;
});

/// Provider to check if device is connected to internet
final isConnectedProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(connectivityServiceProvider);
  return await service.isConnected;
});
