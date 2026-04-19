import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/wallet/wallet_provider.dart';
import '../../models/wallet/wallet_model.dart';
import 'widgets/wallet_balance_card.dart';
import 'widgets/promo_cash_card.dart';
import 'widgets/wallet_txn_tile.dart';

class WalletPage extends ConsumerWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);
    final txnAsync = ref.watch(walletTransactionsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("My Wallet"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/');
            }
          },
        ),
      ),
      body: walletAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (wallet) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(walletProvider);
              ref.invalidate(walletTransactionsProvider);
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// 🔥 BALANCE CARDS
                  Row(
                    children: [
                      Expanded(
                        child: WalletBalanceCard(wallet: wallet),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: PromoCashCard(wallet: wallet),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  /// ➕ ADD MONEY
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.add),
                    label: const Text("Add Money"),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content:
                          Text("Add money via Razorpay (coming next)"),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 28),

                  /// 🧾 TRANSACTIONS
                  Text(
                    "Recent Transactions",
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),

                  txnAsync.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                    error: (e, _) => Text(e.toString()),
                    data: (transactions) {
                      if (transactions.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Center(
                            child: Text(
                              "No transactions yet",
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        );
                      }

                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: transactions.length,
                        separatorBuilder: (_, __) =>
                        const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          return WalletTxnTile(
                            transaction: transactions[index],
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
