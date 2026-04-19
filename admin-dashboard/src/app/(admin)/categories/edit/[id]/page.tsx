"use client";
import React, { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormInput,
  FormSelect,
  FormCheckbox,
} from "@/components";
import { useAdminCategory, useImageUpload } from "@/hooks";
import { useEditCategoryForm } from "../../_components/hooks/useEditCategory";
import { ROUTES } from "@/lib/consts";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getCategoryByIdQuery, updateCategory, adminCategories } = useAdminCategory();
  const { uploadSingle } = useImageUpload();

  const { data: category, isLoading, isError } = getCategoryByIdQuery(id);

  const {
    formData,
    errors,
    handleChange,
    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,
    validateForm,
    getSafeStringValue,
    getSafeBooleanValue,
    imageFile,
    bannerFile,
    handleAddBannerFile,
    handleRemoveBannerFile,
    getBannerForUpload,
  } = useEditCategoryForm(category);

  // ✅ Filter parent options to ignore deleted categories
  const parentOptions = React.useMemo(() => {
    if (!Array.isArray(adminCategories)) return [];

    const activeCategories = adminCategories.filter((c: any) => !c.isDeleted);

    switch (formData.type) {
      case "SUPER":
        return activeCategories
          .filter((c) => c.type === "MASTER")
          .map((c) => ({ value: c._id, label: c.name }));
      case "CATEGORY":
        return activeCategories
          .filter((c) => c.type === "SUPER")
          .map((c) => ({ value: c._id, label: c.name }));
      case "SUBCATEGORY":
        return activeCategories
          .filter((c) => c.type === "CATEGORY")
          .map((c) => ({ value: c._id, label: c.name }));
      default:
        return [];
    }
  }, [formData.type, adminCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    // ✅ Prevent submitting if parent is deleted
    if (formData.parent && !parentOptions.find((p) => p.value === formData.parent)) {
      toast.error("Cannot assign a deleted category as parent");
      return;
    }

    try {
      const file = getFileForUpload();
      const bannerPayload = getBannerForUpload();
      let thumbnailUrl = formData.thumbnail;
      let bannerUrl = formData.banner;

      if (file) {
        toast.loading("Uploading image...", { id: "upload" });
        const res = await uploadSingle(file);
        toast.dismiss("upload");

        if (res?.imageUrl) {
          thumbnailUrl = res.imageUrl;
        } else {
          toast.error("Image upload failed");
          return;
        }
      }

      if (bannerPayload) {
        toast.loading("Uploading banner...", { id: "upload-banner" });
        const bannerRes = await uploadSingle(bannerPayload);
        toast.dismiss("upload-banner");

        if (bannerRes?.imageUrl) {
          bannerUrl = bannerRes.imageUrl;
        } else {
          toast.error("Banner upload failed");
          return;
        }
      }

      const res = await updateCategory(id, { ...formData, thumbnail: thumbnailUrl, banner: bannerUrl });
      if (res?.success) router.push(ROUTES.ADMIN.CATEGORY.MANAGE);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  if (isError || !category)
    return <div className="text-center py-20 text-gray-500">Category not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FormInput
              label="Name"
              name="name"
              value={getSafeStringValue("name")}
              onChange={handleChange}
              error={errors.name}
            />

            <FormInput
              label="Slug"
              name="slug"
              value={getSafeStringValue("slug")}
              onChange={handleChange}
              error={errors.slug}
            />

            <FormSelect
              label="Type"
              name="type"
              value={getSafeStringValue("type")}
              onChange={handleChange}
              error={errors.type}
              options={[
                { value: "MASTER", label: "Master" },
                { value: "SUPER", label: "Super" },
                { value: "CATEGORY", label: "Category" },
                { value: "SUBCATEGORY", label: "Subcategory" },
              ]}
            />

            <FormSelect
              label="Parent Category"
              name="parent"
              value={getSafeStringValue("parent")}
              onChange={handleChange}
              error={errors.parent}
              options={parentOptions}
            />

            {/* ⚠️ Warning if selected parent is deleted */}
            {formData.parent && !parentOptions.find((p) => p.value === formData.parent) && (
              <p className="text-red-600 text-sm mt-1">
                ⚠️ The selected parent category has been deleted.
              </p>
            )}

            {/* 🖼️ Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAddImageFile(e.target.files?.[0])}
                className="block w-full text-sm border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              <div className="mt-3 relative w-24 h-24">
                <Image
                  src={imageFile?.preview || formData.thumbnail || category.thumbnail || "/placeholder-image.jpg"}
                  alt="Thumbnail"
                  fill
                  className="object-cover rounded border"
                />
              </div>

              {imageFile && (
                <button
                  type="button"
                  onClick={handleRemoveImageFile}
                  className="text-xs text-red-500 mt-1"
                >
                  Remove image
                </button>
              )}

              {errors.thumbnail && (
                <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
              )}
            </div>

            {/* 🖼️ Banner */}
            <div>
              <label className="block text-sm font-medium mb-1">Banner (App Display) - Optional</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAddBannerFile(e.target.files?.[0])}
                className="block w-full text-sm border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />

              <div className="mt-3 relative w-full max-w-[300px] h-24">
                <Image
                  src={bannerFile?.preview || formData.banner || category.banner || "/placeholder-image.jpg"}
                  alt="Banner"
                  fill
                  className="object-contain rounded border bg-gray-50"
                  unoptimized={
                    // Avoid optimizing external placeholder to prevent next/image build errors if strict
                    (bannerFile?.preview || formData.banner || category.banner) ? false : true
                  }
                />
              </div>

              {bannerFile && (
                <button
                  type="button"
                  onClick={handleRemoveBannerFile}
                  className="text-xs text-red-500 mt-1"
                >
                  Remove banner
                </button>
              )}

              {errors.banner && (
                <p className="mt-1 text-sm text-red-600">{errors.banner}</p>
              )}
            </div>

            <FormInput
              label="Meta Title"
              name="metaTitle"
              value={getSafeStringValue("metaTitle")}
              onChange={handleChange}
            />

            <textarea
              name="metaDescription"
              value={getSafeStringValue("metaDescription")}
              onChange={handleChange}
              className="border rounded-md p-2 text-sm"
            />

            <FormCheckbox
              label="Active"
              name="isActive"
              checked={getSafeBooleanValue("isActive")}
              onChange={handleChange}
            />

            <FormInput
              label="Meta Keywords (comma separated)"
              name="metaKeywords"
              placeholder="keyword1, keyword2"
              value={formData.metaKeywords ?? ""}
              onChange={handleChange}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.ADMIN.CATEGORY.MANAGE)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
