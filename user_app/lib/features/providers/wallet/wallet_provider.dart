import 'package:Quickzon/features/models/wallet/wallet_transaction_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Quickzon/core/network/dio_client.dart';
import '../../repositories/wallet/wallet_repository.dart';
import '../../models/wallet/wallet_model.dart';

/// 🔹 Repository Provider
final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  final dio = ref.read(dioProvider);
  return WalletRepository(dio);
});

/// 🔹 Wallet Provider
final walletProvider = FutureProvider<WalletModel>((ref) async {
  final repo = ref.read(walletRepositoryProvider);
  return repo.getWallet();
});

/// 🔹 Wallet Transactions Provider (✅ WALLET DEPENDENT)
final walletTransactionsProvider =
FutureProvider<List<WalletTransaction>>((ref) async {
  final repo = ref.read(walletRepositoryProvider);

  // 🔥 IMPORTANT: pehle wallet lao
  final wallet = await ref.watch(walletProvider.future);

  // 🔥 phir walletId se transactions lao
  return repo.getWalletTransactions(wallet.id);
});
