// features/screens/auth/verify_otp_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/core/utils/enums/auth_enum.dart';
import 'package:Quickzon/features/widgets/input/otp_input.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:Quickzon/features/models/auth/auth_payload.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';

class VerifyOTPScreen extends ConsumerStatefulWidget {
  final String identifier;
  final OtpPurpose purpose;
  final String? verificationType;

  const VerifyOTPScreen({
    super.key,
    required this.identifier,
    required this.purpose,
    this.verificationType,
  });

  @override
  ConsumerState<VerifyOTPScreen> createState() => _VerifyOTPScreenState();
}

class _VerifyOTPScreenState extends ConsumerState<VerifyOTPScreen> {
  String _otp = '';
  bool _isLoading = false;
  bool _isResending = false;
  int _resendCountdown = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    setState(() => _resendCountdown = 30);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() => _resendCountdown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _verifyOTP() async {
    if (_otp.length != 6) {
      _showError('Please enter complete OTP');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final payload = VerifyOTPRequest(
        identifier: widget.identifier,
        otp: _otp,
        purpose: widget.purpose,
      );

      final success = await ref
          .read(authControllerProvider.notifier)
          .verifyOTP(payload);

      setState(() => _isLoading = false);

      if (success && mounted) {
        // Navigate based on purpose
        if (widget.purpose == OtpPurpose.register) {
          context.go('/login');
          _showSuccess('Registration successful! Please login.');
        } else if (widget.purpose == OtpPurpose.forgot_password) {
          // Navigate to reset password screen with token
          context.go('/reset-password');
        } else {
          context.go('/');
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      final apiResponse = e as ApiResponse?;
      _showError(apiResponse?.message ?? 'Verification failed');
    }
  }

  Future<void> _resendOTP() async {
    if (_resendCountdown > 0) return;

    setState(() => _isResending = true);

    try {
      final payload = ResendOTPRequest(
        identifier: widget.identifier,
        purpose: widget.purpose,
      );

      final success = await ref
          .read(authControllerProvider.notifier)
          .resendOTP(payload);

      setState(() => _isResending = false);

      if (success) {
        _startResendTimer();
        _showSuccess('OTP sent successfully!');
      }
    } catch (e) {
      setState(() => _isResending = false);
      final apiResponse = e as ApiResponse?;
      _showError(apiResponse?.message ?? 'Failed to resend OTP');
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  void _showSuccess(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  String _getTitle() {
    if (widget.purpose == OtpPurpose.register) {
      return widget.verificationType == 'email'
          ? 'Verify Your Email Address'
          : 'Verify Your Phone Number';
    } else if (widget.purpose == OtpPurpose.forgot_password) {
      return 'Reset Password';
    } else {
      return 'Enter OTP';
    }
  }

  String _getSubtitle() {
    final identifier = widget.identifier;
    if (widget.purpose == OtpPurpose.register) {
      return widget.verificationType == 'email'
          ? 'We will send the authentication code to the email address you entered.\nDo you want to continue?'
          : 'We will send the authentication code to the phone number you entered.\nDo you want to continue?';
    } else {
      return 'A verification code has been sent to $identifier';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),

              // Title
              Text(
                _getTitle(),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              // Identifier Display
              Text(
                widget.identifier,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 16),

              // Subtitle
              Text(
                _getSubtitle(),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF757575),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 40),

              // OTP Input Fields
              OTPFieldV2(
                length: 6,
                onCompleted: (otp) {
                  setState(() => _otp = otp);
                  _verifyOTP();
                },
                onChanged: (otp) {
                  setState(() => _otp = otp);
                },
              ),

              const SizedBox(height: 32),

              // Verify Button
              CustomButton(
                text: 'Verify',
                onPressed: _otp.length == 6 ? _verifyOTP : null,
                isLoading: _isLoading,
              ),

              const SizedBox(height: 24),

              // Resend OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Didn't receive the code? ",
                    style: TextStyle(
                      color: Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                  if (_isResending)
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Color(0xFF4CAF50)),
                      ),
                    )
                  else if (_resendCountdown > 0)
                    Text(
                      'Resend (${_resendCountdown}s)',
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  else
                    TextButton(
                      onPressed: _resendOTP,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(0, 0),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Resend',
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
    );
  }
}