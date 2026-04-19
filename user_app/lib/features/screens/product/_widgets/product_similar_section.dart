import 'package:Quickzon/features/providers/product/product_provider.dart';
import 'package:Quickzon/features/widgets/card/product_card1.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SimilarProductsSection extends ConsumerWidget {
  final String categoryId;
  final String currentProductId;

  const SimilarProductsSection({
    super.key,
    required this.categoryId,
    required this.currentProductId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final similarProductsAsync = ref.watch(
      productsByCategoryProvider(
        CategoryProductsParams(
          categoryId: categoryId,
          queryParams: {'limit': '20'},
        ),
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(

          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Similar Products',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color:Colors.black,
            ),
          ),
        ),
        const SizedBox(height: 12),

        similarProductsAsync.when(
          loading: () => const _SimilarLoading(),
          error: (_, __) => const _SimilarEmpty(text: 'Failed to load products'),
          data: (products) {
            final items = products
                .where((p) => p.id != currentProductId)
                .take(6)
                .toList();

            if (items.isEmpty) {
              return const _SimilarEmpty();
            }

            return SizedBox(
              height: 220,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (_, index) {
                  return SizedBox(
                    width: 150,
                    child: ProductCard1(product: items[index]),
                  );
                },
              ),
            );
          },
        ),
      ],
    );
  }
}

class _SimilarLoading extends StatelessWidget {
  const _SimilarLoading();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 300,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, __) => const _AnimatedProductSkeleton(),
      ),
    );
  }
}
class _SimilarEmpty extends StatelessWidget {
  final String text;
  const _SimilarEmpty({
    this.text = 'No similar products found',
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(color: Colors.grey),
        ),
      ),
    );
  }
}

/// ✨ Animated shimmer skeleton (top-left → bottom-right)
class _AnimatedProductSkeleton extends StatefulWidget {
  const _AnimatedProductSkeleton();

  @override
  State<_AnimatedProductSkeleton> createState() =>
      _AnimatedProductSkeletonState();
}

class _AnimatedProductSkeletonState extends State<_AnimatedProductSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1, milliseconds: 200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final shimmerGradient = LinearGradient(
          begin: const Alignment(-1.0, -1.0),
          end: const Alignment(1.0, 1.0),
          colors: [
            Colors.grey.shade300,
            Colors.grey.shade100,
            Colors.grey.shade300,
          ],
          stops: [
            (_controller.value - 0.3).clamp(0.0, 1.0),
            _controller.value.clamp(0.0, 1.0),
            (_controller.value + 0.3).clamp(0.0, 1.0),
          ],
        );

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Image skeleton
              Container(
                height: 160,
                decoration: BoxDecoration(
                  gradient: shimmerGradient,
                  borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(12)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _shimmerBox(height: 14, width: 120, gradient: shimmerGradient),
                    const SizedBox(height: 6),
                    _shimmerBox(height: 14, width: 100, gradient: shimmerGradient),
                    const SizedBox(height: 6),
                    _shimmerBox(height: 12, width: 60, gradient: shimmerGradient),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _shimmerBox(height: 16, width: 50, gradient: shimmerGradient),
                            const SizedBox(height: 4),
                            _shimmerBox(height: 11, width: 40, gradient: shimmerGradient),
                          ],
                        ),
                        _shimmerBox(height: 36, width: 60, radius: 8, gradient: shimmerGradient),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _shimmerBox({
    required double height,
    required double width,
    required Gradient gradient,
    double radius = 4,
  }) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
