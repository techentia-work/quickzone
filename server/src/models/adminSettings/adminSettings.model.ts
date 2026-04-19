import { Schema, model } from "mongoose";
import { IAdminSettingDocument, IAdminSettingModel } from "../../lib/types";

const AdminSettingSchema = new Schema<IAdminSettingDocument, IAdminSettingModel>(
  {
    // Site branding - Logo image instead of text
    siteLogo: { type: String, default: "" },
    siteDescription: {
      type: String,
      default: "",
      maxlength: [300, "Description too long"],
    },
    faviconUrl: { type: String, default: "" },

    // Colors & Theme
    primaryColor: {
      type: String,
      default: "#2563eb",
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color code"],
    },
    secondaryColor: {
      type: String,
      default: "#1e293b",
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color code"],
    },

    // ⭐ Multiple Master Category Colors
    masterCategoryColors: {
      type: Map,
      of: String,
      default: {}, // example: { "masterId1": "#FF0000", "masterId2": "#00FF00" }
    },
    promoMedia: {
      type: String,
      default: "",
    },
    masterCategoryPromoBanners: {
      type: Map,
      of: new Schema({
        media: { type: String, default: "" },
        redirectUrl: { type: String, default: "" },
      }, { _id: false }),
      default: {},
    },
    checkoutAdsImages: {
      type: [String],
      default: [],
    },
    promoRedirectUrl: {
      type: String,
      default: "",
    },

    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },

    // Charges Configuration
    handlingCharges: {
      type: Number,
      default: 0,
      min: [0, "Handling charges cannot be negative"],
    },

    deliveryCharges: [
      {
        minAmount: {
          type: Number,
          required: true,
          min: [0, "Min amount cannot be negative"],
        },
        maxAmount: {
          type: Number,
          required: true,
          min: [0, "Max amount cannot be negative"],
        },
        charge: {
          type: Number,
          required: true,
          min: [0, "Charge cannot be negative"],
        },
      },
    ],

    maintenanceMode: { type: Boolean, default: false },
    customCSS: { type: String, default: "" },

    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    metadata: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AdminSettingSchema.index({ updatedAt: -1 });

export const AdminSetting = model<IAdminSettingDocument, IAdminSettingModel>(
  "AdminSetting",
  AdminSettingSchema
);
