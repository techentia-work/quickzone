"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save, Smartphone, ImagePlus, Trash2, ChevronRight } from "lucide-react";
import { FormInput, FormCheckbox, FormGrid, FormActions, FormSelect } from "@/components";
import { useAdminCategory, useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import { useAdminAppFeatured } from "@/hooks/entities/useAdminAppFeatured";
import { useAddFeaturedForm } from "../_components/hooks/useAddFeaturedForm";
import Image from "next/image";

interface SlotItem {
  file: File | null;
  preview: string;
  categoryId: string;
  subcategoryId: string;
}

const emptySlot = (): SlotItem => ({ file: null, preview: "", categoryId: "", subcategoryId: "" });

export default function AddAppFeaturedCategoryPage() {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setFormData,
  } = useAddFeaturedForm();

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const { createAppFeatured, isCreating } = useAdminAppFeatured();
  const { adminCategories } = useAdminCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gridCount, setGridCount] = useState<5 | 6>(6);
  const [slots, setSlots] = useState<SlotItem[]>(Array.from({ length: 6 }, emptySlot));

  const filterMasterCategory = formData.masterCategory || null;
  const masterCategories = adminCategories?.filter((cat: any) => cat.type === "MASTER" && !cat.isDeleted) || [];
  const parentCategories = adminCategories?.filter((cat: any) =>
    (cat.type === "CATEGORY" || cat.type === "SUPER") &&
    !cat.isDeleted
  );

  const subcategories = adminCategories?.filter((cat: any) =>
    cat.type === "SUBCATEGORY" && !cat.isDeleted
  );

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Adjust slots when gridCount changes
  useEffect(() => {
    setSlots((prev) => {
      const newSlots = Array.from({ length: gridCount }, (_, i) => prev[i] || emptySlot());
      return newSlots;
    });
  }, [gridCount]);

  const handleSlotImage = (index: number, file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], file, preview };
      return next;
    });
  };

  const handleSlotCategory = (index: number, categoryId: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], categoryId, subcategoryId: "" }; // Reset subcat when cat changes
      return next;
    });
  };

  const handleSlotSubcategory = (index: number, subcategoryId: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], subcategoryId };
      return next;
    });
  };

  const handleClearSlot = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = emptySlot();
      return next;
    });
    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in Title and Position");
      return;
    }

    // Validate: all slots need image + category + subcategory
    const emptySlots = slots
      .map((s, i) => (!s.preview || !s.categoryId || !s.subcategoryId ? i + 1 : null))
      .filter(Boolean);
    if (emptySlots.length > 0) {
      toast.error(`Slot${emptySlots.length > 1 ? "s" : ""} ${emptySlots.join(", ")} — please add image, category & subcategory`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload all slot images in parallel
      const uploadedMappings = await Promise.all(
        slots.map(async (slot) => {
          let imageUrl = "";
          if (slot.file) {
            const res = await uploadSingle(slot.file);
            imageUrl = (res as any)?.imageUrl ?? "";
          }

          // Use subcategory if selected, else fallback to category
          const isSub = !!slot.subcategoryId;
          return {
            type: isSub ? "SUBCATEGORY" : "CATEGORY",
            refId: isSub ? slot.subcategoryId : slot.categoryId,
            imageUrl,
          };
        })
      );

      const payload = {
        ...formData,
        type: "FEATURED",
        gridCount,
        mappings: uploadedMappings,
        category: slots.map((s) => s.categoryId),
        subcategory: slots.map((s) => s.subcategoryId).filter(Boolean),
        mapType: slots.some(s => s.subcategoryId) ? "SUBCATEGORY" : "CATEGORY",
        masterCategory: formData.masterCategory?.trim() || null,
        slug: formData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), // Generate a slug if missing
      };

      const res: any = await createAppFeatured(payload as any);
      if (res.success) {
        resetForm();
        setSlots(Array.from({ length: gridCount }, emptySlot));
        fileInputRefs.current.forEach((ref) => { if (ref) ref.value = ""; });
        // Handled by mutation onSuccess toast
      }
    } catch (err) {
      // Handled by mutation onError toast
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isUploadingSingle || isSubmitting || isCreating;
  const completedSlots = slots.filter((s) => s.preview && s.categoryId && s.subcategoryId).length;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add App Featured Category</h2>
            <p className="text-green-100 text-sm mt-0.5">
              Appears only in the Flutter mobile app • Grid-based layout
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* ── Step 1: Basic Info ──────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="text-base font-semibold text-gray-800">Basic Info</h3>
            </div>
            <FormGrid cols={2}>
              <FormInput
                label="Section Title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
              />
              <FormInput
                label="Display Order"
                name="order"
                type="number"
                min="1"
                value={formData.order ?? ""}
                onChange={handleChange}
                error={errors.order}
              />
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
                error={errors.position}
              />
              <FormSelect
                options={[
                  { value: "DEFAULT", label: "Default Grid" },
                  { value: "HERO", label: "Hero (Full Width)" },
                ]}
                label="App Layout Style"
                name="appLayout"
                value={formData.appLayout || "DEFAULT"}
                onChange={handleChange}
                error={errors.appLayout}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color || "#ffffff"}
                    onChange={handleChange}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || "#ffffff"}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value))
                        setFormData((p) => ({ ...p, color: e.target.value }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <FormSelect
                label="Master Category (filter, optional)"
                name="masterCategory"
                value={formData.masterCategory || ""}
                onChange={(e) => setFormData((p) => ({ ...p, masterCategory: e.target.value }))}
                options={[
                  { value: "", label: "All master categories" },
                  ...masterCategories.map((c: any) => ({ value: c._id, label: c.name })),
                ]}
              />
            </FormGrid>
          </section>

          {/* ── Step 2: Grid Count ──────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="text-base font-semibold text-gray-800">Choose Grid Count</h3>
              <span className="text-sm text-gray-500">— How many items will this section show?</span>
            </div>
            <div className="flex gap-4">
              {([5, 6] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGridCount(n)}
                  className={`flex-1 py-4 rounded-xl border-2 font-semibold text-lg transition-all ${
                    gridCount === n
                      ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                      : "border-gray-200 text-gray-500 hover:border-green-300"
                  }`}
                >
                  {n} Items
                  <span className="block text-xs font-normal mt-0.5 text-current opacity-70">
                    {n} photos + {n} category links
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Step 3: Slots ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-base font-semibold text-gray-800">
                  Configure {gridCount} Slots
                </h3>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                completedSlots === gridCount
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {completedSlots}/{gridCount} slots ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot, index) => {
                const isComplete = !!slot.preview && !!slot.categoryId && !!slot.subcategoryId;
                const selectedCat = parentCategories?.find((c: any) => c._id === slot.categoryId);
                return (
                  <div
                    key={index}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                      isComplete
                        ? "border-green-400 shadow-sm"
                        : "border-dashed border-gray-300"
                    }`}
                  >
                    {/* Slot header */}
                    <div className={`px-3 py-2 flex items-center justify-between text-xs font-semibold ${
                      isComplete ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
                    }`}>
                      <span>Slot {index + 1}</span>
                      {isComplete && (
                        <button
                          type="button"
                          onClick={() => handleClearSlot(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Image area */}
                    <div
                      className="relative h-36 bg-gray-100 cursor-pointer group"
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      {slot.preview ? (
                        <>
                          <Image
                            src={slot.preview}
                            alt={`Slot ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Change image</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-1 text-gray-400 group-hover:text-green-500 transition-colors">
                          <ImagePlus size={28} />
                          <span className="text-xs">Click to upload</span>
                          <span className="text-[10px]">Square recommended</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        className="hidden"
                        onChange={(e) => handleSlotImage(index, e.target.files?.[0] ?? null)}
                      />
                    </div>

                    {/* Category select */}
                    <div className="p-3">
                      <label className="block text-xs text-gray-500 mb-1 font-medium">
                        Link to Category
                      </label>
                      <select
                        value={slot.categoryId}
                        onChange={(e) => handleSlotCategory(index, e.target.value)}
                        className={`w-full text-sm px-2 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 transition mb-2 ${
                          slot.categoryId
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-300 bg-white text-gray-600"
                        }`}
                      >
                        <option value="">-- Select Category --</option>
                        {parentCategories?.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      {slot.categoryId && (
                        <select
                          value={slot.subcategoryId}
                          onChange={(e) => handleSlotSubcategory(index, e.target.value)}
                          className={`w-full text-xs px-2 py-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 transition ${
                            slot.subcategoryId
                              ? "border-green-200 bg-green-50/50 text-green-700"
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                        >
                          <option value="">-- Select Subcategory --</option>
                          {subcategories
                            ?.filter((sub: any) =>
                              typeof sub.parent === "string"
                                ? sub.parent === slot.categoryId
                                : sub.parent?._id === slot.categoryId
                            )
                            .map((sub: any) => (
                              <option key={sub._id} value={sub._id}>
                                {sub.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Active toggle + Actions ─────────────────────────────── */}
          <div className="border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <FormCheckbox
              label="Active (visible in app immediately)"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSlots(Array.from({ length: gridCount }, emptySlot));
                  fileInputRefs.current.forEach((r) => { if (r) r.value = ""; });
                }}
                disabled={isFormLoading}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isFormLoading || completedSlots < gridCount}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
              >
                {isFormLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create App Featured ({completedSlots}/{gridCount})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
