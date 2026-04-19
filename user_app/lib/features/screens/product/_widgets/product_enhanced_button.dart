import 'package:flutter/material.dart';

class EnhancedButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final Color? color;
  final Color? textColor;
  final double? height;
  final double? borderRadius;
  final Widget? icon;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool showDivider;
  final double? width;
  final EdgeInsetsGeometry? padding;

  const EnhancedButton({
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
    this.prefixIcon,
    this.suffixIcon,
    this.showDivider = false,
    this.width,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? const Color(0xFF4CAF50);
    final buttonTextColor = textColor ??
        (isOutlined ? buttonColor : Colors.white);

    return SizedBox(
      height: height,
      width: width,
      child: isOutlined
          ? _buildOutlinedButton(buttonColor, buttonTextColor)
          : _buildElevatedButton(buttonColor, buttonTextColor),
    );
  }

  Widget _buildOutlinedButton(Color buttonColor, Color buttonTextColor) {
    return OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: buttonColor, width: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius!),
        ),
        backgroundColor: Colors.transparent,
        disabledForegroundColor: buttonColor.withOpacity(0.38),
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 16),
      ),
      child: _buildChild(buttonTextColor, buttonColor),
    );
  }

  Widget _buildElevatedButton(Color buttonColor, Color buttonTextColor) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: buttonColor,
        disabledBackgroundColor: buttonColor.withOpacity(0.6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius!),
        ),
        elevation: 0,
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 16),
      ),
      child: _buildChild(buttonTextColor, Colors.white),
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

    if (icon != null && !showDivider) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
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

    if (prefixIcon != null || suffixIcon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (prefixIcon != null) ...[
            prefixIcon!,
            if (showDivider) ...[
              const SizedBox(width: 12),
              Container(
                height: 24,
                width: 1,
                color: textColor.withOpacity(0.3),
              ),
              const SizedBox(width: 12),
            ] else
              const SizedBox(width: 8),
          ],
          Flexible(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (suffixIcon != null) ...[
            if (showDivider) ...[
              const SizedBox(width: 12),
              Container(
                height: 24,
                width: 1,
                color: textColor.withOpacity(0.3),
              ),
              const SizedBox(width: 12),
            ] else
              const SizedBox(width: 8),
            suffixIcon!,
          ],
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
