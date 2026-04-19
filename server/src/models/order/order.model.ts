import mongoose from "mongoose";
import {
  IOrderDocument,
  OrderModelType,
  IOrderItem,
  IShippingAddress,
  IOrderTracking,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TaxRateType,
  PaymentGateway,
  IRazorpayPaymentDetails
} from "../../lib/types/index";
import { orderUtils } from "./order.utils";

const OrderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true, trim: true },
    variantTitle: { type: String, trim: true },
    sku: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: String, enum: Object.values(TaxRateType), default: TaxRateType.GST_5 },
    tax: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    googleLocation: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true },
    landmark: { type: String, trim: true },
  },
  { _id: false }
);

const OrderTrackingSchema = new mongoose.Schema<IOrderTracking>(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    comment: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

// Razorpay payment details schema
const RazorpayPaymentDetailsSchema = new mongoose.Schema<IRazorpayPaymentDetails>(
  {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    refund_id: { type: String },
    refund_status: { type: String },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema<IOrderDocument, OrderModelType>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (val: IOrderItem[]) => val.length > 0,
        message: "Order must have at least one item"
      }
    },
    subTotal: { type: Number, required: true, min: 0 },
    totalTax: { type: Number, required: true, min: 0 },
    shippingCharges: { type: Number, default: 0, min: 0 },
    handlingCharge: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    appliedPromo: {
      code: { type: String, uppercase: true },
      discountAmount: { type: Number, min: 0 }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    promoUsed: { type: Number, default: 0 },
    walletUsed: { type: Number, default: 0 },
    walletTotalUsed: { type: Number, default: 0 },
    onlinePaid: { type: Number, default: 0 },
    remainingCOD: { type: Number, default: 0 },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    billingAddress: { type: ShippingAddressSchema },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentGateway: { type: String, enum: Object.values(PaymentGateway) }, // Added
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paymentId: { type: String }, // Generic payment ID
    transactionId: { type: String }, // Generic transaction ID
    razorpayDetails: { type: RazorpayPaymentDetailsSchema }, // Razorpay specific
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PROCESSING },
    tracking: { type: [OrderTrackingSchema], default: [] },
    notes: { type: String, maxlength: 500 },
    cancellationReason: { type: String, maxlength: 500 },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: { type: Date },
    deliveredAt: { type: Date },
    expectedDeliveryDate: { type: Date },
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
  },
  { timestamps: true }
);

// Compound Indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ "appliedPromo.code": 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "razorpayDetails.razorpay_order_id": 1 }); // Added for Razorpay lookups
OrderSchema.index({ "razorpayDetails.razorpay_payment_id": 1 }); // Added for Razorpay lookups

// Pre-save middleware: Add tracking entry when status changes
OrderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    const existingTracking = this.tracking.find(
      (t) => t.status === this.status &&
        Math.abs(new Date().getTime() - t.timestamp.getTime()) < 1000
    );

    if (!existingTracking) {
      this.tracking.push({
        status: this.status,
        timestamp: new Date(),
        comment: undefined,
        updatedBy: undefined
      });
    }
  }
  next();
});

// Pre-save middleware: Initialize tracking for new orders
OrderSchema.pre("save", function (next) {
  if (this.isNew && this.tracking.length === 0) {
    this.tracking.push({
      status: this.status,
      timestamp: new Date(),
      comment: "Order placed successfully"
    });
  }
  next();
});

// Static methods
OrderSchema.statics = orderUtils.statics;

export const Order = mongoose.model<IOrderDocument, OrderModelType>("Order", OrderSchema);
