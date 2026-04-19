// lib/features/screens/address/address_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';

class AddressSelectionScreen extends ConsumerStatefulWidget {
  const AddressSelectionScreen({super.key});

  @override
  ConsumerState<AddressSelectionScreen> createState() =>
      _AddressSelectionScreenState();
}

class _AddressSelectionScreenState
    extends ConsumerState<AddressSelectionScreen> {
  String? selectedAddressId;

  @override
  void initState() {
    super.initState();
    // Initialize with currently selected address
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final currentSelection = ref.read(selectedAddressProvider);
      if (currentSelection != null) {
        setState(() {
          selectedAddressId = currentSelection.id;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final addressesAsync = ref.watch(addressControllerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Select an Address',
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF212121),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(
                      Icons.close,
                      color: Color(0xFF212121),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: addressesAsync.when(
                data: (addresses) {
                  if (addresses.isEmpty) {
                    return _buildEmptyState(context);
                  }

                  // Set default selection if none selected
                  if (selectedAddressId == null) {
                    final defaultAddr = addresses.firstWhere(
                          (a) => a.isDefault,
                      orElse: () => addresses.first,
                    );
                    selectedAddressId = defaultAddr.id;
                  }

                  return Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: addresses.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final address = addresses[index];
                            return _AddressCard(
                              address: address,
                              isSelected: selectedAddressId == address.id,
                              onSelect: () {
                                setState(() => selectedAddressId = address.id);
                              },
                              onEdit: () {
                                context.push(
                                  '/address/create',
                                  extra: {'addressId': address.id},
                                );
                              },
                              onDelete: () => _confirmDelete(context, address.id!),
                            );
                          },
                        ),
                      ),

                      // Add New Address Button
                      Container(
                        padding: const EdgeInsets.all(16),
                        color: Colors.white,
                        child: SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: () => context.push('/address/location'),
                            icon: const Icon(Icons.add),
                            label: Text(
                              'Add New Address',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF5AC268),
                              side: const BorderSide(
                                color: Color(0xFF5AC268),
                                width: 1.5,
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Deliver Here Button
                      Container(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        color: Colors.white,
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: selectedAddressId != null
                                ? () => _deliverToAddress(addresses)
                                : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF5AC268),
                              disabledBackgroundColor: const Color(0xFFE0E0E0),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              'Deliver Here',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF5AC268),
                  ),
                ),
                error: (error, stack) => _buildErrorState(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _deliverToAddress(List<AddressType> addresses) {
    if (selectedAddressId == null) return;

    // Find the selected address
    final selectedAddress = addresses.firstWhere(
          (addr) => addr.id == selectedAddressId,
      orElse: () => addresses.first,
    );

    // Update the global selected address
    ref.read(selectedAddressProvider.notifier).select(selectedAddress);

    // Show success message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Delivering to ${selectedAddress.label}'),
        backgroundColor: const Color(0xFF5AC268),
        duration: const Duration(seconds: 2),
      ),
    );

    // Pop the screen
    context.pop();
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.location_off_outlined,
                size: 64,
                color: Colors.grey[400],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Addresses Yet',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF212121),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Add a delivery address to get your\norders delivered to your doorstep',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: const Color(0xFF757575),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => context.push('/address/location'),
              icon: const Icon(Icons.add),
              label: Text(
                'Add Your First Address',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to Load Addresses',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF212121),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Something went wrong while loading your addresses',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: const Color(0xFF757575),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.refresh(addressControllerProvider),
              icon: const Icon(Icons.refresh),
              label: Text(
                'Try Again',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5AC268),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Delete Address?',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'Are you sure you want to delete this address? This action cannot be undone.',
          style: GoogleFonts.inter(
            fontSize: 14,
            color: const Color(0xFF757575),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF757575),
              ),
            ),
          ),
          TextButton(
            onPressed: () async {
              await ref.read(addressControllerProvider.notifier).deleteAddress(id);
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Address deleted successfully'),
                    backgroundColor: Color(0xFF5AC268),
                  ),
                );
              }
            },
            child: Text(
              'Delete',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                color: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  final AddressType address;
  final bool isSelected;
  final VoidCallback onSelect;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _AddressCard({
    required this.address,
    required this.isSelected,
    required this.onSelect,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelect,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF5AC268)
                : const Color(0xFFE0E0E0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
            BoxShadow(
              color: const Color(0xFF5AC268).withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                // Type Badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getIconForType(address.type.name),
                        size: 14,
                        color: const Color(0xFF5AC268),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        address.label,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF5AC268),
                        ),
                      ),
                    ],
                  ),
                ),

                // Default Badge
                if (address.isDefault) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Default',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Colors.orange[700],
                      ),
                    ),
                  ),
                ],

                const Spacer(),

                // Selection Indicator
                if (isSelected)
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: Color(0xFF5AC268),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 12),

            // Name
            Text(
              address.fullName,
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF212121),
              ),
            ),

            const SizedBox(height: 6),

            // Address Lines - Prioritize Google Location
            if (address.googleLocation != null &&
                address.googleLocation!.isNotEmpty)
              Text(
                address.googleLocation!,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF424242),
                  height: 1.4,
                ),
              )
            else
              Text(
                '${address.addressLine1}${address.addressLine2 != null
                    ? ', ${address.addressLine2}'
                    : ''}',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF424242),
                  height: 1.4,
                ),
              ),

            // Landmark
            if (address.landmark != null) ...[
              const SizedBox(height: 2),
              Text(
                'Near ${address.landmark}',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF757575),
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],

            const SizedBox(height: 2),

            // City, State, Pincode
            Text(
              '${address.city}, ${address.state} - ${address.pincode}',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: const Color(0xFF424242),
              ),
            ),

            const SizedBox(height: 6),

            // Phone
            Row(
              children: [
                const Icon(
                  Icons.phone_outlined,
                  size: 14,
                  color: Color(0xFF757575),
                ),
                const SizedBox(width: 4),
                Text(
                  address.phone,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF424242),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 8),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_outlined, size: 16),
                    label: Text(
                      'Edit',
                      style: GoogleFonts.inter(fontSize: 13),
                    ),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF5AC268),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 24,
                  color: const Color(0xFFE0E0E0),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: onDelete,
                    icon: const Icon(Icons.delete_outline, size: 16),
                    label: Text(
                      'Delete',
                      style: GoogleFonts.inter(fontSize: 13),
                    ),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.red[600],
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type.toUpperCase()) {
      case 'HOME':
        return Icons.home_outlined;
      case 'WORK':
        return Icons.work_outline;
      default:
        return Icons.location_on_outlined;
    }
  }
}