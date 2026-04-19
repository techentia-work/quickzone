"use client";

import React, { useState } from "react";
import { Home, Image } from "lucide-react";
import { useModal, useFilter, usePagination, useTable } from "@/hooks";
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
import { useRouter } from "next/navigation";
import { useAdminBanner } from "@/hooks/entities/useAdminBanner";
import { entitySchema, ROUTES } from "@/lib/consts";
import {
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/lib/types/banner/banner.types";
import { BreadcrumbItem } from "@/lib/types";
import { DeleteBannerModal } from "./_components/DeleteBannerModal";

export default function AdminBannerPage() {
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("banner");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const {
    bannerList,
    pagination,
    isLoadingBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    isMutating,
    selectedBanner,
    setSelectedBanner,
  } = useAdminBanner(activeFilters);

  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.banner.tableColumns, filters, setFilter);

  const deleteModal = useModal();

  const handleDeleteBanner = async (id: string) => {
    await deleteBanner(id);
  };

  const handleEdit = (banner: any) => {
    router.push(`/banners/editBanner/${banner._id}`);
  };

  const handleDelete = (banner: any) => {
    setSelectedBanner(banner);
    deleteModal.openModal();
  };

  const handleView = (banner: any) => {
    router.push(`/banner/${banner._id}`);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Banners", icon: Image },
  ];

  if (isLoadingBanner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  // ✅ Map banners with proper masterCategory fallback
  const bannersToDisplay = (Array.isArray(bannerList)
    ? bannerList
    : bannerList?.banners || []
  ).map((banner: any) => ({
    ...banner,
    masterCategoryName:
      banner.masterCategory?.name ||
      banner.masterCategory?.title ||
      "Default",
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <DeleteBannerModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        banner={selectedBanner}
        onConfirm={handleDeleteBanner}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Banner Management"
        subtitle="Manage homepage banners, promotional visuals, and display sections"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search banners by title, slug, or category..."
              />
            </div>

            <div className="flex items-center justify-end gap-4 mb-4">
              <Button onClick={() => setIsFilterOpen(true)}>Open Filters</Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.banner}
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

        {/* ✅ Table displays master category properly */}
        <Table
          data={bannersToDisplay}
          columns={[
            ...entitySchema.banner.tableColumns,
            {
              key: "masterCategoryName",
              label: "Master Category",
            },
          ]}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
