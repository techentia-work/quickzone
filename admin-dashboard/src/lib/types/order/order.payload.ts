import { OrderStatus, PaymentStatus, TaxRateType } from "./order.enums";
import { OrderItemType, OrderAddressType } from "./order.types";

// 🧾 Create Order Payload
export interface CreateOrderPayload {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  addressId: string;
  paymentMethod: string;
  notes?: string;
}

// ❌ Cancel Order Payload
export interface CancelOrderPayload {
  reason: string;
}

// 🔄 Update Order Status Payload
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// 💳 Update Payment Status Payload
export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
}

// 📊 Bulk Update Orders Payload (for admin)
export interface BulkUpdateOrdersPayload {
  orderIds: string[];
  updateData: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  };
}

// 🧮 Order Form Errors (for validation/UI)
export interface OrderFormErrors {
  items?: string;
  addressId?: string;
  paymentMethod?: string;
  reason?: string;
  status?: string;
  paymentStatus?: string;
  notes?: string;
  [key: string]: string | undefined;
}

// 💸 Order Item Form Errors (for client-side forms)
export interface OrderItemFormErrors {
  productId?: string;
  variantId?: string;
  quantity?: string;
  [key: string]: string | undefined;
}

// 📦 Example of an Order Validation Type (for Zod or Yup integration)
export interface OrderValidationSchema {
  items: OrderItemType[];
  address: OrderAddressType;
  paymentMethod: string;
  notes?: string;
}
