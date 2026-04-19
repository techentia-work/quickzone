import mongoose from "mongoose";
import { ICategoryDocument, CategoryModelType, TypeOfCategory } from "../../lib/types/index";
import { createCategoryPreSave, deleteCategory, deleteCategoryBulk, rebuildTree, restoreCategory } from "./category.utils";

const CategorySchema = new mongoose.Schema<ICategoryDocument, CategoryModelType>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        subtitle: { type: String },
        thumbnail: { type: String },
        banner: { type: String },
        metaTitle: { type: String },
        metaKeywords: { type: String },
        metaDescription: { type: String },
        markup: { type: String },
        type: { type: String, enum: Object.values(TypeOfCategory), default: TypeOfCategory.CATEGORY, },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
        ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
        path: [{ type: String }],
        fullSlug: { type: String },
        level: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

CategorySchema.index({ parent: 1, order: 1 });
CategorySchema.index({ type: 1 });
CategorySchema.index({ slug: 1 }, { unique: true, collation: { locale: "en", strength: 2 }, partialFilterExpression: { isDeleted: false } });
CategorySchema.index({ name: "text", metaTitle: "text", metaKeywords: "text" });
CategorySchema.index({ parent: 1, slug: 1 }, { unique: true });
CategorySchema.index({ ancestors: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ fullSlug: 1 }, { unique: true, sparse: true });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isDeleted: 1, isActive: 1, type: 1 });

CategorySchema.pre("save", createCategoryPreSave);

CategorySchema.static('deleteCategory', deleteCategory);
CategorySchema.static('restoreCategory', restoreCategory)

CategorySchema.static('rebuildTree', rebuildTree);

CategorySchema.static('deleteCategoryBulk', deleteCategoryBulk)

export const Category = mongoose.model<ICategoryDocument, CategoryModelType>("Category", CategorySchema);
