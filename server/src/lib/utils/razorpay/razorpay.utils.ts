import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../../types/index";

// Initialize Razorpay instance lazily
let _razorpayInstance: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
    if (!_razorpayInstance) {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.error("❌ Razorpay Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env");
            throw new AppError("Payment gateway not configured. Please check server environment variables.", 500);
        }

        _razorpayInstance = new Razorpay({
            key_id,
            key_secret,
        });
    }
    return _razorpayInstance;
};

// Export a proxy or a dummy that calls getRazorpay when used
// But for simplicity in this codebase, let's keep the export and update usages if needed
// Or use a Proxy for the export
export const razorpay = new Proxy({} as Razorpay, {
    get: (target, prop) => {
        const instance = getRazorpay();
        return (instance as any)[prop];
    }
});

export interface RazorpayOrderOptions {
    amount: number; // in smallest currency unit (paise for INR)
    currency?: string;
    receipt: string;
    notes?: Record<string, any>;
}

export interface RazorpayPaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export const razorpayUtils = {
    createOrder: async (options: RazorpayOrderOptions) => {
        try {
            const order = await razorpay.orders.create({
                amount: Math.round(options.amount * 100), // Convert to paise
                currency: options.currency || "INR",
                receipt: options.receipt,
                notes: options.notes || {},
            });

            return order;
        } catch (error: any) {
            console.error("Razorpay order creation error:", error);
            throw new AppError(error.message || "Failed to create Razorpay order", 500);
        }
    },
    verifyPaymentSignature: (data: RazorpayPaymentVerification): boolean => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
                data;

            // Create signature verification string
            const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;

            // Generate expected signature
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(signatureBody)
                .digest("hex");

            // Compare signatures
            return expectedSignature === razorpay_signature;
        } catch (error) {
            console.error("Razorpay signature verification error:", error);
            return false;
        }
    },
    fetchPayment: async (paymentId: string) => {
        try {
            const payment = await razorpay.payments.fetch(paymentId);
            return payment;
        } catch (error: any) {
            console.error("Razorpay fetch payment error:", error);
            throw new AppError(
                error.message || "Failed to fetch payment details",
                500
            );
        }
    },
    fetchOrder: async (orderId: string) => {
        try {
            const order = await razorpay.orders.fetch(orderId);
            return order;
        } catch (error: any) {
            console.error("Razorpay fetch order error:", error);
            throw new AppError(error.message || "Failed to fetch order details", 500);
        }
    },
    createRefund: async (
        paymentId: string,
        amount?: number,
        notes?: Record<string, any>
    ) => {
        try {
            const refundData: any = { payment_id: paymentId };

            if (amount) {
                refundData.amount = Math.round(amount * 100); // Convert to paise
            }

            if (notes) {
                refundData.notes = notes;
            }

            const refund = await razorpay.payments.refund(paymentId, refundData);
            return refund;
        } catch (error: any) {
            console.error("Razorpay refund error:", error);
            throw new AppError(error.message || "Failed to create refund", 500);
        }
    },
    fetchRefund: async (refundId: string) => {
        try {
            const refund = await razorpay.refunds.fetch(refundId);
            return refund;
        } catch (error: any) {
            console.error("Razorpay fetch refund error:", error);
            throw new AppError(error.message || "Failed to fetch refund details", 500);
        }
    },
    capturePayment: async (paymentId: string, amount: number) => {
        try {
            const capture = await razorpay.payments.capture(
                paymentId,
                Math.round(amount * 100), // Convert to paise
                "INR"
            );
            return capture;
        } catch (error: any) {
            console.error("Razorpay capture payment error:", error);
            throw new AppError(error.message || "Failed to capture payment", 500);
        }
    },
    validateWebhookSignature: (
        webhookBody: string,
        webhookSignature: string,
        webhookSecret: string
    ): boolean => {
        try {
            const expectedSignature = crypto
                .createHmac("sha256", webhookSecret)
                .update(webhookBody)
                .digest("hex");

            return expectedSignature === webhookSignature;
        } catch (error) {
            console.error("Webhook signature validation error:", error);
            return false;
        }
    },
};
