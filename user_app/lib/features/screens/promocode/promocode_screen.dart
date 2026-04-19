// lib/features/screens/promocode/promocode_page.dart
import 'package:Quickzon/core/utils/enums/promocode_enum.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/features/models/models.dart';
import 'package:Quickzon/features/widgets/widgets.dart';
import 'package:Quickzon/features/providers/providers.dart';

class PromoCodeScreen extends ConsumerStatefulWidget {
  const PromoCodeScreen({super.key});

  @override
  ConsumerState<PromoCodeScreen> createState() => _PromoCodeScreenState();
}

class _PromoCodeScreenState extends ConsumerState<PromoCodeScreen> {
  final _codeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isApplying = false;
  bool _isLoadingPromos = true;
  List<PromoCodeType> _availablePromos = [];

  @override
  void initState() {
    super.initState();
    _loadPromos();
  }

  Future<void> _loadPromos() async {
    setState(() => _isLoadingPromos = true);
    try {
      final promos = await ref.read(promoControllerProvider.notifier).fetchPromos();
      if (mounted) {
        setState(() {
          _availablePromos = promos;
          _isLoadingPromos = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingPromos = false);
      }
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _applyPromoCode() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isApplying = true);
    final code = _codeController.text.trim().toUpperCase();

    try {
      final resultMessage = await ref.read(promoControllerProvider.notifier).applyPromo(code);

      if (mounted) {
        if (resultMessage == null) {
          // Success - show snackbar and pop
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Promo code $code applied successfully!'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
          context.pop();
        } else {
          // Show error message
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(resultMessage),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  Future<void> _applyQuickPromo(PromoCodeType promo) async {
    setState(() => _isApplying = true);
    try {
      final resultMessage = await ref.read(promoControllerProvider.notifier).applyPromo(promo.code);

      if (mounted) {
        if (resultMessage == null) {
          // Success - show snackbar and pop
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Promo code ${promo.code} applied successfully!'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
          context.pop();
        } else {
          // Show error message
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(resultMessage),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  Future<void> _removePromo() async {
    setState(() => _isApplying = true);
    try {
      await ref.read(promoControllerProvider.notifier).removePromo();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Promo removed successfully'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    final cartAsync = ref.watch(cartControllerProvider);
    final currentPromoCode = cartAsync.value?.appliedPromo?.code?.toUpperCase();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coupons'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // 🏷️ Promo Code Input
          Container(
            color: colorScheme.surface,
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _codeController,
                      hintText: 'Enter Coupon Code',
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter a coupon code';
                        }
                        return null;
                      },
                      enabled: !_isApplying,
                      inputFormatters: [
                        TextInputFormatter.withFunction(
                              (oldValue, newValue) =>
                              newValue.copyWith(text: newValue.text.toUpperCase()),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _isApplying ? null : _applyPromoCode,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isApplying
                        ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                        : const Text(
                      'Apply',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ✅ Current Applied Promo
          if (currentPromoCode != null && currentPromoCode.isNotEmpty)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: colorScheme.primary),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: colorScheme.primary, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Applied: $currentPromoCode',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: colorScheme.primary,
                          ),
                        ),
                        if (cartAsync.value?.appliedPromo?.discountAmount != null)
                          Text(
                            'You saved ₹${cartAsync.value!.appliedPromo!.discountAmount!.toStringAsFixed(0)}',
                            style: textTheme.bodySmall?.copyWith(
                              color: colorScheme.primary,
                            ),
                          ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _isApplying ? null : _removePromo,
                    child: Text(
                      'Remove',
                      style: TextStyle(color: colorScheme.error),
                    ),
                  ),
                ],
              ),
            ),

          // 🧾 Available Promos
          Expanded(
            child: _isLoadingPromos
                ? const Center(child: CircularProgressIndicator())
                : _availablePromos.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.local_offer_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text(
                    'No coupons available',
                    style: textTheme.titleMedium?.copyWith(color: Colors.grey),
                  ),
                ],
              ),
            )
                : RefreshIndicator(
              onRefresh: _loadPromos,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _availablePromos.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final promo = _availablePromos[index];
                  final isApplied = currentPromoCode != null &&
                      currentPromoCode == promo.code.toUpperCase();

                  return _PromoCard(
                    promo: promo,
                    isApplied: isApplied,
                    isApplying: _isApplying,
                    onApply: () => _applyQuickPromo(promo),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  final PromoCodeType promo;
  final bool isApplied;
  final bool isApplying;
  final VoidCallback onApply;

  const _PromoCard({
    required this.promo,
    required this.isApplied,
    required this.isApplying,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isApplied ? Colors.grey.shade100 : colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isApplied ? colorScheme.primary : Colors.grey.shade300,
          width: isApplied ? 2 : 1,
        ),
        boxShadow: isApplied ? [] : [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _getPromoTitle(promo),
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isApplied ? Colors.grey.shade600 : null,
                  ),
                ),
              ),
              if (isApplied)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: colorScheme.primary,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'APPLIED',
                    style: textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          if (promo.minCartValue != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                promo.minCartValue! > 0
                    ? 'Minimum order value: ₹${promo.minCartValue!.toStringAsFixed(0)}'
                    : 'No minimum order value',
                style: textTheme.bodySmall?.copyWith(
                  color: isApplied ? Colors.grey.shade500 : Colors.black54,
                ),
              ),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isApplied
                      ? Colors.grey.shade300
                      : colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: isApplied
                        ? Colors.grey.shade400
                        : colorScheme.primary.withOpacity(0.3),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Text(
                  promo.code.toUpperCase(),
                  style: textTheme.labelLarge?.copyWith(
                    color: isApplied ? Colors.grey.shade600 : colorScheme.primary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: isApplying || isApplied ? null : onApply,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  backgroundColor: isApplied ? Colors.grey.shade400 : null,
                  disabledBackgroundColor: Colors.grey.shade400,
                ),
                child: Text(
                  isApplied ? 'Applied' : 'Apply',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getPromoTitle(PromoCodeType promo) {
    if (promo.discountType == PromocodeDiscountType.PERCENTAGE) {
      return 'Flat ${promo.discountValue.toStringAsFixed(0)}% OFF${promo.maxDiscountAmount != null ? ' upto ₹${promo.maxDiscountAmount!.toStringAsFixed(0)}' : ''}';
    } else {
      return 'Flat ₹${promo.discountValue.toStringAsFixed(0)} OFF';
    }
  }
}