import pkg from "mongoose";
import { IQCNotificationDocument, IQCNotificationModel, } from "../../lib/types/notification/notification.types";

const { Schema, model, models } = pkg;

const QCNotificationSchema = new Schema<IQCNotificationDocument, IQCNotificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    driver: { type: Schema.Types.ObjectId, ref: "Driver" },
    isForAdmin: { type: Boolean, default: false },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: [200, "Title cannot exceed 200 characters"], },
    body: { type: String, required: [true, "Body is required"], trim: true, maxlength: [1000, "Body cannot exceed 1000 characters"], },
    type: { type: String, enum: ["ORDER_PLACED", "ORDER_CONFIRMED", "ORDER_DISPATCHED", "ORDER_DELIVERED", "ORDER_CANCELLED", "REFUND_INITIATED", "PROMOTION", "SYSTEM_ALERT","PAYMENT_CONFIRMED",], default: "SYSTEM_ALERT", },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    meta: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// === Indexes ===
QCNotificationSchema.index({ user: 1, createdAt: -1 });
QCNotificationSchema.index({ vendor: 1, createdAt: -1 });
QCNotificationSchema.index({ driver: 1, createdAt: -1 });
QCNotificationSchema.index({ isForAdmin: 1, createdAt: -1 });
QCNotificationSchema.index({ read: 1 });
QCNotificationSchema.index({ type: 1, createdAt: -1 });

// === Virtuals ===
QCNotificationSchema.virtual("isUnread").get(function () {
  return !this.read;
});

QCNotificationSchema.virtual("isRecent").get(function () {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return (this as any).createdAt.getTime() > oneDayAgo;
});

// === Pre-save validation ===
QCNotificationSchema.pre("save", function (next) {
  const targets = [this.user, this.vendor, this.driver, this.isForAdmin];
  if (!targets.some(Boolean)) {
    return next(new Error("Notification must be assigned to at least one role"));
  }
  next();
});

// === Static methods ===
QCNotificationSchema.statics.findUnreadForUser = function (userId: string) {
  return this.find({ user: userId, read: false }).sort({ createdAt: -1 });
};

QCNotificationSchema.statics.findUnreadForVendor = function (vendorId: string) {
  return this.find({ vendor: vendorId, read: false }).sort({ createdAt: -1 });
};

QCNotificationSchema.statics.findUnreadForDriver = function (driverId: string) {
  return this.find({ driver: driverId, read: false }).sort({ createdAt: -1 });
};


QCNotificationSchema.statics.findUnreadForAdmin = function () {
  return this.find({ isForAdmin: true, read: false }).sort({ createdAt: -1 });
};

// === Creation methods ===
QCNotificationSchema.statics.createUserNotification = async function (userId: string, title: string, body: string, type: string, meta?: any) {
  return this.create({ user: userId, title, body, type, meta: meta || {} });
};

QCNotificationSchema.statics.createVendorNotification = async function (vendorId: string, title: string, body: string, type: string, meta?: any) {
  return this.create({ vendor: vendorId, title, body, type, meta: meta || {} });
};

QCNotificationSchema.statics.createDriverNotification = async function (driverId: string, title: string, body: string, type: string, meta?: any) {
  return this.create({ driver: driverId, title, body, type, meta: meta || {} });
};

QCNotificationSchema.statics.createAdminNotification = async function (title: string, body: string, type: string, meta?: any) {
  return this.create({ isForAdmin: true, title, body, type, meta: meta || {}, });
};

// === Mark as read/unread ===
QCNotificationSchema.statics.markAllReadForUser = function (userId: string) {
  return this.updateMany({ user: userId, read: false }, { read: true });
};

QCNotificationSchema.statics.markAllReadForVendor = function (vendorId: string) {
  return this.updateMany({ vendor: vendorId, read: false }, { read: true });
};

QCNotificationSchema.statics.markAllReadForDriver = function (driverId: string) {
  return this.updateMany({ driver: driverId, read: false }, { read: true });
};

QCNotificationSchema.statics.markAllReadForAdmin = function () {
  return this.updateMany({ isForAdmin: true, read: false }, { read: true });
};

// === Instance methods ===
QCNotificationSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save();
};

QCNotificationSchema.methods.markAsUnread = function () {
  this.read = false;
  return this.save();
};

// === Cleanup ===
QCNotificationSchema.statics.deleteOld = function (daysOld = 30) {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoff } });
};

const QCNotification = model<IQCNotificationDocument, IQCNotificationModel>("QCNotification", QCNotificationSchema);

export default QCNotification;
