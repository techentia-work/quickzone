import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/repositories/repositories.dart';

class AllOrdersController extends AsyncNotifier<List<OrderType>> {
  @override
  Future<List<OrderType>> build() async => _fetchAllOrders();

  Future<List<OrderType>> _fetchAllOrders() async {
    try {
      final repository = ref.read(deliveryBoyRepositoryProvider);
      final res = await repository.getAllOrders();
      if (res.success && res.data != null) return res.data!.orders;
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }

  Future<void> refreshOrders() async {
    state = const AsyncValue.loading();
    final orders = await _fetchAllOrders();
    state = AsyncValue.data(orders);
  }
}

/// 🧩 Global provider
final allOrdersControllerProvider =
AsyncNotifierProvider<AllOrdersController, List<OrderType>>(
    AllOrdersController.new);
