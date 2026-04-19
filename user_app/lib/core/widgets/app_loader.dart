import 'package:flutter/material.dart';

class AppLoader extends StatelessWidget {
  const AppLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.35),
      child: const Center(
        child: SizedBox(
          width: 42,
          height: 42,
          child: CircularProgressIndicator(
            strokeWidth: 3,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
