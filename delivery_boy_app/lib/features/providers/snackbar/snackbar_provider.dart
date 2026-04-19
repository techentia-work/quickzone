// lib/features/providers/snackbar_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/features/models/models.dart';

class SnackbarNotifier extends Notifier<SnackbarMessage?> {
  @override
  SnackbarMessage? build() => null;

  void showSuccess(String message, {String? actionLabel, VoidCallback? onAction, Duration? duration, bool clearPrevious = false}) {
    state = SnackbarMessage.success(message, actionLabel: actionLabel, onAction: onAction, duration: duration ?? const Duration(seconds: 3), clearPrevious: clearPrevious,);
  }

  void showError(String message, {String? actionLabel, VoidCallback? onAction, Duration? duration, bool clearPrevious = true}) {
    state = SnackbarMessage.error(message, actionLabel: actionLabel, onAction: onAction, duration: duration ?? const Duration(seconds: 6), clearPrevious: clearPrevious,);
  }

  void showWarning(String message, {String? actionLabel, VoidCallback? onAction, Duration? duration, bool clearPrevious = false}) {
    state = SnackbarMessage.warning(message, actionLabel: actionLabel, onAction: onAction, duration: duration ?? const Duration(seconds: 3), clearPrevious: clearPrevious,);
  }

  void showInfo(String message, {String? actionLabel, VoidCallback? onAction, Duration? duration, bool clearPrevious = true}) {
    state = SnackbarMessage.info(message, actionLabel: actionLabel, onAction: onAction, duration: duration ?? const Duration(seconds: 2), clearPrevious: clearPrevious,);
  }

  void showCustom(String message, {String? actionLabel, VoidCallback? onAction, Duration? duration, bool clearPrevious = true}) {
    state = SnackbarMessage.custom(message, actionLabel: actionLabel, onAction: onAction, duration: duration ?? const Duration(seconds: 2), clearPrevious: clearPrevious,);
  }

  void clear() {
    state = null;
  }
}

final snackbarProvider = NotifierProvider<SnackbarNotifier, SnackbarMessage?>(
  SnackbarNotifier.new,
);
