"use client";

import React, { useState } from "react";
import { Home, ClipboardList } from "lucide-react";
import { useFilter, usePagination, useTable, useModal } from "@/hooks";
import {
  Breadcrumb,
  FilterDropdown,
  FilterSheet,
  PageHeader,
  Pagination,
  SearchBar,
  StatsCards,
  Table,
  Button,
} from "@/components";
import { entitySchema, ROUTES } from "@/lib/consts";
import { useRouter } from "next/navigation";
import { useAdminOrder } from "@/hooks/entities/useAdminOrder";
import { OrderType } from "@/lib/types/order/order.types";
import { BreadcrumbItem } from "@/lib/types";
import toast from "react-hot-toast";
import { DeleteOrderModal } from "./_components/DeleteOrderModal";
import { useAdminDeliveryBoy } from "@/hooks/entities/useAdminDeliveryBoy";
import { log } from "node:console";
import { DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";
import { AssignDeliveryBoyModal } from "./_components/AssignDeliveryBoyModal";

export default function AdminOrdersPage() {
  /** ---------------------------- FILTERS ---------------------------- **/
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("order");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /** ---------------------------- ORDERS ---------------------------- **/

  const {
    orders,
    stats,
    pagination,
    isLoadingOrders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    isMutating,
    refetchOrders,
    refetchStats,
  } = useAdminOrder(activeFilters);

  const { deliveryBoys, assignOrder } = useAdminDeliveryBoy();

  console.log("orders", orders);

  /** ---------------------------- PAGINATION ---------------------------- **/
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  /** ---------------------------- TABLE ---------------------------- **/
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.order.tableColumns, filters, setFilter);

  /** ---------------------------- MODALS ---------------------------- **/
  const deleteModal = useModal();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const router = useRouter();

  /** ---------------------------- HANDLERS ---------------------------- **/
  const handleView = (order: OrderType) => {
    setSelectedOrder(order);
    router.push(`/orders/${order._id}`);
  };

  const handleCancel = (order: OrderType) => {
    setSelectedOrder(order);
    deleteModal.openModal();
  };

  const handleStatusChange = async (order: OrderType, newStatus: any) => {
    try {
      await updateOrderStatus(order._id, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusChange = async (
    order: OrderType,
    newStatus: any
  ) => {
    try {
      await updatePaymentStatus(order._id, { paymentStatus: newStatus });
      toast.success(`Payment marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Orders", icon: ClipboardList },
  ];

  const [assignModal, setAssignModal] = useState(false);

  const openAssignModal = async (order: OrderType) => {
    setSelectedOrder(order);
    setAssignModal(true);
  };

  const handleConfirmAssign = async (deliveryBoyId: string) => {
    if (!selectedOrder) return;

    await assignOrder({ orderId: selectedOrder._id, deliveryBoyId });
    refetchStats();
    setAssignModal(false);
  };

  /** ---------------------------- LOADING STATE ---------------------------- **/
  if (isLoadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  /** ---------------------------- RENDER ---------------------------- **/
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* 🪟 Cancel Order Modal */}
      {/* <DeleteOrderModal
        order={selectedOrder}
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        onConfirm={handleDeleteOrder}
        isLoading={isMutating}
      /> */}
      <AssignDeliveryBoyModal
        isOpen={assignModal}
        closeModal={() => setAssignModal(false)}
        deliveryBoys={deliveryBoys}
        onConfirm={handleConfirmAssign}
        isLoading={isMutating}
      />

      {/* 🧭 Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 🧾 Page Header */}
      <PageHeader
        title="Order Management"
        subtitle="View, track, and manage all orders placed by customers"
      />

      <div className="p-6">
        {/* 📊 Stats */}
        <StatsCards stats={stats} entity="order" />

        {/* 🔍 Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search orders by number, user, or status..."
              />
            </div>

            <div className="flex items-center justify-end gap-4 mb-4">
              <Button onClick={() => setIsFilterOpen(true)}>
                Open Filters
              </Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.order}
              />

              <FilterDropdown
                label="Columns"
                options={columnOptions}
                value={Array.from(visibleColumns).map(String)}
                onChange={handleColumnChange}
                multiple
              />
            </div>
          </div>
        </div>

        {/* 📋 Orders Table */}
        <Table
          data={orders || []}
          columns={entitySchema.order.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onView={handleView}
          onDelete={handleCancel}
          onApprove={openAssignModal}
        />

        {/* 🪶 Empty State */}
        {(!orders || orders.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}

        {/* 📑 Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
