import 'package:Quickzon/features/models/featured/featured_model.dart';
import 'package:Quickzon/features/providers/order/order_provider.dart';
import 'package:Quickzon/features/providers/settings/admin_setting_provider.dart';
import 'package:Quickzon/features/screens/home/_widgets/ShowcaseGridSection.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_banner.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_featured.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_super_categories.dart';
import 'package:Quickzon/features/screens/home/_widgets/showcase_grid_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:Quickzon/features/providers/banner/banner_provider.dart';
import 'package:Quickzon/features/providers/category/category_provider.dart';
import 'package:Quickzon/features/providers/featured/featured_provider.dart';
import 'package:Quickzon/features/providers/featured/featured_product_provider.dart';
import 'package:Quickzon/features/providers/slider/slider_provider.dart';

import 'package:Quickzon/features/screens/home/_widgets/brand_of_the_day_card.dart';
import 'package:Quickzon/features/screens/home/_widgets/featured_week_section.dart';
import 'package:Quickzon/features/screens/home/_widgets/shop_by_store_section.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_featured_product_section.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_slider.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_navbar.dart';
import 'package:Quickzon/features/screens/home/_widgets/home_master_categories.dart';

import 'package:Quickzon/features/widgets/global_cart_bar.dart';
import 'package:Quickzon/core/utils/enums/enums.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with AutomaticKeepAliveClientMixin {
  final ScrollController _scrollController = ScrollController();
  bool _showStickyCategories = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();

    // Initialize providers
    ref.read(adminSettingProvider.future);
    ref.read(orderControllerProvider.notifier).fetchOrders();
    
    // Initialize category tree (master categories)
    ref.read(masterCategoryTreeProvider);

    _scrollController.addListener(_onScroll);

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.white,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();

    SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.manual,
      overlays: SystemUiOverlay.values,
    );

    super.dispose();
  }

  void _onScroll() {
    final shouldShow = _scrollController.offset > 120;
    if (shouldShow != _showStickyCategories) {
      setState(() => _showStickyCategories = shouldShow);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    /// 🔥 ORDER ID NIKALNA (HOME SCREEN ME HI)
    final ordersAsync = ref.watch(orderControllerProvider);

    int activeOrderCount = 0;
    String? anyActiveOrderId;

    ordersAsync.when(
      data: (orders) {
        if (orders == null) return;

        for (final order in orders) {
          if (order.status != OrderStatus.DELIVERED &&
              order.status != OrderStatus.CANCELLED &&
              order.status != OrderStatus.REFUNDED) {
            activeOrderCount++;
            anyActiveOrderId ??= order.id; // pehla active order
          }
        }
      },
      loading: () {},
      error: (_, __) {},
    );


    return Scaffold(
      backgroundColor: Colors.white,
      extendBody: true,
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          /// ================= MAIN CONTENT =================
          SafeArea(
            top: false,
            bottom: false,
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(bannerControllerProvider);
                ref.invalidate(sliderControllerProvider);
                ref.invalidate(featuredControllerProvider);
                ref.invalidate(featuredProductControllerProvider);
                ref.invalidate(categoryControllerProvider);
                await ref.read(orderControllerProvider.notifier).fetchOrders();
              },
              child: SingleChildScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    const FeaturedSection(),
                    const SizedBox(height: 16),
                    const FeaturedWeekSection(),
                    const SizedBox(height: 24),

                    /// 🔥 APP 1
                    HomeFeaturedProductSection(
                      sectionsProvider: app1SectionsProvider,
                    ),
                    const SizedBox(height: 24),

                    const ShowcaseSection(showcaseType: 'TOP_PICKS'),
                    const SizedBox(height: 24),

                    const ShopByCategorySection(maxSuperCategories: 5),

                    const SizedBox(height: 24),
                    const ShowcaseSection(showcaseType: 'PRICE_DROP'),
                    const SizedBox(height: 24),
                    /// 🔥 APP 2
                    HomeFeaturedProductSection(
                      sectionsProvider: app2SectionsProvider,
                    ),
                    const SizedBox(height: 24),

                    const ShopByStoreSection(),
                    const SizedBox(height: 24),

                    const ShowcaseSection(showcaseType: 'NEW_ARRIVALS'),
                    const SizedBox(height: 24),
                    const SliderCarousel(),
                    const SizedBox(height: 24),

                    const BannerCarousel(),
                    const SizedBox(height: 24),

                    const BrandOfTheDaySection(),
                    const SizedBox(height: 24),

                    /// 🔥 APP 3
                    HomeFeaturedProductSection(
                      sectionsProvider: app3SectionsProvider,
                    ),
                    const SizedBox(height: 24),

                    const ShowcaseSection(showcaseType: 'MOST_ORDERED'),
                    const SizedBox(height: 24),

                    /// 🔥 APP 4
                    HomeFeaturedProductSection(
                      sectionsProvider: app4SectionsProvider,
                    ),
                    const SizedBox(height: 24),
                    const ShowcaseSection(showcaseType: 'BEST_SELLERS'),
                    const SizedBox(height: 24),

                    /// 🔥 APP 5
                    HomeFeaturedProductSection(
                      sectionsProvider: app5SectionsProvider,
                    ),
                    const SizedBox(height: 24),

                    const ShowcaseSection(showcaseType: 'QUICK_ESSENTIALS'),
                    const SizedBox(height: 24),
                  ],
                ),

              ),
            ),
          ),

          /// ================= STICKY MASTER CATEGORIES =================
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: IgnorePointer(
              ignoring: !_showStickyCategories,
              child: AnimatedOpacity(
                opacity: _showStickyCategories ? 1 : 0,
                duration: const Duration(milliseconds: 250),
                child: Container(
                  color: Colors.white,
                  child: const HomeMasterCategories(),
                ),
              ),
            ),
          ),

          /// ================= ORDER + CART BARS =================
          if (activeOrderCount > 0 && anyActiveOrderId != null)
          Positioned(
            right: 16,
            bottom: MediaQuery.of(context).padding.bottom + 90,
            child: OrderTrackerButton(
              orderId: anyActiveOrderId!,
              activeCount: activeOrderCount,
            ),
          ),

          Positioned(
            left: 12,
            right: 12,
            bottom: 90,
            child: const GlobalCartBar(),
          ),
        ],
      ),
    );
  }
}
class OrderTrackerButton extends StatelessWidget {
  final String orderId;
  final int activeCount;

  const OrderTrackerButton({
    super.key,
    required this.orderId,
    required this.activeCount,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push(
          '/my-orders',
          extra: 1, // 👈 UPCOMING TAB
        );
      },
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          /// MAIN BUTTON
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFF09A84E),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.delivery_dining,
              color: Colors.white,
              size: 28,
            ),
          ),

          /// BADGE = number of active orders
          if (activeCount > 0)
            Positioned(
              top: -4,
              right: -4,
              child: Container(
                width: 20,
                height: 20,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  activeCount.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}


class _FeaturedSection extends ConsumerWidget {
  const _FeaturedSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredControllerProvider);

    return featuredAsync.when(
      data: (sections) {
        if (sections.isEmpty) {
          return const _HeroBanner(section: null);
        }

        return Column(
          children: sections.map((section) {
            return _HeroBanner(section: section);
          }).toList(),
        );
      },
      loading: () => const _HeroBanner(section: null),
      error: (_, __) => const _HeroBanner(section: null),
    );
  }
}
Color hexToColor(String hex) {
  hex = hex.replaceAll('#', '');
  if (hex.length == 6) hex = 'FF$hex';
  return Color(int.parse(hex, radix: 16));
}

class _HeroBanner extends StatelessWidget {
  final FeaturedType? section;
  const _HeroBanner({this.section});

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;

    final bgColor = section?.color != null
        ? hexToColor(section!.color!)
        : Colors.white;

    return SizedBox(
      height: 225 + statusBarHeight,
      width: double.infinity,
      child: Stack(
        children: [
          Positioned.fill(child: Container(color: bgColor)),
          Positioned(
            top: statusBarHeight,
            left: 0,
            right: 0,
            child: const HomeNavBar(),
          ),
          const Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: HomeMasterCategories(),
          ),
        ],
      ),
    );
  }
}
