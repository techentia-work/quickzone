import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/utils/enums/enums.dart';
import 'package:quickzone_delivery/features/models/models.dart';
import 'package:quickzone_delivery/features/providers/providers.dart';
import 'package:quickzone_delivery/features/repositories/repositories.dart';

class DeliveryBoyOrdersController extends AsyncNotifier<List<OrderType>> {
  @override
  Future<List<OrderType>> build() async => _fetchAssignedOrders();

  Future<List<OrderType>> _fetchAssignedOrders() async {
    try {
      final repository = ref.read(deliveryBoyRepositoryProvider);
      final res = await repository.getAssignedOrders();
      if (res.success && res.data != null) return res.data!.orders;
      return [];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return [];
    }
  }

  Future<void> refreshOrders() async {
    state = const AsyncValue.loading();
    final orders = await _fetchAssignedOrders();
    state = AsyncValue.data(orders);
  }

  Future<void> acceptOrder(AcceptRejectOrderRequest payload) async {
    try {
      final repository = ref.read(deliveryBoyRepositoryProvider);
      final res = await repository.acceptAssignedOrder(payload);
      if (res.success) {
        ref.read(snackbarProvider.notifier).showSuccess('Order accepted ✅');
        await refreshOrders();
      } else {
        throw res;
      }
    } catch (e) {
      ref.read(snackbarProvider.notifier).showError('Failed to accept order');
    }
  }

  Future<void> rejectOrder(AcceptRejectOrderRequest payload) async {
    try {
      final repository = ref.read(deliveryBoyRepositoryProvider);
      final res = await repository.rejectAssignedOrder(payload);
      if (res.success) {
        ref.read(snackbarProvider.notifier).showInfo('Order rejected 🚫');
        await refreshOrders();
      } else {
        throw res;
      }
    } catch (e) {
      ref.read(snackbarProvider.notifier).showError('Failed to reject order');
    }
  }

  Future<void> updateDeliveryStatus(UpdateDeliveryStatusRequest payload,{VoidCallback? onDelivered}) async {
    try {
      final repository = ref.read(deliveryBoyRepositoryProvider);
      final res = await repository.updateDeliveryStatus(payload);
      if (res.success) {
        ref.read(snackbarProvider.notifier).showSuccess('Status updated 🚚');
        await refreshOrders();

        // If delivered, call callback
        if (payload.status == OrderStatus.DELIVERED) {
          onDelivered?.call();
        }
      } else {
        throw res;
      }
    } catch (e) {
      ref.read(snackbarProvider.notifier).showError('Failed to update status');
    }
  }
}

/// 🧩 Global provider
final deliveryBoyOrdersControllerProvider =
AsyncNotifierProvider<DeliveryBoyOrdersController, List<OrderType>>(
    DeliveryBoyOrdersController.new);
