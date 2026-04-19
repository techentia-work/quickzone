import 'package:Quickzon/features/models/wallet/wallet_transaction_model.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class WalletTxnTile extends StatelessWidget {
  final WalletTransaction transaction;

  const WalletTxnTile({
    super.key,
    required this.transaction,
  });

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.type == "CREDIT";
    final theme = Theme.of(context);

    final dateText = DateFormat('dd MMM yyyy, hh:mm a')
        .format(transaction.createdAt.toLocal());

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          /// ICON
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isCredit
                  ? Colors.green.withOpacity(0.12)
                  : Colors.red.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCredit ? Icons.arrow_downward : Icons.arrow_upward,
              size: 20,
              color: isCredit ? Colors.green : Colors.red,
            ),
          ),

          const SizedBox(width: 12),

          /// DETAILS
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction.description?.isNotEmpty == true
                      ? transaction.description!
                      : transaction.source,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  dateText,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),

          /// AMOUNT
          Text(
            "${isCredit ? '+' : '-'}₹${transaction.amount.toStringAsFixed(0)}",
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isCredit ? Colors.green : Colors.red,
            ),
          ),
        ],
      ),
    );
  }
}
