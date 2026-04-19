
import { OrderStatus, PaymentMethod, PaymentStatus } from "./order.enums";
import { ShippingAddressPayload } from "./order.payload";

export interface OrderResponse {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subTotal: number;
  totalTax: number;
  shippingAddress: ShippingAddressPayload;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  assignedDeliveryBoy?: {
    _id: string;
    name: string;
    phone: string;
  };
 handlingCharge?: number;
 deliveryCharge?:number;
 walletDeduction?:number;
 onlinePaid?:number;
}