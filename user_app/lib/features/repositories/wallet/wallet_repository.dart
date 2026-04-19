import 'package:Quickzon/features/models/wallet/wallet_transaction_model.dart';
import 'package:dio/dio.dart';
import '../../models/wallet/wallet_model.dart';

class WalletRepository {
  final Dio dio;
  WalletRepository(this.dio);

  /// 🔹 Get Wallet
  Future<WalletModel> getWallet() async {
    final res = await dio.get("/wallet");
    return WalletModel.fromJson(res.data["data"]);
  }

  /// 🔹 Get Wallet Transactions (✅ CORRECT ROUTE)
  Future<List<WalletTransaction>> getWalletTransactions(String walletId) async {
    final res = await dio.get("/transaction/wallet/$walletId");

    final List list = res.data["data"]["transactions"]; // ✅ FIX HERE

    return list
        .map((e) => WalletTransaction.fromJson(e))
        .toList();
  }
  /// 🔹 Pay using Wallet
  Future<void> payUsingWallet(double amount) async {
    await dio.post(
      "/payment/wallet/pay",
      data: {
        "amount": amount,
      },
    );
  }
}
