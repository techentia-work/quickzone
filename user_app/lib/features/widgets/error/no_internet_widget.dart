// lib/features/widgets/error/no_internet_widget.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Reusable widget to display no internet connection message
class NoInternetWidget extends StatelessWidget {
  final VoidCallback? onRetry;
  final String? message;
  final bool showRetryButton;

  const NoInternetWidget({
    super.key,
    this.onRetry,
    this.message,
    this.showRetryButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // WiFi Off Icon
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.wifi_off_rounded,
                size: 80,
                color: const Color(0xFF9E9E9E),
              ),
            ),
            const SizedBox(height: 32),

            // Title
            Text(
              'No Internet Connection',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF212121),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),

            // Message
            Text(
              message ?? 'Please check your connection and try again',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: const Color(0xFF757575),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Retry Button
            if (showRetryButton && onRetry != null)
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5AC268),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 14,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Retry',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
