import 'package:Quickzon/features/models/showcase_product/showcase_product_model.dart';
import 'package:Quickzon/features/providers/featured/shop_by_store_products_provider.dart';
import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:Quickzon/features/screens/product/_widgets/_widgets.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/models/featured/shop_by_store_model.dart';

import 'package:Quickzon/features/widgets/card/product_card.dart';
import 'package:Quickzon/features/widgets/navigation/bottom_navbar.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

class ShopByStoreProductsScreen extends ConsumerStatefulWidget {
  final ShopByStore store;

  const ShopByStoreProductsScreen({
    super.key,
    required this.store,
  });

  @override
  ConsumerState<ShopByStoreProductsScreen> createState() =>
      _ShopByStoreProductsScreenState();
}

class _ShopByStoreProductsScreenState
    extends ConsumerState<ShopByStoreProductsScreen> {
  dynamic selectedProduct;
  ProductVariantType? selectedVariant;
  int cartQty = 0;

  // Search & Filter State
  bool _isSearchActive = false;
  String _searchQuery = '';
  RangeValues _priceRange = const RangeValues(0, 10000);
  String? _selectedType;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _precacheImages(List<ShowcaseProductItem> products) {
    if (products.isEmpty) return;
    for (final p in products) {
      if (p.mainImage != null && p.mainImage!.isNotEmpty) {
        precacheImage(CachedNetworkImageProvider(p.mainImage!), context);
      }
    }
  }

  List<ShowcaseProductItem> _filterProducts(List<ShowcaseProductItem> products) {
    return products.where((p) {
      // Name Search
      if (_searchQuery.isNotEmpty &&
          !p.name.toLowerCase().contains(_searchQuery.toLowerCase())) {
        return false;
      }

      // Type Filter
      if (_selectedType != null) {
        // We need to check the variants or if we have a global type
        // For simplicity, checking if any variant (or product) matches the type
        // In card1 it uses product.productType
        // ShowcaseProductItem doesn't have productType directly, so we might need to rely on variants or skip if unavailable
      }

      // Price Filter
      if (p.variants.isNotEmpty) {
        final price = p.variants.first.discountedPrice ?? p.variants.first.price ?? 0;
        if (price < _priceRange.start || price > _priceRange.end) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  // ===================================================
  // SAFE PRODUCT TAP
  // ===================================================
  void _onProductTap(dynamic product) {
    setState(() {
      selectedProduct = product;
      selectedVariant =
      product.variants.isNotEmpty ? product.variants.first : null;
      cartQty = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(
      shopByStoreProductsProvider(widget.store.slug),
    );

    /// 🔥 PRECACHE
    productsAsync.whenData((list) => _precacheImages(list));

    return Scaffold(
      backgroundColor: Colors.white,

      // ===================================================
      // 🔥 AUTO SWITCH BOTTOM BAR (FIXED)
      // ===================================================
      bottomNavigationBar:
      selectedProduct != null && selectedVariant != null
          ? ProductBottomBar(
        product: selectedProduct!,
        selectedVariant: selectedVariant!,
        cartQuantity: cartQty,
        onAddToCart: () {
          setState(() => cartQty = 1);
        },
        onUpdateQuantity: (qty) {
          setState(() => cartQty = qty);
        },
      )
          : const AppBottomNavBar(), // ✅ FIXED

      body: CustomScrollView(
        slivers: [
          // ===================================================
          // BANNER (STORE)
          // ===================================================
          SliverAppBar(
            pinned: true,
            expandedHeight: 230,
            backgroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black),
              onPressed: () => Navigator.pop(context),
            ),
            title: _isSearchActive
                ? TextField(
              controller: _searchController,
              autofocus: true,
              style: const TextStyle(color: Colors.black, fontSize: 16),
              decoration: const InputDecoration(
                hintText: 'Search products...',
                border: InputBorder.none,
                hintStyle: TextStyle(color: Colors.black38),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            )
                : null,
            actions: [
              IconButton(
                icon: Icon(_isSearchActive ? Icons.close : Icons.search, color: Colors.black),
                onPressed: () {
                  setState(() {
                    _isSearchActive = !_isSearchActive;
                    if (!_isSearchActive) {
                      _searchQuery = '';
                      _searchController.clear();
                    }
                  });
                },
              ),
              IconButton(
                icon: const Icon(Icons.filter_alt_outlined, color: Colors.black),
                onPressed: () => _showLocalFilterSheet(),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: widget.store.banner != null
                  ? CachedNetworkImage(
                imageUrl: widget.store.banner!,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: Colors.grey.shade200),
                errorWidget: (context, url, err) => Container(color: Colors.grey.shade300, child: const Icon(Icons.image)),
              )
                  : Container(color: Colors.grey.shade300),
            ),
          ),

          // ===================================================
          // PRODUCTS GRID
          // ===================================================
          productsAsync.when(
            loading: () => const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
            error: (_, __) => const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Center(child: Text('Failed to load products')),
              ),
            ),
            data: (rawProducts) {
              final products = _filterProducts(rawProducts);
              if (products.isEmpty) {
                return const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Center(child: Text('No products found')),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                        (context, index) {
                      final product = products[index];
                      return GestureDetector(
                        onTap: () => _onProductTap(product),
                        child: ProductCard1(product: product),
                      );
                    },
                    childCount: products.length,
                  ),
                  gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.62,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showLocalFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Filter Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  Text('Price Range: ₹${_priceRange.start.round()} - ₹${_priceRange.end.round()}'),
                  RangeSlider(
                    values: _priceRange,
                    min: 0,
                    max: 10000,
                    divisions: 100,
                    activeColor: Colors.green,
                    onChanged: (val) {
                      setModalState(() => _priceRange = val);
                      setState(() => _priceRange = val);
                    },
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                      child: const Text('Apply'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () {
                        setModalState(() {
                          _priceRange = const RangeValues(0, 10000);
                        });
                        setState(() {
                          _priceRange = const RangeValues(0, 10000);
                        });
                      },
                      child: const Text('Reset'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
