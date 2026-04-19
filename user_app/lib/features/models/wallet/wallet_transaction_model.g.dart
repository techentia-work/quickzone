// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_transaction_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletTransaction _$WalletTransactionFromJson(Map<String, dynamic> json) =>
    WalletTransaction(
      id: json['_id'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      source: json['source'] as String,
      description: json['description'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$WalletTransactionToJson(WalletTransaction instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'type': instance.type,
      'amount': instance.amount,
      'source': instance.source,
      'description': instance.description,
      'status': instance.status,
      'createdAt': instance.createdAt.toIso8601String(),
    };
