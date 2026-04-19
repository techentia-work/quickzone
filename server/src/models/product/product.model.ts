// product.model.ts
import mongoose from "mongoose";
import { TaxRateType, IProductDocument, IVariant, ProductEatableType, ProductModelType, ProductStatus, VariantInventoryType, VariantQuantityType, VariantStatus } from "../../lib/types/index";
import { createProductPreSave, deleteProductsByCategory, rebuildProductCategoryPaths, restoreProductsByCategory, } from "./product.utils";

const VariantSchema = new mongoose.Schema<IVariant>(
    {
        title: { type: String },
        sku: { type: String, required: true, index: true, unique: true, sparse: true },
variantType: {
  type: String,
},
        measurement: { type: Number },
        measurementUnit: { type: String },
        price: { type: Number, required: true },
        mrp: { type: Number },
        discountPercent: { type: Number, default: 0 },
        discountedPrice: { type: Number },
        stock: { type: Number, default: 0 },
        inventoryType: { type: String, enum: Object.values(VariantInventoryType), default: VariantInventoryType.LIMITED },
        status: { type: String, enum: Object.values(VariantStatus), default: VariantStatus.AVAILABLE },
        images: [{ type: String }],
    },
    { _id: true }
);

const ProductSchema = new mongoose.Schema<IProductDocument, ProductModelType>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null, },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        categoryPath: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
        description: { type: String },
        shortDescription: { type: String },
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: { type: String },
        tags: [{ type: String, index: true }],
        mainImage: { type: String },
        images: [{ type: String }],
        productType: { type: String, enum: Object.values(ProductEatableType), default: ProductEatableType.NONE },
        isReturnable: { type: Boolean, default: true },
        isCOD: { type: Boolean, default: true },
        isCancelable: { type: Boolean, default: true },
        maxQtyPerUser: { type: Number, default: 10 },
        taxRate: { type: String, enum: Object.values(TaxRateType), default: TaxRateType.GST_5 },
        variants: [VariantSchema],
        status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.APPROVED },
        isActive: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },

        manufacturer: { type: String },
        madeIn: { type: String },
        fssaiNumber: { type: String },
        barcode: { type: String, index: true },
        ratings: {
            avg: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
        popularity: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
        searchKeywords: [{ type: String }],
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
        isApproved: { type: Boolean, default: true },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
ProductSchema.index(
    { name: "text", description: "text", tags: "text", brand: "text", metaTitle: "text", metaKeywords: "text" },
    { weights: { name: 10, brand: 5, tags: 3, description: 2 } }
);
ProductSchema.index({ categoryId: 1, isActive: 1, isDeleted: 1 });
ProductSchema.index({ sellerId: 1, isActive: 1 });
ProductSchema.index({ "variants.price": 1 });
ProductSchema.index({ "variants.stock": 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ popularity: -1 });
ProductSchema.index({ searchKeywords: 1 });

// Pre-save hooks
ProductSchema.pre("save", createProductPreSave);
ProductSchema.virtual('brand', { ref: 'Brand', localField: 'brandId', foreignField: '_id', justOne: true });
ProductSchema.static("deleteProductsByCategory", deleteProductsByCategory)
ProductSchema.static("restoreProductsByCategory", restoreProductsByCategory)
ProductSchema.static("rebuildProductCategoryPaths", rebuildProductCategoryPaths)

export const Product = mongoose.model<IProductDocument, ProductModelType>("Product", ProductSchema);
