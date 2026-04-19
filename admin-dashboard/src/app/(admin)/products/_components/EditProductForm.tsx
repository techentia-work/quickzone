"use client";

import React, { useRef, useState } from "react";
import { Save, Upload, X, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

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

import {
    TaxRateType,
    VariantInventoryType,
    ProductEatableType,
} from "@/lib/types";

import { useImageUpload, useAdminProduct } from "@/hooks";
import { useEditProductForm } from "./hooks/useEditProductForm";

export function EditProductForm({ productId }: { productId: string }) {
    const {
        loading,
        formData,
        setFormData,
        errors,
        setErrors,

        // data
        brands,
        parentCategories,
        subCategories,
        selectedParentCategory,

        // helpers
        updateField,
        handleChange,
        handleArrayChange,
        generateSlug,

        // images
        imageFiles,
        handleAddImageFiles,
        handleRemoveImageFile,
        handleSetMainImage,
        getFilesForUpload,
        getFinalImageUrls,

        // categories
        handleParentCategoryChange,
        handleSubCategoryChange,
    } = useEditProductForm(productId);

    const { uploadBulk, isUploadingBulk } = useImageUpload();
    const { updateProduct } = useAdminProduct();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading || !formData) {
        return <div className="text-center py-10 text-gray-500">Loading product...</div>;
    }

    const isFormLoading = isUploadingBulk || isSubmitting;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleAddImageFiles(files);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // upload only new files
            const toUpload = getFilesForUpload();
            let newUrls: string[] = [];
            if (toUpload.length > 0) {
                const uploaded = await uploadBulk(toUpload);
                newUrls = (uploaded || []).map((u: any) => u.imageUrl).filter(Boolean);
            }

            const { images, mainImage } = getFinalImageUrls(newUrls);

            const payload = {
                ...formData,
                images,
                mainImage,
            };

            await updateProduct(productId, payload);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Edit Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <FormGrid cols={2}>
                        <FormInput
                            label="Product Name"
                            name="name"
                            required
                            value={formData.name ?? ""}
                            onChange={(e) => updateField("name", e.target.value)}
                            error={errors.name}
                            placeholder="Enter product name"
                            disabled={isFormLoading}
                        />
                        <FormInput
                            label="Slug"
                            name="slug"
                            required
                            value={formData.slug ?? ""}
                            onChange={(e) => updateField("slug", e.target.value)}
                            error={errors.slug}
                            placeholder="product-slug"
                            disabled={isFormLoading}
                        />

                        {/* Brand (ObjectId) */}
                        <FormSelect
                            label="Brand"
                            name="brandId"
                            value={formData.brandId ?? ""}
                            onChange={(e) => updateField("brandId", e.target.value)}
                            error={errors.brandId}
                            options={[
                                { value: "", label: "-- Select Brand --" },
                                ...brands.map((b: any) => ({ value: b._id, label: b.name })),
                            ]}
                            disabled={isFormLoading}
                        />

                        {/* Product Type */}
                        <FormSelect
                            label="Product Type"
                            name="productType"
                            value={formData.productType ?? ProductEatableType.NONE}
                            onChange={handleChange}
                            error={errors.productType}
                            options={[
                                { value: ProductEatableType.VEG, label: "🌱 Vegetarian" },
                                { value: ProductEatableType.NON_VEG, label: "🍖 Non-Vegetarian" },
                                { value: ProductEatableType.NONE, label: "Not Applicable" },
                            ]}
                            disabled={isFormLoading}
                        />

                        {/* Category */}
                        <FormSelect
                            label="Category"
                            name="parentCategory"
                            value={selectedParentCategory}
                            onChange={handleParentCategoryChange}
                            error={errors.categoryId}
                            options={[
                                { value: "", label: "-- Select Category --" },
                                ...parentCategories.map((cat: any) => ({ value: cat._id, label: cat.name })),
                            ]}
                            disabled={isFormLoading}
                        />

                        {/* Subcategory */}
                        <FormSelect
                            label="Subcategory"
                            name="subcategory"
                            value={formData.categoryId ?? ""}
                            onChange={handleSubCategoryChange}
                            error={errors.categoryId}
                            options={[
                                { value: "", label: "-- Select Subcategory --" },
                                ...subCategories.map((sub: any) => ({ value: sub._id, label: sub.name })),
                            ]}
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* Product Images */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>

                    {/* Upload Button */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isFormLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Select Images
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                            Add new images if needed. Existing images stay unless removed.
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isFormLoading}
                    />

                    {/* Image Preview Gallery */}
                    {imageFiles.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imageFiles.map((img, index) => (
                                <div
                                    key={img.preview + index}
                                    className={`relative group border-2 rounded-lg overflow-hidden ${img.isMain ? "border-yellow-500 ring-2 ring-yellow-500" : "border-gray-200"
                                        }`}
                                >
                                    <Image
                                        src={img.preview}
                                        width={256}
                                        height={160}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-40 object-cover"
                                    />

                                    {img.isMain && (
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-white" />
                                            Main
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        {!img.isMain && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetMainImage(img.preview)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 flex items-center gap-1"
                                                disabled={isFormLoading}
                                            >
                                                <Star className="w-3 h-3" />
                                                Set Main
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImageFile(img.preview)}
                                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                            title="Remove image"
                                            disabled={isFormLoading}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 font-medium">No images</p>
                        </div>
                    )}
                </div>

                {/* Descriptions */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Descriptions</h3>
                    <FormGrid cols={1}>
                        <FormTextArea
                            label="Short Description"
                            name="shortDescription"
                            value={formData.shortDescription ?? ""}
                            onChange={handleChange}
                            error={errors.shortDescription}
                            rows={2}
                            placeholder="Brief product description (1-2 sentences)"
                            disabled={isFormLoading}
                        />
                        <FormTextArea
                            label="Full Description"
                            name="description"
                            value={formData.description ?? ""}
                            onChange={handleChange}
                            error={errors.description}
                            rows={4}
                            placeholder="Detailed product description"
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* SEO & Meta */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">SEO & Meta Information</h3>
                    <FormGrid cols={1}>
                        <FormInput
                            label="Meta Title"
                            name="metaTitle"
                            value={formData.metaTitle ?? ""}
                            onChange={handleChange}
                            error={errors.metaTitle}
                            placeholder="SEO title (60 chars max)"
                            disabled={isFormLoading}
                        />
                        <FormTextArea
                            label="Meta Description"
                            name="metaDescription"
                            value={formData.metaDescription ?? ""}
                            onChange={handleChange}
                            error={errors.metaDescription}
                            rows={2}
                            placeholder="SEO description (160 chars max)"
                            disabled={isFormLoading}
                        />
                        <FormInput
                            label="Meta Keywords"
                            name="metaKeywords"
                            value={formData.metaKeywords ?? ""}
                            onChange={handleChange}
                            error={errors.metaKeywords}
                            placeholder="keyword1, keyword2, keyword3"
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* Product Details */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                    <FormGrid cols={2}>
                        <FormInput
                            label="Manufacturer"
                            name="manufacturer"
                            value={formData.manufacturer ?? ""}
                            onChange={handleChange}
                            error={errors.manufacturer}
                            placeholder="Manufacturer name"
                            disabled={isFormLoading}
                        />
                        <FormInput
                            label="Made In"
                            name="madeIn"
                            value={formData.madeIn ?? ""}
                            onChange={handleChange}
                            error={errors.madeIn}
                            placeholder="Country of origin"
                            disabled={isFormLoading}
                        />
                        <FormInput
                            label="FSSAI Number"
                            name="fssaiNumber"
                            value={formData.fssaiNumber ?? ""}
                            onChange={handleChange}
                            error={errors.fssaiNumber}
                            placeholder="FSSAI license number"
                            disabled={isFormLoading}
                        />
                        <FormInput
                            label="Barcode"
                            name="barcode"
                            value={formData.barcode ?? ""}
                            onChange={handleChange}
                            error={errors.barcode}
                            placeholder="Product barcode"
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* Pricing & Tax */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h3>
                    <FormGrid cols={2}>
                        <FormInput
                            label="Max Qty Per User"
                            name="maxQtyPerUser"
                            type="number"
                            value={formData.maxQtyPerUser ?? ""}
                            onChange={handleChange}
                            error={errors.maxQtyPerUser}
                            disabled={isFormLoading}
                        />
                        <FormSelect
                            label="Tax Rate"
                            name="taxRate"
                            value={formData.taxRate ?? ""}
                            onChange={handleChange}
                            error={errors.taxRate}
                            options={[
                                { value: TaxRateType.GST_5, label: "GST 5%" },
                                { value: TaxRateType.GST_12, label: "GST 12%" },
                                { value: TaxRateType.GST_18, label: "GST 18%" },
                                { value: TaxRateType.GST_28, label: "GST 28%" },
                            ]}
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* Variants Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>

                    {formData.variants?.map((variant, index) => (
                        <div key={index} className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50">
                            <h4 className="font-semibold mb-3">Variant {index + 1}</h4>

                            <FormGrid cols={3}>
                                <FormInput
                                    label="Title"
                                    name="title"
                                    value={variant.title ?? ""}
                                    onChange={(e) => {
                                        const updated = (formData.variants && formData.variants?.length > 0) ? [...formData.variants] : [];
                                        updated[index].title = e.target.value;
                                        updateField("variants", updated);
                                    }}
                                    placeholder="e.g., 500g, Small, Red"
                                    error={errors.variants?.[index]?.title}
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    name="sku"
                                    label="SKU"
                                    required
                                    value={variant.sku ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].sku = e.target.value;
                                        updateField("variants", updated);
                                    }}
                                    placeholder="Unique SKU code"
                                    error={errors.variants?.[index]?.sku}
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    label="Price"
                                    name="price"
                                    type="number"
                                    required
                                    value={variant.price ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].price = Number(e.target.value);
                                        updateField("variants", updated);
                                    }}
                                    placeholder="Enter price"
                                    error={errors.variants?.[index]?.price}
                                    disabled={isFormLoading}
                                />
                            </FormGrid>

                            <FormGrid cols={3}>
                                <FormInput
                                    label="MRP"
                                    name="mrp"
                                    type="number"
                                    value={variant.mrp ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].mrp = Number(e.target.value);
                                        updateField("variants", updated);
                                    }}
                                    placeholder="Enter MRP"
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    label="Discount %"
                                    name="discountPercent"
                                    type="number"
                                    value={variant.discountPercent ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].discountPercent = Number(e.target.value);
                                        updateField("variants", updated);
                                    }}
                                    placeholder="Discount in %"
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    label="Net Price"
                                    name=""
                                    type="number"
                                    value={(variant.price ?? 0) * (1 - (variant.discountPercent ?? 0) / 100)}
                                    readOnly
                                    disabled
                                />
                            </FormGrid>

                            <FormGrid cols={2}>
                                <FormSelect
                                    label="Inventory Type"
                                    name="inventoryType"
                                    value={variant.inventoryType ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        const val = e.target.value as VariantInventoryType;
                                        updated[index].inventoryType = val;
                                        if (val === VariantInventoryType.UNLIMITED) updated[index].stock = null;
                                        updateField("variants", updated);
                                    }}
                                    options={[
                                        { label: "Limited", value: "LIMITED" },
                                        { label: "Unlimited", value: "UNLIMITED" },
                                    ]}
                                    error={errors.variants?.[index]?.inventoryType}
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    required={variant.inventoryType === "LIMITED"}
                                    value={variant.stock ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        const val = e.target.value;
                                        updated[index].stock = val === "" ? null : Number(val);
                                        updateField("variants", updated);
                                    }}
                                    placeholder={variant.inventoryType === "UNLIMITED" ? "N/A" : "Available stock"}
                                    error={errors.variants?.[index]?.stock}
                                    disabled={isFormLoading || variant.inventoryType === "UNLIMITED"}
                                />
                                <FormInput
                                    label="Measurement"
                                    name="measurement"
                                    type="number"
                                    value={variant.measurement ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].measurement = Number(e.target.value);
                                        updateField("variants", updated);
                                    }}
                                    placeholder="e.g., 250"
                                    error={errors.variants?.[index]?.measurement}
                                    disabled={isFormLoading}
                                />
                                <FormInput
                                    label="Measurement Unit"
                                    name="measurementUnit"
                                    value={variant.measurementUnit ?? ""}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[index].measurementUnit = e.target.value;
                                        updateField("variants", updated);
                                    }}
                                    placeholder="e.g., g / ml / pcs"
                                    disabled={isFormLoading}
                                />
                            </FormGrid>

                            <button
                                type="button"
                                className="text-red-600 text-sm mt-2"
                                onClick={() => {
                                    const newVariants = formData.variants?.filter((_, i) => i !== index);
                                    updateField("variants", newVariants);
                                }}
                                disabled={isFormLoading}
                            >
                                ❌ Remove Variant
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            updateField("variants", [
                                ...(formData.variants || []),
                                {
                                    title: "",
                                    sku: "",
                                    variantType: "PACKET",
                                    price: null,
                                    mrp: null,
                                    discountPercent: null,
                                    stock: null,
                                    measurement: null,
                                    measurementUnit: "",
                                    inventoryType: VariantInventoryType.LIMITED,
                                    status: "AVAILABLE",
                                    images: [],
                                },
                            ]);
                        }}
                        className="text-blue-600 font-medium mt-2"
                        disabled={isFormLoading}
                    >
                        ➕ Add Variant
                    </button>
                </div>

                {/* Tags & Keywords */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tags & Keywords</h3>
                    <FormGrid cols={1}>
                        <FormTextArea
                            label="Tags (comma-separated)"
                            name="tags"
                            value={formData.tags?.join(", ") ?? ""}
                            onChange={(e) => handleArrayChange("tags", e.target.value)}
                            rows={2}
                            placeholder="tag1, tag2, tag3"
                            error={errors.tags}
                            disabled={isFormLoading}
                        />
                        <FormTextArea
                            label="Search Keywords (comma-separated)"
                            name="searchKeywords"
                            value={formData.searchKeywords?.join(", ") ?? ""}
                            onChange={(e) => handleArrayChange("searchKeywords", e.target.value)}
                            rows={2}
                            placeholder="keyword1, keyword2, keyword3"
                            error={errors.searchKeywords}
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                {/* Product Policies */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Policies</h3>
                    <FormGrid cols={3}>
                        <FormCheckbox
                            label="Returnable"
                            name="isReturnable"
                            checked={formData.isReturnable ?? false}
                            onChange={handleChange}
                            disabled={isFormLoading}
                        />
                        <FormCheckbox
                            label="COD Available"
                            name="isCOD"
                            checked={formData.isCOD ?? false}
                            onChange={handleChange}
                            disabled={isFormLoading}
                        />
                        <FormCheckbox
                            label="Cancelable"
                            name="isCancelable"
                            checked={formData.isCancelable ?? false}
                            onChange={handleChange}
                            disabled={isFormLoading}
                        />
                    </FormGrid>
                </div>

                <FormActions>
                    <FormCancelButton
                        onClick={() => {
                            // reset to server-loaded values
                            setErrors({});
                            // optional: reload product here if desired
                            window.location.reload();
                        }}
                        disabled={isFormLoading}
                    >
                        Reset
                    </FormCancelButton>
                    <FormSubmitButton
                        isLoading={isFormLoading}
                        loadingText={
                            isUploadingBulk ? "Uploading images..." : isSubmitting ? "Updating product..." : "Processing..."
                        }
                        icon={<Save className="w-4 h-4" />}
                    >
                        Update Product
                    </FormSubmitButton>
                </FormActions>
            </form>
        </div>
    );
}
