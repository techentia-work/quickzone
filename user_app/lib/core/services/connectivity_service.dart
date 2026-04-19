// lib/core/services/connectivity_service.dart
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Service to monitor network connectivity
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  
  /// Stream of connectivity results
  Stream<List<ConnectivityResult>> get connectivityStream =>
      _connectivity.onConnectivityChanged;

  /// Check current connectivity status
  Future<bool> checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }

  /// Check if currently connected to internet
  Future<bool> get isConnected => checkConnectivity();
}
