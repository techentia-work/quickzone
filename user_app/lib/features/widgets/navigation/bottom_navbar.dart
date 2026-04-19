import 'package:Quickzon/core/utils/enums/enums.dart';
import 'package:Quickzon/features/providers/order/order_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import '../../../core/utils/cache_manager.dart';
import 'package:Quickzon/features/providers/settings/admin_setting_provider.dart';
import 'package:Quickzon/features/providers/category/category_provider.dart';

class AppBottomNavBar extends ConsumerWidget {
  const AppBottomNavBar({super.key});

  int _getCurrentIndex(String location) {
    if (location.startsWith('/repeat')) return 1;
    if (location.startsWith('/categories')) return 3;
    if (location.startsWith('/help-support')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final isAuthenticated =
        auth.whenOrNull(data: (user) => user != null) ?? false;

    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = _getCurrentIndex(location);

    return Material(
      color: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.18),
                blurRadius: 28,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'Home',
                isActive: currentIndex == 0,
                onTap: () => context.go('/'),
              ),

              _NavItem(
                icon: Icons.shopping_bag_outlined,
                activeIcon: Icons.shopping_bag,
                label: 'Repeat Order',
                isActive: currentIndex == 1,
                onTap: () {
                  if (!isAuthenticated) {
                    _showLoginRequired(context);
                    return;
                  }

                  context.go('/repeat'); // 🔥 FINAL
                },
              ),


              /// 🔥 CENTER ACTION (PROMO MEDIA)
              _CenterActionButton(
                onTap: () => context.go('/action'),
              ),

              _NavItem(
                icon: Icons.grid_view_outlined,
                activeIcon: Icons.grid_view_rounded,
                label: 'Category',
                isActive: currentIndex == 3,
                onTap: () => context.go('/categories'),
              ),

              _NavItem(
                icon: Icons.support_agent_outlined,
                activeIcon: Icons.support_agent,
                label: 'Help',
                isActive: currentIndex == 4,
                onTap: () => context.go('/help-support'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLoginRequired(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Please login to continue'),
        action: SnackBarAction(
          label: 'Login',
          onPressed: () => context.push('/login'),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? Colors.black : Colors.grey.shade600;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight:
                isActive ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CenterActionButton extends ConsumerWidget {
  final VoidCallback onTap;

  const _CenterActionButton({required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    /// ✅ SAFE READ (NO when / no settingsAsync)
    final settings = ref.watch(adminSettingProvider).maybeWhen(
      data: (data) => data,
      orElse: () => null,
    );

    // Watch the selected master category
    final selectedMasterId = ref.watch(selectedMasterCategoryProvider);

    // Resolve which promo media and url to use
    String promoMediaUrl = settings?.promoMedia ?? '';
    String promoRedirectUrl = settings?.promoRedirectUrl ?? '';

    if (settings != null && selectedMasterId != null) {
      final specificPromo = settings.masterCategoryPromoBanners[selectedMasterId];
      if (specificPromo != null && specificPromo is Map) {
        final specificMedia = specificPromo['media']?.toString();
        if (specificMedia != null && specificMedia.isNotEmpty) {
          promoMediaUrl = specificMedia;
          promoRedirectUrl = specificPromo['redirectUrl']?.toString() ?? '';
        }
      }
    }

    return GestureDetector(
      onTap: () async {
        if (promoRedirectUrl.isNotEmpty) {
           final Uri url = Uri.parse(promoRedirectUrl);
           if (await canLaunchUrl(url)) {
             await launchUrl(url, mode: LaunchMode.externalApplication);
             return;
           }
        }
        
        onTap();
      },
      child: Container(
        height: 56,
        width: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 14,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipOval(
        child: ClipOval(
          child: promoMediaUrl.isNotEmpty
              ? Builder(
                  builder: (context) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      try {
                        precacheImage(
                          CachedNetworkImageProvider(promoMediaUrl, cacheManager: AppCacheManager.instance),
                          context,
                        );
                      } catch (_) {}
                    });
                    
                    return CachedNetworkImage(
                      imageUrl: promoMediaUrl,
                      cacheManager: AppCacheManager.instance,
                      memCacheWidth: 112,
                      memCacheHeight: 112,
                      fit: BoxFit.cover,
                    );
                  },
                )
              : const SizedBox(),
        ),
        ),
      ),
    );
  }
}
