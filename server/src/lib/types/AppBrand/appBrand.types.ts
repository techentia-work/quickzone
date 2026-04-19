import { Document, Model, Schema } from "mongoose";

export interface IAppBrandDocument extends Document {
  brand: Schema.Types.ObjectId;
  masterCategory?: Schema.Types.ObjectId | null;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppBrandModelType extends Model<IAppBrandDocument> {}
