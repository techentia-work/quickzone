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
import { useAdminCategory, useAdminProduct, useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import { useAdminFeatured } from "@/hooks/entities/useAdminFeatured";
import { useAddFeaturedForm } from "./hooks/useAddFeaturedForm";
import Image from "next/image";

export function AddFeaturedForm({ mapType }: { mapType?: "SUBCATEGORY" | "PRODUCT" | "URL" }) {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,
    imageFile,
    imageFile1, // ✅ EXPORT
    handleAddImageFile1,
    setFormData,
    getFileForUpload1
  } = useAddFeaturedForm();

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const { createFeatured } = useAdminFeatured();
  const { adminCategories } = useAdminCategory();
  const { getProductsByCategory } = useAdminProduct();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Multiple categories support
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMappings, setSelectedMappings] = useState<
    { type: string; refId: string }[]
  >([]);

  const [products, setProducts] = useState<any>([]);

  // ✅ Get all subcategories for selected categories
  const subcategories = adminCategories?.filter(
    (cat: any) =>
      selectedCategories.includes(cat.parent?.toString()) &&
      cat.type === "SUBCATEGORY" &&
      !cat.isDeleted
  );

  // ✅ Fetch products for selected subcategories (only for PRODUCT mapType)
  useEffect(() => {
    const fetchProducts = async () => {
      if (mapType !== "PRODUCT") return;

      const selectedSubcategoryIds = selectedMappings
        .filter((m) => m.type === "SUBCATEGORY")
        .map((m) => m.refId);

      if (selectedSubcategoryIds.length === 0) {
        setProducts([]);
        return;
      }

      const allProducts = [];
      for (const subcatId of selectedSubcategoryIds) {
        const res = await getProductsByCategory(subcatId);
        if (res?.products) {
          allProducts.push(...res.products);
        }
      }

      // Remove duplicates based on _id
      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p._id === product._id)
      );

      setProducts(uniqueProducts);
    };
    fetchProducts();
  }, [selectedMappings, mapType]);

  // ✅ Auto-generate slug from selected categories and subcategories
  useEffect(() => {
    let baseSlug = "";

    const selectedCats = adminCategories?.filter((cat: any) =>
      selectedCategories.includes(cat._id)
    );

    const selectedSubcats = adminCategories?.filter((cat: any) =>
      selectedMappings.some(
        (m) => m.refId === cat._id && m.type === "SUBCATEGORY"
      )
    );

    if (selectedCats?.length > 0) {
      baseSlug = selectedCats.map((c: any) => c.slug).join("-");
    }

    if (selectedSubcats?.length > 0) {
      const subcatSlugs = selectedSubcats.map((s: any) => s.slug).join("-");
      baseSlug += baseSlug ? `/${subcatSlugs}` : subcatSlugs;
    }

    setFormData((prev) => ({
      ...prev,
      slug: baseSlug.replace(/^-+|-+$/g, ""),
    }));
  }, [selectedCategories, selectedMappings]);

  // ✅ Toggle category selection
  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      // 1. Remove logic
      if (prev.includes(categoryId)) {
        // Remove from selectedCategories
        const newCats = prev.filter((id) => id !== categoryId);

        // Also remove from mappings (both SUBCATEGORY and CATEGORY types)
        // Remove subcategories
        const subcatsToRemove = adminCategories
          ?.filter(
            (cat: any) =>
              cat.parent?.toString() === categoryId &&
              cat.type === "SUBCATEGORY"
          )
          .map((cat: any) => cat._id);

        setSelectedMappings((mappings) =>
          mappings.filter(
            (m) =>
              !(
                (m.type === "SUBCATEGORY" &&
                  subcatsToRemove?.includes(m.refId)) ||
                (m.type === "CATEGORY" && m.refId === categoryId)
              )
          )
        );

        return newCats;
      }

      // 2. Add logic
      const newCats = [...prev, categoryId];

      // 🔥 Auto-add to mappings if Position starts with APP
      if (formData.position?.startsWith("APP")) {
        setSelectedMappings((curr) => {
          const exists = curr.some(m => m.refId === categoryId && m.type === "CATEGORY");
          if (exists) return curr;
          return [...curr, { type: "CATEGORY", refId: categoryId }];
        });
      }

      return newCats;
    });
  };

  // ✅ Toggle mapping (subcategories/products/URL)
  const handleToggleMapping = (type: string, id: string) => {
     if (type === "URL") return; // URLs are managed differently
    setSelectedMappings((prev) => {
      const exists = prev.some((m) => m.refId === id && m.type === type);
      if (exists)
        return prev.filter((m) => !(m.refId === id && m.type === type));
      return [...prev, { type, refId: id }];
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const file = getFileForUpload();
      const file1 = getFileForUpload1(); // ✅ ADD

      let imageUrl = formData.imageUrl;
      let imageUrl1 = formData.imageUrl1;

      if (file) {
        const res = await uploadSingle(file);
        imageUrl = (res as any)?.imageUrl;
        if (!imageUrl) throw new Error("Image upload failed");
      }
      if (file1) {
        const res1 = await uploadSingle(file1);
        imageUrl1 = (res1 as any)?.imageUrl;
      }
      const payload = {
        ...formData,
        imageUrl,
        imageUrl1,
        // ✅ Filter mappings based on mapType
        mappings: mapType === "PRODUCT"
          ? selectedMappings.filter((m) => m.type === "PRODUCT")
          : (mapType === "URL" 
             ? selectedMappings.filter(m => m.type === "URL")
             : (formData.position?.startsWith("APP")
                ? selectedCategories.map(catId => ({ type: "CATEGORY", refId: catId }))
                : selectedMappings.filter((m) => m.type === "SUBCATEGORY"))),
        // ✅ Only send category/subcategory for SUBCATEGORY mapType
        category: mapType === "SUBCATEGORY" && selectedCategories.length > 0 ? selectedCategories : [],
        subcategory: mapType === "SUBCATEGORY"
          ? selectedMappings
            .filter((m) => m.type === "SUBCATEGORY")
            .map((m) => m.refId)
          : [],
        mapType: mapType || null,
        masterCategory:
          formData.masterCategory?.trim() && formData.masterCategory !== ""
            ? formData.masterCategory
            : null,
      };

      const res = await createFeatured(payload as any);
      if (res.success) {
        resetForm();
        handleRemoveImageFile();
        setSelectedCategories([]);
        setSelectedMappings([]);
      }
    } catch (err) {
      toast.error("Failed to create featured section");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isFormLoading = isUploadingSingle || isSubmitting;

  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Add New Featured Section
        </h2>
      </div>

      <div className="space-y-6">
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
          {/* Web-only positions — no APP positions here */}
          <FormSelect
            options={[
              { value: "TOP", label: "Top" },
              { value: "MIDDLE", label: "Middle" },
              { value: "BOTTOM", label: "Bottom" },
            ]}
            label="Position"
            name="position"
            value={formData.position ?? ""}
            onChange={handleChange}
            error={errors.position}
          />
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color || "#ffffff"}
                onChange={handleChange}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color || "#ffffff"}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, color: value }));
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </FormGrid>

        <FormSelect
          label="Select Master Category"
          name="masterCategory"
          value={formData.masterCategory || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              masterCategory: e.target.value,
            }))
          }
          options={[
            { value: "", label: "Default (no master category)" },
            ...adminCategories
              .filter((cat: any) => cat.type === "MASTER" && !cat.isDeleted)
              .map((cat: any) => ({
                value: cat._id,
                label: cat.name,
              })),
          ]}
        />

        <FormInput
          label="Slug"
          name="slug"
          value={formData.slug || ""}
          onChange={handleChange}
          disabled
        />

        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Mappings</h3>

          {/* ✅ Multiple Categories Selection */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Select Categories (Multiple)
            </p>
            <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
              {adminCategories
                ?.filter((cat: any) => cat.type === "CATEGORY" && !cat.isDeleted)
                .map((cat: any) => (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleToggleCategory(cat._id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {selectedCategories.length} categories
              </p>
            )}
          </div>

          {/* ✅ Multiple Subcategories Selection - FOR BOTH MODES */}
          {subcategories.length > 0 && !formData.position?.startsWith("APP") && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Select Subcategories (Multiple)
              </p>
              <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                {subcategories.map((sub: any) => (
                  <label
                    key={sub._id}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded hover:bg-green-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMappings.some(
                        (m) => m.refId === sub._id && m.type === "SUBCATEGORY"
                      )}
                      onChange={() => handleToggleMapping("SUBCATEGORY", sub._id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{sub.name}</span>
                  </label>
                ))}
              </div>
              {selectedMappings.filter((m) => m.type === "SUBCATEGORY").length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Selected: {selectedMappings.filter((m) => m.type === "SUBCATEGORY").length} subcategories
                </p>
              )}
            </div>
          )}

          {/* ✅ Multiple Products Selection */}
          {mapType === "PRODUCT" && products.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Select Products (Multiple)
              </p>
              <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                {products.map((p: any) => (
                  <label
                    key={p._id}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMappings.some(
                        (m) => m.refId === p._id && m.type === "PRODUCT"
                      )}
                      onChange={() => handleToggleMapping("PRODUCT", p._id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{p.name}</span>
                  </label>
                ))}
              </div>
              {selectedMappings.filter((m) => m.type === "PRODUCT").length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Selected: {selectedMappings.filter((m) => m.type === "PRODUCT").length} products
                </p>
              )}
            </div>
          )}

          {/* ✅ URL Mode - Manual Add */}
          {mapType === "URL" && (
             <div className="mt-3 p-4 bg-white rounded border">
                <p className="text-sm font-semibold mb-2">Add Manual URL Mapping</p>
                <div className="flex gap-4">
                   <button
                    type="button"
                    onClick={() => setSelectedMappings(prev => [...prev, { type: "URL", refId: `manual-${Date.now()}`, externalUrl: "" }])}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                   >
                     + Add New URL Slot
                   </button>
                   <p className="text-xs text-gray-500 self-center">
                     Add a slot then specify the URL in the selected items table.
                   </p>
                </div>
             </div>
          )}
        </div>

        {/* ✅ Display Selected Mapped Items */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Items ({mapType === "PRODUCT"
              ? selectedMappings.filter(m => m.type === "PRODUCT").length
              : (mapType === "URL" 
                 ? selectedMappings.filter(m => m.type === "URL").length
                 : selectedMappings.filter(m => m.type === "SUBCATEGORY").length)})
          </h3>

          {selectedMappings.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Name / URL</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedMappings
                    .map((m: any, i: number) => {
                      // Get the actual item data
                      let itemData = null;
                      if (m.type === "SUBCATEGORY") {
                        itemData = adminCategories?.find((cat: any) => cat._id === m.refId);
                      } else if (m.type === "PRODUCT") {
                        itemData = products.find((p: any) => p._id === m.refId);
                      }

                      return (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            {itemData?.thumbnail || itemData?.imageUrl ? (
                              <Image
                                src={itemData.thumbnail || itemData.imageUrl}
                                alt={itemData.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400 border">
                                N/A
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {m.type === "URL" ? (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs text-blue-600 font-bold uppercase">Manual Link</span>
                                <input
                                  type="text"
                                  placeholder="Enter Redirect URL"
                                  value={m.externalUrl || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedMappings(prev => prev.map((item, idx) => 
                                      idx === i ? { ...item, externalUrl: val } : item
                                    ));
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm bg-blue-50 focus:ring-1 focus:ring-blue-400 outline-none"
                                />
                              </div>
                            ) : (
                              itemData?.name || "Loading..."
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize">
                             {m.type}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (m.type === "URL") {
                                   setSelectedMappings(prev => prev.filter((_, idx) => idx !== i));
                                } else {
                                   handleToggleMapping(m.type, m.refId);
                                }
                              }}
                              className="px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm">No items selected yet</p>
            </div>
          )}
        </div>

        {/* 🖼️ Image Upload */}
        <div>
          <h3 className="text-lg font-medium mb-4">Image</h3>
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
          <p className="text-xs text-gray-600 mt-2">Category banner - Image Size: 800px × 250px</p>
          <p className="text-xs text-gray-600">Product banner - Image Size: 600px × 400px</p>
        </div>


        <div>
          <h3 className="text-lg font-medium mb-4">SEO & Meta</h3>
          <FormGrid cols={1}>
            <FormInput
              label="Meta Title"
              name="metaTitle"
              value={formData.metaTitle ?? ""}
              onChange={handleChange}
              error={errors.metaTitle}
            />
            <FormTextArea
              label="Meta Description"
              name="metaDescription"
              value={formData.metaDescription ?? ""}
              onChange={handleChange}
              error={errors.metaDescription}
            />
          </FormGrid>
        </div>

        <FormCheckbox
          label="Active"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />

        <FormActions>
          <button
            type="button"
            onClick={resetForm}
            disabled={isFormLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isFormLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isFormLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Featured...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Featured
              </>
            )}
          </button>
        </FormActions>
      </div>
    </div>
  );
}