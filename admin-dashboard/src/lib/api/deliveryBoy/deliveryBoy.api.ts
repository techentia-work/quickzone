import {
  DeliveryBoyProfileResponse,
  DeliveryBoyType,
} from "@/lib/types/deliveryBoy/deliveryBoy.types";
import axiosClient from "../client/axios";
import {
  AssignOrderPayload,
  CreateDeliveryBoyPayload,
  UpdateDeliveryBoyStatusPayload,
  DeliveryBoyLoginPayload,
  UpdateDeliveryBoyPayload,
} from "@/lib/types/deliveryBoy/deliveryBoypayload";

const BASE_URL = "/api/delivery-boys";

const deliveryBoyApi = {

  create: async (data: CreateDeliveryBoyPayload) => {
    const res = await axiosClient.post(
      `${BASE_URL}/create`,
      data
    );

    return res;
  },

  /**
   * 🟡 Get all delivery boys (Admin)
   */
  getAll: async (query?: string) => {
    const res = await axiosClient.get(
      `${BASE_URL}/all${query ? `?${query}` : ""}`
    );
    return res.data as any;
  },

  getById: async (id: string) => {
    const res = await axiosClient.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  /**
   * 🔵 Update a delivery boy (Admin)
   */
  update: async (id: string, data: UpdateDeliveryBoyPayload) => {
    const res = await axiosClient.patch(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  /**
   * 🟠 Update delivery boy status (Admin)
   */
  updateStatus: async (id: string, data: UpdateDeliveryBoyStatusPayload) => {
    const res = await axiosClient.patch(`${BASE_URL}/${id}/status`, data);
    return res.data;
  },

  /**
   * 🟣 Assign order to a delivery boy (Admin)
   */
  assignOrder: async (data: AssignOrderPayload) => {
    const res = await axiosClient.post(`${BASE_URL}/assign`, data);
    return res.data;
  },

  /**
   * 🔴 Delete a delivery boy (Admin)
   */
  delete: async (id: string) => {
    const res = await axiosClient.delete(`${BASE_URL}/${id}`);
    return res.data;
  },

  /**
   * 🔐 Delivery boy login
   */
  login: async (data: DeliveryBoyLoginPayload) => {
    const res = await axiosClient.post(`${BASE_URL}/login`, data);
    return res.data;
  },

  /**
   * 🚪 Logout delivery boy (optional)
   */
  logout: async () => {
    const res = await axiosClient.post(`${BASE_URL}/logout`);
    return res.data;
  },

  /**
   * 👤 Get profile of logged-in delivery boy
   */
  getProfile: async () => {
    const res = await axiosClient.get(`${BASE_URL}/profile`);
    return res.data;
  },
};

export default deliveryBoyApi;
