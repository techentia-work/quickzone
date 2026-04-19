import 'package:json_annotation/json_annotation.dart';

part 'wallet_transaction_model.g.dart';

@JsonSerializable()
class WalletTransaction {
  @JsonKey(name: '_id')
  final String id;

  final String type; // CREDIT | DEBIT
  final double amount;
  final String source; // WALLET / ORDER / PROMO
  final String? description;
  final String status; // SUCCESS / FAILED
  final DateTime createdAt;

  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.source,
    this.description,
    required this.status,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) =>
      _$WalletTransactionFromJson(json);

  Map<String, dynamic> toJson() => _$WalletTransactionToJson(this);
}
