import mongoose, { Document, Model } from "mongoose";

export enum TypeOfCategory {
    MASTER = "MASTER",
    SUPER = "SUPER",
    CATEGORY = "CATEGORY",
    SUBCATEGORY = "SUBCATEGORY",
    LEVEL_5 = "LEVEL_5",
    LEVEL_6 = "LEVEL_6",
    LEVEL_7 = "LEVEL_7",
}

export const typeMap: Record<number, TypeOfCategory> = {
    1: TypeOfCategory.MASTER,
    2: TypeOfCategory.SUPER,
    3: TypeOfCategory.CATEGORY,
    4: TypeOfCategory.SUBCATEGORY,
    5: TypeOfCategory.LEVEL_5,
    6: TypeOfCategory.LEVEL_6,
    7: TypeOfCategory.LEVEL_7,
};

export interface DeleteCategoryQuery {
    cascade?: boolean;
    reparent?: boolean;
    permanent?: boolean;
}

export interface ICategory {
    name: string;
    slug: string;
    subtitle?: string;
    thumbnail?: string;
    banner?: string;
    metaTitle?: string;
    metaKeywords?: string;
    metaDescription?: string;
    markup?: string;
    type: TypeOfCategory;
    parent?: mongoose.Types.ObjectId | null;
    ancestors?: mongoose.Types.ObjectId[];
    path?: string[];
    fullSlug?: string;
    level?: number;
    order: number;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document { }

export interface CategoryModelType extends Model<ICategoryDocument> {
    deleteCategory(categoryId: mongoose.Types.ObjectId, options?: DeleteCategoryQuery): Promise<void>;
    deleteCategoryBulk(): Promise<void>;
    restoreCategory(categoryId: mongoose.Types.ObjectId, passedSession?: mongoose.ClientSession): Promise<void>;
    rebuildTree(categoryId: mongoose.Types.ObjectId | null, passedSession?: mongoose.ClientSession): Promise<void>;
}