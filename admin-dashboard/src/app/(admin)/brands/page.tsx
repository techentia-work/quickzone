"use client";

import React, { useState } from "react";
import { Home, Tag } from "lucide-react";
import { useModal, useFilter, usePagination, useTable } from "@/hooks";
import { Breadcrumb, FilterDropdown, FilterSheet, PageHeader, Pagination, SearchBar, Table, Button, } from "@/components";
import { useRouter } from "next/navigation";
import { useAdminBrand } from "@/hooks/entities/useAdminBrand";
import { entitySchema, ROUTES } from "@/lib/consts";
import { CreateBrandPayload, UpdateBrandPayload, } from "@/lib/types";
import { BreadcrumbItem } from "@/lib/types";
import { DeleteBrandModal } from "./_components";

export default function AdminBrandPage() {
    // Filters
    const { filters, activeFilters, setFilter, resetFilters } = useFilter("brand");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const router = useRouter();

    // Brand Data Hook
    const {
        brandList,
        pagination,
        isLoadingBrand,
        isMutating,
        selectedBrand,
        setSelectedBrand,
        createBrand,
        updateBrand,
        deleteBrand,
    } = useAdminBrand(activeFilters);

    console.log(brandList)

    // Pagination
    const { handlePageChange, handleItemsPerPageChange } =
        usePagination(setFilter);

    // Table
    const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
        useTable(entitySchema.brand.tableColumns, filters, setFilter);

    // Modals
    const deleteModal = useModal();

    // Handlers
    const handleAddBrand = async (data: CreateBrandPayload) => {
        await createBrand(data);
    };

    const handleEditBrand = async (
        id: string,
        data: Partial<UpdateBrandPayload>
    ) => {
        await updateBrand(id, data);
    };

    const handleDeleteBrand = async (id: string) => {
        await deleteBrand(id);
    };

    const handleEdit = (brand: any) => {
        router.push(`/brands/editBrand/${brand._id}`);
    };

    const handleDelete = (brand: any) => {
        setSelectedBrand(brand);
        deleteModal.openModal();
    };

    const handleView = (brand: any) => {
        router.push(`/brands/${brand._id}`);
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
        { label: "Brands", icon: Tag },
    ];

    if (isLoadingBrand) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading brands...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4">
            <DeleteBrandModal
                isOpen={deleteModal.isOpen}
                closeModal={deleteModal.closeModal}
                brand={selectedBrand}
                onConfirm={handleDeleteBrand}
                isLoading={isMutating}
            />

            <Breadcrumb items={breadcrumbItems} />

            <PageHeader
                title="Brand Management"
                subtitle="Manage product brands, logos, and visibility settings"
            />

            <div className="p-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 max-w-lg">
                            <SearchBar
                                value={filters.search}
                                onChange={(value) => setFilter("search", value)}
                                placeholder="Search brands by name or slug..."
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
                                schema={entitySchema.brand}
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
                    data={brandList}
                    columns={entitySchema.brand.tableColumns}
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
