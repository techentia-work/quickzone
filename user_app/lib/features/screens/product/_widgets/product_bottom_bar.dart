import 'package:Quickzon/features/models/models.dart';
import './product_enhanced_button.dart';
import './product_quantity_selector.dart';
import 'package:flutter/material.dart';

class ProductBottomBar extends StatelessWidget {
  final dynamic product;
  final ProductVariantType selectedVariant;
  final int cartQuantity;
  final VoidCallback onAddToCart;
  final Function(int) onUpdateQuantity;

  const ProductBottomBar({
    super.key,
    required this.product,
    required this.selectedVariant,
    required this.cartQuantity,
    required this.onAddToCart,
    required this.onUpdateQuantity,
  });

  @override
  Widget build(BuildContext context) {
    final isOutOfStock = selectedVariant.stock != null && selectedVariant.stock! <= 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Price',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '₹${selectedVariant.discountedPrice?.toStringAsFixed(0) ?? ''}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            if (cartQuantity > 0)
              QuantitySelector(
                quantity: cartQuantity,
                onQuantityChanged: onUpdateQuantity,
                minQuantity: 0,
                maxQuantity: selectedVariant.stock ?? 999,
              )
            else
              Expanded(
                flex: 2,
                child: EnhancedButton(
                  text: isOutOfStock ? 'Out of Stock' : 'Add to Cart',
                  onPressed: isOutOfStock ? null : onAddToCart,
                  icon: const Icon(Icons.shopping_cart_outlined, size: 20),
                  height: 52,
                  color: const Color(0xFF4CAF50),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
