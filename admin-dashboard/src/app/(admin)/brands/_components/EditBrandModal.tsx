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
} from "@/components";

import { useBrandForm } from "./hooks/useBrandForm";
import { useImageUpload } from "@/hooks";
import { useAdminBrand } from "@/hooks/entities/useAdminBrand";

export function EditBrandForm({ brandId }: { brandId: string }) {
    const { brandList, updateBrand } = useAdminBrand();
    const brand = brandList.find((x: any) => x._id === brandId);

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
        resetForm,
    } = useBrandForm(brand);

    const { uploadSingle } = useImageUpload();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    // Preload existing brand data on mount
    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name,
                slug: brand.slug,
                banner: brand.banner ?? "",
                thumbnail: brand.thumbnail ?? "",
                isActive: brand.isActive,
            });
        }
    }, [brand, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return toast.error("Fix validation errors first");

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
                ...formData,
                banner: bannerUrl,
                thumbnail: thumbUrl,
            };

            const res = await updateBrand(brandId, payload);
            if (!res.success) throw new Error("Failed to update brand");

            toast.success("Brand updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Error updating brand");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!brand) {
        return (
            <div className="text-center py-10 text-gray-500">
                Loading brand...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Edit Brand</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name + Slug */}
                <FormGrid cols={2}>
                    <FormInput
                        label="Brand Name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => {
                            const nameValue = e.target.value;
                            updateField("name", nameValue);

                            const currentAutoSlug = generateSlug(nameValue);

                            if (
                                !formData.slug ||
                                formData.slug === generateSlug(formData.name)
                            ) {
                                updateField("slug", currentAutoSlug);
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
                        onChange={(e) => updateField("slug", generateSlug(e.target.value))}
                        error={errors.slug}
                        placeholder="apple"
                    />
                </FormGrid>

                {/* Thumbnail */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Brand Thumbnail</h3>

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
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file);
                        }}
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
                    <h3 className="text-lg font-medium mb-2">Brand Banner (Optional)</h3>

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
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBannerUpload(file);
                        }}
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
                            setFormData({
                                name: brand.name,
                                slug: brand.slug,
                                banner: brand.banner,
                                thumbnail: brand.thumbnail,
                                isActive: brand.isActive,
                            });
                        }}
                    >
                        Reset
                    </FormCancelButton>

                    <FormSubmitButton
                        isLoading={isSubmitting}
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
