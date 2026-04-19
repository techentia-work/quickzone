"use client";

import React, { useState } from "react";
import { Home, Truck } from "lucide-react";
import { useFilter, usePagination, useTable } from "@/hooks";
import {
  Breadcrumb,
  FilterDropdown,
  FilterSheet,
  PageHeader,
  Pagination,
  SearchBar,
  Table,
  Button,
} from "@/components";
import { entitySchema, ROUTES } from "@/lib/consts";
import { useRouter } from "next/navigation";
import { useAdminDeliveryBoy } from "@/hooks/entities/useAdminDeliveryBoy";
import { DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";
import { BreadcrumbItem } from "@/lib/types";
import toast from "react-hot-toast";
import { DeleteDeliveryBoyModal } from "./_components/DeleteDeliveryBoyModal";
import deliveryBoyApi from "@/lib/api/deliveryBoy/deliveryBoy.api";

export default function AdminDeliveryBoysPage() {
  /** ---------------------------- FILTERS ---------------------------- **/
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("deliveryBoy");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /** ---------------------------- DATA HOOK ---------------------------- **/
  const {
    deliveryBoys,
    pagination,
    isLoadingDeliveryBoys,
    deleteDeliveryBoy,
    refetchDeliveryBoys,
  } = useAdminDeliveryBoy(activeFilters);

  /** ---------------------------- PAGINATION ---------------------------- **/
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  /** ---------------------------- TABLE ---------------------------- **/
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.deliveryBoy.tableColumns, filters, setFilter);

  /** ---------------------------- ROUTER ---------------------------- **/
  const router = useRouter();

  /** ---------------------------- MODAL ---------------------------- **/
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] =
    useState<DeliveryBoyType | null>(null);

  /** ---------------------------- HANDLERS ---------------------------- **/

  const handleOpenDeleteModal = (deliveryBoy: DeliveryBoyType) => {
    setSelectedDeliveryBoy(deliveryBoy);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      console.log("Id", id);

      const res: any = await deleteDeliveryBoy(id);
      toast.success(res.message || "Delivery boy deleted successfully");
      refetchDeliveryBoys();
    } catch (error) {
      toast.error("Failed to delete delivery boy");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedDeliveryBoy(null);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Delivery Boys", icon: Truck },
  ];

  /** ---------------------------- LOADING STATE ---------------------------- **/
  if (isLoadingDeliveryBoys) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery boys...</p>
        </div>
      </div>
    );
  }

  /** ---------------------------- RENDER ---------------------------- **/
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* 🧭 Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 🧾 Page Header */}
      <PageHeader
        title="Delivery Management"
        subtitle="Manage, assign, and track delivery boys efficiently"
      />

      <div className="p-6">
        {/* 🗑️ Delete Modal */}
        <DeleteDeliveryBoyModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
          deliveryBoy={selectedDeliveryBoy}
          onConfirm={handleConfirmDelete}
          isLoading={false}
        />

        {/* 🔍 Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search by name, phone, or status..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button onClick={() => setIsFilterOpen(true)}>
                Open Filters
              </Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.deliveryBoy}
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

        {/* 📋 Delivery Boys Table */}
        <Table
          data={deliveryBoys || []}
          columns={entitySchema.deliveryBoy.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onDelete={handleOpenDeleteModal}
        />

        {/* 🪶 Empty State */}
        {(!deliveryBoys || deliveryBoys.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No delivery boys found
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
