import 'package:json_annotation/json_annotation.dart';

part 'wallet_model.g.dart';

@JsonSerializable()
class WalletModel {
  @JsonKey(name: '_id')
  final String id;

  final String ownerId;
  final String ownerModel;
  final String? ownerName;

  final double balance;
  final double promoCash;

  final DateTime? promoCashExpiresAt;

  final String currency;
  final bool isActive;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  WalletModel({
    required this.id,
    required this.ownerId,
    required this.ownerModel,
    this.ownerName,
    required this.balance,
    required this.promoCash,
    this.promoCashExpiresAt,
    required this.currency,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  /// 🔥 TOTAL USABLE AMOUNT (Blinkit style)
  double get totalBalance => balance + promoCash;

  factory WalletModel.fromJson(Map<String, dynamic> json) =>
      _$WalletModelFromJson(json);

  Map<String, dynamic> toJson() => _$WalletModelToJson(this);
}
