"use client";

import React, { useState } from "react";
import { Save, Tag, ArrowLeft } from "lucide-react";
import { FormInput, FormActions, FormSelect } from "@/components";
import { useAdminBrand, useAdminCategory } from "@/hooks";
import { useAdminAppBrand } from "@/hooks/entities/useAdminAppBrand";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/consts";
import Link from "next/link";
import { useEffect } from "react";

export default function AddAppBrandPage() {
  const router = useRouter();
  const { brandList } = useAdminBrand("limit=500");
  const { categories: masterCategories } = useAdminCategory("limit=500&type=MASTER");
  const { appBrands, createAppBrand, isCreating } = useAdminAppBrand();

  const [formData, setFormData] = useState({
    brand: "",
    masterCategory: "",
    order: 0,
  });

  const [errors, setErrors] = useState<any>({});

  // Auto-increment Order Logic
  useEffect(() => {
    if (appBrands && appBrands.length > 0) {
      const maxOrder = Math.max(...appBrands.map((b: any) => b.order || 0));
      setFormData((prev) => ({ ...prev, order: maxOrder + 1 }));
    } else if (appBrands && appBrands.length === 0) {
      setFormData((prev) => ({ ...prev, order: 1 }));
    }
  }, [appBrands]);

  const brandOptions = brandList.map((b: any) => ({
    value: b._id,
    label: b.name,
  }));

  const categoryOptions = masterCategories.map((c: any) => ({
    value: c._id,
    label: c.name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: any = {};
    if (!formData.brand) newErrors.brand = "Please select a brand";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createAppBrand(formData);
      router.push(ROUTES.ADMIN.APPBRAND.ROOT);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <Link href={ROUTES.ADMIN.APPBRAND.ROOT} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-gray-800">Add App Brand</h1>
              <p className="text-gray-500 text-sm">Create a new brand entry for the mobile app</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormSelect
                label="Select Brand"
                name="brand"
                value={formData.brand}
                options={brandOptions}
                onChange={handleChange}
                required
                error={errors.brand}
                className="w-full"
              />

              <FormSelect
                label="Master Category (Optional)"
                name="masterCategory"
                value={formData.masterCategory}
                options={categoryOptions}
                onChange={handleChange}
                className="w-full"
              />

              <FormInput
                label="Display Order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange}
                placeholder="e.g. 1, 2, 3"
                className="w-full"
              />
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
               <Link 
                 href={ROUTES.ADMIN.APPBRAND.ROOT}
                 className="px-6 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors"
               >
                 Cancel
               </Link>
               <button
                 type="submit"
                 disabled={isCreating}
                 className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
               >
                 {isCreating ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <Save size={18} />
                 )}
                 Add Brand to App
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
