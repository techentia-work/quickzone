import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/providers/wishlist/wishlist_provider.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlistAsync = ref.watch(wishlistControllerProvider);

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (context.canPop()) {
          context.pop();
        } else {
          context.go('/');
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('My Wishlist'),
          centerTitle: true,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0.5,

          /// 🔥 Back button ONLY when wishlist empty
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/');
              }
            },
          ),
        ),
        body: wishlistAsync.when(
          data: (wishlist) {
            if (wishlist == null || wishlist.items.isEmpty) {
              return const Center(
                child: Text(
                  'Your wishlist is empty',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black54,
                  ),
                ),
              );
            }

            return Padding(
              padding: const EdgeInsets.all(12),
              child: GridView.builder(
                gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.7,
                ),
                itemCount: wishlist.items.length,
                itemBuilder: (context, index) {
                  final item = wishlist.items[index];
                  final product = item.productId;

                  if (product == null) return const SizedBox();

                  return ProductCard1(product: product);
                },
              ),
            );
          },
          loading: () =>
          const Center(child: CircularProgressIndicator()),
          error: (error, _) =>
              Center(child: Text('Error: $error')),
        ),
      ),
    );
  }
}
