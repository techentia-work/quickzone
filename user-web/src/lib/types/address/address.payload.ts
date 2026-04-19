// @/lib/types/address/address.payload.ts

import { AddressLabelType } from "./address.enums";

export interface CreateAddressPayload {
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
  country?: string;
  formattedAddress?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  placeId?: number;
  osmType?: string;
  addressType?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  type?: AddressLabelType;
  customLabel?: string;
  fullName?: string;
  phone?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  formattedAddress?: string;
  location?: {
    type?: "Point";
    coordinates?: [number, number];
  };
  placeId?: number;
  osmType?: string;
  addressType?: string;
  isDefault?: boolean;
}
