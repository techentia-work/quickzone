export enum TaxRateType {
  GST_5 = "gst_5",
  GST_12 = "gst_12",
  GST_18 = "gst_18",
  GST_28 = "gst_28",
  GST_40 = "gst_40",
}

export enum OrderStatus {
  PROCESSING = "PROCESSING",
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentMethod {
  COD = "cod",
  ONLINE = "online",
  WALLET = "wallet",
  WALLET_ONLINE = "wallet_online",
  WALLET_COD = "wallet_cod"
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}
