import 'package:flutter/material.dart';
import 'package:Quickzon/features/models/featured/featured_product_model.dart';
import 'package:Quickzon/features/widgets/card/product_card1.dart';

enum _SortType {
  none,
  priceLowHigh,
  priceHighLow,
  newest,
}

/// =======================================================
/// FEATURED PRODUCTS – SEE ALL PAGE
/// (LOCAL SEARCH + LOCAL FILTER)
/// =======================================================
class FeaturedProductsPage extends StatefulWidget {
  final String title;
  final List<FeaturedProductItem> products;

  const FeaturedProductsPage({
    super.key,
    required this.title,
    required this.products,
  });

  @override
  State<FeaturedProductsPage> createState() => _FeaturedProductsPageState();
}

class _FeaturedProductsPageState extends State<FeaturedProductsPage> {
  bool _isSearching = false;
  String _query = '';
  _SortType _sortType = _SortType.none;

  List<FeaturedProductItem> get _filteredProducts {
    List<FeaturedProductItem> list = [...widget.products];

    /// 🔍 SEARCH
    if (_query.isNotEmpty) {
      list = list
          .where((p) =>
          p.name.toLowerCase().contains(_query.toLowerCase()))
          .toList();
    }

    /// 🔽 SORT
    switch (_sortType) {
      case _SortType.priceLowHigh:
        list.sort((a, b) =>
            _priceOf(a).compareTo(_priceOf(b)));
        break;

      case _SortType.priceHighLow:
        list.sort((a, b) =>
            _priceOf(b).compareTo(_priceOf(a)));
        break;

      case _SortType.newest:
        list = list.reversed.toList(); // backend order = newest
        break;

      case _SortType.none:
        break;
    }

    return list;
  }

  double _priceOf(FeaturedProductItem p) {
    final v = p.variants.isNotEmpty ? p.variants.first : null;
    return (v?.discountedPrice ?? v?.price ?? 0).toDouble();
  }

  void _openFilterSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _FilterSheet(
        selected: _sortType,
        onSelected: (type) {
          setState(() => _sortType = type);
          Navigator.pop(context);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 1,

        /// 🔥 TITLE / SEARCH
        title: _isSearching
            ? TextField(
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search in products...',
            border: InputBorder.none,
          ),
          onChanged: (val) =>
              setState(() => _query = val.trim()),
        )
            : Text(widget.title),

        actions: [
          /// FILTER
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: _openFilterSheet,
          ),

          /// SEARCH
          if (_isSearching)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _query = '';
                });
              },
            )
          else
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () =>
                  setState(() => _isSearching = true),
            ),
        ],
      ),

      /// ================= GRID =================
      body: _filteredProducts.isEmpty
          ? const Center(child: Text('No products found'))
          : GridView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _filteredProducts.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.77,
        ),
        itemBuilder: (_, i) {
          return ProductCard1(
            product: _filteredProducts[i],
            showFavorite: true,
          );
        },
      )

    );
  }
}

/// =======================================================
/// FILTER BOTTOM SHEET
/// =======================================================
class _FilterSheet extends StatelessWidget {
  final _SortType selected;
  final ValueChanged<_SortType> onSelected;

  const _FilterSheet({
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:
      const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _item('Newest', _SortType.newest),
          _item('Price: Low to High', _SortType.priceLowHigh),
          _item('Price: High to Low', _SortType.priceHighLow),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _item(String text, _SortType type) {
    return ListTile(
      title: Text(text),
      trailing:
      selected == type ? const Icon(Icons.check) : null,
      onTap: () => onSelected(type),
    );
  }
}
