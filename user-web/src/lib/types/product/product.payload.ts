import { TaxRateType } from "../order/order.enums";
import { ProductStatus } from "./product.enums";
import { ProductBase, ProductVariantBase } from "./product.types";

// Payload Types for API requests
export type CreateProductPayload = Omit<ProductBase, "isApproved" | "isActive"> & { isApproved?: boolean; isActive?: boolean; };

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface BulkUpdateProductsPayload {
    productIds: string[];
    updateData: {
        status?: ProductStatus;
        isActive?: boolean;
        taxRate?: TaxRateType;
        isReturnable?: boolean;
        isCOD?: boolean;
        isCancelable?: boolean;
        isApproved?: boolean;
    };
}

export type CreateVariantPayload = ProductVariantBase;

export type UpdateVariantPayload = Partial<ProductVariantBase>;