export interface DeliveryChargeRange {
  minAmount: number;
  maxAmount: number; // 0 means unlimited/above
  charge: number;
}

export interface AdminSettingType {
  _id?: string;
  siteLogo: string; // Image URL instead of siteName
  siteDescription?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  promoMedia?: string;
  checkoutAdsImage?: string; // Checkout ads image URL
  masterCategoryColors?: Record<string, string>;
  masterCategoryPromoBanners?: Record<string, { media: string; redirectUrl: string }>;
  theme?: "light" | "dark" | "system";
  maintenanceMode?: boolean;
  customCSS?: string;

  // Charges
  handlingCharges: number;
  deliveryCharges: DeliveryChargeRange[];

  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };

  metadata?: Record<string, any>;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateAdminSettingPayload = Partial<AdminSettingType>;