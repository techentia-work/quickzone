import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/core/utils/validators/validator.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:Quickzon/features/widgets/widgets.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _attemptLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final payload = LoginRequest(
      email: _emailCtrl.text.trim(),
      phone: null,
      password: _passwordCtrl.text,
    );

    final success =
    await ref.read(authControllerProvider.notifier).login(payload);

    setState(() => _isLoading = false);

    if (success && mounted) {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen for API errors
    ref.listen<AsyncValue<AuthenticatedUser?>>(
      authControllerProvider,
          (previous, next) {
        next.whenOrNull(
          error: (err, stack) {
            final apiResponse = err as ApiResponse?;
            final message = apiResponse?.message ?? 'An error occurred';

            if (mounted) {
              ScaffoldMessenger.of(context)
                ..hideCurrentSnackBar()
                ..showSnackBar(
                  SnackBar(
                    content: Text(
                      message,
                      style: const TextStyle(fontSize: 14),
                    ),
                    backgroundColor: Colors.redAccent,
                    duration: const Duration(seconds: 6),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
            }
          },
        );
      },
    );

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

              // Header (fixed)
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
                          validator: Validators.passwordValidator,
                        ),

                        const SizedBox(height: 12),

                        // Forgot Password
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {
                              context.push('/forgot-password');
                            },
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: const Size(0, 0),
                              tapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'Forgot Password ?',
                              style: TextStyle(
                                color: Color(0xFF4CAF50),
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Login Button
                        CustomButton(
                          text: 'Login',
                          onPressed: _attemptLogin,
                          isLoading: _isLoading,
                        ),

                        const SizedBox(height: 24),

                        // Register Link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              "Don't have an account? ",
                              style: TextStyle(
                                color: Colors.black87,
                                fontSize: 14,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                context.push('/register');
                              },
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                minimumSize: const Size(0, 0),
                                tapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: const Text(
                                'Register',
                                style: TextStyle(
                                  color: Color(0xFF4CAF50),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
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
