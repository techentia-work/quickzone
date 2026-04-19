"use client";
import React, { useState } from "react";
import { Plus, Home, FolderTree, List, TreePine } from "lucide-react";
import {
  BreadcrumbItem,
  CategoryType,
} from "@/lib/types";
import {
  useModal,
  useFilter,
  useAdminCategory,
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
  Table,
  Button,
} from "@/components";
import CategoryTreeView from "@/components/tree/CategoryTreeView";
import { entitySchema, ROUTES } from "@/lib/consts";
import { DeleteCategoryModal } from "../_components/DeleteCategoryModal";
import { useRouter } from "next/navigation";
import { categoryApi } from "@/lib/api/category/category.api";

export default function AdminCategoriesPage() {
  // View mode toggle
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  // Filters
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("category");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  // Categories
  const {
    categories,
    categoryTree,
    pagination,
    isLoadingCategories,
    deleteCategory,
    restoreCategory,
    rebuildTree,
    rebuildTreeAll,
    isMutating,
    selectedCategory,
    setSelectedCategory,
    activeCategoriesCount,
    deletedCategoriesCount,
    totalCategories,
  } = useAdminCategory(activeFilters);

  // Pagination
  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  // Table
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.category.tableColumns, filters, setFilter);

  // Modals
  const deleteModal = useModal();

  // Handlers
  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const handleRestoreCategory = async (id: string) => {
    await restoreCategory(id);
  };

  const handleRebuildTree = async (id: string) => {
    await rebuildTree(id);
  };

  const handleRebuildTreeAll = async () => {
    await rebuildTreeAll();
  };

  const handleEdit = (category: CategoryType) => {
    router.push(`edit/${category._id}`);
  };

  const handleDelete = (category: CategoryType) => {
    setSelectedCategory(category);
    deleteModal.openModal();
  };

  const handleView = (category: CategoryType) => {
    setSelectedCategory(category);
    console.log("View category:", category);
  };

  // Simple Reorder - Just update order and call update API
  const handleCategoryMove = async (
    categoryId: string,
    parentId: string | null,
    newOrder: number
  ) => {
    try {
      console.log("=== REORDER ===");
      console.log("Category:", categoryId);
      console.log("New Order:", newOrder);

      // Use 'as any' to bypass TypeScript check temporarily
      // Or update your UpdateCategoryPayload type to include order?: number
      await categoryApi.update(categoryId, { 
        order: newOrder 
      } as any);

      console.log("✅ Order updated");
      
      // Rebuild tree to fix all orders
      await rebuildTreeAll();
      
      // Refresh page
      window.location.reload();
      
    } catch (error: any) {
      console.error("❌ Reorder failed:", error);
      alert("Failed to reorder. Please try again.");
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Categories", icon: FolderTree },
  ];

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* Modals */}
      <DeleteCategoryModal
        isOpen={deleteModal.isOpen}
        closeModal={deleteModal.closeModal}
        category={selectedCategory}
        onConfirm={handleDeleteCategory}
        isLoading={isMutating}
      />

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Category Management"
        subtitle="Manage and organize all categories in your catalog hierarchy"
      >
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white border rounded-lg p-1">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                viewMode === "tree"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TreePine size={16} />
              Tree
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List size={16} />
              Table
            </button>
          </div>

          <Button
            onClick={handleRebuildTreeAll}
            variant="outline"
            disabled={isMutating}
          >
            Rebuild All Trees
          </Button>
        </div>
      </PageHeader>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Categories</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalCategories}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Active Categories</div>
            <div className="text-2xl font-bold text-green-600">
              {activeCategoriesCount}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Root Categories</div>
            <div className="text-2xl font-bold text-blue-600">
              {viewMode === "tree"
                ? categoryTree.length
                : categories.filter((c: any) => !c.parent).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Deleted Categories</div>
            <div className="text-2xl font-bold text-red-600">
              {deletedCategoriesCount}
            </div>
          </div>
        </div>

        {/* Filters - Only show for table view */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <SearchBar
                  value={filters.search}
                  onChange={(value) => setFilter("search", value)}
                  placeholder="Search categories by name, slug, or type..."
                />
              </div>
              <div className="flex items-center justify-end gap-4">
                <Button onClick={() => setIsFilterOpen(true)}>
                  Open Filters
                </Button>

                <FilterSheet
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  filters={filters}
                  setFilter={setFilter}
                  resetFilters={resetFilters}
                  schema={entitySchema.category}
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
        )}

        {/* Content - Conditional based on view mode */}
        {viewMode === "tree" ? (
          <CategoryTreeView
            categories={categoryTree}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={handleCategoryMove}
            enableDragDrop={true}
          />
        ) : (
          <>
            {/* Table View */}
            <Table
              data={categories}
              columns={entitySchema.category.tableColumns}
              visibleColumns={visibleColumns}
              sortField={filters.sortBy}
              sortDirection={filters.sortOrder}
              toggleSort={toggleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />

            {/* No Data */}
            {categories.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-500">
                  {filters.search || filters.type || filters.parentId
                    ? "Try adjusting your search criteria or filters."
                    : "Get started by creating your first category."}
                </p>
              </div>
            )}

            {/* Pagination - Only for table view */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}