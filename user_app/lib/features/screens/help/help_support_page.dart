import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpSupportPage extends StatelessWidget {
  const HelpSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _paragraph(
              'We’re here to help! If you have any questions, issues, or need '
              'assistance with your orders, payments, or app usage, please find '
              'the support options below.',
            ),

            const SizedBox(height: 24),

            // 🔥 MOVED CONTACT US HERE
            Text(
              'Contact Us',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7D32),
              ),
            ),
            const SizedBox(height: 12),

            _contactTile(
              icon: Icons.email_outlined,
              title: 'Email Support',
              subtitle: 'quickzonteam@gmail.com',
              onTap: () => _launch('mailto:quickzonteam@gmail.com'),
            ),

            _contactTile(
              icon: Icons.phone_outlined,
              title: 'Customer Care',
              subtitle: '+91-8810560599',
              onTap: () => _launch('tel:8810560599'),
            ),

            _contactTile(
              icon: Icons.access_time,
              title: 'Support Hours',
              subtitle: '9:00 AM – 9:00 PM (All Days)',
            ),

            const SizedBox(height: 24),

            const SizedBox(height: 16),

            _section(
              title: 'Common Issues',
              content:
              'You can reach out to us for help with order tracking, payment '
              'issues, refunds, cancellations, account problems, or any '
              'technical difficulties while using the Quickzon app.',
            ),

            _section(
              title: 'Order Related Help',
              content:
              'For order-related concerns such as delayed delivery, missing '
              'items, damaged products, or incorrect orders, please contact '
              'our support team within 24 hours of delivery.',
            ),

            _section(
              title: 'Payment & Refund Support',
              content:
              'If your payment is stuck, failed, or a refund is pending, '
              'our team will assist you after verifying the transaction details.',
            ),

            _section(
              title: 'Account & App Support',
              content:
              'Facing login issues, OTP problems, or app crashes? Let us know '
              'your registered phone number or email so we can help you faster.',
            ),

            const SizedBox(height: 24),

            _section(
              title: 'Feedback & Suggestions',
              content:
              'We value your feedback! Share your suggestions to help us '
              'improve Quickzon and provide you with a better experience.',
            ),

            _section(
              title: 'Response Time',
              content:
              'Our support team usually responds within 24 hours. During '
              'peak times or holidays, responses may take slightly longer.',
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Future<void> _launch(String urlString) async {
    final uri = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        // Fallback or external launch forced
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
    }
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

  static Widget _contactTile({
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFF2E7D32).withOpacity(0.1),
        child: Icon(icon, color: const Color(0xFF2E7D32)),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
      subtitle: Text(subtitle),
    );
  }
}
