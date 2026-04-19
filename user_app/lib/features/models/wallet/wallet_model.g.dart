// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletModel _$WalletModelFromJson(Map<String, dynamic> json) => WalletModel(
  id: json['_id'] as String,
  ownerId: json['ownerId'] as String,
  ownerModel: json['ownerModel'] as String,
  ownerName: json['ownerName'] as String?,
  balance: (json['balance'] as num).toDouble(),
  promoCash: (json['promoCash'] as num).toDouble(),
  promoCashExpiresAt: json['promoCashExpiresAt'] == null
      ? null
      : DateTime.parse(json['promoCashExpiresAt'] as String),
  currency: json['currency'] as String,
  isActive: json['isActive'] as bool,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$WalletModelToJson(WalletModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'ownerId': instance.ownerId,
      'ownerModel': instance.ownerModel,
      'ownerName': instance.ownerName,
      'balance': instance.balance,
      'promoCash': instance.promoCash,
      'promoCashExpiresAt': instance.promoCashExpiresAt?.toIso8601String(),
      'currency': instance.currency,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
