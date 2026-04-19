import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/providers/providers.dart';
import 'package:Quickzon/features/providers/wallet/wallet_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class HomeNavBar extends ConsumerWidget {
  const HomeNavBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.value;
    final selectedAddress = ref.watch(selectedAddressProvider);
    final addressesAsync = ref.watch(addressControllerProvider);
    final walletAsync = ref.watch(walletProvider);

    final isAuthenticated = user != null;

    void handleNavigation(String route) {
      if (!isAuthenticated) {
        context.push('/login');
      } else {
        context.push(route);
      }
    }

    void handleAddressClick() {
      if (!isAuthenticated) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please login first to select delivery address'),
            duration: Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.push('/login');
      } else {
        addressesAsync.whenOrNull(
          data: (addresses) {
            if (addresses.isEmpty) {
              context.push('/address/location');
            } else {
              context.push('/address');
            }
          },
          loading: () => context.push('/address'),
          error: (_, __) => context.push('/address'),
        );
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        children: [
          Row(
            children: [
              /// 📍 ADDRESS SECTION
              Expanded(
                child: GestureDetector(
                  onTap: handleAddressClick,
                  child: _buildAddressSection(
                    context,
                    ref,
                    isAuthenticated,
                    selectedAddress,
                    addressesAsync,
                  ),
                ),
              ),

              const SizedBox(width: 10),

              /// 💰 WALLET ICON (BLINKIT STYLE)
              GestureDetector(
              onTap: () => handleNavigation('/wallet'),
              child: Stack(
              clipBehavior: Clip.none,
              children: [
              // 🔹 White background circle
              Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
              BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 6,
              offset: const Offset(0, 2),
              ),
              ],
              ),
              child: const Icon(
    Icons.account_balance_wallet_outlined,
    size: 22,
    color: Colors.black87,
    ),
    ),

    // 🔹 Green amount badge
    Positioned(
    top: -12,
    right: -10,
    child: walletAsync.when(
    data: (wallet) => Container(
    padding:
    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(
    color: Colors.green,
    borderRadius: BorderRadius.circular(10),
    ),
    child: Text(
    '₹${wallet.totalBalance.toStringAsFixed(0)}',
    style: GoogleFonts.poppins(
    fontSize: 10,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    ),
    ),
    ),
    loading: () => const SizedBox(
    width: 12,
    height: 12,
    child: CircularProgressIndicator(strokeWidth: 2),
    ),
    error: (_, __) => const SizedBox(),
    ),
    ),
    ],
    ),
    ),



    const SizedBox(width: 10),

              /// 👤 PROFILE ICON
              GestureDetector(
                onTap: () => handleNavigation('/profile'),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.black26),
                    borderRadius: BorderRadius.circular(30),
                    color: Colors.white,
                  ),
                  child: const Icon(
                    Icons.person,
                    size: 24,
                    color: Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ================= ADDRESS SECTION =================

  Widget _buildAddressSection(
      BuildContext context,
      WidgetRef ref,
      bool isAuthenticated,
      AddressType? selectedAddress,
      AsyncValue<List<AddressType>> addressesAsync,
      ) {
    Widget brandTitle = Text(
      'Quickzon',
      style: GoogleFonts.poppins(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        color: const Color(0xFF171717),
      ),
    );

    if (!isAuthenticated) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          brandTitle,
          const SizedBox(height: 2),
          Text(
            'Select Location',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Please login to select delivery address',
            style: GoogleFonts.inter(fontSize: 12),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }

    return addressesAsync.when(
      loading: () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          brandTitle,
          const SizedBox(height: 4),
          Row(
            children: const [
              SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              SizedBox(width: 8),
              Text('Loading...'),
            ],
          ),
        ],
      ),
      error: (_, __) => _emptyAddressUI(brandTitle),
      data: (addresses) {
        if (addresses.isEmpty) {
          return _emptyAddressUI(brandTitle);
        }

        AddressType displayAddress = selectedAddress ??
            addresses.firstWhere(
                  (a) => a.isDefault,
              orElse: () => addresses.first,
            );

        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (ref.read(selectedAddressProvider) == null) {
            ref
                .read(selectedAddressProvider.notifier)
                .select(displayAddress);
          }
        });

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            brandTitle,
            const SizedBox(height: 2),
            _buildAddressDisplay(
              displayAddress.label,
              displayAddress.googleLocation ??
                  _formatAddress(displayAddress),
            ),
          ],
        );
      },
    );
  }

  Widget _emptyAddressUI(Widget brandTitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        brandTitle,
        const SizedBox(height: 2),
        Row(
          children: const [
            Text(
              'Add Address',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(width: 4),
            Icon(Icons.add_circle_outline, size: 18),
          ],
        ),
        const SizedBox(height: 2),
        const Text(
          'Tap to add your delivery address',
          style: TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildAddressDisplay(String label, String address) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Text(
              'Home',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 20),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          address,
          style: const TextStyle(fontSize: 12, color: Colors.black45),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  String _formatAddress(AddressType address) {
    final parts = <String>[
      address.addressLine1,
      if (address.addressLine2?.isNotEmpty == true) address.addressLine2!,
      address.city,
      address.state,
      address.pincode,
    ];
    return parts.join(', ');
  }
}
