"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save, Tag, Search, Trash2, GripVertical, Smartphone } from "lucide-react";
import { FormInput, FormCheckbox, FormGrid, FormActions, FormSelect } from "@/components";
import { useAdminBrand, useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import { useAdminAppFeatured } from "@/hooks/entities/useAdminAppFeatured";
import { useAddFeaturedForm } from "../_components/hooks/useAddFeaturedForm";
import Image from "next/image";

export default function AddAppFeaturedBrandPage() {
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
  const { brandList, isLoadingBrand } = useAdminBrand("limit=500");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── States ──────────────────────────────────────────────────────────────
  const [selectedBrands, setSelectedBrands] = useState<any[]>([]); // Array of brand objects to preserve order
  const [searchQuery, setSearchQuery] = useState("");

  // Default position and type
  useEffect(() => {
    setFormData((p) => ({ ...p, position: p.position || "APP", mapType: "BRAND" as any }));
  }, []);

  const handleToggleBrand = (brand: any) => {
    setSelectedBrands((prev) => {
      const exists = prev.find((b) => b._id === brand._id);
      if (exists) {
        return prev.filter((b) => b._id !== brand._id);
      } else {
        return [...prev, brand];
      }
    });
  };

  const moveBrand = (index: number, direction: "up" | "down") => {
    const newItems = [...selectedBrands];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setSelectedBrands(newItems);
  };

  const filteredBrandsList = brandList.filter((b: any) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in the required fields");
      return;
    }
    if (selectedBrands.length === 0) {
      toast.error("Please select at least one brand");
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
        mapType: "BRAND" as any,
        mappings: selectedBrands.map((b) => ({
          type: "BRAND",
          refId: b._id,
        })),
        slug: formData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
      };

      const res: any = await createAppFeatured(payload as any);
      if (res.success) {
        resetForm();
        handleRemoveImageFile();
        setSelectedBrands([]);
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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add App Featured Brands</h2>
            <p className="text-emerald-100 text-sm mt-0.5">
              Select and order brands to showcase on the mobile app
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Step 1: Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="text-base font-semibold text-gray-800">Section Details</h3>
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
               <FormInput label="Section Color (Hex)" name="color" value={formData.color ?? ""} onChange={handleChange} placeholder="#ffffff" />
            </FormGrid>
          </section>

          {/* Step 2: Brand Selection */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-base font-semibold text-gray-800">Select Brands</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-4 border rounded-xl bg-gray-50">
              {isLoadingBrand ? (
                <div className="col-span-full py-10 flex flex-col items-center gap-2 text-emerald-500">
                   <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredBrandsList.map((brand: any) => {
                const isSelected = selectedBrands.some(b => b._id === brand._id);
                return (
                  <label
                    key={brand._id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white relative ${
                      isSelected ? "border-emerald-500 ring-2 ring-emerald-50/50" : "border-transparent hover:border-emerald-200"
                    }`}
                  >
                    <input type="checkbox" checked={isSelected} onChange={() => handleToggleBrand(brand)} className="hidden" />
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border bg-gray-50">
                       <Image src={brand.thumbnail || "/placeholder.png"} alt={brand.name} fill className="object-cover" />
                    </div>
                    <p className="text-[11px] font-semibold text-gray-700 text-center truncate w-full">{brand.name}</p>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Step 3: Organize Selected Brands */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="text-base font-semibold text-gray-800">Organize Display Order</h3>
              <span className="text-xs text-gray-400 font-normal">(Last selected brands appear at the end)</span>
            </div>

            {selectedBrands.length === 0 ? (
               <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <Tag className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm italic">No brands selected yet</p>
               </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {selectedBrands.map((brand, index) => (
                  <div key={brand._id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <GripVertical className="text-gray-300 w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 w-6 h-6 flex items-center justify-center rounded-lg">{index + 1}</span>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0">
                       <Image src={brand.thumbnail || "/placeholder.png"} alt={brand.name} fill className="object-cover" />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-gray-800">{brand.name}</span>
                    <div className="flex items-center gap-1">
                       <button
                         disabled={index === 0}
                         onClick={() => moveBrand(index, "up")}
                         className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                       >
                         ▲
                       </button>
                       <button
                         disabled={index === selectedBrands.length - 1}
                         onClick={() => moveBrand(index, "down")}
                         className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                       >
                         ▼
                       </button>
                       <button
                         onClick={() => handleToggleBrand(brand)}
                         className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ml-2"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Banner & Actions */}
          <div className="space-y-6 pt-4 border-t">
             <div className="flex flex-col sm:flex-row gap-6 items-start bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
               <div className="flex-1 w-full space-y-2">
                  <label className="text-sm font-semibold text-emerald-800">Optional Header Banner</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleAddImageFile(e.target.files?.[0])}
                    className="block w-full text-xs text-gray-600
                    file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                    file:text-xs file:font-semibold file:bg-white file:text-emerald-700 hover:file:bg-emerald-50 shadow-sm"
                  />
               </div>
               {imageFile?.preview && (
                 <div className="relative w-32 h-16 rounded-lg overflow-hidden border shadow-sm flex-shrink-0">
                    <Image src={imageFile.preview} alt="Banner Preview" fill className="object-cover" />
                    <button onClick={handleRemoveImageFile} className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm">
                       <Trash2 size={12} />
                    </button>
                 </div>
               )}
             </div>

             <div className="flex items-center justify-between">
                <FormCheckbox label="Active Section" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <div className="flex gap-4">
                   <button type="button" onClick={() => { resetForm(); setSelectedBrands([]); }} className="px-4 py-2 text-gray-400 hover:text-gray-600 font-medium text-sm">Clear Form</button>
                   <button
                     type="button"
                     onClick={handleSubmit}
                     disabled={isFormLoading || selectedBrands.length === 0}
                     className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                   >
                     {isFormLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                     Feature {selectedBrands.length} Brands
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
