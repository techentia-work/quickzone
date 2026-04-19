"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategory } from "@/hooks";
import { TypeOfCategory } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { Footer } from "@/components";
import { useAppSelector } from "@/lib/store";

function CategoryCard({ category }: { category: any }) {
  return (
    <div className="flex flex-col items-center p-2">
      <Link href={`/categories/${category.slug}`} className="group">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300">
          <Image
            src={category.thumbnail as string}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>
      <p className="text-sm font-semibold text-center mt-2 line-clamp-2 hover:text-green-600 transition-colors">
        {category.name}
      </p>
    </div>
  );
}

const CategoryPage = () => {
  const { data: masterCategories, isLoading } = useCategory({
    type: TypeOfCategory.MASTER,
    tree: true,
  });

  // Get selected master category from Redux store
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  // Filter categories based on selected master category
  const filteredCategories = useMemo(() => {
    if (!masterCategories || masterCategories.length === 0) return [];

    if (!selectedMasterCategoryId) {
      // When "All" is selected, show all categories
      return masterCategories.flatMap(
        (master: any) =>
          master.children?.flatMap((superCat: any) => superCat.children || []) || []
      );
    } else {
      // When specific master category is selected, show only its categories
      const selectedMaster = masterCategories.find(
        (master: any) => master._id === selectedMasterCategoryId
      );

      if (!selectedMaster) return [];

      return selectedMaster.children?.flatMap(
        (superCat: any) => superCat.children || []
      ) || [];
    }
  }, [masterCategories, selectedMasterCategoryId]);

  if (isLoading) {
    return (
      <div className="animate-pulse py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl mb-2" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!masterCategories || masterCategories.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          No categories available. Check back later!
        </p>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          No categories available for this selection.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCategories.map((category: any) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>
      <Footer/>
    </div>
  );
};

export default CategoryPage;