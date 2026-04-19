import { Response } from "express";
import { AppError, AuthRequest } from "../../lib/types/index";
import { AdminSetting } from "../../models/index";

export const adminSettingController = {
  // ===========================
  // ✅ Get site settings (Admin only)
  // ===========================
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await AdminSetting.findOne().sort({ updatedAt: -1 });

      if (!settings)
        throw new AppError("No settings found. Please configure site settings.", 404);

      res.status(200).json({
        success: true,
        message: "Settings fetched successfully",
        data: settings,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch settings",
      });
    }
  },

  // ===========================
  // ✅ Update or create settings
  // ===========================
  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const body = req.body;

      console.log("========== UPDATE ADMIN SETTINGS ==========");
      console.log("1️⃣ Request body:", JSON.stringify(body, null, 2));

      if (req.user?._id) body.updatedBy = req.user._id;

      // ⭐ NEW — support for multiple master category colors
      const updatePayload = {
        ...body,

        siteLogo: body.siteLogo || "",
        faviconUrl: body.faviconUrl || "",
        handlingCharges: body.handlingCharges || 0,
        promoMedia: body.promoMedia || "",
        promoRedirectUrl: body.promoRedirectUrl || "", // ⭐ NEW
        checkoutAdsImages: body.checkoutAdsImages || [], // ⭐ NEW
        masterCategoryColors: body.masterCategoryColors || {},

        deliveryCharges: Array.isArray(body.deliveryCharges)
          ? body.deliveryCharges
          : [],
      };

      console.log("2️⃣ Update payload:", JSON.stringify(updatePayload, null, 2));

      const settings = await AdminSetting.findOneAndUpdate({}, updatePayload, {
        new: true,
        upsert: true,
        runValidators: true,
      });

      console.log("3️⃣ Updated settings:", JSON.stringify(settings, null, 2));
      console.log("========== END UPDATE ==========");

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (err: any) {
      console.error("UPDATE ERROR:", err);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to update settings",
      });
    }
  },

  // ===========================
  // ✅ Reset settings
  // ===========================
  async resetSettings(req: AuthRequest, res: Response) {
    try {
      await AdminSetting.deleteMany({});
      const defaultSettings = await AdminSetting.create({});

      res.status(200).json({
        success: true,
        message: "Settings reset to defaults",
        data: defaultSettings,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to reset settings",
      });
    }
  },

  // ===========================
  // ✅ Settings summary
  // ===========================
  async getSettingsSummary(req: AuthRequest, res: Response) {
    try {
      const count = await AdminSetting.countDocuments();
      const latest = await AdminSetting.findOne()
        .sort({ updatedAt: -1 })
        .select("updatedAt updatedBy");

      res.status(200).json({
        success: true,
        message: "Settings summary fetched successfully",
        data: {
          totalVersions: count,
          lastUpdated: latest?.updatedAt,
          lastUpdatedBy: latest?.updatedBy,
        },
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch summary",
      });
    }
  },

  // ===========================
  // ✅ Public settings (Frontend)
  // ===========================
  async getPublicSettings(req: any, res: Response) {
    try {
      const settings = await AdminSetting.findOne().sort({ updatedAt: -1 });

      if (!settings)
        return res.status(404).json({
          success: false,
          message: "No settings found",
        });

      const publicData = {
        siteLogo: settings.siteLogo,
        siteDescription: settings.siteDescription,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,

        // ⭐ NEW — send all colors for master categories
        masterCategoryColors: settings.masterCategoryColors || {},
        promoMedia: settings.promoMedia,
        promoRedirectUrl: settings.promoRedirectUrl || "",

        // ⭐ NEW — Checkout Ads Image for Order Detail Page
        checkoutAdsImages: settings.checkoutAdsImages || [],

        theme: settings.theme,
        maintenanceMode: settings.maintenanceMode,
        socialLinks: settings.socialLinks,
        handlingCharges: settings.handlingCharges,
        deliveryCharges: settings.deliveryCharges,
      };

      res.status(200).json({
        success: true,
        message: "Public settings fetched successfully",
        data: publicData,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch public settings",
      });
    }
  },
};
