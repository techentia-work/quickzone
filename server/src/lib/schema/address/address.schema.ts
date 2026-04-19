import { z } from "zod";
import { AddressLabelType } from "../../types/index";

const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;

/**
 * Common reusable optional string handler
 * - allows: string | "" | null | undefined
 * - converts "" / null → undefined
 */
const optionalString = (max: number, msg = "Invalid value") =>
  z
    .union([
      z.string().max(max, msg),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .transform((val) => {
      if (val === "" || val == null) return undefined;
      return val;
    });

/**
 * Optional phone number handler
 */
const optionalPhone = z
  .union([
    z.string().regex(phoneRegex, "Please enter a valid 10-digit phone number"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional()
  .transform((val) => {
    if (val === "" || val == null) return undefined;
    return val;
  });

/**
 * =========================
 * ADDRESS SCHEMAS
 * =========================
 */
export const addressSchema = {
  /**
   * CREATE ADDRESS
   */
  createAddressSchema: z.object({
    label: z.string().min(1, "Label is required").max(50, "Label too long"),
    type: z.nativeEnum(AddressLabelType),

    customLabel: optionalString(20, "Custom label too long"),

    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Name too long"),

    phone: z
      .string()
      .regex(phoneRegex, "Please enter a valid 10-digit phone number"),

    alternatePhone: optionalPhone,

    addressLine1: z
      .string()
      .min(1, "Address is required")
      .max(200, "Address too long"),

    addressLine2: optionalString(200, "Address too long"),

    googleLocation: optionalString(200, "Location too long"),

    landmark: optionalString(200, "Landmark too long"),

    city: z.string().min(1, "City is required").max(100, "City too long"),

    state: z.string().min(1, "State is required").max(100, "State too long"),

    pincode: z
      .string()
      .regex(pincodeRegex, "Please enter a valid 6-digit pincode"),

    country: z.string().default("India"),

    isDefault: z.boolean().optional(),
  }),

  /**
   * UPDATE ADDRESS
   * (⚠️ same rules as create, but everything optional)
   */
  updateAddressSchema: z.object({
    label: z.string().min(1).max(50).optional(),
    type: z.nativeEnum(AddressLabelType).optional(),

    customLabel: optionalString(20, "Custom label too long"),

    fullName: z.string().min(1).max(100).optional(),

    phone: z
      .string()
      .regex(phoneRegex, "Please enter a valid 10-digit phone number")
      .optional(),

    alternatePhone: optionalPhone,

    addressLine1: z.string().min(1).max(200).optional(),

    addressLine2: optionalString(200, "Address too long"),

    googleLocation: optionalString(200, "Location too long"),

    landmark: optionalString(200, "Landmark too long"),

    city: z.string().min(1).max(100).optional(),

    state: z.string().min(1).max(100).optional(),

    pincode: z
      .string()
      .regex(pincodeRegex, "Please enter a valid 6-digit pincode")
      .optional(),

    country: z.string().optional(),

    isDefault: z.boolean().optional(),
  }),
};
