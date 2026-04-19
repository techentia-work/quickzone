import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/cache_manager.dart';

/// =======================================================
/// PRODUCT IMAGE CAROUSEL (AUTO SLIDE 3s)
/// =======================================================

class ProductImageCarousel extends StatefulWidget {
  final List<String> images;

  const ProductImageCarousel({
    super.key,
    required this.images,
  });

  @override
  State<ProductImageCarousel> createState() => _ProductImageCarouselState();
}

class _ProductImageCarouselState extends State<ProductImageCarousel> {
  late PageController _pageController;
  late List<String> _images;
  Timer? _autoSlideTimer;

  int _currentPage = 0;

  @override
  void initState() {
    super.initState();

    /// REMOVE DUPLICATES
    _images = widget.images.toSet().toList();

    // 🔥 PRECACHE ALL PRODUCT IMAGES
    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (final img in _images) {
        if (img.isNotEmpty) {
           precacheImage(CachedNetworkImageProvider(img, cacheManager: AppCacheManager.instance), context);
        }
      }
    });

    _pageController = PageController();

    /// AUTO SLIDE – ONLY IF MORE THAN 1 IMAGE
    if (_images.length > 1) {
      _autoSlideTimer =
          Timer.periodic(const Duration(seconds: 3), (timer) {
            if (!_pageController.hasClients) return;

            final nextPage = (_currentPage + 1) % _images.length;

            _pageController.animateToPage(
              nextPage,
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeInOut,
            );
          });
    }
  }

  @override
  void dispose() {
    _autoSlideTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_images.isEmpty) {
      return _buildPlaceholder();
    }

    return Stack(
      children: [
        PageView.builder(
          controller: _pageController,
          itemCount: _images.length,
          onPageChanged: (index) {
            setState(() => _currentPage = index);
          },
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () => _openImageViewer(context, index),
              child: _buildImage(_images[index]),
            );
          },
        ),

        /// DOT INDICATOR
        if (_images.length > 1)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(
                    _images.length,
                        (index) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentPage == index
                            ? Colors.white
                            : Colors.white.withOpacity(0.4),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildImage(String imageUrl) {
    return Container(
      color: Colors.white,
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        cacheManager: AppCacheManager.instance,
        fit: BoxFit.contain,
        errorWidget: (_, __, ___) => _buildPlaceholder(),
        placeholder: (_, __) => Center(
          child: CircularProgressIndicator(color: Colors.black12),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.grey[100],
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 64,
          color: Colors.grey[400],
        ),
      ),
    );
  }

  void _openImageViewer(BuildContext context, int index) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ImageViewerScreen(
          images: _images,
          initialIndex: index,
        ),
      ),
    );
  }
}

/// =======================================================
/// IMAGE VIEWER WITH THUMBNAILS + BACK ARROW
/// =======================================================

class ImageViewerScreen extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const ImageViewerScreen({
    super.key,
    required this.images,
    required this.initialIndex,
  });

  @override
  State<ImageViewerScreen> createState() => _ImageViewerScreenState();
}

class _ImageViewerScreenState extends State<ImageViewerScreen> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,

      /// ================= TOP BAR =================
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '${_currentIndex + 1} / ${widget.images.length}',
          style: const TextStyle(color: Colors.white),
        ),
        centerTitle: true,
      ),

      body: Column(
        children: [
          /// ================= MAIN IMAGE =================
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: widget.images.length,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
              },
              itemBuilder: (context, index) {
                return Center(
                  child: InteractiveViewer(
                    minScale: 1.0,
                    maxScale: 4.0,
                    child: CachedNetworkImage(
                      imageUrl: widget.images[index],
                      cacheManager: AppCacheManager.instance,
                      fit: BoxFit.contain,
                      errorWidget: (_, __, ___) => const Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.white54,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          /// ================= THUMBNAILS =================
          if (widget.images.length > 1)
            Container(
              height: 90,
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: widget.images.length,
                itemBuilder: (context, index) {
                  final isActive = index == _currentIndex;

                  return GestureDetector(
                    onTap: () {
                      _pageController.animateToPage(
                        index,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                      setState(() => _currentIndex = index);
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color:
                          isActive ? Colors.white : Colors.transparent,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: CachedNetworkImage(
                          imageUrl: widget.images[index],
                          cacheManager: AppCacheManager.instance,
                          width: 70,
                          height: 70,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
