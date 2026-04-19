"use client";

import React, { useRef, useState } from "react";
import { Save, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FormInput, FormCheckbox, FormGrid, FormActions, FormSubmitButton, FormCancelButton } from "@/components";
import { useBrandForm } from "./hooks/useBrandForm";
import { useImageUpload } from "@/hooks";
import { useAdminBrand } from "@/hooks/entities/useAdminBrand";

export function AddBrandForm() {
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
    } = useBrandForm();

    const { uploadSingle } = useImageUpload();
    const { createBrand } = useAdminBrand();

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

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
                ...formData,
                banner: bannerUrl,
                thumbnail: thumbUrl,
            };

            const res = await createBrand(payload);
            if (!res.success) throw new Error("Failed to create brand");

            toast.success("Brand created successfully");
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error("Error creating brand");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Add Brand</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Thumbnail Upload */}
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

                    {/* Preview */}
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
                            <p className="text-gray-500 mt-2">No thumbnail selected</p>
                        </div>
                    )}
                </div>

                {/* Banner Upload */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Brand Banner (optional)</h3>

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

                    {/* Preview */}
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
                            <p className="text-gray-500 mt-2">No banner selected</p>
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
                    <FormCancelButton onClick={resetForm}>Reset</FormCancelButton>
                    <FormSubmitButton isLoading={isSubmitting} icon={<Save className="w-4 h-4" />}>
                        Create Brand
                    </FormSubmitButton>
                </FormActions>
            </form>
        </div>
    );
}
