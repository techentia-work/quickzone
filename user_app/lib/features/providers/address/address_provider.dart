import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/features/models/address/address_model.dart';
import 'package:Quickzon/features/repositories/address/address_repository.dart';
import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:Quickzon/core/network/api_response.dart';

/// Controller for managing the list of addresses
class AddressController extends AsyncNotifier<List<AddressType>> {
  @override
  Future<List<AddressType>> build() async {
    final authState = ref.watch(authControllerProvider);

    if (authState.hasValue && authState.value == null) {
      return [];
    }

    if (authState.hasValue && authState.value != null) {
      return await _fetchAddresses();
    }

    return [];
  }

  Future<List<AddressType>> _fetchAddresses() async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(addressRepositoryProvider);
      final result = await repo.getAllAddresses();

      if (result.success && result.data != null) {
        final addresses = result.data!;
        state = AsyncData(addresses);

        // Auto-select default address (only if none selected yet)
        final selectedNotifier = ref.read(selectedAddressProvider.notifier);
        if (ref.read(selectedAddressProvider) == null && addresses.isNotEmpty) {
          final defaultAddress = addresses.firstWhere(
                (a) => a.isDefault,
            orElse: () => addresses.first,
          );
          selectedNotifier.select(defaultAddress);
        }

        return addresses;
      }

      state = const AsyncData([]);
      return [];
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return [];
    }
  }


  /// ➕ Add a new address and return API response
  Future<ApiResponse<AddressType>> addAddress(Map<String, dynamic> payload) async {
    try {
      final repo = ref.read(addressRepositoryProvider);
      final response = await repo.createAddress(payload);

      if (response.success) {
        await _fetchAddresses();
      }

      return response;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return ApiResponse(success: false, message: 'Failed to add address', error: error);
    }
  }

  /// ✏️ Update existing address and return API response
  Future<ApiResponse<AddressType>> updateAddress(String id, Map<String, dynamic> payload) async {
    try {
      final repo = ref.read(addressRepositoryProvider);
      final response = await repo.updateAddress(id, payload);

      if (response.success) {
        await _fetchAddresses();
      }

      return response;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return ApiResponse(success: false, message: 'Failed to update address', error: error);
    }
  }

  /// ❌ Delete address and return API response
  Future<ApiResponse<void>> deleteAddress(String id) async {
    try {
      final repo = ref.read(addressRepositoryProvider);
      final response = await repo.permanentDeleteAddress(id);

      if (response.success) {
        await _fetchAddresses();
      }

      return response;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return ApiResponse(success: false, message: 'Failed to delete address', error: error);
    }
  }

  /// ⭐ Set an address as default and return API response
  Future<ApiResponse<AddressType>> setDefaultAddress(String id) async {
    try {
      final repo = ref.read(addressRepositoryProvider);
      final response = await repo.setDefaultAddress(id);

      if (response.success) {
        final selected = ref.read(selectedAddressProvider);
        if (selected != null && selected.id == id) {
          ref.read(selectedAddressProvider.notifier).clear();
        }

        await _fetchAddresses();
      }

      return response;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return ApiResponse(success: false, message: 'Failed to set default address', error: error);
    }
  }

  Future<void> _handleUnauthorized() async {
    final authNotifier = ref.read(authControllerProvider.notifier);
    await authNotifier.logout();
    state = const AsyncData([]);
  }
}

/// Provider for the list of addresses
final addressControllerProvider =
AsyncNotifierProvider<AddressController, List<AddressType>>(
  AddressController.new,
);

/// Modern replacement for StateProvider: manages selected address
class SelectedAddressNotifier extends Notifier<AddressType?> {
  @override
  AddressType? build() {
    return null; // Initial: no address selected
  }

  void select(AddressType? address) {
    state = address;
  }

  void clear() {
    state = null;
  }
}

/// Provider for the currently selected delivery address
final selectedAddressProvider = NotifierProvider<SelectedAddressNotifier, AddressType?>(SelectedAddressNotifier.new);