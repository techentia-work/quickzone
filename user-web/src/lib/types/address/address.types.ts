// @/lib/types/address/address.types.ts

import { AddressLabelType } from "./address.enums";

export type LocationAddressStepType = "list" | "map" | "form";

export interface Address {
  _id: string;
  userId: string;
  label: string;
  type: AddressLabelType;
  customLabel?: string;
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
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  placeId?: number;
  osmType?: string;
  addressType?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
