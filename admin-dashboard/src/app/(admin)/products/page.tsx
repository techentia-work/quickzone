"use client";
import React, { useState } from "react";
import { Plus, Home, Package } from "lucide-react";
import {
  BreadcrumbItem,
  CreateProductPayload,
  UpdateProductPayload,
  ProductType,
} from "@/lib/types";
import { DeleteProductModal } from "./_components";
import {
  useModal,
  useFilter,
  useAdminProduct,
  usePagination,
  useTable,
} from "@/hooks";
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

export default function AdminProductsPage() {
  // Filters
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("product");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Products
  const {
    products,
    pagination,
    stats,
    isLoadingProducts,
    deleteProduct,
    isMutating,
    selectedProduct,
    setSelectedProduct,
  } = useAdminProduct(activeFilters);

  // Pagination
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  // Table
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.product.tableColumns, filters, setFilter);

  // Modals
  const addModal = useModal();
  const deleteModal = useModal();

  const router = useRouter();

  // Handlers

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
  };

  const handleEdit = (product: ProductType) => {
    router.push(`/products/edit/${product._id}`);
  };

  const handleDelete = (product: ProductType) => {
    setSelectedProduct(product);
    deleteModal.openModal();
  };

  const handleView = (product: ProductType) => {
    setSelectedProduct(product);
    console.log("View product:", product);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Products", icon: Package },
  ];

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* Modals */}
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        product={selectedProduct}
        onConfirm={handleDeleteProduct}
        isLoading={isMutating}
      />

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Product Management"
        subtitle="Manage and monitor all products in your inventory"
      ></PageHeader>

      <div className="p-6">
        {/* Stats */}
        <StatsCards stats={stats} entity="product" />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search products by name, brand, or SKU..."
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
                schema={entitySchema.product}
              />

              {/* Column Selector */}
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
          data={products}
          columns={entitySchema.product.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          toggleSort={toggleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* No Data */}
        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              {filters.search || filters.brand || filters.categoryId
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first product."}
            </p>
            {!filters.search && !filters.brand && !filters.categoryId && (
              <button
                onClick={addModal.openModal}
                className="mt-4 inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              ></button>
            )}
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
