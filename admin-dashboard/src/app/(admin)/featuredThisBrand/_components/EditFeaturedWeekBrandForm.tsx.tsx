"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import {
  FormInput,
  FormCheckbox,
  FormGrid,
  FormSubmitButton,
  FormCancelButton,
  FormActions,
  FormSelect,
} from "@/components";

import { useBrandForm } from "./hooks/useBrandForm";
import { useImageUpload } from "@/hooks";
import { useAdminFeaturedWeekBrand } from "@/hooks/entities/useAdminFeaturedWeekBrand";
import { useAdminCategory } from "@/hooks/entities/useAdminCategory";
import { FeaturedWeekBrandType } from "@/lib/types/featuredWeekBrand/featuredWeekBrand.types";

interface EditFeaturedWeekBrandFormProps {
  id: string;
}

export function EditFeaturedWeekBrandForm({
  id,
}: EditFeaturedWeekBrandFormProps) {
  const { list, update, isMutating } = useAdminFeaturedWeekBrand();
  const item = list.find(
    (x: FeaturedWeekBrandType) => x._id === id
  );

  const {
    formData,
    errors,
    bannerFile,
    thumbnailFile,
    handleChange,
    updateField,
    validateForm,
    setFormData,
    handleBannerUpload,
    handleThumbnailUpload,
    generateSlug,
  } = useBrandForm({
    masterCategory: null,
  });

  const { uploadSingle } = useImageUpload();
  const { adminCategories } = useAdminCategory("?type=MASTER");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Preload data
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        slug: item.slug,
        banner: item.banner ?? "",
        thumbnail: item.thumbnail ?? "",
        masterCategory: item.masterCategory?._id ?? null,
        isActive: item.isActive,
      });
    }
  }, [item, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Fix validation errors");

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

      await update(id, payload);

      toast.success("Featured brand updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error updating featured brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading featured brand...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Edit Featured This Week
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

        {/* Master Category */}
        <FormSelect
          label="Master Category"
          name="masterCategory"
          value={formData.masterCategory ?? ""}
          onChange={(e) =>
            updateField("masterCategory", e.target.value || null)
          }
          options={adminCategories.map((cat: any) => ({
            label: cat.name,
            value: cat._id,
          }))}
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
          ) : formData.thumbnail ? (
            <Image
              src={formData.thumbnail}
              width={200}
              height={200}
              alt="Thumbnail"
              className="mt-4 rounded-lg object-cover border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">No thumbnail uploaded</p>
            </div>
          )}
        </div>

        {/* Banner */}
        <div>
          <h3 className="text-lg font-medium mb-2">Banner (optional)</h3>

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
          ) : formData.banner ? (
            <Image
              src={formData.banner}
              width={400}
              height={200}
              alt="Banner"
              className="mt-4 rounded-lg object-cover border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">No banner uploaded</p>
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
          <FormCancelButton
            onClick={() => {
              if (!item) return;
              setFormData({
                name: item.name,
                slug: item.slug,
                banner: item.banner ?? "",
                thumbnail: item.thumbnail ?? "",
                masterCategory: item.masterCategory?._id ?? null,
                isActive: item.isActive,
              });
            }}
          >
            Reset
          </FormCancelButton>

          <FormSubmitButton
            isLoading={isSubmitting || isMutating}
            loadingText="Updating featured brand..."
            icon={<Save className="w-4 h-4" />}
          >
            Update Featured Brand
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
