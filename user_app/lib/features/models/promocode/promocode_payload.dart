import 'package:json_annotation/json_annotation.dart';

part 'promocode_payload.g.dart';

@JsonSerializable()
class ApplyPromoResponse {
  @JsonKey(name: 'appliedPromo')
  final AppliedPromo? appliedPromo;

  ApplyPromoResponse({this.appliedPromo});

  factory ApplyPromoResponse.fromJson(Map<String, dynamic> json) => _$ApplyPromoResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ApplyPromoResponseToJson(this);
}

@JsonSerializable()
class AppliedPromo {
  final String? code;
  final double? discountAmount;

  AppliedPromo({this.code, this.discountAmount});

  factory AppliedPromo.fromJson(Map<String, dynamic> json) =>
      _$AppliedPromoFromJson(json);

  Map<String, dynamic> toJson() => _$AppliedPromoToJson(this);
}