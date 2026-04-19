// features/widgets/ui/button/button.dart
import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final Color? color;
  final Color? textColor;
  final double? height;
  final double? borderRadius;
  final Widget? icon;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.color,
    this.textColor,
    this.height = 56,
    this.borderRadius = 12,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? const Color(0xFF4CAF50);
    final buttonTextColor = textColor ?? (isOutlined ? buttonColor : Colors.white);

    return SizedBox(
      height: height,
      child: isOutlined
          ? OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          side: BorderSide(
            color: buttonColor,
            width: 2,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius!),
          ),
          backgroundColor: Colors.transparent,
          disabledForegroundColor: buttonColor.withOpacity(0.38),
        ),
        child: _buildChild(buttonTextColor, buttonColor),
      )
          : ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: buttonColor,
          disabledBackgroundColor: buttonColor.withOpacity(0.6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius!),
          ),
          elevation: 0,
        ),
        child: _buildChild(buttonTextColor, Colors.white),
      ),
    );
  }

  Widget _buildChild(Color textColor, Color loadingColor) {
    if (isLoading) {
      return SizedBox(
        height: 24,
        width: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation(loadingColor),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon!,
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      );
    }

    return Text(
      text,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
    );
  }
}