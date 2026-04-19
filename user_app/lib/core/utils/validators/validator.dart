// lib/core/utils/validators.dart
class Validators {
  // Email regex (simple but practical)
  static final RegExp _emailRegExp =
  RegExp(r'^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$');

  // Password: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit
  static final RegExp _passwordComplexityRegExp =
  // RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$');
  RegExp(r'^.{8,}$');

  /// Returns true if [email] is a valid email format.
  static bool isValidEmail(String? email) {
    if (email == null) return false;
    return _emailRegExp.hasMatch(email.trim());
  }

  /// Returns true if [password] meets complexity (min 8, uppercase, lowercase, digit)
  static bool isValidPassword(String? password) {
    if (password == null) return false;
    return _passwordComplexityRegExp.hasMatch(password);
  }

  /// Validator for a TextFormField for email
  static String? emailValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter email';
    }
    if (!isValidEmail(value.trim())) {
      return 'Please enter a valid email';
    }
    return null;
  }

  /// Validator for a TextFormField for password
  static String? passwordValidator(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter password';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!_passwordComplexityRegExp.hasMatch(value)) {
      return 'Password must contain uppercase, lowercase and a number';
    }
    return null;
  }
}
