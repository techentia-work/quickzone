import 'package:flutter/material.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';

class SnackbarMessage {
  final String message;
  final SnackbarType type;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Duration duration;
  final bool clearPrevious;

  const SnackbarMessage({
    required this.message,
    required this.type,
    this.actionLabel,
    this.onAction,
    this.duration = const Duration(seconds: 3),
    this.clearPrevious = false,
  });

  SnackbarMessage.success(
      this.message, {this.actionLabel, this.onAction, this.duration = const Duration(seconds: 3), this.clearPrevious = false,}) : type = SnackbarType.success;

  SnackbarMessage.error(
      this.message, {this.actionLabel, this.onAction, this.duration = const Duration(seconds: 6), this.clearPrevious = true,}) : type = SnackbarType.error;

  SnackbarMessage.warning(
      this.message, {this.actionLabel, this.onAction, this.duration = const Duration(seconds: 3), this.clearPrevious = false,}) : type = SnackbarType.warning;

  SnackbarMessage.info(
      this.message, {this.actionLabel, this.onAction, this.duration = const Duration(seconds: 2), this.clearPrevious = true,}) : type = SnackbarType.info;

  // Custom snackbar for special cases like "press back to exit"
  SnackbarMessage.custom(
      this.message, {this.actionLabel, this.onAction, this.duration = const Duration(seconds: 2), this.clearPrevious = true,}) : type = SnackbarType.custom;
}