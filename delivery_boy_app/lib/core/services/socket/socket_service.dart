// lib/core/services/socket_service.dart
// ============================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SocketService {
  IO.Socket? _socket;
  bool _isConnected = false;

  // Callbacks for real-time events
  final List<Function(Map<String, dynamic>)> _notificationListeners = [];
  final List<Function(bool)> _connectionListeners = [];

  bool get isConnected => _isConnected;
  IO.Socket? get socket => _socket;

  /// Initialize socket connection
  void connect({required String userId, required String userType}) {
    if (_socket != null && _isConnected) {
      debugPrint('🔌 Socket already connected');
      return;
    }

    final serverUrl = dotenv.env['SOCKET_URL'] ?? 'http://localhost:3000';

    debugPrint('🔌 Connecting to Socket.IO at $serverUrl');

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setPath('/socket.io')
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .setExtraHeaders({'authorization': 'Bearer YOUR_TOKEN'}) // Add if needed
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      debugPrint('✅ Socket connected: ${_socket!.id}');

      // Join room based on user type
      final room = userType == 'admin' ? 'admins' : 'driver:$userId';
      _socket!.emit('join', room);
      debugPrint('📦 Joined room: $room');

      // Notify connection listeners
      for (var listener in _connectionListeners) {
        listener(true);
      }
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      debugPrint('❌ Socket disconnected');

      // Notify connection listeners
      for (var listener in _connectionListeners) {
        listener(false);
      }
    });

    _socket!.onConnectError((error) {
      debugPrint('⚠️ Connection error: $error');
    });

    _socket!.onError((error) {
      debugPrint('❌ Socket error: $error');
    });

    // Listen for new notifications
    _socket!.on('notification:new', (data) {
      debugPrint('🔔 New notification received: $data');

      if (data is Map<String, dynamic>) {
        // Notify all registered listeners
        for (var listener in _notificationListeners) {
          listener(data);
        }
      }
    });

    _socket!.connect();
  }

  /// Add notification listener
  void addNotificationListener(Function(Map<String, dynamic>) callback) {
    _notificationListeners.add(callback);
  }

  /// Remove notification listener
  void removeNotificationListener(Function(Map<String, dynamic>) callback) {
    _notificationListeners.remove(callback);
  }

  /// Add connection status listener
  void addConnectionListener(Function(bool) callback) {
    _connectionListeners.add(callback);
  }

  /// Remove connection status listener
  void removeConnectionListener(Function(bool) callback) {
    _connectionListeners.remove(callback);
  }

  /// Disconnect socket
  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _isConnected = false;
      _notificationListeners.clear();
      _connectionListeners.clear();
      debugPrint('🔌 Socket disconnected and disposed');
    }
  }

  /// Emit custom event
  void emit(String event, dynamic data) {
    if (_socket != null && _isConnected) {
      _socket!.emit(event, data);
      debugPrint('📤 Emitted $event: $data');
    } else {
      debugPrint('⚠️ Cannot emit - socket not connected');
    }
  }
}

// Provider for socket service
final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();

  // Cleanup on dispose
  ref.onDispose(() {
    service.disconnect();
  });

  return service;
});