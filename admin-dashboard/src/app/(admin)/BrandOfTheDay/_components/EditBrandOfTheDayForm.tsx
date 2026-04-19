"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
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

import { useBrandOfTheDayForm } from "./hooks/useBrandOfTheDayForm";
import { useImageUpload } from "@/hooks";
import { useAdminBrandOfTheDay } from "@/hooks/entities/useAdminBrandOfTheDay";
import { useAdminCategory } from "@/hooks/entities/useAdminCategory";
import { BrandOfTheDayType } from "@/lib/types/brandOfTheDay/brandOfTheDay.types";

interface EditBrandOfTheDayFormProps {
  id: string;
}

export function EditBrandOfTheDayForm({
  id,
}: EditBrandOfTheDayFormProps) {
  const { list, update, isMutating } =
    useAdminBrandOfTheDay();

  const item = list.find(
    (x: BrandOfTheDayType) => x._id === id
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
  } = useBrandOfTheDayForm({
    masterCategory: null,
  });

  const { uploadSingle } = useImageUpload();
  const { adminCategories } =
    useAdminCategory("?type=MASTER");

  const masterCategories = useMemo(
    () =>
      adminCategories.filter(
        (c: any) => c.type === "MASTER" && !c.isDeleted
      ),
    [adminCategories]
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= PRELOAD ================= */
  useEffect(() => {
    if (!item) return;

    setFormData({
      name: item.name,
      title: item.title,
      websiteUrl: item.websiteUrl,
      banner: item.banner ?? "",
      thumbnail: item.thumbnail ?? "",
      masterCategory: item.masterCategory?._id ?? null,
      isActive: item.isActive,
    });
  }, [item, setFormData]);

  /* ================= SUBMIT ================= */
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
        title: formData.title,
        websiteUrl: formData.websiteUrl,
        banner: bannerUrl,
        thumbnail: thumbUrl,
        masterCategory: formData.masterCategory || null,
        isActive: formData.isActive,
      };

      await update(id, payload);
      toast.success("Brand of the day updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error updating brand of the day");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading brand of the day...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Edit Brand Of The Day
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME + TITLE */}
        <FormGrid cols={2}>
          <FormInput
            label="Brand Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <FormInput
            label="Brand Title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />
        </FormGrid>

        {/* WEBSITE */}
        <FormInput
          label="Website URL"
          name="websiteUrl"
          required
          value={formData.websiteUrl}
          onChange={handleChange}
          error={errors.websiteUrl}
        />

        {/* MASTER CATEGORY */}
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
            hidden
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
              className="mt-4 rounded-lg border"
            />
          ) : formData.thumbnail ? (
            <Image
              src={formData.thumbnail}
              width={200}
              height={200}
              alt="Thumbnail"
              className="mt-4 rounded-lg border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
            </div>
          )}
        </div>

        {/* Banner */}
        <div>
          <h3 className="text-lg font-medium mb-2">Banner</h3>
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
            hidden
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
              className="mt-4 rounded-lg border"
            />
          ) : formData.banner ? (
            <Image
              src={formData.banner}
              width={400}
              height={200}
              alt="Banner"
              className="mt-4 rounded-lg border"
            />
          ) : (
            <div className="border-2 border-dashed p-6 text-center rounded-lg mt-4">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
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
                title: item.title,
                websiteUrl: item.websiteUrl,
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
            loadingText="Updating brand..."
            icon={<Save className="w-4 h-4" />}
          >
            Update Brand
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
