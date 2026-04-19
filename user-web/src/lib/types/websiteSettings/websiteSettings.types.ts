// @/lib/types/settings/websiteSettings.types.ts

// ✅ Delivery charge range structure
export interface DeliveryChargeRange {
  minAmount: number;
  maxAmount: number; // 0 means unlimited/above
  charge: number;
}

// ✅ Social media links visible on the website
export interface WebsiteSocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

// ✅ Public (safe) version of site settings for frontend
export interface WebsiteSettingsType {
  siteName?: string; // Optional because we're using siteLogo now
  siteLogo: string; // ✅ Image URL instead of text name
  siteDescription?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark" | "system";
  maintenanceMode?: boolean;
  
  // ✅ Charges
  handlingCharges: number;
  deliveryCharges: DeliveryChargeRange[];
  
  socialLinks?: WebsiteSocialLinks;
}

// ✅ Standard API response type for website settings
export interface WebsiteSettingsResponse {
  success: boolean;
  message?: string;
  data?: WebsiteSettingsType;
}

// ✅ Admin version (full access) - includes internal fields
export interface AdminSettingType extends WebsiteSettingsType {
  _id?: string;
  customCSS?: string;
  metadata?: Record<string, any>;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Update payload type
export type UpdateAdminSettingPayload = Partial<AdminSettingType>;