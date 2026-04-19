"use client";

import React, { useState } from "react";
import { Home, Gift, Tag } from "lucide-react";
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
import toast from "react-hot-toast";
import { useAdminPromo } from "@/hooks/entities/useAdminPromo";
import { BreadcrumbItem } from "@/lib/types";
import { PromoType } from "@/lib/types/promocode/promocode.types";
import { DeletePromoModal } from "./_components/DeletePromoModal";

export default function AdminPromosPage() {
  /** ---------------------------- FILTERS ---------------------------- **/
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("promo");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /** ---------------------------- PROMOCODES ---------------------------- **/
  const {
    promos,
    pagination,
    isLoadingPromos,
    togglePromoStatus,
    deletePromo,
    promoStats,
    isMutating
  } = useAdminPromo(activeFilters);

  console.log("Promocode" , promoStats);
  

  const [selectedPromo, setSelectedPromo] = useState<PromoType | null>(null);
  const deleteModal = useModal();
  const router = useRouter();

  /** ---------------------------- HANDLERS ---------------------------- **/
  const handleView = (promo: PromoType) => {
    setSelectedPromo(promo);
    router.push(`/admin/promos/${promo._id}`);
  };

  const handleDelete = (promo: PromoType) => {
    setSelectedPromo(promo);
    deleteModal.openModal();
  };

  const handleEdit = (promo: PromoType) => {
    router.push(`/promocode/edit/${promo._id}`);
  };

  const handleConfirmDelete = async () => {
    if (selectedPromo) {
      try {
        await deletePromo(selectedPromo._id);
      } catch {
        toast.error("Failed to delete promo");
      } finally {
        deleteModal.closeModal();
      }
    }
  };

  const handleToggleStatus = async (promo: PromoType) => {
    try {
      await togglePromoStatus(promo._id);
      toast.success(
        `Promo ${promo.active ? "disabled" : "activated"} successfully`
      );
    } catch {
      toast.error("Failed to toggle promo status");
    }
  };

  /** ---------------------------- PAGINATION ---------------------------- **/
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  /** ---------------------------- TABLE ---------------------------- **/
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.promo.tableColumns, filters, setFilter);

  /** ---------------------------- BREADCRUMB ---------------------------- **/
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Promocodes", icon: Gift },
  ];

  /** ---------------------------- LOADING STATE ---------------------------- **/
  if (isLoadingPromos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promocodes...</p>
        </div>
      </div>
    );
  }

  /** ---------------------------- RENDER ---------------------------- **/
  return (
    <div className="min-h-screen bg-gray-50 py-4">
        <DeletePromoModal
        promo={selectedPromo}
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        isLoading={isMutating}
      /> 

      {/* 🧭 Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 🧾 Page Header */}
      <PageHeader
        title="Promocode Management"
        subtitle="Create, view, and manage discount codes for your store"
      />

      <div className="p-6">
        {/* 📊 Stats */}
        <StatsCards stats={promoStats} entity="promo" />

        {/* 🔍 Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search promocodes by name, code, or type..."
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
                schema={entitySchema.promo}
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

        {/* 📋 Promo Table */}
        <Table
          data={promos || []}
          columns={entitySchema.promo.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onView={handleView}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* 🪶 Empty State */}
        {(!promos || promos.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No promocodes found
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
