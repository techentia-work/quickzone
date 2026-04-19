"use client";
import React, { useState } from "react";
import { Plus, Home, Sparkles } from "lucide-react";
import {
  Breadcrumb,
  PageHeader,
  StatsCards,
  SearchBar,
  FilterDropdown,
  FilterSheet,
  Pagination,
  Table,
  Button,
} from "@/components";
import { useModal, useFilter, usePagination, useTable } from "@/hooks";
import { ROUTES, entitySchema } from "@/lib/consts";
import { useRouter } from "next/navigation";
import { useAdminShowcaseProduct } from "@/hooks/entities/useAdminShowCaseProduct";
import { ShowcaseProductType } from "@/lib/types/showCaseProduct/showCaseProduct.types";
import { BreadcrumbItem } from "@/lib/types";
import { DeleteShowcaseProductModal } from "./_components/DeleteShowCaseProductModal";

export default function AdminShowcaseProductsPage() {
  // Filters
  const { filters, activeFilters, setFilter, resetFilters } = useFilter("showcaseProduct");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Showcase Products
  const {
    showcases,
    pagination,
    setSelectedShowcase,
    isLoadingShowcases,
    selectedShowcase,
    isMutating,
    deleteShowcase,
  } = useAdminShowcaseProduct(activeFilters);

  // Pagination
  const { handlePageChange, handleItemsPerPageChange } = usePagination(setFilter);

  // Table
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } = useTable(
    entitySchema.showcaseProduct.tableColumns,
    filters,
    setFilter
  );

  const deleteModal = useModal();

  const handleDeleteShowcase = (showcase: ShowcaseProductType) => {
    setSelectedShowcase(showcase);
    deleteModal.openModal();
  };

  const handleDelete = async (id: string) => {
    await deleteShowcase(id);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Showcases", icon: Sparkles },
  ];

  // Filtered showcases based on master category
  const filteredShowcases = showcases.filter((showcase) => {
    if (!filters.masterCategory || filters.masterCategory === "all") return true;
    return showcase.masterCategory._id === filters.masterCategory;
  });

  if (isLoadingShowcases) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading showcases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* Modals */}
      <DeleteShowcaseProductModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        showcase={selectedShowcase}
        onConfirm={handleDelete}
        isLoading={isMutating}
      />

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <PageHeader
        title="Showcase Management"
        subtitle="Manage and organize homepage showcase products like 'New Arrivals','Best Deals' OR 'Premium'"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search showcases by title or type..."
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
                schema={entitySchema.showcaseProduct}
              />

              <FilterDropdown
                label="Columns"
                options={columnOptions}
                value={Array.from(visibleColumns).map(String)}
                onChange={handleColumnChange}
                multiple
              />

              {/* Master Category Dropdown */}
              <FilterDropdown
                label="Master Category"
                options={[
                  { label: "All", value: "all" },
                  { label: "Beauty", value: "69125a838dca74fbfecd6c2e" },
                  { label: "Groceries", value: "69125a838dca74fbfecd6c2b" },
                ]}
                value={filters.masterCategory || "all"}
                onChange={(value) => setFilter("masterCategory", value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          data={filteredShowcases}
          columns={entitySchema.showcaseProduct.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onDelete={handleDeleteShowcase}
        />

        {/* No Data */}
        {filteredShowcases.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No showcases found</h3>
            <p className="text-gray-500">
              {filters.search || filters.masterCategory
                ? "Try adjusting your search or filters."
                : "Create your first showcase to feature products on the homepage."}
            </p>
          </div>
        )}

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
