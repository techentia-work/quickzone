import { AdminSettingType, UpdateAdminSettingPayload } from "@/lib/types/adminSettings/adminSettings.types";
import axiosClient from "../client/axios";

export const adminSettingApi = {
  // === Public Endpoints ===
  getPublic: () =>
    axiosClient.get<AdminSettingType>("/api/admin-settings/public"),

  // === Admin Endpoints ===
  getSettings: () => axiosClient.get<AdminSettingType>("/api/admin-settings"),

  updateSettings: (data: UpdateAdminSettingPayload) =>
    axiosClient.put<AdminSettingType>("/api/admin-settings", data),

  resetSettings: () =>
    axiosClient.delete<AdminSettingType>("/api/admin-settings/reset"),

  getSettingsSummary: () =>
    axiosClient.get<{ totalVersions: number; lastUpdated: string; lastUpdatedBy?: string }>(
      "/api/admin-settings/summary"
    ),
};

export default adminSettingApi;