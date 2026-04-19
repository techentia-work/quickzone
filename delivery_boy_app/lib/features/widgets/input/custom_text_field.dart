// lib/features/widgets/input/custom_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A highly customizable text field widget that works independently across the app.
/// Combines robust state management with a polished, consistent UI.
class CustomTextField extends ConsumerStatefulWidget {
  /// Controller for the text field
  final TextEditingController controller;

  /// Label text displayed above the field (optional)
  final String? label;

  /// Hint text displayed when field is empty
  final String hintText;

  /// Keyboard type
  final TextInputType? keyboardType;

  /// Whether this is a password field (enables visibility toggle)
  final bool isPassword;

  /// Validation function
  final String? Function(String?)? validator;

  /// Widget displayed at the end of the field
  final Widget? suffixIcon;

  /// Widget displayed at the start of the field
  final Widget? prefixIcon;

  /// Maximum number of lines
  final int? maxLines;

  /// Maximum length of text
  final int? maxLength;

  /// Whether field is enabled
  final bool enabled;

  /// Called when field is tapped
  final VoidCallback? onTap;

  /// Called when text changes
  final Function(String)? onChanged;

  /// Text input action
  final TextInputAction? textInputAction;

  /// Input formatters
  final List<TextInputFormatter>? inputFormatters;

  /// External error text (overrides validation error)
  final String? errorText;

  /// Focus node
  final FocusNode? focusNode;

  /// Whether field is read-only
  final bool readOnly;

  /// Called when editing is complete
  final VoidCallback? onEditingComplete;

  /// Called when field is submitted
  final void Function(String)? onFieldSubmitted;

  /// Auto-validate mode
  final AutovalidateMode? autovalidateMode;

  /// Whether to show error message below field
  final bool showErrorMessage;

  /// Text alignment
  final TextAlign textAlign;

  /// Text style
  final TextStyle? style;

  /// Whether to obscure text (for non-password fields that need obscuring)
  final bool obscureText;

  const CustomTextField({
    super.key,
    required this.controller,
    this.label,
    required this.hintText,
    this.keyboardType,
    this.isPassword = false,
    this.validator,
    this.suffixIcon,
    this.prefixIcon,
    this.maxLines = 1,
    this.maxLength,
    this.enabled = true,
    this.onTap,
    this.onChanged,
    this.textInputAction,
    this.inputFormatters,
    this.errorText,
    this.focusNode,
    this.readOnly = false,
    this.onEditingComplete,
    this.onFieldSubmitted,
    this.autovalidateMode,
    this.showErrorMessage = true,
    this.textAlign = TextAlign.start,
    this.style,
    this.obscureText = false,
  });

  @override
  ConsumerState<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends ConsumerState<CustomTextField> {
  late FocusNode _internalFocusNode;
  bool _isFocused = false;
  bool _obscureText = true;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    _internalFocusNode = widget.focusNode ?? FocusNode();
    _internalFocusNode.addListener(_onFocusChange);
    widget.controller.addListener(_onTextChange);
  }

  @override
  void didUpdateWidget(CustomTextField oldWidget) {
    super.didUpdateWidget(oldWidget);

    // Update focus node if it changed
    if (widget.focusNode != oldWidget.focusNode) {
      _internalFocusNode.removeListener(_onFocusChange);
      if (oldWidget.focusNode == null) {
        _internalFocusNode.dispose();
      }
      _internalFocusNode = widget.focusNode ?? FocusNode();
      _internalFocusNode.addListener(_onFocusChange);
    }

    // Update controller listener if it changed
    if (widget.controller != oldWidget.controller) {
      oldWidget.controller.removeListener(_onTextChange);
      widget.controller.addListener(_onTextChange);
    }
  }

  @override
  void dispose() {
    _internalFocusNode.removeListener(_onFocusChange);
    widget.controller.removeListener(_onTextChange);
    if (widget.focusNode == null) {
      _internalFocusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    if (mounted) {
      setState(() {
        _isFocused = _internalFocusNode.hasFocus;
      });
    }
  }

  void _onTextChange() {
    // Clear validation error when user starts typing
    if (_validationError != null && widget.controller.text.isNotEmpty) {
      if (mounted) {
        setState(() {
          _validationError = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null || _validationError != null;
    final errorMessage = widget.errorText ?? _validationError;
    final shouldObscure = widget.isPassword ? _obscureText : widget.obscureText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Label (if provided)
        if (widget.label != null && widget.label!.isNotEmpty) ...[
          Text(
            widget.label!,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF212121),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Text Field
        TextFormField(
          controller: widget.controller,
          focusNode: _internalFocusNode,
          keyboardType: widget.keyboardType,
          obscureText: shouldObscure,
          enabled: widget.enabled,
          maxLines: widget.isPassword ? 1 : widget.maxLines,
          maxLength: widget.maxLength,
          onTap: widget.onTap,
          onChanged: widget.onChanged,
          textInputAction: widget.textInputAction,
          inputFormatters: widget.inputFormatters,
          readOnly: widget.readOnly,
          onEditingComplete: widget.onEditingComplete,
          onFieldSubmitted: widget.onFieldSubmitted,
          textAlign: widget.textAlign,
          style: widget.style,
          autovalidateMode: widget.autovalidateMode,
          validator: (value) {
            if (widget.validator != null) {
              final error = widget.validator!(value);
              if (mounted) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) {
                    setState(() {
                      _validationError = error;
                    });
                  }
                });
              }
              return error;
            }
            return null;
          },
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: const TextStyle(
              color: Color(0xFF9E9E9E),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
            filled: true,
            fillColor: widget.enabled
                ? Colors.white
                : const Color(0xFFF5F5F5),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            counterText: widget.maxLength != null ? null : '',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFE0E0E0),
                width: 1,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError
                    ? Colors.redAccent.withOpacity(0.5)
                    : const Color(0xFFE0E0E0),
                width: 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError
                    ? Colors.redAccent
                    : const Color(0xFF5AC268),
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Colors.redAccent,
                width: 1,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Colors.redAccent,
                width: 2,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFE0E0E0),
                width: 1,
              ),
            ),
            // Password visibility toggle or custom suffix icon
            suffixIcon: widget.isPassword
                ? IconButton(
              icon: Icon(
                _obscureText
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                color: const Color(0xFF757575),
                size: 22,
              ),
              onPressed: () {
                setState(() {
                  _obscureText = !_obscureText;
                });
              },
            )
                : widget.suffixIcon,
            prefixIcon: widget.prefixIcon,
            // Hide default error text (we'll show custom error below)
            errorStyle: const TextStyle(height: 0, fontSize: 0),
          ),
        ),

        // Custom error message display
        if (widget.showErrorMessage && hasError && errorMessage != null)
          Padding(
            padding: const EdgeInsets.only(left: 12, top: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 14,
                  color: Colors.redAccent,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    errorMessage,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.redAccent,
                      fontWeight: FontWeight.w500,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}