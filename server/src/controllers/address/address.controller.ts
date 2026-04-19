import { Response } from "express";
import mongoose from "mongoose";
import { Address } from "../../models/index";
import { AppError, AuthRequest, AddressLabelType } from "../../lib/types/index";

export const addressController = {
    // Create new address
    createAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const addressData = req.body;

        console.log(addressData);
        

        if (addressData.type === AddressLabelType.CUSTOM && !addressData.customLabel) {
            throw new AppError("Custom label is required for CUSTOM type addresses.", 400);
        }

        if (addressData.type !== AddressLabelType.CUSTOM) {
            const existing = await Address.findOne({ userId, type: addressData.type, isActive: true, });
            if (existing) {
                throw new AppError(`You already have a ${addressData.type.toLowerCase()} address.`, 400);
            }
        }

        const existingAddressCount = await Address.countDocuments({ userId, isActive: true });

        if (existingAddressCount === 0) {
            addressData.isDefault = true;
        }

        if (addressData.isDefault) {
            await Address.updateMany({ userId }, { $set: { isDefault: false } });
        }

        const address = new Address({ ...addressData, userId });

        await address.save();

        res.status(201).json({ success: true, message: "Address created successfully", data: { address } });
    },

    // Get all addresses for user
    getAllAddresses: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { activeOnly = "true" } = req.query;

        const query: any = { userId };
        if (activeOnly === "true") {
            query.isActive = true;
        }

        const addresses = await Address.find(query)
            .sort({ isDefault: -1, createdAt: -1 });

        res.json({ success: true, count: addresses.length, message: "Addresses fetched successfully", data: { addresses } });
    },

    // Get single address by ID
    getAddressById: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;

        const address = await Address.findOne({
            _id: addressId,
            userId,
            isActive: true
        });

        if (!address) {
            throw new AppError("Address not found", 404);
        }

        res.json({ success: true, message: "Address fetched successfully", data: { address } });
    },

    // Get default address
    getDefaultAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const address = await Address.getDefaultAddress(userId);

        if (!address) {
            throw new AppError("No default address found", 404);
        }

        res.json({ success: true, message: "Default address fetched successfully", data: { address } });
    },

    // Update address
    updateAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;
        const updateData = req.body;

        // 1️⃣ Find existing address
        const address = await Address.findOne({ _id: addressId, userId, isActive: true, });

        if (!address) {
            throw new AppError("Address not found", 404);
        }

        // 2️⃣ Validate type changes
        if (updateData.type) {
            // Ensure valid enum value
            const validTypes = Object.values(AddressLabelType);
            if (!validTypes.includes(updateData.type)) {
                throw new AppError(`Invalid address type: ${updateData.type}`, 400);
            }

            if (updateData.type === AddressLabelType.CUSTOM && !updateData.customLabel) {
                throw new AppError("customLabel is required when type is CUSTOM", 400);
            }

            if (updateData.type !== AddressLabelType.CUSTOM) {
                const existingType = await Address.findOne({ userId, type: updateData.type, isActive: true, _id: { $ne: addressId }, });

                if (existingType) {
                    throw new AppError(`You already have a ${updateData.type.toLowerCase()} address.`, 400);
                }
            }
        }

        if (updateData.isDefault && !address.isDefault) {
            await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
        }

        address.set(updateData)

        await address.save();

        res.json({ success: true, message: "Address updated successfully", data: { address }, });
    },

    // Set address as default
    setDefaultAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;

        const address = await Address.setDefaultAddress(
            userId,
            new mongoose.Types.ObjectId(addressId as string)
        );

        res.json({ success: true, message: "Default address updated successfully", data: { address } });
    },

    // Soft delete address
    deleteAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;

        const address = await Address.findOne({
            _id: addressId,
            userId,
            isActive: true
        });

        if (!address) {
            throw new AppError("Address not found", 404);
        }

        // If deleting default address, set another as default
        if (address.isDefault) {
            const nextAddress = await Address.findOne({
                userId,
                _id: { $ne: addressId },
                isActive: true
            }).sort({ createdAt: -1 });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        address.isActive = false;
        await address.save();

        res.json({ success: true, message: "Address deleted successfully" });
    },

    // Permanently delete address (hard delete)
    permanentDeleteAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;

        const address = await Address.findOne({
            _id: addressId,
            userId
        });

        if (!address) {
            throw new AppError("Address not found", 404);
        }

        // If deleting default address, set another as default
        if (address.isDefault && address.isActive) {
            const nextAddress = await Address.findOne({
                userId,
                _id: { $ne: addressId },
                isActive: true
            }).sort({ createdAt: -1 });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        await Address.deleteOne({ _id: addressId });

        res.json({ success: true, message: "Address permanently deleted" });
    },

    // Restore soft-deleted address
    restoreAddress: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { addressId } = req.params;

        const address = await Address.findOne({
            _id: addressId,
            userId,
            isActive: false
        });

        if (!address) {
            throw new AppError("Address not found or already active", 404);
        }

        address.isActive = true;
        await address.save();

        res.json({ success: true, message: "Address restored successfully", data: { address } });
    },

    // Get addresses by type
    getAddressesByType: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { type } = req.params;

        if (!Object.values(AddressLabelType).includes(type as AddressLabelType)) {
            throw new AppError("Invalid address type", 400);
        }

        const addresses = await Address.find({
            userId,
            type: type as AddressLabelType,
            isActive: true
        }).sort({ isDefault: -1, createdAt: -1 });

        res.json({ success: true, count: addresses.length, data: { addresses } });
    }
};
