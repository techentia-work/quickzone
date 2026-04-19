"use client";

import { useEffect, useMemo } from "react";
import { useCategory } from "@/hooks";
import {
  useAppDispatch,
  useAppSelector,
  setSelectedMasterCategory,
} from "@/lib/store";
import SubNavLoader from "../loader/SubNavLoader";
import { TypeOfCategory } from "@/lib/types";

export function SubNavbar() {
  const dispatch = useAppDispatch();
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  const { data: masterCategories, isLoading } = useCategory({
    type: TypeOfCategory.MASTER,
  });

  // 🔄 Reverse order sorting
  const sortedCategories = useMemo(() => {
    if (!masterCategories) return [];
    return [...masterCategories].reverse(); // REVERSE ORDER
  }, [masterCategories]);

  useEffect(() => {
    if (!isLoading && sortedCategories.length > 0 && !selectedMasterCategoryId) {
      dispatch(setSelectedMasterCategory(sortedCategories[0]._id));
    }
  }, [isLoading, sortedCategories, selectedMasterCategoryId, dispatch]);

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setSelectedMasterCategory(categoryId));
  };

  if (isLoading) {
    return <SubNavLoader />;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[112px] md:top-20 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:gap-3 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {sortedCategories.map((category: any) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 font-medium text-sm ${
                selectedMasterCategoryId === category._id
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.icon && (
                <span className="text-base">{category.icon}</span>
              )}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
