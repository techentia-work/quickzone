import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AboutUsPage extends StatelessWidget {
  const AboutUsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('About Us'),
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
              'Quickzon is Agra’s very own grocery delivery application, designed '
                  'to bring convenience, speed, and freshness right to your doorstep. '
                  'Launched in 2025, Quickzon is the digital face of Shri Balaji Mart, '
                  'a trusted retail brand serving Agra since 2022.',
            ),

            _section(
              title: 'Who We Are',
              content:
              'With over three years of retail experience, we understand what '
                  'customers want: fresh products, fair prices, and reliable service. '
                  'Quickzon combines the trust of a local grocery store with modern '
                  'technology to deliver groceries and essentials with just a few taps.',
            ),

            _section(
              title: 'Our Journey',
              content:
              'The journey began in 2022 with Shri Balaji Mart, a local grocery store '
                  'that became a preferred choice for families in Agra. In 2025, the '
                  'growing demand for doorstep delivery inspired us to create Quickzon.',
            ),

            _section(
              title: 'Our Mission',
              content:
              'To make grocery shopping easy, quick, and reliable while supporting '
                  'local suppliers and delivering the best value to our customers.',
            ),

            _section(
              title: 'Our Vision',
              content:
              'To become the most trusted and preferred grocery delivery brand in '
                  'Agra and beyond, setting new standards in speed, freshness, and '
                  'customer satisfaction.',
            ),

            _bulletSection(
              title: 'What We Offer',
              items: const [
                'Fresh Fruits & Vegetables – Handpicked daily',
                'Dairy & Bakery Products',
                'Packaged Food & Snacks',
                'Beverages',
                'Household Essentials',
                'Personal Care Products',
              ],
            ),

            _bulletSection(
              title: 'Why Choose Quickzon?',
              items: const [
                'Local Trust backed by Shri Balaji Mart',
                'Fast Delivery',
                'Easy to Use App',
                'Affordable Prices',
                'Secure Payments (COD & Online)',
                'Friendly Customer Support',
              ],
            ),

            _section(
              title: 'Technology Meets Tradition',
              content:
              'Quickzon blends traditional customer service with modern technology. '
                  'Our app is lightweight, fast, and designed for ease of use.',
            ),

            _section(
              title: 'Our Commitment to Quality',
              content:
              'We source products from reliable local suppliers and inspect every '
                  'order before delivery to ensure freshness and safety.',
            ),

            _section(
              title: 'Supporting Local Economy',
              content:
              'As an Agra-based startup, Quickzon supports local farmers, vendors, '
                  'and suppliers—strengthening the local economy.',
            ),

            _section(
              title: 'Customer-Centric Approach',
              content:
              'Our customers are at the heart of everything we do. We value feedback '
                  'and continuously improve our services.',
            ),

            _bulletSection(
              title: 'Future Plans',
              items: const [
                'Instant delivery for urgent needs',
                'Subscription plans',
                'Loyalty programs',
                'Expansion to nearby cities',
              ],
            ),

            _bulletSection(
              title: 'Our Values',
              items: const [
                'Trust',
                'Quality',
                'Speed',
                'Innovation',
                'Community',
              ],
            ),

            _section(
              title: 'Join the Quickzon Family',
              content:
              'Quickzon is more than an app; it’s a promise – to deliver happiness '
                  'to your doorstep. Download the Quickzon app and experience the '
                  'future of grocery shopping in Agra.',
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

  static Widget _bulletSection({
    required String title,
    required List<String> items,
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
                    style: const TextStyle(
                      fontSize: 14,
                      height: 1.5,
                    ),
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
