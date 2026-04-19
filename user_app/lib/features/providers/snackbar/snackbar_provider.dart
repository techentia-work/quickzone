// lib/core/providers/snackbar_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final snackBarProvider = Provider<SnackBar Function({
    required BuildContext context,
    required String message,
    bool isSuccess,
    String? actionLabel,
    VoidCallback? onAction,
})>((ref) {
  return ({required context, required message, isSuccess = true, actionLabel, onAction,}) {
    final theme = Theme.of(context);
    return SnackBar(
      content: Text(message, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),),
      backgroundColor: isSuccess ? theme.colorScheme.primary : theme.colorScheme.error,
      duration: const Duration(seconds: 3),
      action: actionLabel != null
          ? SnackBarAction(
        label: actionLabel,
        onPressed: onAction ?? () {},
        textColor: Colors.white,
      )
          : null,
    );
  };
});