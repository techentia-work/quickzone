import 'package:flutter/material.dart';
import '../../../models/wallet/wallet_model.dart';

class WalletBalanceCard extends StatelessWidget {
  final WalletModel wallet;
  const WalletBalanceCard({super.key, required this.wallet});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xff16a34a), Color(0xff15803d)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Available Balance",
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Text(
            "₹${wallet.totalBalance.toStringAsFixed(0)}",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _row("Wallet", wallet.balance),
          _row("Promo", wallet.promoCash),
        ],
      ),
    );
  }

  Widget _row(String label, double value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70)),
        Text("₹${value.toStringAsFixed(0)}",
            style: const TextStyle(color: Colors.white)),
      ],
    );
  }
}
