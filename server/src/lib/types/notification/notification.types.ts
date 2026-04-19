import { Document, Model, Types } from "mongoose";

export type QCNotificationType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_DISPATCHED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "REFUND_INITIATED"
  | "PROMOTION"
  | "SYSTEM_ALERT";

export interface IQCNotification {
  user?: Types.ObjectId;
  vendor?: Types.ObjectId;
  driver?: Types.ObjectId;
  isForAdmin?: boolean;
  title: string;
  body: string;
  type: QCNotificationType;
  order?: Types.ObjectId;
  meta?: Record<string, any>;
  read?: boolean;
}

/** 🧾 Instance Methods */
export interface IQCNotificationDocument extends IQCNotification, Document {
  markAsRead(): Promise<IQCNotificationDocument>;
  markAsUnread(): Promise<IQCNotificationDocument>;
}

/** 🧠 Static Methods */
export interface IQCNotificationModel extends Model<IQCNotificationDocument> {
  // === Find ===
  findUnreadForUser(userId: string): Promise<IQCNotificationDocument[]>;
  findUnreadForVendor(vendorId: string): Promise<IQCNotificationDocument[]>;
  findUnreadForDriver(driverId: string): Promise<IQCNotificationDocument[]>;
  findUnreadForAdmin(): Promise<IQCNotificationDocument[]>;

  // === Create ===
  createUserNotification(
    userId: string,
    title: string,
    body: string,
    type: QCNotificationType,
    meta?: Record<string, any>
  ): Promise<IQCNotificationDocument>;

  createVendorNotification(
    vendorId: string,
    title: string,
    body: string,
    type: QCNotificationType,
    meta?: Record<string, any>
  ): Promise<IQCNotificationDocument>;

  createDriverNotification(
    driverId: string,
    title: string,
    body: string,
    type: QCNotificationType,
    meta?: Record<string, any>
  ): Promise<IQCNotificationDocument>;

  createAdminNotification(
    title: string,
    body: string,
    type: QCNotificationType,
    meta?: Record<string, any>
  ): Promise<IQCNotificationDocument>;

  // === Mark as Read ===
  markAllReadForAdmin(): Promise<any>;
  markAllReadForUser(userId: string): Promise<any>;
  markAllReadForVendor(vendorId: string): Promise<any>;
  markAllReadForDriver(driverId: string): Promise<any>;

  // === Cleanup ===
  deleteOld(daysOld?: number): Promise<{ deletedCount?: number }>;
}
