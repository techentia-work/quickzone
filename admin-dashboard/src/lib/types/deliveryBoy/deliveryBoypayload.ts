import { DeliveryBoyStatus } from "./deliveryBoy.enum";
import { DeliveryBoyType } from "./deliveryBoy.types";

/* 🧾 Create Delivery Boy (Admin creates credentials automatically) */
export interface CreateDeliveryBoyPayload {
  name: string;
  phone: string;
}

/* 🔑 Delivery Boy Login */
export interface DeliveryBoyLoginPayload {
  email: string;
  password: string;
}

/* 🔄 Update Delivery Boy Status (Admin) */
export interface UpdateDeliveryBoyStatusPayload {
  status: DeliveryBoyStatus;
}

/* 🧩 Update Delivery Boy Details (Admin) */
export interface UpdateDeliveryBoyPayload {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

/* 🚚 Assign Order to Delivery Boy (Admin) */
export interface AssignOrderPayload {
  orderId: string;
  deliveryBoyId: string;
}

/* 📋 Get Profile Response */
export interface DeliveryBoyProfileResponse {
  success: boolean;
  message: string;
  data: DeliveryBoyType;
}

/* 📦 Delivery Boy Form Errors (for validation/UI) */
export interface DeliveryBoyFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: string;
  deliveryBoyId?: string;
  orderId?: string;
  [key: string]: string | undefined;
}

/* 🧠 Delivery Boy Validation Schema (for form libraries like Zod/Yup) */
export interface DeliveryBoyValidationSchema {
  name: string;
  phone: string;
}

/* 📊 Bulk Update Delivery Boys (optional future feature) */
export interface BulkUpdateDeliveryBoysPayload {
  deliveryBoyIds: string[];
  updateData: {
    status?: DeliveryBoyStatus;
    isActive?: boolean;
  };
}
