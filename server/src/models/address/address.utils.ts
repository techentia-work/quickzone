import mongoose from "mongoose";
import { IAddressDocument, AddressModelType } from "../../lib/types/index";
import { AppError } from "../../lib/types/index";

export const addressUtils = {
    statics: {
        async setDefaultAddress(this: AddressModelType, userId: mongoose.Types.ObjectId, addressId: mongoose.Types.ObjectId): Promise<IAddressDocument> {
            const address = await this.findOne({ _id: addressId, userId, isActive: true });

            if (!address) {
                throw new AppError("Address not found", 404);
            }

            // Unset all other default addresses for this user
            await this.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });

            // Set this address as default
            address.isDefault = true;
            await address.save();

            return address;
        },

        async getDefaultAddress(this: AddressModelType, userId: mongoose.Types.ObjectId): Promise<IAddressDocument | null> {
            return await this.findOne({ userId, isDefault: true, isActive: true });
        }
    }
};
