import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DeliveryBoyModelType, DeliveryBoyStatus, IDeliveryBoyDocument, } from "../../lib/types/deliveryboy/deliveryBoy.types";
import { deliveryBoyUtils } from "./deliveryBoy.utils";
import { UserRole } from "../../lib/types/index";

const DeliveryBoySchema = new mongoose.Schema<IDeliveryBoyDocument, DeliveryBoyModelType>(
  {
    name: { type: String, required: true, trim: true, },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    phone: { type: String, required: true, trim: true, },
    password: { type: String, required: true, minlength: 6, },
    deliveryCode: { type: String, unique: true, required: true, uppercase: true, trim: true, },
    status: { type: String, enum: Object.values(DeliveryBoyStatus), default: DeliveryBoyStatus.AVAILABLE, },
    isActive: { type: Boolean, default: true, },
    role: { type: String, enum : [UserRole.DELIVERY_BOY], default: UserRole.DELIVERY_BOY },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order", },],
    lastLogin: { type: Date, },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
DeliveryBoySchema.index({ email: 1 });
DeliveryBoySchema.index({ status: 1 });
DeliveryBoySchema.index({ isActive: 1 });
DeliveryBoySchema.index({ isDeleted: 1 });

DeliveryBoySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

DeliveryBoySchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

DeliveryBoySchema.statics = deliveryBoyUtils.statics;

export const DeliveryBoy = mongoose.model<IDeliveryBoyDocument,DeliveryBoyModelType>("DeliveryBoy", DeliveryBoySchema);
