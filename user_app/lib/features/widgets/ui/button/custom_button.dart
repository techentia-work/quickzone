import 'package:flutter/material.dart';

enum ButtonVariant {
  primary,
  secondary,
  outline,
  text,
}

enum ButtonSize {
  small,
  medium,
  large,
}

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isFullWidth;
  final Widget? icon;
  final bool isLoading;
  final Color? customColor;
  final Color? customTextColor;
  final BorderRadius? borderRadius;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isFullWidth = false,
    this.icon,
    this.isLoading = false,
    this.customColor,
    this.customTextColor,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = customColor ?? const Color(0xFF5AC268);
    final disabledColor = Colors.grey.shade300;

    // Size configurations
    double height;
    double horizontalPadding;
    double fontSize;

    switch (size) {
      case ButtonSize.small:
        height = 40;
        horizontalPadding = 16;
        fontSize = 14;
        break;
      case ButtonSize.medium:
        height = 50;
        horizontalPadding = 24;
        fontSize = 16;
        break;
      case ButtonSize.large:
        height = 56;
        horizontalPadding = 32;
        fontSize = 18;
        break;
    }

    // Variant configurations
    Color backgroundColor;
    Color textColor;
    BorderSide borderSide;

    switch (variant) {
      case ButtonVariant.primary:
        backgroundColor = onPressed == null ? disabledColor : buttonColor;
        textColor = customTextColor ?? Colors.white;
        borderSide = BorderSide.none;
        break;
      case ButtonVariant.secondary:
        backgroundColor = onPressed == null ? disabledColor : buttonColor.withOpacity(0.1);
        textColor = customTextColor ?? buttonColor;
        borderSide = BorderSide.none;
        break;
      case ButtonVariant.outline:
        backgroundColor = Colors.transparent;
        textColor = customTextColor ?? buttonColor;
        borderSide = BorderSide(
          color: onPressed == null ? disabledColor : buttonColor,
          width: 2,
        );
        break;
      case ButtonVariant.text:
        backgroundColor = Colors.transparent;
        textColor = customTextColor ?? buttonColor;
        borderSide = BorderSide.none;
        break;
    }

    Widget buttonChild = isLoading
        ? SizedBox(
      height: 20,
      width: 20,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        valueColor: AlwaysStoppedAnimation<Color>(textColor),
      ),
    )
        : Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[
          icon!,
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
      ],
    );

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          disabledBackgroundColor: disabledColor,
          elevation: variant == ButtonVariant.primary ? 0 : 0,
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius ?? BorderRadius.circular(12),
            side: borderSide,
          ),
        ),
        child: buttonChild,
      ),
    );
  }
}