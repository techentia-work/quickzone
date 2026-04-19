import 'dart:async';
import 'package:flutter/foundation.dart'; // for VoidCallback

/// Debouncer - executes only after a delay of inactivity
class Debouncer {
  final int milliseconds;
  Timer? _timer;

  Debouncer({this.milliseconds = 300});

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }

  void dispose() {
    _timer?.cancel();
  }
}

/// Throttler - ensures the action runs at most once per duration
class Throttler {
  final int milliseconds;
  DateTime? _lastRun;
  Timer? _timer;

  Throttler({this.milliseconds = 300});

  void run(VoidCallback action) {
    final now = DateTime.now();

    if (_lastRun == null ||
        now.difference(_lastRun!).inMilliseconds >= milliseconds) {
      _lastRun = now;
      action();
    } else {
      _timer?.cancel();
      final remaining = milliseconds - now.difference(_lastRun!).inMilliseconds;
      _timer = Timer(Duration(milliseconds: remaining), () {
        _lastRun = DateTime.now();
        action();
      });
    }
  }

  void dispose() {
    _timer?.cancel();
  }
}

/// DebouncedThrottle - combines debounce and throttle behavior
class DebouncedThrottle {
  final int debounceMs;
  final int throttleMs;

  Timer? _debounceTimer;
  DateTime? _lastRun;
  Timer? _throttleTimer;

  DebouncedThrottle({
    this.debounceMs = 300,
    this.throttleMs = 0,
  });

  void run(VoidCallback action) {
    _debounceTimer?.cancel();

    void handler() {
      final now = DateTime.now();

      if (throttleMs > 0 && _lastRun != null) {
        final timeSinceLastRun = now.difference(_lastRun!).inMilliseconds;

        if (timeSinceLastRun < throttleMs) {
          _throttleTimer?.cancel();
          _throttleTimer = Timer(Duration(milliseconds: throttleMs - timeSinceLastRun), handler);
          return;
        }
      }

      _lastRun = now;
      action();
    }

    _debounceTimer = Timer(Duration(milliseconds: debounceMs), handler);
  }

  void dispose() {
    _debounceTimer?.cancel();
    _throttleTimer?.cancel();
  }
}
