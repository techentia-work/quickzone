"use client";

import React, { useEffect, useRef, useState } from "react";
import { Home, Settings, Plus, Trash2, Upload } from "lucide-react";
import { Breadcrumb, PageHeader, Button, Input } from "@/components";
import { BreadcrumbItem } from "@/lib/types";
import { ROUTES } from "@/lib/consts";
import useAdminSettings from "@/hooks/entities/useAdminSettings";
import { DeliveryChargeRange } from "@/lib/types/adminSettings/adminSettings.types";
import { useImageUpload } from "@/hooks";
import toast from "react-hot-toast";
import Image from "next/image";
import { categoryApi } from "@/lib/api";

export default function AdminSettingsPage() {
  const {
    settings,
    isLoadingSettings,
    updateSettings,
    resetSettings,
    refetchSettings,
    isMutating,
  } = useAdminSettings();

  const { uploadSingle, isUploadingSingle } = useImageUpload();
  const [masterCategories, setMasterCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    siteLogo: "",
    faviconUrl: "",
    promoMedia: "",
    promoRedirectUrl: "",
    checkoutAdsImages: [], // 🔥 Changed from string to string[]
    siteDescription: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e293b",
    masterCategoryColors: {},
    theme: "system",
    handlingCharges: 0,
    deliveryCharges: [],
    masterCategoryPromoBanners: {},
  });
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Image file states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [promoPreview, setPromoPreview] = useState<string>("");
  const [masterCategoryPromoFiles, setMasterCategoryPromoFiles] = useState<Record<string, File>>({});
  const [masterCategoryPromoPreviews, setMasterCategoryPromoPreviews] = useState<Record<string, string>>({});

  // 🔥 Checkout Ads Array State
  const [checkoutAdsFiles, setCheckoutAdsFiles] = useState<File[]>([]);
  const [checkoutAdsPreviews, setCheckoutAdsPreviews] = useState<string[]>([]);

  const promoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const checkoutAdsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (settings && typeof settings === "object") {
      setFormData({
        ...settings,
        masterCategoryColors: settings.masterCategoryColors || {},
        masterCategoryPromoBanners: settings.masterCategoryPromoBanners || {},
        deliveryCharges: settings.deliveryCharges || [],
      });

      // Preview images
      setLogoPreview(settings.siteLogo || "");
      setFaviconPreview(settings.faviconUrl || "");
      setPromoPreview(settings.promoMedia || "");
      // setCheckoutAdsPreview(settings.checkoutAdsImage || ""); // ❌ Removed old logic
    }
  }, [settings]);
  const handlePromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMasterCategoryPromoFileChange = (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMasterCategoryPromoFiles(prev => ({ ...prev, [categoryId]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setMasterCategoryPromoPreviews(prev => ({ ...prev, [categoryId]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMasterCategoryPromoUrlChange = (categoryId: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      masterCategoryPromoBanners: {
        ...prev.masterCategoryPromoBanners,
        [categoryId]: {
          ...(prev.masterCategoryPromoBanners?.[categoryId] || { media: '' }),
          redirectUrl: url
        }
      }
    }));
  };

  // 🔥 Handle Multiple File Selection
  const handleCheckoutAdsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setCheckoutAdsFiles((prev) => [...prev, ...newFiles]);

      // Generate previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCheckoutAdsPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 🔥 Remove EXISTING image from formData
  const removeCheckoutAdImage = (index: number) => {
    const updatedImages = [...(formData.checkoutAdsImages || [])];
    updatedImages.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, checkoutAdsImages: updatedImages }));
  };

  // 🔥 Remove NEW file from selection
  const removeNewCheckoutAdFile = (index: number) => {
    const updatedFiles = [...checkoutAdsFiles];
    updatedFiles.splice(index, 1);
    setCheckoutAdsFiles(updatedFiles);

    const updatedPreviews = [...checkoutAdsPreviews];
    updatedPreviews.splice(index, 1);
    setCheckoutAdsPreviews(updatedPreviews);
  };
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoryApi.getAdminCategories();
        setMasterCategories(
          res.data?.categories?.filter(c => c.type === "MASTER") || []
        );
      } catch (error) {
        console.error("Failed to load master categories", error);
      }
    }

    fetchCategories();
  }, []);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleDeliveryChargeChange = (index: number, field: keyof DeliveryChargeRange, value: number) => {
    const updated = [...formData.deliveryCharges];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, deliveryCharges: updated }));
  };

  const addDeliveryRange = () => {
    setFormData((prev: any) => ({
      ...prev,
      deliveryCharges: [
        ...prev.deliveryCharges,
        { minAmount: 0, maxAmount: 0, charge: 0 },
      ],
    }));
  };

  const removeDeliveryRange = (index: number) => {
    const updated = formData.deliveryCharges.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, deliveryCharges: updated }));
  };

  // ✅ Handle logo file selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle favicon file selection
  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle master category color change
  const handleMasterCategoryColorChange = (categoryId: string, color: string) => {
    setFormData((prev: any) => ({
      ...prev,
      masterCategoryColors: {
        ...prev.masterCategoryColors,
        [categoryId]: color,
      },
    }));
  };

  const handleSave = async () => {
    try {
      let logoUrl = formData.siteLogo;
      let faviconUrl = formData.faviconUrl;
      let promoMediaUrl = formData.promoMedia;
      // let checkoutAdsUrl = formData.checkoutAdsImage; // ❌ Removed

      if (logoFile) {
        const res = await uploadSingle(logoFile);
        logoUrl = (res as any)?.imageUrl;
        if (!logoUrl) throw new Error("Logo upload failed");
      }

      if (faviconFile) {
        const res = await uploadSingle(faviconFile);
        faviconUrl = (res as any)?.imageUrl;
        if (!faviconUrl) throw new Error("Favicon upload failed");
      }

      // ⭐ ADD THIS
      if (promoFile) {
        const res = await uploadSingle(promoFile);
        promoMediaUrl = (res as any)?.imageUrl;
        if (!promoMediaUrl) throw new Error("Promo media upload failed");
      }

      // 🔥 Handle Multiple Checkout Ads Upload
      let updatedCheckoutAdsImages = [...(formData.checkoutAdsImages || [])];

      if (checkoutAdsFiles.length > 0) {
        // Upload all new files
        const uploadPromises = checkoutAdsFiles.map((file) => uploadSingle(file));
        const results = await Promise.all(uploadPromises);

        const newImageUrls = results.map((res: any) => res?.imageUrl).filter(Boolean);
        updatedCheckoutAdsImages = [...updatedCheckoutAdsImages, ...newImageUrls];
      }

      // 🔥 Handle Multiple Master Category Promos
      const updatedMasterCategoryPromoBanners = { ...(formData.masterCategoryPromoBanners || {}) };
      const categoryPromoPromises = Object.entries(masterCategoryPromoFiles).map(async ([categoryId, file]) => {
        const res = await uploadSingle(file);
        const url = (res as any)?.imageUrl;
        if (url) {
          updatedMasterCategoryPromoBanners[categoryId] = {
            ...updatedMasterCategoryPromoBanners[categoryId],
            media: url
          };
        }
      });
      await Promise.all(categoryPromoPromises);

      const payload = {
        ...formData,
        siteLogo: logoUrl,
        faviconUrl,
        promoMedia: promoMediaUrl,
        masterCategoryPromoBanners: updatedMasterCategoryPromoBanners,
        checkoutAdsImages: updatedCheckoutAdsImages, // 🔥 Send Array
      };

      await updateSettings(payload);

      setIsEditing(false);
      setLogoFile(null);
      setFaviconFile(null);
      setPromoFile(null);
      setMasterCategoryPromoFiles({});
      setCheckoutAdsFiles([]);
      setCheckoutAdsPreviews([]);

      refetchSettings();
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  };


  const handleReset = async () => {
    await resetSettings();

    setLogoFile(null);
    setFaviconFile(null);
    setPromoFile(null);
    setMasterCategoryPromoFiles({});
    setCheckoutAdsFiles([]); // 🔥 Reset Array
    setCheckoutAdsPreviews([]);

    setLogoPreview("");
    setFaviconPreview("");
    setPromoPreview("");
    setMasterCategoryPromoPreviews({});

    refetchSettings();
    toast.success("Settings reset to defaults");
  };


  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Admin Settings", icon: Settings },
  ];

  const isFormLoading = isUploadingSingle || isMutating;

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Website Settings"
        subtitle="Manage global site configurations and branding"
      />

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        {/* === General Section === */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General</h3>

          {/* Site Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logo
            </label>
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              onChange={handleLogoFileChange}
              disabled={isFormLoading}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {logoPreview && (
              <div className="mt-3">
                <Image
                  src={logoPreview}
                  width={200}
                  height={80}
                  alt="Logo Preview"
                  className="h-20 w-auto object-contain border rounded-md p-2"
                />
              </div>
            )}
          </div>

          {/* Favicon Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <input
              type="file"
              ref={faviconInputRef}
              accept="image/*"
              onChange={handleFaviconFileChange}
              disabled={isFormLoading}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {faviconPreview && (
              <div className="mt-3">
                <Image
                  src={faviconPreview}
                  width={32}
                  height={32}
                  alt="Favicon Preview"
                  className="w-8 h-8 object-contain border rounded-md"
                />
              </div>
            )}
          </div>
          {/* Promo Media Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global Promo Banner (Image / GIF)
            </label>

            <input
              type="file"
              ref={promoInputRef}
              accept="image/*,.gif"
              onChange={handlePromoFileChange}
              disabled={isFormLoading}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
      file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
      file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {promoPreview && (
              <div className="mt-3">
                <Image
                  src={promoPreview}
                  alt="Promo Banner"
                  width={500}
                  height={200}
                  className="max-h-40 w-auto rounded-md border p-2 bg-gray-50 object-contain"
                  unoptimized // For GIFs
                />
              </div>
            )}

            {/* Promo Redirect URL */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Promo Banner Redirect URL
              </label>
              <Input
                type="text"
                placeholder="https://example.com/promo"
                value={formData?.promoRedirectUrl || ""}
                onChange={(e) => handleChange("promoRedirectUrl", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Master Category Specific Promos */}
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Master Category Specific Promo Banners
            </label>
            <div className="space-y-6">
              {masterCategories.map((cat: any) => {
                const preview = masterCategoryPromoPreviews[cat._id] || formData.masterCategoryPromoBanners?.[cat._id]?.media;
                return (
                  <div key={cat._id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-3">{cat.name}</h4>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      onChange={(e) => handleMasterCategoryPromoFileChange(cat._id, e)}
                      disabled={!isEditing || isFormLoading}
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md 
                        file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {preview && (
                      <div className="mt-3">
                        <Image
                          src={preview}
                          alt={`${cat.name} Promo Preview`}
                          width={400}
                          height={128}
                          className="max-h-32 w-auto rounded-md border p-1 bg-white object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Redirect URL
                      </label>
                      <Input
                        type="text"
                        placeholder="https://example.com/promo"
                        value={formData.masterCategoryPromoBanners?.[cat._id]?.redirectUrl || ""}
                        onChange={(e) => handleMasterCategoryPromoUrlChange(cat._id, e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                );
              })}
              {masterCategories.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No master categories available
                </p>
              )}
            </div>
          </div>

          {/* Checkout Ads Image Upload (Multiple) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checkout Ads Banners (Multiple)
            </label>

            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="checkout-ads-upload"
                  multiple
                  accept="image/*,.gif"
                  onChange={handleCheckoutAdsFileChange}
                  disabled={isFormLoading}
                  className="hidden"
                />
                <label
                  htmlFor="checkout-ads-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Add Images
                </label>
                <span className="text-xs text-gray-500">
                  {checkoutAdsFiles.length > 0 ? `${checkoutAdsFiles.length} new files selected` : "No new files selected"}
                </span>
              </div>

              {/* Previews Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {formData.checkoutAdsImages?.map((url: string, index: number) => (
                  <div key={`existing-${index}`} className="relative group border rounded-lg p-2 bg-gray-50">
                    <Image
                      src={url}
                      alt={`Banner ${index + 1}`}
                      width={200}
                      height={96}
                      className="w-full h-24 object-cover rounded"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeCheckoutAdImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* New File Previews */}
                {checkoutAdsPreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group border rounded-lg p-2 bg-blue-50 border-blue-200">
                    <Image
                      src={preview}
                      alt={`New Banner ${index + 1}`}
                      width={200}
                      height={96}
                      className="w-full h-24 object-cover rounded"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                      <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">New</span>
                    </div>
                    <button
                      onClick={() => removeNewCheckoutAdFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2"
              value={formData?.siteDescription || ""}
              onChange={(e) => handleChange("siteDescription", e.target.value)}
              disabled={!isEditing}
              placeholder="Enter site description"
            />
          </div>
        </section >

        {/* === Branding Section === */}
        < section >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                className="h-10 w-full cursor-pointer border border-gray-300 rounded-md"
                value={formData?.primaryColor || "#2563eb"}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                className="h-10 w-full cursor-pointer border border-gray-300 rounded-md"
                value={formData?.secondaryColor || "#1e293b"}
                onChange={(e) => handleChange("secondaryColor", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Master Category Colors */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Master Category Colors
            </label>
            <div className="space-y-3">
              {masterCategories.map((cat: any) => (
                <div key={cat._id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {cat.name}
                  </span>
                  <input
                    type="color"
                    className="h-10 w-24 cursor-pointer border border-gray-300 rounded-md"
                    value={formData.masterCategoryColors?.[cat._id] || "#f97316"}
                    onChange={(e) => handleMasterCategoryColorChange(cat._id, e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              ))}

              {masterCategories.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No master categories available
                </p>
              )}
            </div>
          </div>
        </section >

        {/* === Charges Section === */}
        < section >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Charges</h3>

          {/* Handling Charges */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handling Charges (₹)
            </label>
            <Input
              type="number"
              value={formData?.handlingCharges || 0}
              onChange={(e) => handleChange("handlingCharges", Number(e.target.value))}
              disabled={!isEditing}
              placeholder="0"
            />
          </div>

          {/* Delivery Charges */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Delivery Charges
              </label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDeliveryRange}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Range
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {formData?.deliveryCharges?.map((range: DeliveryChargeRange, index: number) => (
                <div key={index} className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Min Amount (₹)</label>
                    <Input
                      type="number"
                      value={range.minAmount}
                      onChange={(e) =>
                        handleDeliveryChargeChange(index, "minAmount", Number(e.target.value))
                      }
                      disabled={!isEditing}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Max Amount (₹) - 0 = Unlimited</label>
                    <Input
                      type="number"
                      value={range.maxAmount}
                      onChange={(e) =>
                        handleDeliveryChargeChange(index, "maxAmount", Number(e.target.value))
                      }
                      disabled={!isEditing}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Charge (₹)</label>
                    <Input
                      type="number"
                      value={range.charge}
                      onChange={(e) =>
                        handleDeliveryChargeChange(index, "charge", Number(e.target.value))
                      }
                      disabled={!isEditing}
                      placeholder="0"
                    />
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeDeliveryRange(index)}
                      className="text-red-500 hover:text-red-700 mt-5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              {(!formData?.deliveryCharges || formData.deliveryCharges.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No delivery charge ranges configured. Click "Add Range" to create one.
                </p>
              )}
            </div>
          </div>
        </section >

        {/* === Action Buttons === */}
        < div className="flex justify-between items-center mt-6" >
          <Button variant="outline" onClick={handleReset} disabled={isFormLoading}>
            Reset to Default
          </Button>

          <div className="flex gap-3">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isFormLoading}>
                  {isFormLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div >
      </div >
    </div >
  );
}