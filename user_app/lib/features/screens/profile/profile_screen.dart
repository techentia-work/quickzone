import 'package:Quickzon/features/providers/auth/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final controller = ref.read(authControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Profile'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
      ),
      body: auth.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (user) {
          if (user == null) {
            return const Center(child: Text('Not logged in'));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              /// PROFILE HEADER
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.green,
                child: Text(
                  user.fullName?.substring(0, 1).toUpperCase() ?? 'U',
                  style: const TextStyle(fontSize: 40, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                user.fullName ?? 'User',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                user.email ?? user.phone ?? '',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),

              const SizedBox(height: 32),

              /// =================== MENU ===================

              ListTile(
                leading: const Icon(Icons.shopping_bag_outlined),
                title: const Text('My Orders'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/my-orders');
                },
              ),
              
              ListTile(
                leading: const Icon(Icons.favorite_outline),
                title: const Text('Wishlist'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/wishlist');
                },
              ),

              ListTile(
                leading: const Icon(Icons.location_on_outlined),
                title: const Text('My Addresses'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/address');
                },
              ),

              ListTile(
                leading: const Icon(Icons.privacy_tip_outlined),
                title: const Text('Privacy Policy'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                 context.push('/privacy-policy');
                },
              ),

              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('About Us'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/about-us');
                },
              ),
              ListTile(
                leading: const Icon(Icons.assignment_return_outlined),
                title: const Text('Return Policy'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/return-policy'),
              ),

              ListTile(
                leading: const Icon(Icons.description_outlined),
                title: const Text('Terms & Conditions'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/terms-conditions'),
              ),

              ListTile(
                leading: const Icon(Icons.help_outline),
                title: const Text('Help & Support'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/help-support'),
              ),

              const Divider(height: 32),

              /// LOGOUT
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text(
                  'Logout',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () async {
                  await controller.logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
