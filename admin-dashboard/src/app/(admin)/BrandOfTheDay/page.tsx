"use client";

import React, { useState } from "react";
import { Home, BadgeCheck } from "lucide-react";
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
import { useAdminBrandOfTheDay } from "@/hooks/entities/useAdminBrandOfTheDay";

import { entitySchema, ROUTES } from "@/lib/consts";
import { BreadcrumbItem } from "@/lib/types";
import { BrandOfTheDayType } from "@/lib/types/brandOfTheDay/brandOfTheDay.types";

import { DeleteBrandOfTheDayModal } from "./_components";

export default function AdminBrandOfTheDayPage() {
  const router = useRouter();

  /* =========================
     Filters
  ========================= */
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("brandOfTheDay");
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
  } = useAdminBrandOfTheDay(activeFilters);

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
      entitySchema.brandOfTheDay.tableColumns,
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
  const handleEdit = (item: BrandOfTheDayType) => {
    router.push(
      `${ROUTES.ADMIN.BRAND_OF_THE_DAY.ROOT}/editBrand/${item._id}`
    );
  };

  const handleDelete = (item: BrandOfTheDayType) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const handleView = (item: BrandOfTheDayType) => {
    router.push(
      `${ROUTES.ADMIN.BRAND_OF_THE_DAY.ROOT}/${item._id}`
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
    { label: "Brand Of The Day", icon: BadgeCheck },
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
            Loading brands...
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
      <DeleteBrandOfTheDayModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        item={selectedItem}
        onConfirm={handleConfirmDelete}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Brand Of The Day Management"
        subtitle="Manage brands shown in Brand Of The Day section"
        action={
          <Button
            onClick={() =>
              router.push(
                `${ROUTES.ADMIN.BRAND_OF_THE_DAY.ROOT}/create`
              )
            }
          >
            Add Brand
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
                placeholder="Search brands..."
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
                schema={entitySchema.brandOfTheDay}
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
          columns={entitySchema.brandOfTheDay.tableColumns}
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
