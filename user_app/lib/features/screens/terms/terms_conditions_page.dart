import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TermsConditionsPage extends StatelessWidget {
  const TermsConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms & Conditions'),
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
            Center(
              child: Column(
                children: [

                  Text(
                    'Effective Date: 01 January 2025',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.green[700],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            _paragraph(
              'Welcome to Quickzon, operated by Shri Balaji Mart. By downloading, '
                  'installing, or using our mobile application or website, you agree '
                  'to these Terms & Conditions. Please read them carefully.',
            ),

            _section(
              '1. Acceptance of Terms',
              'By accessing or using Quickzon, you agree to comply with and be bound '
                  'by these Terms. If you do not agree, you should not use our services.',
            ),

            _section(
              '2. Eligibility',
              'You must be at least 18 years old to place orders through Quickzon. '
                  'Users under 18 may use the app only under parental supervision.',
            ),

            _section(
              '3. Services Provided',
              'Quickzon is a grocery delivery platform that allows users to order '
                  'groceries, daily essentials, and other listed products for delivery '
                  'in Agra and selected service areas.',
            ),

            _bulletSection(
              '4. Account Registration',
              const [
                'Register with accurate personal and contact details.',
                'Maintain confidentiality of your account credentials.',
                'Notify us immediately in case of unauthorized access.',
              ],
            ),

            _bulletSection(
              '5. Orders & Payments',
              const [
                'All orders are subject to availability and confirmation.',
                'Prices are displayed in INR and include applicable taxes.',
                'Payment methods include COD, UPI, debit/credit cards.',
                'Orders may be cancelled if pricing errors occur.',
              ],
            ),

            _bulletSection(
              '6. Delivery',
              const [
                'Delivery timelines are estimates and may vary.',
                'Delivery charges may apply and will be shown at checkout.',
                'Someone must be available to receive the order.',
              ],
            ),

            _bulletSection(
              '7. Cancellations & Refunds',
              const [
                'Orders can be cancelled before dispatch.',
                'Perishable items cannot be returned unless damaged or expired.',
                'Approved refunds are processed within 7 working days.',
              ],
            ),

            _bulletSection(
              '8. Prohibited Use',
              const [
                'Using the app for illegal purposes.',
                'Attempting to hack or disrupt the platform.',
                'Placing fake or fraudulent orders.',
              ],
            ),

            _bulletSection(
              '9. Limitation of Liability',
              const [
                'Delays or non-delivery due to external factors.',
                'Indirect or incidental damages.',
                'Issues caused by third-party vendors.',
              ],
            ),

            _section(
              '10. Intellectual Property',
              'All content, logos, and designs are the property of Shri Balaji Mart '
                  'and protected by applicable laws.',
            ),

            _section(
              '11. Privacy Policy',
              'Your personal data is handled according to our Privacy Policy, '
                  'available within the Quickzon app.',
            ),

            _section(
              '12. Changes to Terms',
              'We may update these Terms from time to time. Continued use of the '
                  'app means acceptance of updated Terms.',
            ),

            _section(
              '13. Contact Us',
              'For questions or concerns regarding these Terms, contact us at:',
            ),

            const SizedBox(height: 8),
            Text(
              '📧 support@quickzon.in',
              style: textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7D32),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  static Widget _section(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
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

  static Widget _bulletSection(String title, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(height: 8),
        ...items.map(
              (e) => Padding(
            padding: const EdgeInsets.only(left: 8, bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('• ', style: TextStyle(fontSize: 18)),
                Expanded(
                  child: Text(
                    e,
                    style: const TextStyle(fontSize: 14, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
