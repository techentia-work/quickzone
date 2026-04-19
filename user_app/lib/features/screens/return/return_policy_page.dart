import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ReturnPolicyPage extends StatelessWidget {
  const ReturnPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Return Policy'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            _paragraph(
              'At Quickzon, we are committed to providing our customers with fresh, '
                  'high-quality groceries and ensuring complete satisfaction with every '
                  'purchase. We understand that sometimes situations may arise where you '
                  'need to return or exchange an item.',
            ),

            _section(
              title: 'Eligibility for Returns',
              content:
              'Returns are accepted if the product delivered is damaged, expired, '
                  'defective, or incorrect compared to your order. Customers must '
                  'inform us within 24 hours of delivery through our customer support '
                  'channels, along with relevant order details and clear images as proof.',
            ),

            _section(
              title: 'Return Conditions',
              content:
              'Products must be returned in their original packaging and condition. '
                  'Perishable items must be reported immediately to maintain quality '
                  'standards. Once approved, Quickzon will arrange a replacement or '
                  'initiate a refund as per this policy.',
            ),

            _section(
              title: 'Refund Process',
              content:
              'Refunds, when applicable, will be processed to the original payment '
                  'method within a reasonable time frame. Items that are opened, used, '
                  'or not in original condition may not be eligible for return.',
            ),

            _section(
              title: 'Non-Returnable Items',
              content:
              'Certain products such as fresh dairy, meat, and bakery items may be '
                  'non-returnable unless they are damaged or expired at the time of '
                  'delivery.',
            ),

            _section(
              title: 'Policy Updates',
              content:
              'Quickzon reserves the right to update or modify this Return Policy '
                  'at any time. Any changes will be reflected in the latest version '
                  'available on our platform.',
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  static Widget _section({
    required String title,
    required String content,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          content,
          style: const TextStyle(
            fontSize: 14,
            height: 1.6,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  static Widget _paragraph(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        height: 1.6,
        color: Colors.black87,
      ),
    );
  }
}
