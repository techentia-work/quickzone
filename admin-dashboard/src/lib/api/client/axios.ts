import axios, { AxiosRequestConfig } from "axios";
import { asyncErrorHandler } from "../../utils/error.client.utils";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://api.quickzon.in
  timeout: 60000,
  withCredentials: true, // 🔥 COOKIE ENABLE
  headers: {
    "Content-Type": "application/json",
  },
});

// ❌ NO TOKEN STORAGE
// ❌ NO AUTH HEADER
// ❌ NO LOCALSTORAGE

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized – session expired");
    }
    return Promise.reject(error);
  }
);

export const axiosClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    asyncErrorHandler<T>(() => axiosInstance.get(url, config)),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    asyncErrorHandler<T>(() => axiosInstance.post(url, data, config)),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    asyncErrorHandler<T>(() => axiosInstance.put(url, data, config)),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    asyncErrorHandler<T>(() => axiosInstance.patch(url, data, config)),
  delete: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    asyncErrorHandler<T>(() => axiosInstance.delete(url, { data, ...config })),
};

export default axiosClient;
