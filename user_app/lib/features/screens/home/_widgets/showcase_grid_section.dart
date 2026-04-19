import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:flutter/material.dart';

import 'package:Quickzon/features/models/showcase_product/showcase_product_model.dart';
 // 👈 IMPORT CARD

class ShowcaseGridSection extends StatefulWidget {
  final String title;
  final String showcaseType;
  final List<ShowcaseProductItem> products;

  const ShowcaseGridSection({
    super.key,
    required this.title,
    required this.showcaseType,
    required this.products,
  });

  @override
  State<ShowcaseGridSection> createState() => _ShowcaseGridSectionState();
}

class _ShowcaseGridSectionState extends State<ShowcaseGridSection> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    if (widget.products.isEmpty) return const SizedBox.shrink();

    /// 🔥 ONLY SHOW FIRST 6 IF NOT EXPANDED
    final visibleProducts = _isExpanded ? widget.products : widget.products.take(6).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// 🔹 TITLE
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              widget.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),

          const SizedBox(height: 12),

          /// 🔹 GRID (3 x 2 initially)
          GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: visibleProducts.length,
            gridDelegate:
            const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.52, // 👈 SAME AS PRODUCT GRID
            ),
            itemBuilder: (context, index) {
              final product = visibleProducts[index];

              return ProductCard1(
                product: product, // 👈 DIRECT CARD USE

              );
            },
          ),

          /// 🔹 TOGGLE BUTTON
          if (widget.products.length > 6)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      _isExpanded = !_isExpanded;
                    });
                  },
                  child: Text(
                    _isExpanded ? '← Show Less' : 'More Products →',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
