import 'package:flutter/material.dart';

class QuantitySelector extends StatelessWidget {
  final int quantity;
  final Function(int) onQuantityChanged;
  final int minQuantity;
  final int maxQuantity;
  final double? height;
  final double? width;

  const QuantitySelector({
    super.key,
    required this.quantity,
    required this.onQuantityChanged,
    this.minQuantity = 1,
    this.maxQuantity = 99,
    this.height = 52,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width ?? 140,
      decoration: BoxDecoration(
        color: const Color(0xFF4CAF50),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildButton(
            icon: quantity > minQuantity ? Icons.remove : Icons.delete_outline,
            onTap: () {
              if (quantity > minQuantity) {
                onQuantityChanged(quantity - 1);
              } else {
                onQuantityChanged(0);
              }
            },
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              quantity.toString(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          _buildButton(
            icon: Icons.add,
            onTap: quantity < maxQuantity
                ? () => onQuantityChanged(quantity + 1)
                : null,
          ),
        ],
      ),
    );
  }

  Widget _buildButton({
    required IconData icon,
    required VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        child: Icon(
          icon,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }
}
