// app/categories/[slug]/_components/ProductGrid.tsx
"use client";

import { useProducts, useCategory, useFilter } from "@/hooks";
import { ProductCard } from "./ProductCard";
import { Loader2, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { useMemo, useState } from "react";

interface ProductGridProps {
  categorySlug: any;
  selectedSubcategoryId: string | null;
}

export function ProductGrid({
  categorySlug,
  selectedSubcategoryId,
}: ProductGridProps) {
  const { filters, activeFilters, setFilter } = useFilter("product");
  const { data: categories } = useCategory({ type: categorySlug });
  const currentCategory = categories[0];
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryId = selectedSubcategoryId || currentCategory?._id;

  const { products, isLoading, pagination } = useProducts(activeFilters, {
    categoryId: categoryId,
    enabled: !!categoryId,
  });

  const displayTitle = useMemo(() => {
    if (selectedSubcategoryId && currentCategory?.children) {
      const subcategory = currentCategory.children.find(
        (cat: any) => cat._id === selectedSubcategoryId
      );
      return subcategory?.name || currentCategory?.name;
    }
    return currentCategory?.name;
  }, [selectedSubcategoryId, currentCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {displayTitle}
            </h1>
            <p className="text-sm text-gray-600">
              {pagination?.totalCount || 0}{" "}
              {pagination?.totalCount === 1 ? "product" : "products"} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Button */}
            {/* Filters Button */}
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-200 transition-all duration-200 shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div
          className={`grid ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          } gap-5 md:gap-6`}
        >
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Grid3x3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-sm">
            Try selecting a different subcategory or check back later for new
            arrivals
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing page{" "}
              <span className="font-semibold text-gray-900">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("page", filters.page - 1)}
                disabled={filters.page === 1}
                className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-green-200 transition-all duration-200 shadow-sm disabled:hover:bg-white disabled:hover:border-gray-200"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilter("page", pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 ${
                          filters.page === pageNum
                            ? "bg-green-600 text-white shadow-md"
                            : "border border-gray-200 hover:bg-gray-50 hover:border-green-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => setFilter("page", filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-green-200 transition-all duration-200 shadow-sm disabled:hover:bg-white disabled:hover:border-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
