"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save, Smartphone, Package, Search, Trash2 } from "lucide-react";
import { FormInput, FormCheckbox, FormGrid, FormActions, FormSelect } from "@/components";
import { useAdminCategory, useAdminProduct, useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import { useAdminAppFeatured } from "@/hooks/entities/useAdminAppFeatured";
import { useAddFeaturedForm } from "../_components/hooks/useAddFeaturedForm";
import Image from "next/image";

export default function AddAppFeaturedProductPage() {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setFormData,
    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,
    imageFile,
  } = useAddFeaturedForm();

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const { createAppFeatured, isCreating } = useAdminAppFeatured();
  const { adminCategories } = useAdminCategory();
  const { getProductsByCategory } = useAdminProduct();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── States ──────────────────────────────────────────────────────────────
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Categories list
  const masterCategories = adminCategories?.filter((cat: any) => cat.type === "MASTER" && !cat.isDeleted) || [];
  const parentCategories = adminCategories?.filter((cat: any) => cat.type === "CATEGORY" && !cat.isDeleted) || [];

  // Default position
  useEffect(() => {
    setFormData((p) => ({ ...p, position: p.position || "APP", mapType: "PRODUCT" }));
  }, [setFormData]);

  // Fetch products when categories change
  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedCategoryIds.length === 0) {
        setAvailableProducts([]);
        return;
      }
      setIsLoadingProducts(true);
      try {
        const allProducts = [];
        for (const catId of selectedCategoryIds) {
          const res = await getProductsByCategory(catId);
          if (res?.products) allProducts.push(...res.products);
        }
        // Unique products
        const unique = allProducts.filter((p, index, self) => index === self.findIndex((t) => t._id === p._id));
        setAvailableProducts(unique);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryIds, getProductsByCategory]);

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in the required fields");
      return;
    }
    if (selectedProductIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);
    try {
      const file = getFileForUpload();
      let imageUrl = formData.imageUrl;

      if (file) {
        const res = await uploadSingle(file);
        imageUrl = (res as any)?.imageUrl ?? "";
      }

      const payload = {
        ...formData,
        type: "FEATURED",
        imageUrl,
        mapType: "PRODUCT",
        category: [], // We use selectedProductIds in mappings
        subcategory: [],
        mappings: selectedProductIds.map((id) => ({
          type: "PRODUCT",
          refId: id,
        })),
        masterCategory: formData.masterCategory?.trim() || null,
        slug: formData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
      };

      const res: any = await createAppFeatured(payload as any);
      if (res.success) {
        resetForm();
        handleRemoveImageFile();
        setSelectedProductIds([]);
        setSelectedCategoryIds([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isUploadingSingle || isSubmitting || isCreating;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 px-6 py-5 flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add App Featured Product</h2>
            <p className="text-purple-100 text-sm mt-0.5">
              App-specific product section management
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Step 1: Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="text-base font-semibold text-gray-800">Basic Info</h3>
            </div>
            <FormGrid cols={2}>
              <FormInput label="Section Title" name="title" required value={formData.title} onChange={handleChange} error={errors.title} />
              <FormInput label="Display Order" name="order" type="number" value={formData.order ?? ""} onChange={handleChange} />
              <FormSelect
                options={[
                  { value: "APP", label: "App (Main)" },
                  { value: "APP1", label: "App Section 1" },
                  { value: "APP2", label: "App Section 2" },
                  { value: "APP3", label: "App Section 3" },
                  { value: "APP4", label: "App Section 4" },
                  { value: "APP5", label: "App Section 5" },
                  { value: "APP6", label: "App Section 6" },
                  { value: "APP7", label: "App Section 7" },
                  { value: "APP8", label: "App Section 8" },
                ]}
                label="App Section Position"
                name="position"
                value={formData.position ?? "APP"}
                onChange={handleChange}
              />
              <FormSelect
                label="Master Category (Filter categories below)"
                name="masterCategory"
                value={formData.masterCategory || ""}
                onChange={(e) => {
                   setFormData(prev => ({ ...prev, masterCategory: e.target.value }));
                   setSelectedCategoryIds([]);
                }}
                options={[{ value: "", label: "All master categories" }, ...masterCategories.map((c: any) => ({ value: c._id, label: c.name }))]}
              />
            </FormGrid>
          </section>

          {/* Step 2: Category Filter */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="text-base font-semibold text-gray-800">Select Categories</h3>
              <span className="text-xs text-gray-500">— To see products to feature</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 border rounded-xl bg-gray-50">
              {parentCategories
                .filter((cat: any) => {
                  if (!formData.masterCategory) return true;
                  const parentId = typeof cat.parent === "string" ? cat.parent : cat.parent?._id;
                  return parentId === formData.masterCategory;
                })
                .map((cat: any) => (
                <label
                  key={cat._id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-all text-sm font-medium ${
                    selectedCategoryIds.includes(cat._id) ? "bg-purple-600 border-purple-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  <input type="checkbox" checked={selectedCategoryIds.includes(cat._id)} onChange={() => handleToggleCategory(cat._id)} className="hidden" />
                  {cat.name}
                </label>
              ))}
            </div>
          </section>

          {/* Step 3: Product Selection */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-base font-semibold text-gray-800">Select Products</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 w-48 sm:w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-4 border rounded-xl bg-slate-50">
              {isLoadingProducts ? (
                <div className="col-span-full py-10 flex flex-col items-center gap-2 text-purple-500">
                   <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-sm font-medium">Fetching products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="col-span-full text-center py-10 text-gray-400 text-sm italic">
                  Select categories above to load products
                </p>
              ) : (
                filteredProducts.map((p: any) => (
                  <label
                    key={p._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white ${
                      selectedProductIds.includes(p._id) ? "border-purple-500 bg-purple-50" : "border-transparent hover:border-purple-200"
                    }`}
                  >
                    <input type="checkbox" checked={selectedProductIds.includes(p._id)} onChange={() => handleToggleProduct(p._id)} className="w-4 h-4 accent-purple-600" />
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                       <Image src={p.mainImage || "/placeholder.png"} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                       <p className="text-[10px] text-gray-500 truncate">₹{p.price}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </section>

          {/* Banner Section */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 className="text-base font-semibold text-gray-800 mb-3">Section Header Banner</h3>
             <div className="flex flex-col sm:flex-row gap-6 items-start">
               <div className="flex-1 w-full space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleAddImageFile(e.target.files?.[0])}
                    className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                    file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-[10px] text-gray-400">Recommended: 1200px × 600px wide banner for the app section</p>
               </div>
               {imageFile?.preview && (
                 <div className="relative w-48 h-24 rounded-lg overflow-hidden border shadow-sm flex-shrink-0">
                    <Image src={imageFile.preview} alt="Banner Preview" fill className="object-cover" />
                    <button onClick={handleRemoveImageFile} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm">
                       <Trash2 size={14} />
                    </button>
                 </div>
               )}
             </div>
          </section>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t pt-6">
             <FormCheckbox label="Active Section" name="isActive" checked={formData.isActive} onChange={handleChange} />
             <div className="flex gap-3">
                <button type="button" onClick={() => { resetForm(); setSelectedProductIds([]); setSelectedCategoryIds([]); }} className="px-5 py-2 text-gray-500 hover:text-gray-700 font-medium">Reset</button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isFormLoading || selectedProductIds.length === 0}
                  className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isFormLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                  Save App Section ({selectedProductIds.length})
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
