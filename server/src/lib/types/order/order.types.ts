import mongoose, { Document, Model } from "mongoose";
import { TaxRateType } from "../product/product.types";

export enum OrderStatus {
    CONFIRMED = "CONFIRMED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    RETURNED = "RETURNED",
}

export enum PaymentGateway {
    RAZORPAY = "razorpay",
    // CCAVENUE = "ccavenue", // Removed - only Razorpay now
    STRIPE = "stripe",
    PAYPAL = "paypal"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    AUTHORIZED = "AUTHORIZED", // Added for Razorpay authorized payments
}

export enum PaymentMethod {
    COD = "cod",
    ONLINE = "online",
    WALLET = "wallet",
    WALLET_ONLINE = "wallet_online",
    WALLET_COD = "wallet_cod"
}

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
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

export interface IShippingAddress {
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

export interface IOrderTracking {
    status: OrderStatus;
    timestamp: Date;
    comment?: string;
    updatedBy?: mongoose.Types.ObjectId;
}

// Razorpay specific payment details
export interface IRazorpayPaymentDetails {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    refund_id?: string;
    refund_status?: string;
}

export interface IOrder {
    userId: mongoose.Types.ObjectId;
    assignedDeliveryBoy?: mongoose.Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    subTotal: number;
    totalTax: number;
    shippingCharges: number;
    handlingCharge: number;
    deliveryCharge: number;
    appliedPromo?: {
        code: string;
        discountAmount: number;
    };
    totalAmount: number;
    promoUsed: number;
    walletUsed: number;
    walletTotalUsed: number;
    onlinePaid: number;
    remainingCOD: number;
    shippingAddress: IShippingAddress;
    billingAddress?: IShippingAddress;
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
    cancelledBy?: mongoose.Types.ObjectId;
    cancelledAt?: Date;
    deliveredAt?: Date;
    expectedDeliveryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document { }

export interface OrderModelType extends Model<IOrderDocument> {
    generateOrderNumber(): Promise<string>;
    validateStockAvailability(items: IOrderItem[]): Promise<void>;
    reduceStock(items: IOrderItem[], session?: mongoose.ClientSession): Promise<void>;
    restoreStock(items: IOrderItem[], session?: mongoose.ClientSession): Promise<void>;
}