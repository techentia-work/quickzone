"use client";

import React, { useState } from "react";
import { Home, SlidersHorizontal } from "lucide-react";
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
import { useAdminSlider } from "@/hooks/entities/useAdminSlider";
import { entitySchema, ROUTES } from "@/lib/consts";
import {
  CreateSliderPayload,
  UpdateSliderPayload,
} from "@/lib/types/slider/slider.types";
import { BreadcrumbItem } from "@/lib/types";
import { DeleteSliderModal } from "./_components/DeleteSliderModal";

export default function AdminSliderPage() {
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("slider");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  // Slider data
  const {
    sliderList,
    pagination,
    isLoadingSlider,
    createSlider,
    updateSlider,
    deleteSlider,
    isMutating,
    selectedSlider,
    setSelectedSlider,
  } = useAdminSlider(activeFilters);

  // Pagination
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  // Table
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.slider.tableColumns, filters, setFilter);

  // Modals
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const handleAddSlider = async (data: CreateSliderPayload) => {
    await createSlider(data);
  };

  const handleEditSlider = async (
    id: string,
    data: Partial<UpdateSliderPayload>
  ) => {
    await updateSlider(id, data);
  };

  const handleDeleteSlider = async (id: string) => {
    await deleteSlider(id);
  };

  const handleEdit = (slider: any) => {
    router.push(`/sliders/editSlider/${slider._id}`);
  };

  const handleDelete = (slider: any) => {
    setSelectedSlider(slider);
    deleteModal.openModal();
  };

  const handleView = (slider: any) => {
    router.push(`/slider/${slider._id}`);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Sliders", icon: SlidersHorizontal },
  ];

  if (isLoadingSlider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <DeleteSliderModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        slider={selectedSlider}
        onConfirm={handleDeleteSlider}
        isLoading={isMutating}
      />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Slider Management"
        subtitle="Manage homepage sliders, image carousels, or promotional slides"
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search sliders by title, slug, or category..."
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
                schema={entitySchema.slider}
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
          data={Array.isArray(sliderList) ? sliderList : sliderList.sliders}
          columns={entitySchema.slider.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* {sliderList.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <SlidersHorizontal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sliders found
            </h3>
            <p className="text-gray-500">
              {filters.search
                ? "Try adjusting your search or filters."
                : "Start by creating your first slider."}
            </p>
          </div>
        )} */}

        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
