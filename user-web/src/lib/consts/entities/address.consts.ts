import { AddressLabelType, CreateAddressPayload } from "@/lib/types";

export const defaultAddressForm: CreateAddressPayload = {
  label: AddressLabelType.HOME,
  type: AddressLabelType.HOME,
  fullName: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  googleLocation: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  location: { type: "Point", coordinates: [0, 0] },
  isDefault: false,
};