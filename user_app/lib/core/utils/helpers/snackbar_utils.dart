// lib/core/utils/snackbar_utils.dart
import 'package:Quickzon/core/network/api_response.dart';
import 'package:flutter/material.dart';

void showApiSnackBar({
  required BuildContext context,
  required ApiResponse response,
  String? successMessage,
  String? errorMessage,
  Duration duration = const Duration(seconds: 3),
}) {
  final theme = Theme.of(context);
  final isSuccess = response.success;

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        isSuccess
            ? (successMessage ?? response.message)
            : (errorMessage ?? response.message),
        style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),
      ),
      backgroundColor: isSuccess ? theme.colorScheme.primary : theme.colorScheme.error,
      duration: duration,
      action: isSuccess
          ? null
          : SnackBarAction(
        label: 'Retry',
        onPressed: () {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          // Optional: retry logic
        },
        textColor: Colors.white,
      ),
    ),
  );
}