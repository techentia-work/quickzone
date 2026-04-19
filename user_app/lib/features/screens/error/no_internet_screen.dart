// lib/features/screens/error/no_internet_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/error/no_internet_widget.dart';
import '../../providers/connectivity_provider.dart';

/// Full-page screen for no internet connection
class NoInternetScreen extends ConsumerWidget {
  const NoInternetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: NoInternetWidget(
          onRetry: () async {
            // Check connectivity
            final connectivityService = ref.read(connectivityServiceProvider);
            final isConnected = await connectivityService.checkConnectivity();
            
            if (isConnected) {
              // Navigate to home if connected
              if (context.mounted) {
                context.go('/');
              }
            } else {
              // Show message that still no connection
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Still no internet connection'),
                    duration: Duration(seconds: 2),
                    backgroundColor: Colors.redAccent,
                  ),
                );
              }
            }
          },
        ),
      ),
    );
  }
}
