// product.utils.ts
import mongoose, { Types, HydratedDocument } from "mongoose";
import type {
  IProduct,
  IVariant,
  CategoryModelType,
  ProductModelType,
  ICategoryDocument,
} from "../../lib/types/index";
import {
  AppError,
  ICategory,
  VariantInventoryType,
  VariantStatus,
} from "../../lib/types/index";

const getCategoryModel = (): CategoryModelType =>
  mongoose.models.Category as CategoryModelType;

export const createProductPreSave = async function (
  this: HydratedDocument<IProduct>
) {
  if (this.isModified("name") && this.slug === "") {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  if (this.isModified("categoryId") && this.categoryId) {
    const Category = getCategoryModel();
    const category = await Category.findById(this.categoryId);
    if (!category) throw new AppError("Category not found", 400);
    if (category.isDeleted)
      throw new AppError("Cannot assign product to deleted category", 400);

    this.categoryPath = category.ancestors
      ? [...category.ancestors, category._id as Types.ObjectId]
      : [category._id as Types.ObjectId];
  }

  if (this.isNew || this.isModified("variants")) {
    let hasAvailableVariant = false;
    this.variants.forEach((variant: IVariant) => {
      if (
        variant.isModified?.("price") ||
        variant.isModified?.("discountPercent")
      ) {
        if (variant.discountPercent && variant.price) {
          variant.discountedPrice = +(
            variant.price *
            (1 - variant.discountPercent / 100)
          ).toFixed(2);
        } else {
          variant.discountedPrice = variant.price;
        }
      }

      if (
        variant.isModified?.("stock") ||
        variant.isModified?.("inventoryType")
      ) {
        if (
          variant.inventoryType === VariantInventoryType.LIMITED &&
          (!variant.stock || variant.stock <= 0)
        ) {
          variant.status = VariantStatus.SOLD_OUT;
        } else {
          variant.status = VariantStatus.AVAILABLE;
        }
      }

      if (variant.status === VariantStatus.AVAILABLE)
        hasAvailableVariant = true;
    });

    this.isActive = hasAvailableVariant && !this.isDeleted;
  }
};

export const rebuildProductCategoryPaths = async function (
  this: ProductModelType,
  categoryId: Types.ObjectId,
  passedSession?: mongoose.ClientSession | null
): Promise<void> {
  const session = passedSession ?? (await mongoose.startSession());
  try {
    const Category = getCategoryModel();
    const category = await Category.findById(categoryId)
      .session(session)
      .lean<ICategory>();

    if (!category) throw new AppError(categoryId + " Category not found", 404);
    if (category.isDeleted) {
      return; // If category is deleted, products should already be soft-deleted
    }

    const products = await this.find({ categoryId }).session(session).lean();

    const categoryPath = category.ancestors
      ? ([...category.ancestors, categoryId] as Types.ObjectId[])
      : ([categoryId] as Types.ObjectId[]);

    for (const product of products) {
      product.categoryPath = categoryPath;
      await product.save({ session });
    }
  } finally {
    if (!passedSession) session.endSession();
  }
};

export const deleteProductsByCategory = async function (
  this: ProductModelType,
  categoryId: Types.ObjectId,
  passedSession?: mongoose.ClientSession | null
): Promise<void> {
  const session = passedSession ?? (await mongoose.startSession());

  try {
    if (passedSession) {
      // ✅ Reuse the existing transaction/session
      await this.updateMany(
        { categoryPath: { $in: [categoryId] }, isDeleted: false },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false,
          },
        },
        { session }
      );
    } else {
      // ✅ Only start a new transaction if one doesn’t already exist
      await session.withTransaction(async () => {
        await this.updateMany(
          { categoryPath: { $in: [categoryId] }, isDeleted: false },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
              isActive: false,
            },
          },
          { session }
        );
      });
    }
  } finally {
    if (!passedSession) await session.endSession();
  }
};

export const restoreProductsByCategory = async function (
  this: ProductModelType,
  categoryId: Types.ObjectId,
  passedSession?: mongoose.ClientSession | null
): Promise<void> {
  const session = passedSession ?? (await mongoose.startSession());
  try {
    await session.withTransaction(async () => {
      const Category = getCategoryModel();

      const category = await Category.findById(categoryId)
        .session(session)
        .lean();
      if (!category) throw new AppError("Category not found", 404);
      if (category.isDeleted)
        throw new AppError("Cannot restore products for deleted category", 400);

      await this.updateMany(
        { categoryId: categoryId, isDeleted: true },
        { $set: { isDeleted: false, deletedAt: null } },
        { session }
      );

      const products = await this.find({
        categoryId: categoryId,
        isDeleted: false,
      }).session(session);

      for (const product of products) {
        const hasAvailableVariant = product.variants.some(
          (v: IVariant) => v.status === VariantStatus.AVAILABLE
        );
        if (product.isActive !== hasAvailableVariant) {
          product.isActive = hasAvailableVariant;
          await product.save({ session });
        }
      }
    });
  } finally {
    if (!passedSession) session.endSession();
  }
};
