// @/lib/api/profileApi.ts
import axiosClient from "../client/axios";
import { UserProfileType } from "@/lib/types";

export const userProfileApi = {
  // Get detailed profile
  getProfile: () => axiosClient.get<UserProfileType>("/api/user/profile"),

  // Update profile
  updateProfile: (data: Partial<UserProfileType>) =>
    axiosClient.put<UserProfileType>("/api/user/profile", data),
};

export default userProfileApi;
