import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/providers/product/product_provider.dart';

class FilterBottomSheet extends ConsumerStatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  ConsumerState<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends ConsumerState<FilterBottomSheet> {
  RangeValues _priceRange = const RangeValues(0, 5000);
  bool _inStockOnly = false;
  String? _selectedType;

  void _applyFilters() async {
    final query = {
      if (_inStockOnly) 'inStock': true,
      'minPrice': _priceRange.start.toInt(),
      'maxPrice': _priceRange.end.toInt(),
      if (_selectedType != null) 'type': _selectedType,
    };

    await ref.read(productControllerProvider.notifier).getAllProducts(queryParams: query);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Filters',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(),
            _buildPriceRange(),
            const SizedBox(height: 20),
            _buildStockFilter(),
            const SizedBox(height: 20),
            _buildTypeSelector(),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _applyFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Apply Filters',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRange() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Price Range',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        RangeSlider(
          values: _priceRange,
          min: 0,
          max: 5000,
          divisions: 50,
          activeColor: const Color(0xFF4CAF50),
          onChanged: (values) => setState(() => _priceRange = values),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('\$${_priceRange.start.toInt()}'),
            Text('\$${_priceRange.end.toInt()}'),
          ],
        ),
      ],
    );
  }

  Widget _buildStockFilter() {
    return CheckboxListTile(
      title: const Text('In Stock Only'),
      value: _inStockOnly,
      activeColor: const Color(0xFF4CAF50),
      onChanged: (val) => setState(() => _inStockOnly = val ?? false),
    );
  }

  Widget _buildTypeSelector() {
    const types = ['VEG', 'NON_VEG', 'VEGAN'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Product Type',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          children: types.map((type) {
            final selected = _selectedType == type;
            return ChoiceChip(
              label: Text(type),
              selected: selected,
              selectedColor: const Color(0xFF4CAF50),
              labelStyle: TextStyle(
                color: selected ? Colors.white : Colors.black87,
              ),
              onSelected: (_) => setState(() {
                _selectedType = selected ? null : type;
              }),
            );
          }).toList(),
        ),
      ],
    );
  }
}
