import { Document, Model, Types } from "mongoose";

export interface IAdminSetting {
  siteLogo: string; // Site logo image URL (instead of siteName text)
  siteDescription: string;
  faviconUrl: string;
  promoMedia: string;
  promoRedirectUrl?: string; // Optional redirect URL for promo banner
  checkoutAdsImages: string[]; // Checkout ads image URLs (Array)
  primaryColor: string;
  secondaryColor: string;
  masterCategoryColors?: Record<string, string>;
  masterCategoryPromoBanners?: Record<string, { media: string; redirectUrl: string }>;
  theme: "light" | "dark" | "system";
  maintenanceMode: boolean;
  customCSS: string;

  // Charges Configuration
  handlingCharges: number;
  deliveryCharges: Array<{
    minAmount: number; // Minimum order amount
    maxAmount: number; // Maximum order amount (0 = unlimited/above)
    charge: number; // Delivery charge for this range
  }>;

  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  metadata: Record<string, any>;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminSettingDocument extends IAdminSetting, Document { }
export interface IAdminSettingModel extends Model<IAdminSettingDocument> { }