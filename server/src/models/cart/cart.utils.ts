import mongoose, { HydratedDocument } from "mongoose";
import { IAdminSettingModel, ICartDocument } from "../../lib/types/index";

const getAdminSettingModel = (): IAdminSettingModel => mongoose.models.AdminSetting as IAdminSettingModel;

export const cartUtils = {
    calculateCartTotals: async function (this: HydratedDocument<ICartDocument>) {
        const cart = this as ICartDocument;
        const AdminSetting = getAdminSettingModel();

        let subTotal = 0;

        // Calculate item totals (GST inclusive — no tax)
        cart.items.forEach(item => {
            item.discountedPrice = item.discountPercent
                ? +(item.price * (1 - item.discountPercent / 100)).toFixed(2)
                : item.price;

            const itemTotal = item.discountedPrice * item.quantity;
            item.totalPrice = +itemTotal.toFixed(2);

            subTotal += itemTotal;
        });

        cart.subTotal = +subTotal.toFixed(2);
        cart.totalTax = 0; // no GST

        // Fetch admin settings (latest)
        const settings = await AdminSetting.findOne().sort({ updatedAt: -1 });

        const handlingCharge = settings?.handlingCharges || 0;
        cart.handlingCharge = handlingCharge;

        // Calculate delivery charge
        let deliveryCharge = 30;
        if (settings?.deliveryCharges?.length) {
            for (const rule of settings.deliveryCharges) {
                const min = rule.minAmount;
                const max = rule.maxAmount === 0 ? Infinity : rule.maxAmount;

                if (cart.subTotal >= min && cart.subTotal <= max) {
                    deliveryCharge = rule.charge;
                    break;
                }
            }
        }
        cart.deliveryCharge = deliveryCharge;

        // Apply promo if any
        let finalAmount = subTotal;

        if (cart.appliedPromo?.discountAmount) {
            finalAmount -= cart.appliedPromo.discountAmount;
        }

        // Add handling + delivery charges
        finalAmount += handlingCharge + deliveryCharge;

        cart.totalAmount = finalAmount < 0 ? 0 : +finalAmount.toFixed(2);
    }
};
