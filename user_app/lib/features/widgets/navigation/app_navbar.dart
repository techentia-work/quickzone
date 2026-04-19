// features/widgets/navigation/app_navbar.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:Quickzon/features/providers/address/address_provider.dart';

class AppNavBar extends ConsumerWidget implements PreferredSizeWidget {
  final VoidCallback? onCartTap;
  final int cartItemCount;

  const AppNavBar({
    super.key,
    this.onCartTap,
    this.cartItemCount = 0,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final controller = ref.read(authControllerProvider.notifier);
    final selectedAddress = ref.watch(selectedAddressProvider);
    final addressesAsync = ref.watch(addressControllerProvider);

    // Check authentication
    final isAuthenticated = auth.whenOrNull(
      data: (user) => user != null,
    ) ?? false;

    return AppBar(
      elevation: 2,
      backgroundColor: Colors.white,
      title: Row(
        children: [
          // Logo
          Image.asset(
            'assets/images/logo.png',
            height: 32,
            errorBuilder: (context, error, stackTrace) {
              return const Text(
                'Quickzon',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              );
            },
          ),
          const SizedBox(width: 16),

          // Address Selection Widget
          Expanded(
            child: _buildAddressSelector(
              context,
              ref,
              isAuthenticated,
              selectedAddress,
              addressesAsync,
            ),
          ),
        ],
      ),
      actions: [
        // Cart Icon
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.shopping_cart_outlined, color: Colors.black87),
              onPressed: onCartTap ?? () {},
            ),
            if (cartItemCount > 0)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 18,
                    minHeight: 18,
                  ),
                  child: Text(
                    cartItemCount > 99 ? '99+' : cartItemCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(width: 8),

        // User Icon (Login or Logout)
        IconButton(
          icon: Icon(
            isAuthenticated ? Icons.person : Icons.person_outline,
            color: Colors.black87,
          ),
          onPressed: auth.isLoading
              ? null
              : () async {
            if (isAuthenticated) {
              await controller.logout();
              if (context.mounted) {
                context.push('/login');
              }
            } else {
              if (context.mounted) {
                context.push('/login');
              }
            }
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildAddressSelector(
      BuildContext context,
      WidgetRef ref,
      bool isAuthenticated,
      dynamic selectedAddress,
      AsyncValue addressesAsync,
      ) {
    // Case 1: User not authenticated
    if (!isAuthenticated) {
      return _buildLocationButton(
        context,
        'Select Location',
        Icons.location_on_outlined,
            () => _handleLocationSelection(context, ref, isAuthenticated),
      );
    }

    // Case 2: Loading addresses
    return addressesAsync.when(
      loading: () => _buildLoadingState(),
      error: (error, stack) => _buildLocationButton(
        context,
        'Select Location',
        Icons.location_on_outlined,
            () => _handleLocationSelection(context, ref, isAuthenticated),
      ),
      data: (addresses) {
        // Case 3: No addresses available
        if (addresses.isEmpty) {
          return _buildLocationButton(
            context,
            'Add Delivery Address',
            Icons.add_location_outlined,
                () => _handleLocationSelection(context, ref, isAuthenticated),
          );
        }

        // Case 4: Addresses available but none selected - use default
        if (selectedAddress == null) {
          final defaultAddress = addresses.firstWhere(
                (addr) => addr.isDefault,
            orElse: () => addresses.first,
          );

          // Auto-select default address
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ref.read(selectedAddressProvider.notifier).select(defaultAddress);
          });

          return _buildAddressDisplay(
            context,
            defaultAddress.label,
            _formatAddressPreview(defaultAddress),
                () => _handleAddressChange(context, ref),
          );
        }

        // Case 5: Address selected
        return _buildAddressDisplay(
          context,
          selectedAddress.label,
          _formatAddressPreview(selectedAddress),
              () => _handleAddressChange(context, ref),
        );
      },
    );
  }

  Widget _buildLoadingState() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        const SizedBox(width: 8),
        Text(
          'Loading...',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildLocationButton(
      BuildContext context,
      String text,
      IconData icon,
      VoidCallback onTap,
      ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: Colors.blue),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down, size: 18, color: Colors.black54),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressDisplay(
      BuildContext context,
      String label,
      String address,
      VoidCallback onTap,
      ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.blue[50],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.location_on, size: 18, color: Colors.blue),
            const SizedBox(width: 8),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    address,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[700],
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down, size: 18, color: Colors.black54),
          ],
        ),
      ),
    );
  }

  String _formatAddressPreview(dynamic address) {
    final parts = <String>[];

    if (address.addressLine1.isNotEmpty) parts.add(address.addressLine1);
    if (address.city.isNotEmpty) parts.add(address.city);

    return parts.join(', ');
  }

  void _handleLocationSelection(BuildContext context, WidgetRef ref, bool isAuthenticated) {
    if (!isAuthenticated) {
      // Show dialog to login first
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Login Required'),
          content: const Text('Please login to select a delivery address.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/login');
              },
              child: const Text('Login'),
            ),
          ],
        ),
      );
    } else {
      // Navigate to location selection
      context.push('/address/location');
    }
  }

  void _handleAddressChange(BuildContext context, WidgetRef ref) {
    // Navigate to address selection screen
    context.push('/address');
  }
}