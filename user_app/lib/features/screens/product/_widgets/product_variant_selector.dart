 import 'package:Quickzon/features/models/models.dart';
import 'package:flutter/material.dart';

class ProductVariantSelector extends StatelessWidget {
  final List<ProductVariantType> variants;
  final String selectedVariantId;
  final Function(String) onVariantSelected;

  const ProductVariantSelector({
    super.key,
    required this.variants,
    required this.selectedVariantId,
    required this.onVariantSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Size/Quantity',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: variants.map((variant) {
              final isSelected = variant.id == selectedVariantId;
              final variantLabel = (variant.measurement != null &&
                  variant.measurementUnit != null)
                  ? '${variant.measurement?.toStringAsFixed(0)} ${variant.measurementUnit}'
                  : variant.title ?? 'Standard';
              final isOutOfStock = variant.stock != null && variant.stock! <= 0;

              return InkWell(
                onTap: isOutOfStock ? null : () => onVariantSelected(variant.id),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isOutOfStock
                        ? Colors.grey[100]
                        : (isSelected
                        ? Theme.of(context).primaryColor.withOpacity(0.1)
                        : Colors.white),
                    border: Border.all(
                      color: isOutOfStock
                          ? Colors.grey[300]!
                          : (isSelected
                          ? Theme.of(context).primaryColor
                          : Colors.grey[300]!),
                      width: isSelected ? 2 : 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        variantLabel,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                          color: isOutOfStock
                              ? Colors.grey[400]
                              : (isSelected
                              ? Theme.of(context).primaryColor
                              : Colors.black87),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${variant.discountedPrice?.toStringAsFixed(0) ?? ''}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isOutOfStock
                              ? Colors.grey[400]
                              : (isSelected
                              ? Theme.of(context).primaryColor
                              : Colors.black87),
                        ),
                      ),
                      
                      if (isOutOfStock)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            'Out of Stock',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.red[600],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}