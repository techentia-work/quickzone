// @/lib/api/profileApi.ts
import axiosClient from "../client/axios";
import { UserProfileType } from "@/lib/types";

export const userProfileApi = {
  getProfile: () => axiosClient.get<UserProfileType>("/api/auth/profile"),

  updateProfile: (data: Partial<UserProfileType>) =>
    axiosClient.put<UserProfileType>("/api/auth/profile", data),

  getUserDetails: (userId?: string) =>
    userId
      ? axiosClient.get(`/api/user/details/${userId}`)
      : axiosClient.get(`/api/user/details`),

  getAllUsers: (filters : string) => axiosClient.get(`/api/user/all?${filters}`),
};

export default userProfileApi;
