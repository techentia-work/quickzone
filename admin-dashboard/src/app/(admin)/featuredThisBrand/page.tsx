"use client";

import React, { useState } from "react";
import { Home, Star } from "lucide-react";
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
import { useAdminFeaturedWeekBrand } from "@/hooks/entities/useAdminFeaturedWeekBrand";

import { entitySchema, ROUTES } from "@/lib/consts";
import { BreadcrumbItem } from "@/lib/types";
import { FeaturedWeekBrandType } from "@/lib/types/featuredWeekBrand/featuredWeekBrand.types";

import { DeleteFeaturedWeekBrandModal } from "./_components";

export default function AdminFeaturedWeekBrandPage() {
  const router = useRouter();

  /* =========================
     Filters
  ========================= */
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("featuredWeekBrand");
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
  } = useAdminFeaturedWeekBrand(activeFilters);

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
      entitySchema.featuredWeekBrand.tableColumns,
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
  const handleEdit = (item: FeaturedWeekBrandType) => {
    router.push(
      `${ROUTES.ADMIN.FEATURED_WEEK_BRAND.ROOT}/editBrand/${item._id}`
    );
  };

  const handleDelete = (item: FeaturedWeekBrandType) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const handleView = (item: FeaturedWeekBrandType) => {
    router.push(
      `${ROUTES.ADMIN.FEATURED_WEEK_BRAND.ROOT}/${item._id}`
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
    { label: "Featured Week Brands", icon: Star },
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
            Loading featured brands...
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
      <DeleteFeaturedWeekBrandModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        item={selectedItem}
        onConfirm={handleConfirmDelete}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Featured Week Brand Management"
        subtitle="Manage brands highlighted on homepage / app"
        action={
          <Button
            onClick={() =>
              router.push(
                `${ROUTES.ADMIN.FEATURED_WEEK_BRAND.ROOT}/create`
              )
            }
          >
            Add Featured Brand
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
                placeholder="Search featured brands..."
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
                schema={entitySchema.featuredWeekBrand}
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
          columns={entitySchema.featuredWeekBrand.tableColumns}
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
