import mongoose, { Document, Model } from "mongoose";

export enum AddressLabelType {
  HOME = "HOME",
  WORK = "WORK",
  CUSTOM = "CUSTOM",
}

export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddress {
  userId: mongoose.Types.ObjectId;
  label: string;
  type: AddressLabelType;
  customLabel?: string | null;

  fullName: string;
  phone: string;
  alternatePhone?: string;

  addressLine1: string;
  addressLine2?: string;
  googleLocation?: string;
  landmark?: string;

  city: string;
  state: string;
  pincode: string;
  country: string;

  formattedAddress?: string;

  // location: ILocation;

  placeId?: number;
  osmType?: string;
  addressType?: string;

  isDefault: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAddressDocument extends IAddress, Document {}

export interface AddressModelType extends Model<IAddressDocument> {
  setDefaultAddress(
    userId: mongoose.Types.ObjectId,
    addressId: mongoose.Types.ObjectId
  ): Promise<IAddressDocument>;

  getDefaultAddress(
    userId: mongoose.Types.ObjectId
  ): Promise<IAddressDocument | null>;
}
