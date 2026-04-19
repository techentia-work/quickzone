// app/categories/[slug]/_components/CategorySidebar.tsx
"use client";

import { useCategory } from "@/hooks";
import { TypeOfCategory } from "@/lib/types";
import { ChevronRight, Loader2, Package } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

interface CategorySidebarProps {
  categorySlug: string;
  selectedSubcategoryId: string | null;
  onSubcategorySelect: (id: string | null) => void;
}

export function CategorySidebar({
  categorySlug,
  selectedSubcategoryId,
  onSubcategorySelect,
}: CategorySidebarProps) {
  const { data: categories, isLoading } = useCategory({
    type: TypeOfCategory.SUPER,
    tree: true,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 750;
      setIsMobile(mobile);

      if (!mobile) {
        setIsOpen(false); // Desktop => always closed
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Find category using slug
  const currentCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;

    for (const superCat of categories) {
      if (superCat.slug === categorySlug) return superCat;

      if (superCat.children) {
        for (const cat of superCat.children) {
          if (cat.slug === categorySlug) return cat;
        }
      }
    }
    return null;
  }, [categories, categorySlug]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-gray-500 text-sm text-center">Category not found</p>
      </div>
    );
  }

  const subcategories = currentCategory.children || [];

  return (
    <div className="relative">
      {/* MOBILE TOGGLE BUTTON */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -left-3 top-3 z-50 bg-green-600 text-white px-3 py-1 rounded-md shadow"
        >
          {isOpen ? "Close" : "Open"}
        </button>
      )}

      <div
        className={`
          bg-white rounded-2xl shadow-sm border border-gray-100 
          overflow-hidden transition-all duration-300

          ${isMobile ? (isOpen ? "w-full" : "w-28") : "w-28"}
        `}
      >
        {/* Category Header (ALWAYS VISIBLE) */}
        <div className="p-6 border-b border-gray-100 bg-green-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Package className="w-5 h-5 text-green-600" />
            </div>

            {/* Name hide if CLOSED in Mobile */}
            {(!isMobile || isOpen) && (
              <h2 className="text-xl font-bold text-gray-900">
                {currentCategory.name}
              </h2>
            )}
          </div>

          {/* Subtitle hide if sidebar closed */}
          {(!isMobile || isOpen) && currentCategory.subtitle && (
            <p className="text-sm text-gray-600 mt-1 ml-12">
              {currentCategory.subtitle}
            </p>
          )}
        </div>

        {/* FULL CONTENT — only visible when open */}
        {(!isMobile || isOpen) && (
          <>
            {/* All Products */}
            <button
              onClick={() => onSubcategorySelect(null)}
              className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-200 border-b border-gray-50 ${
                selectedSubcategoryId === null
                  ? "bg-green-50 text-green-700 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Package
                  className={`w-4 h-4 ${
                    selectedSubcategoryId === null
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                All Products
              </span>

              {selectedSubcategoryId === null && (
                <ChevronRight className="w-5 h-5 text-green-600" />
              )}
            </button>

            {/* Subcategories */}
            <div className="max-h-full md:max-h-[calc(100vh-350px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {subcategories.length > 0 ? (
                subcategories.map((subcategory: any) => (
                  <button
                    key={subcategory._id}
                    onClick={() => onSubcategorySelect(subcategory._id)}
                    className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                      selectedSubcategoryId === subcategory._id
                        ? "bg-green-50 text-green-700 font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:pl-7"
                    }`}
                  >
                    <span className="text-sm flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedSubcategoryId === subcategory._id
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      />
                      {subcategory.name}
                    </span>

                    {selectedSubcategoryId === subcategory._id && (
                      <ChevronRight className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No subcategories available
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
