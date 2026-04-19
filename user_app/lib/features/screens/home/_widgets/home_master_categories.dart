import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'dart:async';
import '../../../providers/category/category_provider.dart';
import '../../../models/category/category_model.dart';

class HomeMasterCategories extends ConsumerStatefulWidget {
  const HomeMasterCategories({super.key});

  @override
  ConsumerState<HomeMasterCategories> createState() =>
      _HomeMasterCategoriesState();
}

class _HomeMasterCategoriesState
    extends ConsumerState<HomeMasterCategories> {
  bool _didAutoSelect = false;
  late final ProviderSubscription<List<CategoryType>> _subscription;

  @override
  void initState() {
    super.initState();

    _subscription = ref.listenManual<List<CategoryType>>(
      masterCategoriesProvider,
      (previous, next) async {
        if (next.isEmpty) return;
        _precacheCategories(next);
        _autoSelect(next);
      },
    );

    // 🔥 Check if data is already available
    final currentCategories = ref.read(masterCategoriesProvider);
    if (currentCategories.isNotEmpty) {
      _precacheCategories(currentCategories);
      _autoSelect(currentCategories);
    }
  }

  void _precacheCategories(List<CategoryType> categories) {
    if (!mounted) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (final cat in categories) {
        if (cat.thumbnail != null && cat.thumbnail!.isNotEmpty) {
          precacheImage(CachedNetworkImageProvider(cat.thumbnail!), context);
        }
      }
    });
  }

  void _autoSelect(List<CategoryType> categories) {
    if (categories.isEmpty) return;

    final selectedMaster = ref.read(selectedMasterCategoryProvider);
    if (_didAutoSelect || selectedMaster != null) return;

    try {
      final grocery = categories.firstWhere(
        (cat) => cat.isActive && (cat.slug == 'grocery' || cat.slug == 'groceries'),
      );

      _didAutoSelect = true;

      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(selectedMasterCategoryProvider.notifier).select(grocery.id);
      });
    } catch (_) {
      _didAutoSelect = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(selectedMasterCategoryProvider.notifier).select(categories.first.id);
      });
    }
  }



  @override
  void dispose() {
    _subscription.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final masterCategories =
    ref.watch(masterCategoriesProvider);
    final selectedMasterId =
    ref.watch(selectedMasterCategoryProvider);

    if (masterCategories.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        /// 🔍 SEARCH BAR
        const SizedBox(height: 55),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: GestureDetector(
            onTap: () => context.push('/search'),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.black45,
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.search,
                      color: Colors.black45, size: 22),
                  SizedBox(width: 12),
                  Text(
                    'Search ',
                    style: TextStyle(
                      color: Colors.black54,
                      fontSize: 14,
                    ),
                  ),
                  Expanded(
                    child: _AnimatedSearchHint(),
                  ),
                  const Text(
                    '',
                    style: TextStyle(
                      color: Colors.black38,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 15),

        /// 🧩 MASTER CATEGORY LIST
        SizedBox(
          height: 72,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding:
            const EdgeInsets.symmetric(horizontal: 16),
            itemCount: masterCategories.length,
            itemBuilder: (context, index) {
              final category = masterCategories[index];
              final isSelected =
                  selectedMasterId == category.id;

              return GestureDetector(
                onTap: () {
                  ref
                      .read(
                    selectedMasterCategoryProvider
                        .notifier,
                  )
                      .select(category.id);
                },
                child: Padding(
                  padding:
                  const EdgeInsets.only(right: 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          image: DecorationImage(
                            image: category.thumbnail != null
                                ? CachedNetworkImageProvider(category.thumbnail!)
                                : const AssetImage("assets/no_image.png") as ImageProvider,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        category.name,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.normal,
                        ),
                      ),
                      AnimatedContainer(
                        duration: const Duration(
                            milliseconds: 200),
                        margin:
                        const EdgeInsets.only(top: 3),
                        height: 2,
                        width: isSelected ? 30 : 0,
                        color: Colors.black,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _AnimatedSearchHint extends StatefulWidget {
  const _AnimatedSearchHint();

  @override
  State<_AnimatedSearchHint> createState() => _AnimatedSearchHintState();
}

class _AnimatedSearchHintState extends State<_AnimatedSearchHint> {
  int _index = 0;
  Timer? _timer;

  final List<String> _searchItems = [
    'Milk',
    'Bread',
    'Rice',
    'Atta',
    'Oil',
    'Dal',
    'Sugar',
    'Tea',
    'Coffee',
    'Biscuits',
    'Maggi',
    'Chips',
    'Cold Drinks',
    'Chocolates',
    'Ice Cream',
    'Butter',
    'Cheese',
    'Paneer',
    'Curd',
    'Vegetables',
    'Fruits',
    'Headphones',
    'Smartwatches',
    'Tablets',
    'Shampoo',
    'Soap',
    'Toothpaste',
    'Detergent',
    'Diapers',
  ];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _index = (_index + 1) % _searchItems.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (Widget child, Animation<double> animation) {
        // "ek ek word remove wali" - Vertical Slide like Blinkit
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.0, 0.6), // Slide up from slightly below
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
            child: child,
          ),
        );
      },
      child: Align(
        key: ValueKey<String>(_searchItems[_index]),
        alignment: Alignment.centerLeft,
        child: Text(
          _searchItems[_index],
          style: const TextStyle(
            color: Colors.black54,
            fontSize: 14,
            fontWeight: FontWeight.normal,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }
}
