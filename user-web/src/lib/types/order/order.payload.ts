import { PaymentMethod } from "./order.enums";

export interface ShippingAddressPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  landmark?: string;
  googleLocation?: string;
}

export interface CreateOrderPayload {
  shippingAddressId?: string;
  billingAddressId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface CreateRazorpayOrderPayload {
  orderId: string;
}

export interface CreateRazorpayOrderResponse {
  razorpay_order_id: string
  amount: string,
  currency: string,
  orderId: string,
  orderNumber: string,
  key: string,
}

export interface VerifyRazorpayPaymentPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  comment?: string;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: string;
  paymentId?: string;
  transactionId?: string;
}

export interface RefundOrderPayload {
  amount?: number;
  reason: string;
}