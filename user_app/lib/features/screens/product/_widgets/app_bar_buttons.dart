// features/screens/product/_widgets/app_bar_buttons.dart
import 'package:flutter/material.dart';

class ProductAppBarBackButton extends StatelessWidget {
  const ProductAppBarBackButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: const Icon(Icons.arrow_back, size: 20),
        onPressed: () => Navigator.of(context).pop(),
        padding: EdgeInsets.zero,
      ),
    );
  }
}

class ProductAppBarFavoriteButton extends StatelessWidget {
  final bool isFavorite;
  final VoidCallback onToggle;

  const ProductAppBarFavoriteButton({
    super.key,
    required this.isFavorite,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          isFavorite ? Icons.favorite : Icons.favorite_border,
          size: 20,
          color: isFavorite ? Colors.red : Colors.black87,
        ),
        onPressed: onToggle,
        padding: EdgeInsets.zero,
      ),
    );
  }
}

class ProductAppBarShareButton extends StatelessWidget {
  const ProductAppBarShareButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: const Icon(Icons.share_outlined, size: 20),
        onPressed: () {
          // TODO: Implement share functionality
        },
        padding: EdgeInsets.zero,
      ),
    );
  }
}