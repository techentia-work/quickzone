"use client";

import React, { useRef, useState, useMemo } from "react";
import { Save, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import {
  FormInput,
  FormCheckbox,
  FormGrid,
  FormActions,
  FormSubmitButton,
  FormCancelButton,
  FormSelect,
} from "@/components";

import { useBrandForm } from "./hooks/useBrandForm";
import { useImageUpload } from "@/hooks";
import { useAdminFeaturedWeekBrand } from "@/hooks/entities/useAdminFeaturedWeekBrand";
import { useAdminCategory } from "@/hooks/entities/useAdminCategory";

export function AddFeaturedWeekBrandForm() {
  const {
    formData,
    errors,
    bannerFile,
    thumbnailFile,
    handleChange,
    updateField,
    validateForm,
    resetForm,
    handleBannerUpload,
    handleThumbnailUpload,
    generateSlug,
  } = useBrandForm({
    masterCategory: null,
  });

  const { uploadSingle } = useImageUpload();
  const { create } = useAdminFeaturedWeekBrand();

  // ✅ get ALL categories
  const { adminCategories } = useAdminCategory();

  // ✅ ONLY MASTER categories (FIX)
  const masterCategories = useMemo(
    () =>
      adminCategories.filter(
        (cat: any) => cat.type === "MASTER" && !cat.isDeleted
      ),
    [adminCategories]
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      let bannerUrl = formData.banner;
      let thumbUrl = formData.thumbnail;

      if (bannerFile) {
        const res = await uploadSingle(bannerFile.file);
        bannerUrl = res?.imageUrl;
      }

      if (thumbnailFile) {
        const res = await uploadSingle(thumbnailFile.file);
        thumbUrl = res?.imageUrl;
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        banner: bannerUrl,
        thumbnail: thumbUrl,
        masterCategory: formData.masterCategory || null,
        isActive: formData.isActive,
      };

      await create(payload);

      toast.success("Featured Week Brand created successfully");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Error creating featured brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Add Featured This Week
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + Slug */}
        <FormGrid cols={2}>
          <FormInput
            label="Featured Name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => {
              const nameValue = e.target.value;
              updateField("name", nameValue);

              if (
                !formData.slug ||
                formData.slug === generateSlug(formData.name)
              ) {
                updateField("slug", generateSlug(nameValue));
              }
            }}
            error={errors.name}
            placeholder="e.g., Apple"
          />

          <FormInput
            label="Slug"
            name="slug"
            required
            value={formData.slug ?? ""}
            onChange={(e) =>
              updateField("slug", generateSlug(e.target.value))
            }
            error={errors.slug}
            placeholder="apple"
          />
        </FormGrid>

        {/* ✅ MASTER CATEGORY ONLY */}
        <FormSelect
          label="Master Category"
          name="masterCategory"
          value={formData.masterCategory ?? ""}
          onChange={(e) =>
            updateField("masterCategory", e.target.value || null)
          }
          options={[
            { label: "Select Master Category", value: "" },
            ...masterCategories.map((cat: any) => ({
              label: cat.name,
              value: cat._id,
            })),
          ]}
          error={errors.masterCategory}
        />

        {/* Thumbnail */}
        <div>
          <h3 className="text-lg font-medium mb-2">Thumbnail</h3>

          <button
            type="button"
            onClick={() => thumbInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex gap-2"
          >
            <Upload size={16} /> Upload Thumbnail
          </button>

          <input
            ref={thumbInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleThumbnailUpload(e.target.files[0])
            }
          />

          {thumbnailFile ? (
            <Image
              src={thumbnailFile.preview}
              width={200}
              height={200}
              alt="Thumbnail Preview"
              className="mt-4 rounded-lg object-cover border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">
                No thumbnail selected
              </p>
            </div>
          )}
        </div>

        {/* Banner */}
        <div>
          <h3 className="text-lg font-medium mb-2">
            Banner (optional)
          </h3>

          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex gap-2"
          >
            <Upload size={16} /> Upload Banner
          </button>

          <input
            ref={bannerInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleBannerUpload(e.target.files[0])
            }
          />

          {bannerFile ? (
            <Image
              src={bannerFile.preview}
              width={400}
              height={200}
              alt="Banner Preview"
              className="mt-4 rounded-lg object-cover border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">
                No banner selected
              </p>
            </div>
          )}
        </div>

        <FormCheckbox
          label="Active"
          name="isActive"
          checked={formData.isActive ?? true}
          onChange={handleChange}
        />

        <FormActions>
          <FormCancelButton onClick={resetForm}>
            Reset
          </FormCancelButton>

          <FormSubmitButton
            isLoading={isSubmitting}
            icon={<Save className="w-4 h-4" />}
          >
            Create Featured Brand
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
