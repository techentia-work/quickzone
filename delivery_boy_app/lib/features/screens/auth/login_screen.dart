// LOGIN SCREEN - features/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:quickzone_delivery/core/utils/validators/validator.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/auth/auth_provider.dart';
import 'package:quickzone_delivery/features/widgets/widgets.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController(text: 'delivery308514@quickzon.com');
  final _passwordCtrl = TextEditingController(text: 'zrbt8eie');
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _attemptLogin() async {
    if (!_formKey.currentState!.validate()) return;

    // Unfocus to dismiss keyboard
    FocusScope.of(context).unfocus();

    // ✅ Create payload
    final payload = DeliveryBoyLoginRequest(
      email: _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
    );

    // ✅ Call login and get response
    final result = await ref.read(authControllerProvider.notifier).login(payload);

    // ✅ Check if widget is still mounted
    if (!mounted) return;

    // ✅ Handle response
    if (result.success) {
      // ✅ Show success message
      ref.read(snackbarProvider.notifier).showSuccess(result.message);

      // ✅ Navigation will be handled automatically by GoRouter redirect
      // The router watches authControllerProvider and will redirect to '/'
    } else {
      // ✅ Show error message from server
      ref.read(snackbarProvider.notifier).showError(result.message);

      // ✅ Optionally clear password field on error
      _passwordCtrl.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Watch the auth state to get loading status
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),

              // Header
              Text(
                'Welcome Back',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Log in to your account using email',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF757575),
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 40),

              // ✅ Scrollable form area
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Email Field
                        CustomTextField(
                          controller: _emailCtrl,
                          label: 'Email',
                          hintText: 'Enter your email',
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          enabled: !isLoading,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Email is required';
                            }
                            return Validators.emailValidator(value);
                          },
                        ),

                        const SizedBox(height: 24),

                        // Password Field
                        CustomTextField(
                          controller: _passwordCtrl,
                          label: 'Password',
                          hintText: '••••••••',
                          isPassword: true,
                          textInputAction: TextInputAction.done,
                          enabled: !isLoading,
                          onFieldSubmitted: (_) => _attemptLogin(),
                          validator: Validators.passwordValidator,
                        ),

                        // const SizedBox(height: 12),
                        //
                        // // Forgot Password
                        // Align(
                        //   alignment: Alignment.centerRight,
                        //   child: TextButton(
                        //     onPressed: isLoading ? null : () {
                        //       context.push('/forgot-password');
                        //     },
                        //     style: TextButton.styleFrom(
                        //       padding: EdgeInsets.zero,
                        //       minimumSize: const Size(0, 0),
                        //       tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        //     ),
                        //     child: const Text(
                        //       'Forgot Password?',
                        //       style: TextStyle(
                        //         color: Color(0xFF4CAF50),
                        //         fontSize: 14,
                        //         fontWeight: FontWeight.w500,
                        //       ),
                        //     ),
                        //   ),
                        // ),

                        const SizedBox(height: 32),

                        // Login Button
                        CustomButton(
                          text: 'Login',
                          onPressed: isLoading ? null : _attemptLogin,
                          isLoading: isLoading,
                        ),
                        //
                        // const SizedBox(height: 24),
                        //
                        // // Register Link
                        // Row(
                        //   mainAxisAlignment: MainAxisAlignment.center,
                        //   children: [
                        //     const Text(
                        //       "Don't have an account? ",
                        //       style: TextStyle(
                        //         color: Colors.black87,
                        //         fontSize: 14,
                        //       ),
                        //     ),
                        //     TextButton(
                        //       onPressed: isLoading ? null : () {
                        //         context.push('/register');
                        //       },
                        //       style: TextButton.styleFrom(
                        //         padding: EdgeInsets.zero,
                        //         minimumSize: const Size(0, 0),
                        //         tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        //       ),
                        //       child: const Text(
                        //         'Register',
                        //         style: TextStyle(
                        //           color: Color(0xFF4CAF50),
                        //           fontSize: 14,
                        //           fontWeight: FontWeight.w600,
                        //         ),
                        //       ),
                        //     ),
                        //   ],
                        // ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}