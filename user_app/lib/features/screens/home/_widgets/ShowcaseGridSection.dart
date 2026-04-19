import 'package:Quickzon/features/providers/featured/showcase_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


import 'showcase_grid_section.dart';

class ShowcaseSection extends ConsumerWidget {
  final String showcaseType;

  const ShowcaseSection({
    super.key,
    required this.showcaseType,
  });

  String get title {
    switch (showcaseType) {
      case 'NEW_IN_STORE':
        return 'New In Store';
      case 'PREMIUM':
        return 'Premium';
      case 'BEST_DEALS':
        return 'Best Deals';
      case 'HOT_DEALS':
        return 'Hot Deals';
      case 'TRENDING_NEAR_YOU':
        return 'Trending Near You';
      case 'PRICE_DROP':
        return 'Price Drop';
      case 'TOP_PICKS':
        return 'Top Picks';
      case 'QUICK_ESSENTIALS':
        return 'Quick Essentials';
      case 'BEST_SELLERS':
        return 'Best Sellers';
      case 'NEW_ARRIVALS':
        return 'New Arrivals';
      case 'MOST_ORDERED':
        return 'Most Ordered';
      case 'TRENDING_YOUR_CITY':
        return 'Trending Your City';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final showcaseAsync = ref.watch(
      showcaseProvider(showcaseType),
    );

    return showcaseAsync.when(
      data: (products) {
        if (products.isEmpty) return const SizedBox.shrink();

        return ShowcaseGridSection(
          title: title,
          showcaseType: showcaseType,
          products: products,
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
