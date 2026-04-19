import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../navigation/bottom_navbar.dart';

class MainShell extends ConsumerStatefulWidget {
  final Widget child;

  const MainShell({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  DateTime? _lastBackPressTime;

  Future<bool> _onWillPop() async {
    final now = DateTime.now();

    if (_lastBackPressTime != null &&
        now.difference(_lastBackPressTime!) < const Duration(seconds: 2)) {
      SystemNavigator.pop();
      return true;
    }

    _lastBackPressTime = now;

    if (mounted) {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Press back again to exit'),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Colors.black87,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }

    return false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) await _onWillPop();
      },
      child: Scaffold(
        backgroundColor: Colors.transparent,
        extendBody: true,

        body: widget.child,

        // 🔥 ROUTE-BASED BOTTOM BAR (NO INDEX, NO TAP)
        bottomNavigationBar: const AppBottomNavBar(),
      ),
    );
  }
}
