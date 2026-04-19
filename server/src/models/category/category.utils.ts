import mongoose, { Types, HydratedDocument } from "mongoose";
import type {
  CategoryModelType,
  DeleteCategoryQuery,
  ICategoryDocument,
  ProductModelType,
} from "../../lib/types/index";
import { AppError, typeMap, TypeOfCategory } from "../../lib/types/index";

const getCategoryModel = (): CategoryModelType =>
  mongoose.models.Category as CategoryModelType;
const getProductModel = (): ProductModelType =>
  mongoose.models.Product as ProductModelType;

/** Helper to safely parse boolean-like values */
const parseBool = (val: unknown): boolean => {
  if (typeof val === "string") return val.toLowerCase() === "true";
  return Boolean(val);
};

export const createCategoryPreSave = async function (
  this: HydratedDocument<ICategoryDocument>
) {
  if (!this.isNew && !this.isModified("parent") && !this.isModified("slug"))
    return;

  const Category = getCategoryModel();

  if (this.parent) {
    const parentCategory = await Category.findById(this.parent).session(
      this.$session()
    );
    if (!parentCategory) throw new AppError("Parent category not found", 404);
    if (parentCategory.isDeleted)
      throw new AppError("Cannot assign to deleted parent category", 400);

    this.ancestors = [
      ...(parentCategory.ancestors || []),
      parentCategory._id,
    ] as Types.ObjectId[];
    this.path = [...(parentCategory.path || []), this.slug] as string[];
    this.fullSlug = this.path.join("/");
    this.level = (parentCategory.level || 0) + 1;
  } else {
    this.ancestors = [] as Types.ObjectId[];
    this.path = [this.slug] as string[];
    this.fullSlug = this.slug;
    this.level = 1;
  }

  if (this.isNew || this.isModified("parent")) {
    const maxOrderCategory = await Category.findOne({
      parent: this.parent,
      isDeleted: false,
      _id: { $ne: this._id },
    })
      .sort({ order: -1 })
      .session(this.$session())
      .select("order")
      .lean();

    this.order = maxOrderCategory ? (maxOrderCategory.order || 0) + 1 : 1;
  }

  if (!this.isNew) {
    const Product = getProductModel();
    await Product.rebuildProductCategoryPaths(
      this._id as Types.ObjectId,
      this.$session()
    );
  }
};

export const deleteCategory = async function (
  this: CategoryModelType,
  categoryId: Types.ObjectId,
  options: DeleteCategoryQuery = {}
): Promise<void> {
  const session = await this.startSession();
  try {
    await session.withTransaction(async () => {
      const category = await this.findById(categoryId).session(session);
      if (!category) throw new AppError("Category not found", 404);

      category.isDeleted = true;
      category.deletedAt = new Date();
      await category.save({ session });

      const children = await this.find({ parent: categoryId }).session(session);
      const ProductModel = getProductModel();

      const cascade = parseBool(options.cascade);
      const reparent = parseBool(options.reparent);
      const permanent = parseBool(options.permanent);

      if (cascade) {
        await this.updateMany(
          { ancestors: categoryId },
          { $set: { isDeleted: true, deletedAt: new Date() } },
          { session }
        );
        await ProductModel.deleteProductsByCategory(categoryId, session);
      } else if (reparent && category.parent) {
        await this.updateMany(
          { parent: categoryId },
          { $set: { parent: category.parent } },
          { session }
        );
        await this.rebuildTree(category.parent, session);
      } else if (reparent && !category.parent) {
        throw new AppError("Can't reparent a MASTER Category", 400);
      } else if (permanent) {
        await this.deleteMany(
          {
            $or: [{ _id: categoryId }, { ancestors: { $in: [categoryId] } }],
          },
          { session }
        );
        await ProductModel.deleteMany({ categoryPath: categoryId }, { session });
      } else if (children.length > 0) {
        throw new AppError(
          "Category has children. Use cascade:true or reparent:true to handle them.",
          400
        );
      }
    });
  } finally {
    session.endSession();
  }
};

export const deleteCategoryBulk = async function (this: CategoryModelType) {
  const session = await this.startSession();
  try {
    await session.withTransaction(async () => {
      const Category = getCategoryModel();
      const ProductModel = getProductModel();

      // Hard delete all products
      await ProductModel.deleteMany({}, { session });

      // Hard delete all categories
      await Category.deleteMany({}, { session });
    });
  } finally {
    session.endSession();
  }
};

export const restoreCategory = async function (
  this: CategoryModelType,
  catId: Types.ObjectId,
  passedSession?: mongoose.ClientSession
): Promise<ICategoryDocument> {
  const session = passedSession ?? (await this.startSession());
  try {
    return await session.withTransaction(async () => {
      const category = await this.findById(catId).session(session);
      if (!category) throw new AppError("Category not found", 404);
      if (!category.isDeleted)
        throw new AppError("Category is not deleted", 400);

      if (category.parent) {
        const parent = await this.findById(category.parent).session(session);
        if (!parent)
          throw new AppError(
            "Parent Category not found or is not deleted",
            400
          );
      }

      // Restore the category
      category.isDeleted = false;
      category.deletedAt = null;
      await category.save({ session });

      // Rebuild category tree from this node
      await this.rebuildTree(category._id as Types.ObjectId, session);

      // Restore products under this category
      const Product = getProductModel();
      await Product.restoreProductsByCategory(
        category._id as Types.ObjectId,
        session
      );

      return category;
    });
  } finally {
    if (!passedSession) session.endSession();
  }
};

export const rebuildTree = async function (
  this: CategoryModelType,
  categoryId: Types.ObjectId | null,
  passedSession?: mongoose.ClientSession
): Promise<void> {
  const session = passedSession ?? (await this.startSession());
  try {
    await session.withTransaction(async () => {
      const rebuild = async (catId: Types.ObjectId | null) => {
        if (!catId) {
          const roots = await this.find({
            parent: null,
            isDeleted: false,
          }).session(session);
          for (const root of roots) {
            await rebuild(root._id as Types.ObjectId);
          }
          return;
        }

        const category = await this.findById(catId).session(session);
        if (!category) throw new AppError("Category not found", 404);

        const parent = category.parent
          ? await this.findById(category.parent).lean().session(session)
          : null;

        if (parent) {
          category.ancestors = [
            ...(parent.ancestors || []),
            parent._id as Types.ObjectId,
          ];
          category.path = [...(parent.path || []), category.slug];
          category.fullSlug = `${parent.fullSlug}/${category.slug}`;
          category.level = (parent.level || 0) + 1;
        } else {
          category.ancestors = [];
          category.path = [category.slug];
          category.fullSlug = category.slug;
          category.level = 1;
        }
                if (parent) {
                    category.ancestors = [...(parent.ancestors || []), parent._id as Types.ObjectId];
                    category.path = [...(parent.path || []), category.slug];
                    category.fullSlug = `${parent.fullSlug}/${category.slug}`;
                    category.level = (parent.level || 0) + 1;
                } else {
                    category.ancestors = [];
                    category.path = [category.slug];
                    category.fullSlug = category.slug;
                    category.level = 1;
                }

                // Auto-assign type based on level                
                category.type = typeMap[category.level] || TypeOfCategory.LEVEL_7;

        await category.save({ session });

        const Product = getProductModel();
        await Product.rebuildProductCategoryPaths(
          category._id as Types.ObjectId,
          session
        );

        const children = await this.find({
          parent: category._id,
          isDeleted: false,
        })
          .lean()
          .session(session);

        for (const child of children) {
          if (!child._id) continue;
          await rebuild(child._id as Types.ObjectId);
        }
      };

      await rebuild(categoryId);
    });
  } finally {
    if (!passedSession) {
      session.endSession();
    }
  }
};
