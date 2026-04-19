"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import {
  FormInput,
  FormTextArea,
  FormCheckbox,
  FormGrid,
  FormSubmitButton,
  FormCancelButton,
  FormActions,
  FormSelect,
} from "@/components";
import { useAdminSlider } from "@/hooks/entities/useAdminSlider";
import { useImageUpload, useAdminCategory } from "@/hooks";
import toast from "react-hot-toast";
import Image from "next/image";
import { useAddSliderForm } from "./hooks/useAddSliderForm";

export function AddSliderForm() {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    handleAddImageFile,
    handleRemoveImageFile,
    imageFile,
    setFormData,
  } = useAddSliderForm();

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const { createSlider } = useAdminSlider();
  const { adminCategories } = useAdminCategory();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ State for selected category/subcategory - use null instead of undefined
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // ✅ Filter subcategories based on selected category and not deleted
  const subcategories = adminCategories?.filter(
    (cat: any) =>
      cat.parent?.toString() === selectedCategory &&
      cat.type === "SUBCATEGORY" &&
      cat.isDeleted === false
  );

  // ✅ Auto-generate slug based on selected category/subcategory
  useEffect(() => {
    const categoryObj = adminCategories?.find(
      (cat: any) => cat._id === selectedCategory
    );
    const subcategoryObj = adminCategories?.find(
      (cat: any) => cat._id === selectedSubcategory
    );

    const categorySlug = categoryObj
      ? categoryObj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "";
    const subcategorySlug = subcategoryObj
      ? subcategoryObj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "";

    const finalSlug = [categorySlug, subcategorySlug]
      .filter(Boolean)
      .join("/")
      .replace(/\/+$/, "");

    setFormData((prev: any) => ({
      ...prev,
      slug: finalSlug,
    }));
  }, [selectedCategory, selectedSubcategory, adminCategories, setFormData]);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(true)) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const file = imageFile?.file;
      let imageUrl = formData.imageUrl;

      if (file) {
        const res = await uploadSingle(file);
        imageUrl = (res as any)?.imageUrl;
        if (!imageUrl) throw new Error("Image upload failed");
      }

      // ✅ Build payload with null instead of undefined for optional fields
      const payload = {
        ...formData,
        imageUrl,
        masterCategory: formData.masterCategory || null, // ✅ null instead of undefined
        category: selectedCategory || null,              // ✅ null instead of undefined
        subcategory: selectedSubcategory || null,        // ✅ null instead of undefined
      };

      console.log("Submitting payload:", payload); // Debug log

      const res = await createSlider(payload as any);

      if (res.success) {
        resetForm();
        handleRemoveImageFile();
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    } catch (err) {
      toast.error("Failed to create slider");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isFormLoading = isUploadingSingle || isSubmitting;

  // ✅ Render UI
  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Slider</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title, Order, Position */}
        <FormGrid cols={2}>
          <FormInput
            label="Title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />
          <FormInput
            label="Order"
            name="order"
            type="number"
            min="1"
            value={formData.order ?? ""}
            onChange={handleChange}
            error={errors.order}
          />
          <FormSelect
            options={[
              { value: "TOP", label: "Top" },
              { value: "MIDDLE", label: "Middle" },
              { value: "BOTTOM", label: "Bottom" },
              { value: "APP", label: "App" },
            ]}
            label="Position"
            name="position"
            value={formData.position ?? ""}
            onChange={handleChange}
            error={errors.position}
          />
        </FormGrid>

        {/* Master Category */}
        <FormSelect
          label="Select Master Category"
          name="masterCategory"
          value={formData.masterCategory || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              masterCategory: e.target.value === "" ? null : e.target.value, // ✅ null instead of undefined
            }))
          }
          options={[
            { value: "", label: "Default (no master category)" },
            ...adminCategories
              .filter((cat: any) => cat.type === "MASTER" && cat.isDeleted === false)
              .map((cat: any) => ({
                value: cat._id,
                label: cat.name,
              })),
          ]}
        />

        {/* Slug (auto-generated) */}
        <FormInput
          label="Slug"
          name="slug"
          value={formData.slug || ""}
          disabled
          className="bg-gray-50"
        />

        {/* Category & Subcategory */}
        <FormGrid cols={2}>
          <FormSelect
            label="Select Category"
            name="category"
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory(e.target.value === "" ? null : e.target.value) // ✅ null instead of undefined
            }
            options={[
              { value: "", label: "Select Category" },
              ...adminCategories
                .filter((cat: any) => cat.type === "CATEGORY" && cat.isDeleted === false)
                .map((cat: any) => ({
                  value: cat._id,
                  label: cat.name,
                })),
            ]}
          />

          {selectedCategory && (
            <FormSelect
              label="Select Subcategory"
              name="subcategory"
              value={selectedSubcategory || ""}
              onChange={(e) =>
                setSelectedSubcategory(e.target.value === "" ? null : e.target.value) // ✅ null instead of undefined
              }
              options={[
                { value: "", label: "Select Subcategory" },
                ...subcategories.map((sub: any) => ({
                  value: sub._id,
                  label: sub.name,
                })),
              ]}
            />
          )}
        </FormGrid>

        {/* Description */}
        <FormTextArea
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          error={errors.description}
        />

        {/* Image Upload */}
        <div>
          <h3 className="text-lg font-medium mb-4">Slider Image</h3>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAddImageFile(file);
            }}
            disabled={isFormLoading}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
              file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {(imageFile?.preview || formData.imageUrl) && (
            <div className="mt-3 flex items-center gap-4">
              <Image
                src={imageFile?.preview || formData.imageUrl || ""}
                width={128}
                height={128}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Recommended Size: 300px × 240px
          </p>
        </div>

        {/* Active Toggle */}
        <FormCheckbox
          label="Active"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />

        {/* Form Actions */}
        <FormActions>
          <FormCancelButton onClick={resetForm} disabled={isFormLoading}>
            Reset
          </FormCancelButton>
          <FormSubmitButton
            isLoading={isFormLoading}
            loadingText="Creating Slider..."
            icon={<Save className="w-4 h-4" />}
          >
            Create Slider
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}