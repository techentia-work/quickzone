"use client";
import React, { useRef, useState } from "react";
import { Save } from "lucide-react";
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormGrid,
  FormSubmitButton,
  FormCancelButton,
  FormActions,
} from "@/components";
import { CreateCategoryPayload, TypeOfCategory } from "@/lib/types";
import { useCreateCategoryForm } from "./hooks/useCreateCategory";
import { useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import { useAdminCategory } from "@/hooks";
import Image from "next/image";

interface AddCategoryFormProps {
  onSubmit?: (data: CreateCategoryPayload) => Promise<void>;
  isLoading?: boolean;
  categories?: {
    _id: string;
    name: string;
    type: TypeOfCategory;
    fullSlug?: string;
  }[];
}

export function AddCategoryForm({
  onSubmit,
  isLoading = false,
  categories = [],
}: AddCategoryFormProps) {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    getFileForUpload,
    handleAddImageFile,
    handleAddBannerFile,
    getBannerForUpload,
    generateSlug,
    updateField,
  } = useCreateCategoryForm();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const { createCategory, adminCategories } = useAdminCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const fileToUpload = getFileForUpload();
      const bannerToUpload = getBannerForUpload();

      if (!fileToUpload) {
        toast.error("Please select an image");
        setIsSubmitting(false);
        return;
      }

      const uploadResponse = await uploadSingle(fileToUpload);
      const imageUrl = (uploadResponse as any)?.imageUrl;
      if (!imageUrl) throw new Error("Failed to upload thumbnail");

      let bannerUrl = "";
      if (bannerToUpload) {
        const bannerResponse = await uploadSingle(bannerToUpload);
        bannerUrl = (bannerResponse as any)?.imageUrl || "";
      }

      let parentId = formData.parent;
      if (parentId === null || parentId === "") parentId = undefined;

      const categoryData: CreateCategoryPayload = {
        ...formData,
        thumbnail: imageUrl,
        ...(bannerUrl ? { banner: bannerUrl } : {}),
        parent: parentId,
      };

      await createCategory(categoryData);

      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error submitting form", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAddImageFile(file);
    } else {
      toast.error("No file selected");
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAddBannerFile(file);
  };

  const isFormLoading = isUploadingSingle || isSubmitting;

  // ✅ Corrected Parent Filtering Logic
 // ✅ Corrected Parent Filtering Logic with soft-delete check
const filteredParentOptions = React.useMemo(() => {
  if (!Array.isArray(adminCategories)) return [];

  const flatCategories = adminCategories
    .filter((c: any) => !c.isDeleted) // <-- only non-deleted categories
    .map((c: any) => ({
      _id: c._id,
      name: c.name,
      type: c.type,
      fullSlug: c.fullSlug ?? c.name,
    }));

  switch (formData.type) {
    case TypeOfCategory.SUPER:
      // SUPER -> parent must be MASTER
      return flatCategories.filter(
        (cat: any) => cat.type === TypeOfCategory.MASTER
      );

    case TypeOfCategory.CATEGORY:
      // CATEGORY -> parent must be SUPER
      return flatCategories.filter(
        (cat: any) => cat.type === TypeOfCategory.SUPER
      );

    case TypeOfCategory.SUBCATEGORY:
      // SUBCATEGORY -> parent must be CATEGORY
      return flatCategories.filter(
        (cat: any) => cat.type === TypeOfCategory.CATEGORY
      );

    default:
      // MASTER has no parent
      return [];
  }
}, [formData.type, adminCategories]);


  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Add New Category
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h3>
          <FormGrid cols={2}>
            <FormInput
              label="Category Name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => {
                const nameValue = e.target.value;
                updateField("name", nameValue);

                const currentAutoSlug = generateSlug(nameValue);

                // Only auto-update slug if it was empty or matches previous auto-slug
                if (
                  !formData.slug ||
                  formData.slug === generateSlug(formData.name)
                ) {
                  updateField("slug", currentAutoSlug);
                }
              }}
              error={errors.name}
              placeholder="Enter category name"
            />
            <FormInput
              label="Slug"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              error={errors.slug}
              placeholder="category-slug"
            />
            <FormSelect
              label="Category Type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              options={[
                { value: "", label: "Select Category Type" },
                { value: TypeOfCategory.MASTER, label: "Master" },
                { value: TypeOfCategory.SUPER, label: "Super" },
                { value: TypeOfCategory.CATEGORY, label: "Category" },
                { value: TypeOfCategory.SUBCATEGORY, label: "SubCategory" },
              ]}
            />

            {/* Hide parent selection for MASTER */}
            {formData.type !== TypeOfCategory.MASTER && (
              <FormSelect
                label="Parent Category"
                name="parent"
                value={formData.parent ?? ""}
                onChange={handleChange}
                options={[
                  {
                    value: "",
                    label: filteredParentOptions.length
                      ? "Select Parent Category"
                      : "No valid parent categories",
                  },
                  ...filteredParentOptions.map((c: any) => ({
                    value: c._id,
                    label: c.name,
                  })),
                ]}
                error={errors.parent}
              />
            )}
          </FormGrid>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Category Image & Banner
          </h3>
          <FormGrid cols={2}>
            {/* Thumbnail */}
            <div className="flex flex-col gap-4">
              <label className="block text-sm font-medium text-gray-700">Category Thumbnail *</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isFormLoading}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
                  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                  file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.thumbnail && (
                <Image
                  src={formData.thumbnail}
                  width={128}
                  height={128}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              )}
            </div>

            {/* Banner */}
            {formData.type === "SUBCATEGORY" && (
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-gray-700">Category Banner (App Display) - Optional</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  disabled={isFormLoading}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
                    file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                    file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {formData.banner && (
                  <Image
                    src={formData.banner}
                    width={300}
                    height={128}
                    alt="Banner Preview"
                    className="h-32 object-contain w-auto rounded-md border bg-gray-50"
                  />
                )}
              </div>
            )}
          </FormGrid>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Additional Details
          </h3>
          <FormGrid cols={2}>
            <FormInput
              label="Subtitle"
              name="subtitle"
              value={formData.subtitle ?? ""}
              onChange={handleChange}
              placeholder="Optional subtitle"
            />
            <FormCheckbox
              label="Active"
              name="isActive"
              checked={formData.isActive ?? false}
              onChange={handleChange}
            />
          </FormGrid>
        </div>

        {/* SEO Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            SEO & Meta Information
          </h3>
          <FormGrid cols={1}>
            <FormInput
              label="Meta Title"
              name="metaTitle"
              value={formData.metaTitle ?? ""}
              onChange={handleChange}
              placeholder="SEO title (max 60 chars)"
            />
            <FormTextArea
              label="Meta Description"
              name="metaDescription"
              value={formData.metaDescription ?? ""}
              onChange={handleChange}
              rows={2}
              placeholder="SEO description (max 160 chars)"
            />
            <FormInput
              label="Meta Keywords"
              name="metaKeywords"
              value={formData.metaKeywords ?? ""}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
            />
          </FormGrid>
        </div>

        {/* Markup */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Category Markup (HTML)
          </h3>
          <FormTextArea
            label="Markup"
            name="markup"
            value={formData.markup ?? ""}
            onChange={handleChange}
            rows={4}
            placeholder="Optional custom HTML content"
          />
        </div>

        <FormActions>
          <FormCancelButton onClick={resetForm} disabled={isLoading}>
            Reset
          </FormCancelButton>
          <FormSubmitButton
            isLoading={isFormLoading}
            loadingText="Uploading & Creating..."
            icon={<Save className="w-4 h-4" />}
          >
            Create Category
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
