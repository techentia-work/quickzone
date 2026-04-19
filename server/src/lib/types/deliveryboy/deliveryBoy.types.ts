import mongoose from "mongoose";

export enum DeliveryBoyStatus {
  AVAILABLE = "AVAILABLE",
  ASSIGNED = "ASSIGNED",
  OFFLINE = "OFFLINE",
  INPROCESSING = "INPROCESSING",
}

export interface IDeliveryBoy {
  name: string;
  email: string;
  phone: string;
  password: string;
  deliveryCode: string;
  status: DeliveryBoyStatus;
  isActive: boolean;
  role: string;
  assignedOrders: mongoose.Types.ObjectId[];
  lastLogin?: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface IDeliveryBoyDocument extends IDeliveryBoy, mongoose.Document {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface DeliveryBoyModelType
  extends mongoose.Model<IDeliveryBoyDocument> {
}
