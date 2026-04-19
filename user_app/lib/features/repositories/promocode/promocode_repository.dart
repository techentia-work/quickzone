import 'package:Quickzon/features/models/promocode/promocode_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/core/network/api_client.dart';
import 'package:Quickzon/core/network/api_response.dart';
import 'package:Quickzon/features/models/models.dart';

final promoRepositoryProvider = Provider<PromoRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return PromoRepository(client);
});

class PromoRepository {
  final ApiClient _client;
  PromoRepository(this._client);

  Future<ApiResponse<List<PromoCodeType>>> fetchPromos() async =>
      _client.get<List<PromoCodeType>>('/promocode', fromJson: (json) => (json["promocodes"] as List).map((e)=>PromoCodeType.fromJson(e)).toList());

  /// 🎯 Apply promo code to cart/order
 Future<ApiResponse<ApplyPromoResponse>> applyPromo(String code) async =>
      _client.post<ApplyPromoResponse>('/promocode/apply', data: {'code': code}, fromJson: (json) => ApplyPromoResponse.fromJson(json['cart']),);

  /// 🧹 Remove applied promo code
  Future<ApiResponse<void>> removePromo() async =>
      _client.post<void>('/promocode/remove');

  /// ✅ Validate a promo code before applying
  Future<ApiResponse<PromoCodeType>> validatePromo(String code) async =>
      _client.post<PromoCodeType>('/promocode/validate', data: {'code': code}, fromJson: (json) => PromoCodeType.fromJson(json['promo']),);
}
