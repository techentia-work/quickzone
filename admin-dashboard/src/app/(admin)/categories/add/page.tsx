"use client";
import React from "react";
import { useAdminCategory } from "@/hooks";
import { AddCategoryForm } from "../_components/AddCategoryForm";
import { CreateCategoryPayload } from "@/lib/types";

const AddCategoryPage = () => {
  const { createCategory, categories, adminCategories } = useAdminCategory();

  const AdminCategories = (adminCategories as any).categories;

  console.log("Categories in Add Category Page:", categories);
  console.log("Admin Categories in Add Category Page:", adminCategories);
  const handleAddCategory = async (data: CreateCategoryPayload) => {
    const payload = { ...data };
    if (!payload.parent) delete payload.parent;
    if (payload.metaKeywords === "") delete payload.metaKeywords;
    if (payload.metaDescription === "") delete payload.metaDescription;
    if (payload.metaTitle === "") delete payload.metaTitle;

    await createCategory(payload);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <AddCategoryForm
        onSubmit={handleAddCategory}
        categories={AdminCategories}
        isLoading={false}
      />
    </div>
  );
};

export default AddCategoryPage;
