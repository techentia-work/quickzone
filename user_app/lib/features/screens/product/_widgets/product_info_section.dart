import 'package:flutter/material.dart';
import 'package:Quickzon/features/models/models.dart';

class ProductInfoSection extends StatelessWidget {
  final ProductType product;
  final ProductVariantType selectedVariant;

  const ProductInfoSection({
    super.key,
    required this.product,
    required this.selectedVariant,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// ================= PRODUCT NAME
          Text(
            selectedVariant.title!,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 20,
            ),
          ),


          /// ================= WEIGHT / VARIANT
          if (selectedVariant.measurement != null &&
              selectedVariant.measurementUnit != null)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                '${selectedVariant.measurement!.toStringAsFixed(0)} ${selectedVariant.measurementUnit}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),

          const SizedBox(height: 12),

          /// ================= PRICE
          _buildPriceSection(),

          /// ================= LOW STOCK (ONLY < 5)
          if (_shouldShowLowStock())
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: _buildLowStock(),
            ),

          const SizedBox(height: 16),

          /// ================= SHORT DESCRIPTION


          /// ================= FULL DESCRIPTION

        ],
      ),
    );
  }

  // ================= PRICE SECTION
  Widget _buildPriceSection() {
    final double sellingPrice =
        selectedVariant.discountedPrice ?? selectedVariant.price;

    final double? mrp = selectedVariant.price;
    final bool hasDiscount = mrp != null && mrp > sellingPrice;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          '₹${sellingPrice.toStringAsFixed(0)}',
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Colors.black87,
          ),
        ),
        const SizedBox(width: 8),
        if (hasDiscount) ...[
          Text(
            '₹${selectedVariant.price!.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.grey[500],
              decoration: TextDecoration.lineThrough,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              '${selectedVariant.discountPercent?.toStringAsFixed(0)}% OFF',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF4CAF50),
              ),
            ),
          ),
        ],
      ],
    );
  }

  // ================= LOW STOCK CHECK
  bool _shouldShowLowStock() {
    final stock = selectedVariant.stock;
    return stock != null && stock > 0 && stock < 5;
  }

  // ================= LOW STOCK WIDGET
  Widget _buildLowStock() {
    return Row(
      children: [
        const Icon(
          Icons.warning_amber_rounded,
          size: 16,
          color: Colors.orange,
        ),
        const SizedBox(width: 6),
        Text(
          'Only ${selectedVariant.stock} left in stock',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.orange[800],
          ),
        ),
      ],
    );
  }
}
