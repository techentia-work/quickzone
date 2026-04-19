"use client";

import React, { useState } from "react";
import { Home, Store } from "lucide-react";
import { useRouter } from "next/navigation";

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

import { useModal, useFilter, usePagination, useTable } from "@/hooks";
import { useAdminShopByStore } from "@/hooks/entities/useAdminShopByStore";

import { entitySchema, ROUTES } from "@/lib/consts";
import { BreadcrumbItem } from "@/lib/types";
import { ShopByStoreType } from "@/lib/types/shopByStore/shopByStore.types";

import { DeleteShopByStoreModal } from "./_components";

export default function AdminShopByStorePage() {
  const router = useRouter();

  /* =========================
     Filters
  ========================= */
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("shopByStore");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* =========================
     Data
  ========================= */
  const {
    list,
    pagination,
    isLoading,
    isMutating,
    selectedItem,
    setSelectedItem,
    remove,
  } = useAdminShopByStore(activeFilters);

  /* =========================
     Pagination
  ========================= */
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  /* =========================
     Table
  ========================= */
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(
      entitySchema.shopByStore.tableColumns,
      filters,
      setFilter
    );

  /* =========================
     Modal
  ========================= */
  const deleteModal = useModal();

  /* =========================
     Handlers
  ========================= */
  const handleEdit = (item: ShopByStoreType) => {
    router.push(
      `${ROUTES.ADMIN.SHOP_BY_STORE.ROOT}/editBrand/${item._id}`
    );
  };

  const handleDelete = (item: ShopByStoreType) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const handleView = (item: ShopByStoreType) => {
    router.push(
      `${ROUTES.ADMIN.SHOP_BY_STORE.ROOT}/${item._id}`
    );
  };

  const handleConfirmDelete = async (id: string) => {
    await remove(id);
    deleteModal.closeModal();
  };

  /* =========================
     Breadcrumb
  ========================= */
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Shop By Store", icon: Store },
  ];

  /* =========================
     Loading
  ========================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            Loading shop by stores...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     Render
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* Delete Modal */}
      <DeleteShopByStoreModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        item={selectedItem}
        onConfirm={handleConfirmDelete}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Shop By Store Management"
        subtitle="Manage stores shown in Shop By Store section"
        action={
          <Button
            onClick={() =>
              router.push(
                `${ROUTES.ADMIN.SHOP_BY_STORE.ROOT}/create`
              )
            }
          >
            Add Store
          </Button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search stores..."
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={() => setIsFilterOpen(true)}>
                Open Filters
              </Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.shopByStore}
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

        {/* Table */}
        <Table
          data={list}
          columns={entitySchema.shopByStore.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
