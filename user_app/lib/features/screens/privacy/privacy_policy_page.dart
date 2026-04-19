import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
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
              'Quickzon, operated by Shri Balaji Mart, is committed to safeguarding '
                  'the privacy of our customers and ensuring the secure handling of their '
                  'personal information. This Privacy Policy explains how we collect, use, '
                  'disclose, and protect your data when you use our grocery delivery '
                  'application and related services. By using the Quickzon app, you agree '
                  'to the practices described in this policy.',
            ),

            _section(
              title: 'Information We Collect',
              content:
              'We collect personal information such as your name, contact number, '
                  'email address, delivery address, and payment details when you create '
                  'an account or place an order. We may also collect non-personal data '
                  'such as device type, operating system, IP address, and usage patterns '
                  'to improve our services.',
            ),

            _section(
              title: 'How We Use Your Information',
              content:
              'Your information is used to process orders, deliver products, '
                  'communicate updates, provide customer support, and improve our '
                  'platform. We never sell or rent your personal data. Information may '
                  'be shared only with trusted service providers such as payment '
                  'gateways and delivery partners under strict confidentiality.',
            ),

            _section(
              title: 'Data Security',
              content:
              'All payment transactions are encrypted and processed through secure '
                  'gateways. We use reasonable security measures to protect your data, '
                  'but no method of transmission over the internet is completely secure.',
            ),

            _section(
              title: 'Cookies & Tracking Technologies',
              content:
              'Quickzon may use cookies and similar technologies to enhance user '
                  'experience, analyze trends, and improve app functionality. Disabling '
                  'cookies may affect certain features of the application.',
            ),

            _section(
              title: 'Data Disclosure',
              content:
              'We may disclose personal information if required by law or to protect '
                  'the rights and safety of Quickzon and its users. In case of business '
                  'transfers, user data may be transferred with the same privacy '
                  'protections.',
            ),

            _section(
              title: 'Age Restriction',
              content:
              'Our services are intended for users above 18 years of age. We do not '
                  'knowingly collect personal information from minors.',
            ),

            _section(
              title: 'Policy Updates',
              content:
              'This Privacy Policy may be updated from time to time. Continued use '
                  'of Quickzon after updates means you accept the revised policy.',
            ),

            _section(
              title: 'Contact Us',
              content:
              'If you have questions or concerns regarding this Privacy Policy, '
                  'please contact us through the support options available in the '
                  'Quickzon app.',
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
