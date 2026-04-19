import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static final lightTheme = ThemeData(
    useMaterial3: true,

    colorScheme: const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xFF5AC268), // Brand green
      onPrimary: Colors.white,
      secondary: Color(0xFF5AC268),
      onSecondary: Colors.white,
      background: Color(0xFFEFF9F0),
      onBackground: Colors.black,
      surface: Colors.white,
      onSurface: Colors.black,
      error: Colors.redAccent,
      onError: Colors.white,
    ),

    scaffoldBackgroundColor: const Color(0xFFEFF9F0),

    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFEFF9F0),
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: Colors.black),
      titleTextStyle: TextStyle(
        fontFamily: 'SF Pro Display',
        color: Colors.black,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),

    textTheme: TextTheme(
      headlineSmall: GoogleFonts.poppins(
        fontWeight: FontWeight.w800,
        fontSize: 26,
        color: Colors.black,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: Colors.black54,
        height: 1.5,
      ),

      // Buttons / labels
      labelLarge: TextStyle(
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: Color(0xFF5AC268),
      ),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF5AC268),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
        textStyle: const TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
    ),
  );
}
