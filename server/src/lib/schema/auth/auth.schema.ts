// @/lib/schemas/auth.schemas.ts
import { z } from "zod";
import { OtpPurpose, UserRole } from "../../types/index";

export const authSchema = {

    registerSchema: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.union([z.string().email("Invalid email address"), z.literal('').transform(() => undefined), z.undefined()]).optional(),
        phone: z.union([z.string().regex(/^\d{10}$/, "Phone must be 10 digits"), z.literal('').transform(() => undefined),z.null().transform(() => undefined), z.undefined()]).optional(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.nativeEnum(UserRole).optional(),
    }).refine(
        (data) => data.email || data.phone,
        { message: "Either email or phone is required", path: ["email"], }
    ),

    loginSchema: z.object({
        email: z.union([z.string().email("Invalid email address"), z.literal('').transform(() => undefined), z.undefined()]).optional(),
        phone: z.union([z.string().regex(/^\d{10}$/, "Phone must be 10 digits"), z.literal('').transform(() => undefined), z.undefined(),z.null()]).optional(),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }).refine(
        (data) => data.email || data.phone,
        { message: "Either email or phone is required", path: ["email"], }
    ),

    verifyOTPSchema: z.object({
        identifier: z.string().min(1, "Identifier is required"),
        otp: z.string().length(6, "OTP must be 6 digits"),
        purpose: z.enum(Object.values(OtpPurpose)).refine(val => !!val, {
            message: "Purpose is required",
        }),
    }),

    sendOTPSchema: z.object({
        identifier: z.string().min(1, "Identifier is required"),
        otp: z.string().min(1, "OTP is required"),
        purpose: z.enum(Object.values(OtpPurpose)).refine(val => !!val, {
            message: "Purpose is required",
        }),
    }),

    resendOTPSchema: z.object({
        identifier: z.string().min(1, "Identifier is required"),
        purpose: z.enum(Object.values(OtpPurpose)).refine(val => !!val, {
            message: "Purpose is required",
        }),
    }),

    forgotPasswordSchema: z.object({
        email: z.string().email("Invalid email format"),
    }),

    resetPasswordSchema: z.object({
        resetToken: z.string().min(1, "Reset token is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        identifier: z.string().min(1, "Identifier is required"),
    }),

    updateProfileSchema: z.object({
        firstName: z.string().min(2, "Name must be at least 2 characters").optional(),
        walletAddress: z.string().optional(),
    }),

    initiateChangePasswordSchema: z.object({
        currentPassword: z.string().min(8, "Current password must be at least 8 characters")
    }),

    completeChangePasswordSchema: z.object({
        identifier: z.string()
            .min(1, "Identifier is required")
            .refine((val) => {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                // Validate phone format (basic - adjust regex as needed)
                const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

                return emailRegex.test(val) || phoneRegex.test(val);
            }, "Identifier must be a valid email or phone number"),

        newPassword: z.string()
            .min(8, "New password must be at least 8 characters long"),
            // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            //     "New password must contain at least one uppercase letter, one lowercase letter, and one number"),

        changeToken: z.string().min(1, "Change token is required")
    }),
}
