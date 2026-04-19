import 'package:Quickzon/features/providers/product/product_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/utils/cache_manager.dart';
import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:Quickzon/features/widgets/sheet/filter_bottom_sheet.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/category/category_provider.dart';
import '../home/_widgets/ShowcaseGridSection.dart';
import '../home/_widgets/section_header.dart';
import 'package:Quickzon/features/providers/featured/showcase_controller.dart';
import 'package:Quickzon/core/utils/helpers/debounce_helper.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final Debouncer _debouncer = Debouncer(milliseconds: 400);

  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim();
    final selectedMasterId = ref.read(selectedMasterCategoryProvider);
    setState(() => _searchQuery = query);

    if (query.isNotEmpty) {
      _debouncer.run(() {
        final Map<String, dynamic> queryParams = {'search': query};
        if (selectedMasterId != null) {
          queryParams['masterCategory'] = selectedMasterId;
        }
        ref.read(productControllerProvider.notifier)
            .getAllProducts(queryParams: queryParams);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productControllerProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        titleSpacing: 0,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Consumer(
          builder: (context, ref, child) {
            final selectedMasterId = ref.watch(selectedMasterCategoryProvider);
            final masterCategories = ref.watch(masterCategoriesProvider);
            String hintText = 'Search products...';

            if (selectedMasterId != null && masterCategories.isNotEmpty) {
              try {
                final selectedMaster = masterCategories.firstWhere((cat) => cat.id == selectedMasterId);
                hintText = 'Search in ${selectedMaster.name}...';
              } catch (_) {}
            }

            return TextField(
              controller: _searchController,
              autofocus: true,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: hintText,
                border: InputBorder.none,
                hintStyle: const TextStyle(color: Colors.black38),
              ),
              style: const TextStyle(fontSize: 16, color: Colors.black87),
            );
          },
        ),
        actions: [
          if (_searchQuery.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.close, color: Colors.black),
              onPressed: () {
                _searchController.clear();
                ref.read(productControllerProvider.notifier).getAllProducts();
              },
            ),
          IconButton(
            icon: const Icon(Icons.filter_alt_outlined, color: Colors.black),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: _searchQuery.isEmpty
          ? const _InitialSearchContent()
          : productsAsync.when(
              data: (products) {
                if (products == null || products.isEmpty) {
                  return const Center(child: Text('No products found'));
                }
                return GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.75,
                  ),
                  itemCount: products.length,
                  itemBuilder: (_, i) => ProductCard1(product: products[i]),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF4CAF50))),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const FilterBottomSheet(),
    );
  }
}

class _InitialSearchContent extends ConsumerWidget {
  const _InitialSearchContent();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

    final productsAsync = ref.watch(productControllerProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          const ShowcaseSection(showcaseType: 'TRENDING_YOUR_CITY'),
          const SizedBox(height: 24),
          const SectionHeader(title: 'Discover More'),
          const SizedBox(height: 12),
          productsAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No products available'),
                  ),
                );
              }
              return GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75,
                ),
                itemCount: products.length,
                itemBuilder: (_, i) => ProductCard1(product: products[i]),
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: Color(0xFF4CAF50)),
              ),
            ),
            error: (err, _) => Center(child: Text('Error: $err')),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final ProductType product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final variant = product.variants.isNotEmpty ? product.variants.first : null;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black12),
        borderRadius: BorderRadius.circular(10),
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: product.images.isNotEmpty
                ? ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
              child: CachedNetworkImage(
                imageUrl: product.images.first,
                cacheManager: AppCacheManager.instance,
                fit: BoxFit.cover,
                width: double.infinity,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                errorWidget: (context, url, error) => const Icon(Icons.error),
              ),
            )
                : Container(
              color: Colors.grey[200],
              child: const Icon(Icons.image_not_supported, size: 48, color: Colors.grey),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (variant != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      '\$${variant.price}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF4CAF50),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
