import { DeliveryBoyStatus } from "./deliveryBoy.enum";

// 🧑‍💼 Base Delivery Boy Type (matches backend schema)
export interface DeliveryBoyBase {
  name: string;
  email: string;
  phone: string;
  deliveryCode: string;
  status: DeliveryBoyStatus;
  isActive: boolean;
  assignedOrders: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 🧠 Full Delivery Boy Type (includes _id)
export interface DeliveryBoyType extends DeliveryBoyBase {
  _id: string;
}

// 📋 API Response (Generic)
export interface DeliveryBoyListResponse {
  success: boolean;
  data: DeliveryBoyType[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// 🧾 Profile Response
export interface DeliveryBoyProfileResponse {
  success: boolean;
  message: string;
  data: {
    deliveryBoy: DeliveryBoyType;
    credentials: { email: string; password: string };
  };
}

// 📊 Optional: Stats Response (Admin Dashboard)
export interface DeliveryBoyStats {
  total: number;
  available: number;
  assigned: number;
  offline: number;
  active: number;
}
