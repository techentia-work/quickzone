import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/cache_manager.dart';

class ProductFeaturesSection extends StatelessWidget {
  final List<String> tags;

  const ProductFeaturesSection({
    super.key,
    required this.tags,
  });

  @override
  Widget build(BuildContext context) {
    if (tags.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Product Features',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: tags.take(5).map((tag) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF4CAF50).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  tag,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF4CAF50),
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

class ProductReviewsSection extends StatelessWidget {
  final String productId;
  final double rating;
  final int reviewCount;

  const ProductReviewsSection({
    super.key,
    required this.productId,
    required this.rating,
    required this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Reviews & Ratings',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to all reviews
                },
                child: const Text(
                  'See All',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(5, (index) {
                        return Icon(
                          index < rating.floor()
                              ? Icons.star
                              : (index < rating ? Icons.star_half : Icons.star_border),
                          size: 16,
                          color: Colors.white,
                        );
                      }),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$reviewCount Ratings',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  children: [
                    _buildRatingBar(context, 5, 0.7),
                    const SizedBox(height: 4),
                    _buildRatingBar(context, 4, 0.2),
                    const SizedBox(height: 4),
                    _buildRatingBar(context, 3, 0.05),
                    const SizedBox(height: 4),
                    _buildRatingBar(context, 2, 0.03),
                    const SizedBox(height: 4),
                    _buildRatingBar(context, 1, 0.02),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildSampleReview(
            context,
            'Johnson Smith',
            5.0,
            'Recently I have purchased this perfume and I experienced it is very, I loved it.',
            ['https://via.placeholder.com/100', 'https://via.placeholder.com/100'],
            '2 days ago',
          ),
          const SizedBox(height: 16),
          _buildSampleReview(
            context,
            'Sarah Johnson',
            4.0,
            'Great product! Really satisfied with the quality and delivery was fast.',
            [],
            '1 week ago',
          ),
        ],
      ),
    );
  }

  Widget _buildRatingBar(BuildContext context, int stars, double percentage) {
    return Row(
      children: [
        Text(
          '$stars',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(width: 4),
        const Icon(Icons.star, size: 12, color: Colors.amber),
        const SizedBox(width: 8),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percentage,
              backgroundColor: Colors.grey[200],
              valueColor: const AlwaysStoppedAnimation(Color(0xFF4CAF50)),
              minHeight: 6,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '${(percentage * 100).toInt()}%',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildSampleReview(
      BuildContext context,
      String userName,
      double rating,
      String comment,
      List<String> images,
      String timeAgo,
      ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: const Color(0xFF4CAF50),
                child: Text(
                  userName[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      userName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      timeAgo,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.star, size: 10, color: Colors.white),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            comment,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[700],
              height: 1.4,
            ),
          ),
          if (images.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 60,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: images.length,
                itemBuilder: (context, index) {
                  final imageUrl = images[index];
                  return Container(
                    margin: const EdgeInsets.only(right: 8),
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Builder(
                      builder: (context) {
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          try {
                            precacheImage(
                              CachedNetworkImageProvider(imageUrl, cacheManager: AppCacheManager.instance),
                              context,
                            );
                          } catch (_) {}
                        });
                        return CachedNetworkImage(
                          imageUrl: imageUrl,
                          cacheManager: AppCacheManager.instance,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: Colors.grey[200],
                            child: const Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                          errorWidget: (context, url, error) =>
                              const Icon(Icons.error),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}