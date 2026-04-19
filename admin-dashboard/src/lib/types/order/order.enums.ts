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

export enum TaxRateType {
  GST_5 = "gst_5",
  GST_12 = "gst_12",
  GST_18 = "gst_18",
  GST_28 = "gst_28",
  GST_40 = "gst_40",
}
