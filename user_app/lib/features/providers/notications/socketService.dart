import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket? _socket;
  bool _connected = false;

  final List<Function(Map<String, dynamic>)> _notificationListeners = [];

  bool get isConnected => _connected;

  /// 🔌 CONNECT SOCKET
  void connect({
    required String userId,
  }) {
    if (_socket != null && _connected) return;

    final socketUrl = dotenv.env['SOCKET_URL'] ?? '';

    debugPrint('🔌 Connecting socket: $socketUrl');

    _socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      debugPrint('✅ Socket connected');

      // 👤 USER ROOM JOIN
      _socket!.emit('join', 'user:$userId');
      debugPrint('📦 Joined room: user:$userId');
    });

    _socket!.onDisconnect((_) {
      _connected = false;
      debugPrint('❌ Socket disconnected');
    });

    _socket!.onConnectError((err) {
      debugPrint('⚠️ Socket connect error: $err');
    });

    /// 🔔 NOTIFICATION EVENT
    _socket!.on('notification:new', (data) {
      debugPrint('🔔 Notification received: $data');

      if (data is Map<String, dynamic>) {
        for (final listener in _notificationListeners) {
          listener(data);
        }
      }
    });

    _socket!.connect();
  }

  /// 🧩 ADD LISTENER (used in main.dart)
  void addNotificationListener(
      Function(Map<String, dynamic>) callback,
      ) {
    _notificationListeners.add(callback);
  }

  /// 🧹 REMOVE LISTENER
  void removeNotificationListener(
      Function(Map<String, dynamic>) callback,
      ) {
    _notificationListeners.remove(callback);
  }

  /// ❌ DISCONNECT SOCKET
  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _connected = false;
      _notificationListeners.clear();
      debugPrint('🔌 Socket fully disposed');
    }
  }
}
