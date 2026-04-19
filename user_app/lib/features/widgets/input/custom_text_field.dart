// lib/features/widgets/input/custom_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A customizable text field widget that works independently across the app.
/// Uses ConsumerStatefulWidget for potential future integration with Riverpod state.
class CustomTextField extends ConsumerStatefulWidget {
  /// Controller for the text field
  final TextEditingController controller;

  /// Hint text displayed when field is empty
  final String hintText;

  /// Validation function
  final String? Function(String?)? validator;

  /// Keyboard type
  final TextInputType keyboardType;

  /// Whether to obscure text (for passwords)
  final bool obscureText;

  /// Widget displayed at the end of the field
  final Widget? suffixIcon;

  /// Widget displayed at the start of the field
  final Widget? prefixIcon;

  /// Maximum length of text
  final int? maxLength;

  /// Text alignment
  final TextAlign textAlign;

  /// Text style
  final TextStyle? style;

  /// Called when text changes
  final void Function(String)? onChanged;

  /// Input formatters
  final List<TextInputFormatter>? inputFormatters;

  /// Whether field is enabled
  final bool enabled;

  /// External error text (overrides validation error)
  final String? errorText;

  /// Focus node
  final FocusNode? focusNode;

  /// Called when field is tapped
  final VoidCallback? onTap;

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

  /// Label text (optional)
  final String? labelText;

  const CustomTextField({
    super.key,
    required this.controller,
    required this.hintText,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.suffixIcon,
    this.prefixIcon,
    this.maxLength,
    this.textAlign = TextAlign.start,
    this.style,
    this.onChanged,
    this.inputFormatters,
    this.enabled = true,
    this.errorText,
    this.focusNode,
    this.onTap,
    this.readOnly = false,
    this.onEditingComplete,
    this.onFieldSubmitted,
    this.autovalidateMode,
    this.showErrorMessage = true,
    this.labelText,
  });

  @override
  ConsumerState<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends ConsumerState<CustomTextField> {
  late FocusNode _internalFocusNode;
  bool _isFocused = false;
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Optional Label
        if (widget.labelText != null) ...[
          Text(
            widget.labelText!,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: const Color(0xFF212121),
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Text Field
        TextFormField(
          controller: widget.controller,
          focusNode: _internalFocusNode,
          keyboardType: widget.keyboardType,
          obscureText: widget.obscureText,
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
          autovalidateMode: widget.autovalidateMode,
          maxLength: widget.maxLength,
          textAlign: widget.textAlign,
          style: widget.style,
          onChanged: widget.onChanged,
          inputFormatters: widget.inputFormatters,
          enabled: widget.enabled,
          onTap: widget.onTap,
          readOnly: widget.readOnly,
          onEditingComplete: widget.onEditingComplete,
          onFieldSubmitted: widget.onFieldSubmitted,
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: const TextStyle(
              color: Color(0xFF9E9E9E),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
            prefixIcon: widget.prefixIcon,
            suffixIcon: widget.suffixIcon,
            counterText: '',
            filled: true,
            fillColor: widget.enabled
                ? Colors.white
                : const Color(0xFFF5F5F5),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
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
            // Hide default error text
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