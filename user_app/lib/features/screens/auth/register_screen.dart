// features/screens/auth/register_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/core/utils/enums/auth_enum.dart';
import 'package:Quickzon/core/utils/validators/validator.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:Quickzon/features/models/auth/auth_payload.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  Future<void> _attemptRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // Prepare payload - only include email or phone if they have values
    final email = _emailCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();

    final payload = RegisterRequest(
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      email: email.isNotEmpty ? email : null,
      phone: phone.isNotEmpty ? phone : null,
      password: _passwordCtrl.text,
      role: UserRole.USER, // Set default role to USER
    );

    // Remove null fields from JSON before sending
    final payloadJson = payload.toJson();
    payloadJson.removeWhere((key, value) => value == null);

    try {
      final response  = await ref
          .read(authControllerProvider.notifier)
          .register(payload);

      setState(() => _isLoading = false);

      if (response != null && mounted) {
        context.go(
          '/verify-otp',
          extra: {
            'identifier': response.identifier,
            'purpose': response.purpose,
            'verificationType': response.verificationType,
          },
        );
      }

    } catch (e) {
      setState(() => _isLoading = false);

      if (mounted) {
        final apiResponse = e as ApiResponse?;
        final message = apiResponse?.message ?? 'Registration failed';

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
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 60),

                // Header
                Text(
                  'Create New Account',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Set up your username and password.\nYou can always change it later.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF757575),
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 40),

                // First Name and Last Name Fields (Side by Side)
                Row(
                  children: [
                    Expanded(
                      child: CustomTextField(
                        controller: _firstNameCtrl,
                        label: 'First Name',
                        hintText: 'First name',
                        keyboardType: TextInputType.name,
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Required';
                          }
                          if (value.trim().length < 2) {
                            return 'Too short';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: CustomTextField(
                        controller: _lastNameCtrl,
                        label: 'Last Name',
                        hintText: 'Last name',
                        keyboardType: TextInputType.name,
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Required';
                          }
                          if (value.trim().length < 2) {
                            return 'Too short';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Email Field
                CustomTextField(
                  controller: _emailCtrl,
                  label: 'Email',
                  hintText: 'Enter your email',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      // Email is optional if phone is provided
                      final phone = _phoneCtrl.text.trim();
                      if (phone.isEmpty) {
                        return 'Email or phone is required';
                      }
                      return null;
                    }
                    return Validators.emailValidator(value);
                  },
                ),

                const SizedBox(height: 24),

                // Phone Field
                CustomTextField(
                  controller: _phoneCtrl,
                  label: 'Phone Number',
                  hintText: 'Enter your phone number',
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      final email = _emailCtrl.text.trim();
                      if (email.isEmpty) {
                        return 'Email or phone is required';
                      }
                      return null;
                    }
                    if (!RegExp(r'^\+?[0-9]{8,15}$').hasMatch(value.trim())) {
                      return 'Enter a valid phone number';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 24),

                // Password Field
                CustomTextField(
                  controller: _passwordCtrl,
                  label: 'Password',
                  hintText: '••••••••',
                  isPassword: true,
                  textInputAction: TextInputAction.next,
                  validator: Validators.passwordValidator,
                ),

                const SizedBox(height: 24),

                // Confirm Password Field
                CustomTextField(
                  controller: _confirmPasswordCtrl,
                  label: 'Confirm Password',
                  hintText: '••••••••',
                  isPassword: true,
                  textInputAction: TextInputAction.done,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordCtrl.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 32),

                // Register Button
                CustomButton(
                  text: 'Signup',
                  onPressed: _attemptRegister,
                  isLoading: _isLoading,
                ),

                const SizedBox(height: 24),

                // Login Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already have an account? ',
                      style: TextStyle(
                        color: Colors.black87,
                        fontSize: 14,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        context.go('/login');
                      },
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(0, 0),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Log in',
                        style: TextStyle(
                          color: Color(0xFF4CAF50),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}