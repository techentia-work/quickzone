import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_storage/get_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/connectivity_provider.dart';
import '../../providers/category/category_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  
  @override
  void initState() {
    super.initState();
    
    // Animation setup
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    
    _controller.forward();
    _startFlow();
  }

  Future<void> _startFlow() async {
    // Minimum splash time for smooth UX
    await Future.delayed(const Duration(milliseconds: 2000));

    if (!mounted) return;

    try {
      // Check internet connectivity FIRST
      final connectivityService = ref.read(connectivityServiceProvider);
      final isConnected = await connectivityService.checkConnectivity();
      
      if (!mounted) return;
      
      if (!isConnected) {
        // No internet - go to no internet screen
        context.go('/no-internet');
        return;
      }
      
      // Check authentication
      final box = GetStorage();
      final currentUser = box.read('currentUser');
      
      if (currentUser != null) {
        // User is logged in - PRE-LOAD master categories before going to home
        try {
          await ref.read(masterCategoryTreeProvider.future);
        } catch (e) {
          debugPrint('Error loading categories: $e');
          // Continue anyway, home screen will handle error state
        }
        
        if (!mounted) return;
        // Go to home
        context.go('/');
      } else {
        // User not logged in - go to login
        context.go('/login');
      }
    } catch (e) {
      // On error, default to login
      debugPrint('Splash error: $e');
      if (mounted) {
        context.go('/login');
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF5AC268),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Stack(
          children: [
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App Logo
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'assets/images/logo.jpeg',
                      width: 100,
                      height: 100,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  // App Name
                  Text(
                    'Quickzon',
                    style: GoogleFonts.poppins(
                      fontSize: 42,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Quick Shopping, Quick Delivery',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.95),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 50),
                  
                  // Loader
                  SizedBox(
                    width: 35,
                    height: 35,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Bottom decoration
            Positioned(
              right: 0,
              bottom: 0,
              child: Opacity(
                opacity: 0.15,
                child: Image.asset(
                  'assets/images/splash-img.png',
                  width: 180,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
