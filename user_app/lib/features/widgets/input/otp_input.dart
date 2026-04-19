// features/widgets/input/otp_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OTPFieldV2 extends StatefulWidget {
  final int length;
  final Function(String) onCompleted;
  final Function(String)? onChanged;
  final double fieldWidth;
  final double fieldHeight;
  final Color? fillColor;
  final Color? borderColor;
  final Color? focusedBorderColor;
  final TextStyle? textStyle;

  const OTPFieldV2({
    super.key,
    this.length = 6,
    required this.onCompleted,
    this.onChanged,
    this.fieldWidth = 50,
    this.fieldHeight = 60,
    this.fillColor,
    this.borderColor,
    this.focusedBorderColor,
    this.textStyle,
  });

  @override
  State<OTPFieldV2> createState() => _OTPFieldV2State();
}

class _OTPFieldV2State extends State<OTPFieldV2> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
          (index) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
          (index) => FocusNode(),
    );

    // Add listener to first field to handle paste
    _controllers[0].addListener(() {
      if (_controllers[0].text.length > 1) {
        _handlePaste(_controllers[0].text);
      }
    });
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String _getOTP() {
    return _controllers.map((controller) => controller.text).join();
  }

  void _handlePaste(String pastedText) {
    final digitsOnly = pastedText.replaceAll(RegExp(r'[^\d]'), '');

    for (int i = 0; i < widget.length && i < digitsOnly.length; i++) {
      _controllers[i].text = digitsOnly[i];
    }

    final lastFilledIndex = digitsOnly.length < widget.length
        ? digitsOnly.length
        : widget.length - 1;

    if (lastFilledIndex < widget.length) {
      _focusNodes[lastFilledIndex].requestFocus();
    }

    final otp = _getOTP();
    if (otp.length == widget.length) {
      widget.onCompleted(otp);
      for (var node in _focusNodes) {
        node.unfocus();
      }
    }

    if (widget.onChanged != null) {
      widget.onChanged!(otp);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(widget.length, (index) {
        return Container(
          width: widget.fieldWidth,
          height: widget.fieldHeight,
          margin: EdgeInsets.only(
            right: index < widget.length - 1 ? 12 : 0,
          ),
          child: RawKeyboardListener(
            focusNode: FocusNode(),
            onKey: (event) {
              // Handle backspace on empty field
              if (event is RawKeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace) {
                if (_controllers[index].text.isEmpty && index > 0) {
                  // Move to previous field and clear it
                  _focusNodes[index - 1].requestFocus();
                  _controllers[index - 1].clear();
                }
              }
            },
            child: TextFormField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 1,
              style: widget.textStyle ??
                  const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                  ),
              decoration: InputDecoration(
                counterText: '',
                filled: true,
                fillColor: widget.fillColor ?? Colors.grey[50],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: widget.borderColor ?? Colors.grey[300]!,
                    width: 2,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: widget.borderColor ?? Colors.grey[300]!,
                    width: 2,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: widget.focusedBorderColor ?? const Color(0xFF4CAF50),
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(1),
              ],
              onChanged: (value) {
                if (value.isNotEmpty) {
                  if (index < widget.length - 1) {
                    _focusNodes[index + 1].requestFocus();
                  } else {
                    _focusNodes[index].unfocus();
                    final otp = _getOTP();
                    if (otp.length == widget.length) {
                      widget.onCompleted(otp);
                    }
                  }
                } else {
                  // Handle backspace - move to previous field
                  if (index > 0) {
                    _focusNodes[index - 1].requestFocus();
                  }
                }

                if (widget.onChanged != null) {
                  widget.onChanged!(_getOTP());
                }
              },
            ),
          ),
        );
      }),
    );
  }
}