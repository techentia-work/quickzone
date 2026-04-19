import 'dart:async';
import 'package:Quickzon/features/models/models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../core/utils/cache_manager.dart';
import '../../../providers/slider/slider_provider.dart';

class SliderCarousel extends ConsumerStatefulWidget {
  const SliderCarousel({super.key});

  @override
  ConsumerState<SliderCarousel> createState() => _SliderCarouselState();
}

class _SliderCarouselState extends ConsumerState<SliderCarousel> {
  late final PageController _controller;
  Timer? _timer;

  static const _autoScrollDuration = Duration(seconds: 3);

  @override
  void initState() {
    super.initState();

    _controller = PageController(
      viewportFraction: 0.78, 
      initialPage: 1000, 
    );

    _startAutoScroll();

    // 🔥 PRECACHE SLIDER IMAGES
    ref.listenManual<AsyncValue<List<SliderType>>>(
      sliderControllerProvider,
      (previous, next) {
        next.whenData((sliders) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            for (final slider in sliders) {
              if (slider.imageUrl.isNotEmpty) {
                precacheImage(CachedNetworkImageProvider(slider.imageUrl, cacheManager: AppCacheManager.instance), context);
              }
            }
          });
        });
      },
    );
  }

  void _startAutoScroll() {
    _timer?.cancel();
    _timer = Timer.periodic(_autoScrollDuration, (_) {
      if (!_controller.hasClients) return;

      _controller.nextPage(
        duration: const Duration(milliseconds: 550),
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slidersAsync = ref.watch(sliderControllerProvider);

    return slidersAsync.when(
      data: (sliders) {
        if (sliders.isEmpty) return const SizedBox.shrink();

        return SizedBox(
          height: 220,
          child: PageView.builder(
            controller: _controller,
            itemBuilder: (context, index) {
              final realIndex = index % sliders.length;
              final item = sliders[realIndex];

              return AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  double scale = 1.0;

                  if (_controller.position.haveDimensions) {
                    final diff = (_controller.page! - index).abs();
                    scale = (1 - diff * 0.15).clamp(0.85, 1.0);
                  }

                  return Transform.scale(
                    scale: scale,
                    child: child,
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: GestureDetector(
                    onTap: () {
                      if (item.category.isNotEmpty &&
                          item.subcategory.isNotEmpty) {
                        context.push(
                          '/category/${item.category.first.slug}/${item.subcategory.first.slug}',
                        );
                      } else if (item.category.isNotEmpty) {
                        context.push(
                          '/category/${item.category.first.slug}',
                        );
                      }
                    },
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: Stack(
                        children: [
                          /// IMAGE
                          Positioned.fill(
                            child: CachedNetworkImage(
                              imageUrl: item.imageUrl,
                              cacheManager: AppCacheManager.instance,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: Colors.grey[300],
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.broken_image,
                                  size: 40,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                          ),

                          /// AD BADGE
                          Positioned(
                            right: 10,
                            bottom: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.6),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'Ad',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },

      /// LOADING
      loading: () => const SizedBox(
        height: 180,
        child: Center(child: CircularProgressIndicator()),
      ),

      /// ERROR
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
