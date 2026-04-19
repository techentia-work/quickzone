// lib/core/widgets/snackbar_listener.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';
import 'package:quickzone_delivery/core/utils/responsive/responsive.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';

/// Widget that listens to snackbar messages and displays them automatically
class SnackbarListener extends ConsumerWidget {
  final Widget child;

  const SnackbarListener({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<SnackbarMessage?>(snackbarProvider, (previous, next) {
        if (next != null) {
          _showSnackbar(context, next, ref);
        }
      },
    );

    return child;
  }

  void _showSnackbar(BuildContext context, SnackbarMessage message, WidgetRef ref) {
    final messenger = ScaffoldMessenger.of(context);

    // Clear previous snackbars if requested
    if (message.clearPrevious) {
      messenger.clearSnackBars();
    }

    final (backgroundColor, icon) = _getStyle(message.type);

    // Use your Responsive class
    final responsive = Responsive(context);

    // Responsive sizing based on your breakpoints
    final horizontalMargin = responsive.isDesktop ? 24.0 : responsive.isTablet ? 20.0 : 16.0;

    final verticalMargin = responsive.isDesktop ? 24.0 : responsive.isTablet ? 20.0 : 16.0;

    final maxWidth = responsive.isDesktop ? 600.0 : responsive.isTablet ? 500.0 : double.infinity;

    final iconSize = responsive.sp(20); // Auto scales with sp()
    final fontSize = responsive.sp(14); // Auto scales with sp()

    final contentPadding = responsive.isTablet || responsive.isDesktop ? 20.0 : 16.0;

    final borderRadius = responsive.isDesktop ? 16.0 : responsive.isTablet ? 14.0 : 12.0;

    final spacing = responsive.isTablet || responsive.isDesktop ? 16.0 : 12.0;

    messenger.showSnackBar(
      SnackBar(
        content: Container(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, color: Colors.white, size: iconSize),
                SizedBox(width: spacing),
              ],
              Expanded(
                child: Text(
                  message.message,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: fontSize,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        margin: EdgeInsets.symmetric(
          horizontal: horizontalMargin,
          vertical: verticalMargin,
        ),
        padding: EdgeInsets.all(contentPadding),
        duration: message.duration,
        action: message.actionLabel != null && message.onAction != null
            ? SnackBarAction(
          label: message.actionLabel!,
          textColor: Colors.white,
          onPressed: message.onAction!,
        )
            : null,
      ),
    ).closed.then((_) {
      ref.read(snackbarProvider.notifier).clear();
    });
  }

  (Color, IconData?) _getStyle(SnackbarType type) {
    switch (type) {
      case SnackbarType.success:
        return (const Color(0xFF4CAF50), Icons.check_circle_outline);
      case SnackbarType.error:
        return (Colors.redAccent, Icons.error_outline);
      case SnackbarType.warning:
        return (const Color(0xFFFB8C00), Icons.warning_amber_outlined);
      case SnackbarType.info:
        return (const Color(0xFF1E88E5), Icons.info_outline);
      case SnackbarType.custom:
        return (Colors.black87, null); // No icon for custom
    }
  }
}