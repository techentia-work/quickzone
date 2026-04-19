// lib/features/widgets/divider/auth_divider.dart
import 'package:flutter/material.dart';

class AuthDivider extends StatelessWidget {
  final String text;

  const AuthDivider({super.key, this.text = 'Or continue with social account'});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Divider(
            color: Color(0xFFE0E0E0),
            thickness: 1,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF9E9E9E),
              fontFamily: 'Inter',
            ),
          ),
        ),
        const Expanded(
          child: Divider(
            color: Color(0xFFE0E0E0),
            thickness: 1,
          ),
        ),
      ],
    );
  }
}