import 'package:flutter/material.dart';

class Responsive {
  final BuildContext context;
  final Size size;
  final double width;
  final double height;

  Responsive(this.context)
      : size = MediaQuery.of(context).size,
        width = MediaQuery.of(context).size.width,
        height = MediaQuery.of(context).size.height;

  // --- Breakpoints (You can tweak these as you prefer)
  bool get isExtraSmallPhone => width < 360;
  bool get isSmallPhone => width >= 360 && width < 400;
  bool get isMediumPhone => width >= 400 && width < 480;
  bool get isLargePhone => width >= 480 && width < 600;
  bool get isSmallTablet => width >= 600 && width < 720;
  bool get isMediumTablet => width >= 720 && width < 900;
  bool get isLargeTablet => width >= 900 && width < 1024;
  bool get isDesktop => width >= 1024;

  // General categories for convenience
  bool get isPhone => width < 600;
  bool get isTablet => width >= 600 && width < 1024;

  // --- Responsive helpers ---
  double wp(double percent) => width * percent / 100;
  double hp(double percent) => height * percent / 100;

  double sp(double size) {
    if (isExtraSmallPhone) return size * 0.85;
    if (isSmallPhone) return size * 0.9;
    if (isMediumPhone) return size * 1.0;
    if (isLargePhone) return size * 1.1;
    if (isSmallTablet) return size * 1.2;
    if (isMediumTablet) return size * 1.3;
    if (isLargeTablet) return size * 1.4;
    if (isDesktop) return size * 1.5;
    return size;
  }

  // Optional: get device type label (for debugging)
  String get deviceType {
    if (isExtraSmallPhone) return 'Extra Small Phone';
    if (isSmallPhone) return 'Small Phone';
    if (isMediumPhone) return 'Medium Phone';
    if (isLargePhone) return 'Large Phone';
    if (isSmallTablet) return 'Small Tablet';
    if (isMediumTablet) return 'Medium Tablet';
    if (isLargeTablet) return 'Large Tablet';
    return 'Desktop';
  }
}
