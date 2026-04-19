import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// GPS Location Service for Delivery Boy
/// Tracks location every 30 seconds when delivering
class LocationTrackingService {
  Timer? _locationTimer;
  StreamSubscription<Position>? _positionStream;
  Position? _currentPosition;

  /// Check if GPS is enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Request location permissions
  Future<bool> requestLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return false;
    }
    
    return true;
  }

  /// Get current location once
  Future<Position?> getCurrentLocation() async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      final isEnabled = await isLocationServiceEnabled();
      if (!isEnabled) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  /// Start tracking location every 30 seconds
  Future<void> startTracking({
    required Function(Position) onLocationUpdate,
  }) async {
    // Stop any existing tracking
    await stopTracking();

    // Get initial location
    final position = await getCurrentLocation();
    if (position != null) {
      _currentPosition = position;
      onLocationUpdate(position);
    }

    // Start periodic updates every 30 seconds
    _locationTimer = Timer.periodic(
      const Duration(seconds: 30),
      (timer) async {
        final newPosition = await getCurrentLocation();
        if (newPosition != null) {
          _currentPosition = newPosition;
          onLocationUpdate(newPosition);
        }
      },
    );
  }

  /// Stop tracking
  Future<void> stopTracking() async {
    _locationTimer?.cancel();
    _locationTimer = null;
    await _positionStream?.cancel();
    _positionStream = null;
  }

  /// Get last known position
  Position? get lastPosition => _currentPosition;

  /// Check if currently tracking
  bool get isTracking => _locationTimer?.isActive ?? false;
}

/// Provider for location service
final locationServiceProvider = Provider<LocationTrackingService>((ref) {
  return LocationTrackingService();
});

/// Provider for current location
class CurrentLocationNotifier extends Notifier<Position?> {
  @override
  Position? build() {
    return null;
  }

  void updateLocation(Position position) {
    state = position;
  }
}

final currentLocationProvider =
    NotifierProvider<CurrentLocationNotifier, Position?>(() {
  return CurrentLocationNotifier();
});
