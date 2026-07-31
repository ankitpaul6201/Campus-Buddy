import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryBlue = Color(0xFF1944F1);
  static const Color darkButton = Color(0xFF0F0F0F);
  static const Color lightBackground = Color(0xFFF3F4F6);
  static const Color inputGrey = Color(0xFFF3F4F6);
  static const Color cardWhite = Colors.white;

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: primaryBlue,
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: darkButton,
        surface: cardWhite,
        background: lightBackground,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
      useMaterial3: true,
    );
  }
}
