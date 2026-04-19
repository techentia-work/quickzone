import { OrderStatus, PaymentGateway, PaymentMethod, PaymentStatus, TaxRateType } from "./order.enums";

// 🧾 Order Item Type
export interface OrderItemType {
  _id?: string;
  productId: string;
  variantId: string;
  productName: string;
  variantTitle?: string;
  sku: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  discountedPrice: number;
  taxRate?: TaxRateType;
  tax: number;
  totalPrice: number;
  image?: string;
}

// 🚚 Shipping Address Type
export interface OrderAddressType {
  _id?: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  googleLocation?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

// 💳 Payment Info Type
export interface PaymentInfoType {
  method: string;
  transactionId?: string;
  status: PaymentStatus;
  paidAt?: string;
}

export interface IOrderTracking {
  status: OrderStatus;
  timestamp: Date;
  comment?: string;
  updatedBy?: string;
}

// Razorpay specific payment details
export interface IRazorpayPaymentDetails {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  refund_id?: string;
  refund_status?: string;
}

// ⚙️ Base Order Type (backend schema compatible)
export interface OrderBase {
  userId: string;
  assignedDeliveryBoy?: string;
  sellerId?: string;
  orderNumber: string;
  items: OrderItemType[];
  subtotal: number;
  totalTax: number;
  handlingCharge: number;
  deliveryCharge: number;
  appliedPromo?: {
    code: string;
    discountAmount: number;
  };
  discount?: number;
  totalAmount: number;
  promoUsed: number;
  walletUsed: number;
  walletTotalUsed: number;
  onlinePaid: number;
  remainingCOD: number;
  shippingAddress: OrderAddressType;
  billingAddress?: OrderAddressType;
  paymentMethod: PaymentMethod;
  paymentGateway?: PaymentGateway; // Added to track which gateway was used
  paymentStatus: PaymentStatus;
  paymentId?: string; // Generic payment ID
  transactionId?: string; // Generic transaction ID
  razorpayDetails?: IRazorpayPaymentDetails; // Razorpay specific details
  status: OrderStatus;
  tracking: IOrderTracking[];
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  deliveredAt?: Date;
  expectedDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 🧠 Full Order Type (populated)
export interface OrderType extends OrderBase {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    _id: string;
    name: string;
    shopName?: string;
  };
}

// ✍️ Create Order Payload
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

// 🔄 Update Status Payloads
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
}
