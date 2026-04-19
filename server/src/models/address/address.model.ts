import mongoose from "mongoose";
import {
  IAddressDocument,
  AddressModelType,
  AddressLabelType,
} from "../../lib/types/index";
import { addressUtils } from "./address.utils";

const AddressSchema = new mongoose.Schema<IAddressDocument, AddressModelType>(
  {
    userId: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,index: true,},
    label: { type: String, required: true, trim: true, maxlength: 50 },
    type: {type: String,enum: Object.values(AddressLabelType),required: true,default: AddressLabelType.HOME,},
    customLabel: { type: String, trim: true, maxlength: 50, default: null },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: {type: String,required: true,trim: true,match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],},
    alternatePhone: {type: String,trim: true,match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],},
    addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200 },
    googleLocation: { type: String, trim: true, maxlength: 200 },
    landmark: { type: String, trim: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: {type: String,required: true,trim: true,match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],},
    country: { type: String, required: true, default: "India", trim: true },
    formattedAddress: { type: String, trim: true },
    // location: {type: {  type: String,  enum: ["Point"],  default: "Point",},coordinates: {  type: [Number],  required: true,  validate: {    validator: (arr: number[]) => arr.length === 2,    message: "Coordinates must be [longitude, latitude]",  },},},
    placeId: { type: String, trim: true },
    osmType: { type: String, trim: true },
    addressType: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1, isActive: 1 });
AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ location: "2dsphere" });

AddressSchema.statics = addressUtils.statics;

export const Address = mongoose.model<IAddressDocument, AddressModelType>(
  "Address",
  AddressSchema
);
