// features/screens/product/_widgets/product_description_section.dart
import 'package:flutter/material.dart';

class ProductDescriptionSection extends StatefulWidget {
  final String? description;
  final String? shortDescription;
  final String? brand;
  final String? manufacturer;
  final String? madeIn;

  const ProductDescriptionSection({
    super.key,
    this.description,
    this.shortDescription,
    this.brand,
    this.manufacturer,
    this.madeIn,
  });

  @override
  State<ProductDescriptionSection> createState() =>
      _ProductDescriptionSectionState();
}

class _ProductDescriptionSectionState extends State<ProductDescriptionSection> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final hasDescription =
        widget.description != null && widget.description!.isNotEmpty;

    if (!hasDescription) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          Text(
            'Product Details',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          AnimatedCrossFade(
            firstChild: Text(
              widget.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
            secondChild: Text(
              widget.description!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
            crossFadeState: isExpanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
          if (widget.description!.length > 150)
            TextButton(
              onPressed: () {
                setState(() => isExpanded = !isExpanded);
              },
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 8),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isExpanded ? 'Read Less' : 'Read More',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF4CAF50),
                    ),
                  ),
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    size: 18,
                    color: const Color(0xFF4CAF50),
                  ),
                ],
              ),
            ),
          if (widget.brand != null ||
              widget.manufacturer != null ||
              widget.madeIn != null) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            Text(
              'Product Information',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            if (widget.brand != null)
              _InfoRow(label: 'Brand', value: widget.brand!),
            if (widget.manufacturer != null)
              _InfoRow(label: 'Manufacturer', value: widget.manufacturer!),
            if (widget.madeIn != null)
              _InfoRow(label: 'Country of Origin', value: widget.madeIn!),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
