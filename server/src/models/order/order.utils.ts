import mongoose from "mongoose";
import { IOrderItem, OrderModelType, ProductModelType, VariantStatus } from "../../lib/types/index";
import { AppError } from "../../lib/types/index";
import { Types } from "mongoose";

const getProductModel = (): ProductModelType => mongoose.models.Product as ProductModelType;

export const orderUtils = {
    statics: {
        async generateOrderNumber(this: OrderModelType): Promise<string> {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            // Find the last order number for today
            const prefix = `ORD${year}${month}${day}`;
            const lastOrder = await this.findOne({
                orderNumber: new RegExp(`^${prefix}`)
            }).sort({ orderNumber: -1 }).lean();

            let sequence = 1;
            if (lastOrder && lastOrder.orderNumber) {
                const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
                if (!isNaN(lastSequence)) {
                    sequence = lastSequence + 1;
                }
            }

            return `${prefix}${sequence.toString().padStart(4, '0')}`;
        },

        async validateStockAvailability(this: OrderModelType, items: IOrderItem[]): Promise<void> {
            if (!items || items.length === 0) {
                throw new AppError("No items to validate", 400);
            }

            for (const item of items) {
                const Product = getProductModel();
                const product = await Product.findById(item.productId);

                if (!product) {
                    throw new AppError(`Product ${item.productName} not found`, 404);
                }

                if (!product.isActive || product.isDeleted) {
                    throw new AppError(`Product ${item.productName} is not available`, 400);
                }

                if (product.isApproved && !product.isApproved) {
                    throw new AppError(`Product ${item.productName} is not approved for sale`, 400);
                }

                const variant = product.variants.find((v) => (v._id as Types.ObjectId).equals(item.variantId));
                if (!variant) {
                    throw new AppError(`Variant not found for ${item.productName}`, 404);
                }

                if (variant.status !== "AVAILABLE") {
                    throw new AppError(`${item.productName} variant is not available`, 400);
                }

                // Check stock for finite inventory
                if (variant.inventoryType === "LIMITED") {
                    if (variant.stock === undefined || variant.stock === null) {
                        throw new AppError(`Stock information not available for ${item.productName}`, 400);
                    }

                    if (variant.stock < item.quantity) {
                        throw new AppError(
                            `Insufficient stock for ${item.productName}. Only ${variant.stock} unit(s) available`,
                            400
                        );
                    }
                }

                // Check max quantity per user
                if (product.maxQtyPerUser && item.quantity > product.maxQtyPerUser) {
                    throw new AppError(
                        `Maximum ${product.maxQtyPerUser} unit(s) allowed per order for ${item.productName}`,
                        400
                    );
                }
            }
        },

        async reduceStock(this: OrderModelType, items: IOrderItem[], session?: mongoose.ClientSession): Promise<void> {
            if (!items || items.length === 0) return;
            const Product = getProductModel();

            for (const item of items) {
                const product = await Product.findById(item.productId).session(session || null);

                if (!product) {
                    throw new AppError(`Product ${item.productId} not found during stock reduction`);
                }

                const variant = product.variants.find((v) => (v._id as Types.ObjectId).equals(item.variantId));
                if (!variant) {
                    throw new AppError(`Variant ${item.variantId} not found during stock reduction`);
                }

                if (variant.inventoryType === "LIMITED" && variant.stock !== undefined) {
                    const newStock = variant.stock - item.quantity;
                    variant.stock = Math.max(0, newStock);

                    // Mark as out of stock if needed
                    if (variant.stock === 0) {
                        variant.status = VariantStatus.SOLD_OUT;
                    }

                    await product.save({ session });
                }
            }
        },

        async restoreStock(this: OrderModelType, items: IOrderItem[], session?: mongoose.ClientSession): Promise<void> {
            if (!items || items.length === 0) return;

            for (const item of items) {
                const Product = getProductModel();
                const product = await Product.findById(item.productId).session(session || null);

                if (!product) {
                    throw new AppError(`Product ${item.productId} not found during stock restoration`);
                }

                const variant = product.variants.find((v) => (v._id as Types.ObjectId).equals(item.variantId));
                if (!variant) {
                    throw new AppError(`Variant ${item.variantId} not found during stock restoration`);
                }

                if (variant.inventoryType === "LIMITED" && variant.stock !== undefined) {
                    variant.stock += item.quantity;

                    // Reactivate if it was out of stock
                    if (variant.status === "SOLD_OUT" && variant.stock > 0) {
                        variant.status = VariantStatus.AVAILABLE;
                    }

                    await product.save({ session });
                }
            }
        }
    }
};
