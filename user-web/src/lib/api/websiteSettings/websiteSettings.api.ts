import { WebsiteSettingsResponse, WebsiteSettingsType } from "@/lib/types/websiteSettings/websiteSettings.types";
import axiosClient from "../client/axios";

export const websiteSettingsApi = {
  getPublicSettings: () =>
    axiosClient.get<WebsiteSettingsType>("/api/admin-settings/public"),
};

export default websiteSettingsApi;
