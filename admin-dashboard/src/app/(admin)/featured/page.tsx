"use client";

import React, { useState } from "react";
import { Plus, Home, Star } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { useModal, useFilter, usePagination, useTable } from "@/hooks";

import { useAdminFeatured } from "@/hooks/entities/useAdminFeatured";
import { DeleteFeaturedModal } from "./_components/DeleteFeaturedModal";

import { entitySchema, ROUTES } from "@/lib/consts";
import {
  CreateFeaturedPayload,
  UpdateFeaturedPayload,
} from "@/lib/types/featured/featured.types";
import { BreadcrumbItem } from "@/lib/types";

export default function AdminFeaturedPage() {
  const router = useRouter();

  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    featuredList,
    pagination,
    isLoadingFeatured,
    createFeatured,
    updateFeatured,
    deleteFeatured,
    isMutating,
    selectedFeatured,
    setSelectedFeatured,
  } = useAdminFeatured(activeFilters);

  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.featured.tableColumns, filters, setFilter);

  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const handleAddFeatured = async (data: CreateFeaturedPayload) => {
    await createFeatured(data);
  };

  const handleEditFeatured = async (
    id: string,
    data: Partial<UpdateFeaturedPayload>
  ) => {
    await updateFeatured(id, data);
  };

  const handleDeleteFeatured = async (id: string) => {
    await deleteFeatured(id);
  };

  const handleEdit = (featured: any) => {
    router.push(`/featured/editFeatured/${featured._id}`);
  };

  const handleDelete = (featured: any) => {
    setSelectedFeatured(featured);
    deleteModal.openModal();
  };

  const handleView = (featured: any) => {
    router.push(`/admin/featured/${featured._id}`);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Featured", icon: Star },
  ];

  // 🎨 Custom render function for color column
 // 🎨 Custom render function for color column
const renderColorCell = (color: string) => {
  if (!color) {
    return <span className="text-gray-400 italic">No color</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded border border-gray-300 shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
      <span className="text-xs text-gray-600 font-mono">{color}</span>
    </div>
  );
};


  if (isLoadingFeatured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading featured sections...</p>
        </div>
      </div>
    );
  }

  // ✅ Render
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <DeleteFeaturedModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        featured={selectedFeatured}
        onConfirm={handleDeleteFeatured}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Featured Management"
        subtitle="Manage banners, sliders, and highlighted collections."
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <SearchBar
              value={filters.search}
              onChange={(value) => setFilter("search", value)}
              placeholder="Search by title, slug, or type..."
            />

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                Filters
              </Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.featured}
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

        <Table
          data={featuredList}
          columns={entitySchema.featured.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          customRenderers={{
            color: renderColorCell, // 🎨 Custom renderer for color
          }}
        />

        {featuredList.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No featured sections found
            </h3>
            <p className="text-gray-500">
              {filters.search || filters.type
                ? "Try adjusting your search or filters."
                : "Start by creating your first featured section."}
            </p>
          </div>
        )}

        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}