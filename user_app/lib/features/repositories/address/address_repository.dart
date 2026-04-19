import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/core/network/api_client.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/features/models/models.dart';

final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return AddressRepository(client);
});

class AddressRepository {
  final ApiClient _client;
  AddressRepository(this._client);

  /// ➕ Create a new address
  Future<ApiResponse<AddressType>> createAddress(Map<String, dynamic> payload) async =>
      _client.post<AddressType>('/address', data: payload, fromJson: (json) => AddressType.fromJson(json['address']),);

  /// 📋 Get all user addresses
  Future<ApiResponse<List<AddressType>>> getAllAddresses() async =>
      _client.get<List<AddressType>>('/address', fromJson: (json) => (json['addresses'] as List).map((a) => AddressType.fromJson(a)).toList(),);

  /// 🏠 Get default address
  Future<ApiResponse<AddressType>> getDefaultAddress() async =>
      _client.get<AddressType>('/address/default', fromJson: (json) => AddressType.fromJson(json['address']),);

  /// 📂 Get addresses by type (HOME, WORK, CUSTOM)
  Future<ApiResponse<List<AddressType>>> getAddressesByType(String type) async =>
      _client.get<List<AddressType>>('/address/type/$type', fromJson: (json) => (json['addresses'] as List).map((a) => AddressType.fromJson(a)).toList(),);

  /// 🔍 Get single address by ID
  Future<ApiResponse<AddressType>> getAddressById(String addressId) async =>
      _client.get<AddressType>('/address/$addressId', fromJson: (json) => AddressType.fromJson(json['address']),);

  /// ✏️ Update existing address
  Future<ApiResponse<AddressType>> updateAddress(String addressId, Map<String, dynamic> payload) async =>
      _client.patch<AddressType>('/address/$addressId', data: payload, fromJson: (json) => AddressType.fromJson(json['address']),);

  /// ⭐ Set an address as default
  Future<ApiResponse<AddressType>> setDefaultAddress(String addressId) async =>
      _client.patch<AddressType>('/address/$addressId/set-default', fromJson: (json) => AddressType.fromJson(json['address']),);

  /// ❌ Permanently delete address
  Future<ApiResponse<void>> permanentDeleteAddress(String addressId) async =>
      _client.delete<void>('/address/$addressId/permanent');
}
