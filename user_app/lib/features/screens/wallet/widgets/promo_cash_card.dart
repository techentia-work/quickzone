import 'package:flutter/material.dart';
import '../../../models/wallet/wallet_model.dart';

class PromoCashCard extends StatelessWidget {
  final WalletModel wallet;
  const PromoCashCard({super.key, required this.wallet});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160, // 🔥 SAME HEIGHT
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xfffde047), Color(0xfffacc15)],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Promo Cash",
              style: TextStyle(color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Text(
              "₹${wallet.promoCash.toStringAsFixed(0)}",
              style: const TextStyle(
                fontSize: 28, // 🔥 SAME font size
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(), // 🔥 SAME spacing logic
            Text(
              "Expires on ${wallet.promoCashExpiresAt?.toLocal().toString().split(' ').first ?? '-'}",
              style: const TextStyle(
                fontSize: 12,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

