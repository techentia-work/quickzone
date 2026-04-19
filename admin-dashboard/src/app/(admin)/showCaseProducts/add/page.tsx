"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

import { FormActions, FormSubmitButton } from "@/components";
import { useAdminShowcaseProduct } from "@/hooks/entities/useAdminShowCaseProduct";
import { useAdminCategory, useAdminProduct } from "@/hooks";

import featuredWeekBrandApi from "@/lib/api/featuredWeekBrand/featuredWeekBrand.api";
import shopByStoreApi from "@/lib/api/shopByStore/shopByStore.api";

import {
  CreateShowcaseProductPayload,
} from "@/lib/types/showCaseProduct/showCaseProduct.types";

export default function AddShowCaseProduct() {
  const { createShowcase, isLoadingShowcases } =
    useAdminShowcaseProduct();

  const { adminCategories } = useAdminCategory();
  const { getProductsByCategory } = useAdminProduct();

  /* ===============================
     STATE
  =============================== */
  const [masterCategoryId, setMasterCategoryId] = useState("");
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [featuredBrands, setFeaturedBrands] = useState<any[]>([]);
  const [shopByStores, setShopByStores] = useState<any[]>([]);

  const [brandId, setBrandId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [formData, setFormData] =
    useState<CreateShowcaseProductPayload>({
      showcaseType: "NEW_IN_STORE",
      masterCategoryId: "",
      subCategoryIds: [],
      productIds: [],
    });

  /* ===============================
     SUB CATEGORIES
  =============================== */
  const subCategories = adminCategories.filter(
    (c: any) => c.type === "SUBCATEGORY"
  );

  /* ===============================
     FETCH FEATURED BRAND + STORE
  =============================== */
  useEffect(() => {
    featuredWeekBrandApi.getAll("limit=100").then((res) => {
      setFeaturedBrands(res?.data?.items ?? []);
    });

    shopByStoreApi.getAll("limit=100").then((res) => {
      setShopByStores(res?.data?.items ?? []);
    });
  }, []);

  /* ===============================
     FETCH PRODUCTS
  =============================== */
  useEffect(() => {
    const fetchProducts = async () => {
      if (subCategoryIds.length === 0) {
        setProducts([]);
        return;
      }

      const all: any[] = [];
      for (const subId of subCategoryIds) {
        const res = await getProductsByCategory(subId);
        if (res?.products) all.push(...res.products);
      }

      setProducts(
        Array.from(new Map(all.map((p) => [p._id, p])).values())
      );
    };

    fetchProducts();
  }, [subCategoryIds]);

  /* ===============================
     SYNC FORM DATA
  =============================== */
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      masterCategoryId,
      subCategoryIds,
      productIds,
      brandId: brandId || undefined,
      storeId: storeId || undefined,
    }));
  }, [masterCategoryId, subCategoryIds, productIds, brandId, storeId]);

  /* ===============================
     TOGGLES
  =============================== */
  const toggleSubCategory = (id: string) => {
    setSubCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setProductIds([]);
  };

  const toggleProduct = (id: string) => {
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ===============================
     SHOWCASE TYPE CHANGE
  =============================== */
  const handleShowcaseTypeChange = (value: string) => {
    setBrandId(null);
    setStoreId(null);

    // FEATURED BRAND
    if (value.startsWith("FEATURED_BRAND:")) {
      const id = value.split(":")[1];
      const brand = featuredBrands.find((b: any) => b._id === id);

      setBrandId(id);

      setFormData((p) => ({
        ...p,
        showcaseType: brand?.name || "FEATURED_BRAND", // 🔥 yahin fix hai
      }));
      return;
    }

    // SHOP BY STORE
    if (value.startsWith("SHOP_BY_STORE:")) {
      const id = value.split(":")[1];
      const store = shopByStores.find((s: any) => s._id === id);

      setStoreId(id);

      setFormData((p) => ({
        ...p,
        showcaseType: store?.name || "SHOP_BY_STORE", // 🔥 yahin fix
      }));
      return;
    }

    // STATIC TYPES
    setFormData((p) => ({
      ...p,
      showcaseType: value,
    }));
  };


  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.showcaseType ||
      !masterCategoryId ||
      subCategoryIds.length === 0 ||
      productIds.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    await createShowcase(formData);
    toast.success("Showcase product added successfully");

    setMasterCategoryId("");
    setSubCategoryIds([]);
    setProductIds([]);
    setProducts([]);
    setBrandId(null);
    setStoreId(null);
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Add Showcase Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MASTER CATEGORY */}
        <div>
          <label className="font-medium">Master Category *</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={masterCategoryId}
            onChange={(e) => {
              setMasterCategoryId(e.target.value);
              setSubCategoryIds([]);
              setProductIds([]);
            }}
          >
            <option value="">-- Choose --</option>
            {adminCategories
              .filter((c: any) => c.type === "MASTER")
              .map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* SUB CATEGORIES */}
        <div>
          <label className="font-medium">
            Sub Categories * (Multiple)
          </label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
            {subCategories.map((cat: any) => (
              <label key={cat._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subCategoryIds.includes(cat._id)}
                  onChange={() => toggleSubCategory(cat._id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* PRODUCTS */}
        <div>
          <label className="font-medium">
            Products * (Multiple)
          </label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
            {products.map((p: any) => (
              <label key={p._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productIds.includes(p._id)}
                  onChange={() => toggleProduct(p._id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        {/* SHOWCASE TYPE */}
        <div>
          <label className="font-medium">Showcase Type *</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            onChange={(e) => handleShowcaseTypeChange(e.target.value)}
          >
            {/* STATIC TYPES */}
            <option value="NEW_IN_STORE">New In Store</option>
            <option value="BEST_DEALS">Best Deals</option>
            <option value="PREMIUM">Premium</option>
            <option value="HOT_DEALS">Hot Deals</option>
            <option value="TRENDING_NEAR_YOU">Trending Near You</option>
            <option value="PRICE_DROP">Price Drop</option>
            <option value="TOP_PICKS">Top Picks</option>
            <option value="QUICK_ESSENTIALS">Quick Essentials</option>
            <option value="BEST_SELLERS">Best Sellers</option>
            <option value="NEW_ARRIVALS">New Arrivals</option>
            <option value="MOST_ORDERED">Most Ordered</option>
            <option value="TRENDING_YOUR_CITY">Trending Your City</option>

            {/* FEATURED BRANDS (NO HEADING) */}
            {featuredBrands.map((b: any) => (
              <option
                key={b._id}
                value={`FEATURED_BRAND:${b._id}`}
              >
                {b.name} {/* example: Trending Near You */}
              </option>
            ))}

            {/* SHOP BY STORE (NO HEADING) */}
            {shopByStores.map((s: any) => (
              <option
                key={s._id}
                value={`SHOP_BY_STORE:${s._id}`}
              >
                {s.name} {/* example: Sports Store */}
              </option>
            ))}
          </select>

        </div>

        <FormActions>
          <FormSubmitButton
            isLoading={isLoadingShowcases}
            icon={<Save className="w-4 h-4" />}
          >
            Add To Showcase
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
