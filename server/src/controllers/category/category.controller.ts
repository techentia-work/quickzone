import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import {
  AppError,
  AuthRequest,
  TypeOfCategory,
  ICategoryDocument,
  DeleteCategoryQuery,
} from "../../lib/types/index";
import { Category, Product } from "../../models/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";
import { sendPushNotification } from "../../lib/fcm";

export const categoryController = {
  // ---------------- CREATE CATEGORY ----------------
  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    const categoryData = req.body;
    const userId = req.user?._id;

    const existing = await Category.findOne({
      slug: categoryData.slug,
      isDeleted: false,
    }).collation({ locale: "en", strength: 2 });

    if (existing)
      throw new AppError("Category with this slug already exists", 409);

    let parentCategory = null;
    if (categoryData.parent) {
      parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory || parentCategory.isDeleted)
        throw new AppError("Parent category not found", 404);

      if (parentCategory.level && parentCategory.level >= 7)
        throw new AppError("Maximum category depth reached (7 levels)", 400);

      if (
        parentCategory.ancestors?.includes(
          new Types.ObjectId(categoryData.parent)
        )
      )
        throw new AppError("Cannot create circular category hierarchy", 400);
    }

    // Determine order
    const last = await Category.findOne(
      { parent: categoryData.parent || null, isDeleted: false },
      {},
      { sort: { order: -1 } }
    );
    const order = last ? last.order + 1 : 1;

    const category = await Category.create({
      ...categoryData,
      order,
      createdBy: userId,
      updatedBy: userId,
    });

    const populated = await Category.findById(category._id)
      .populate("parent", "name slug type fullSlug")
      .populate("ancestors", "name slug type");

    res
      .status(201)
      .json({
        success: true,
        message: "Category created successfully",
        data: populated,
      });
  },

  async getCategoriesForAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    const categories = await Category.find().sort({ order: 1 }).lean();
    res.status(200).json({ success: true, data: { categories } });
  },

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    const query = req.query;
    const { filter, pagination, sort } =
      helperServerUtils.buildQuery<ICategoryDocument>(
        query,
        ["type", "parent", "level", "isActive", "isDeleted", "order"],
        "order",
        ["name", "slug", "metaTitle", "metaKeywords"]
      );

    if (query.parent === "null") filter.parent = null;
    if (typeof query === "object" && !("isDeleted" in query))
      filter.isDeleted = false;

    const [categories, totalCount] = await Promise.all([
      Category.find(filter)
        .populate("parent", "name slug type fullSlug level")
        .populate("ancestors", "name slug type fullSlug level")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Category.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          ...pagination,
          totalCount,
          totalPages: Math.ceil(totalCount / pagination.limit),
        },
      },
    });
  },

  // ---------------- GET CATEGORY BY ID ----------------
  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id)
        .populate("parent", "name slug type fullSlug level")
        .populate("ancestors", "name slug type fullSlug");

      if (!category || category.isDeleted)
        throw new AppError("Category not found", 404);

      const childrenCount = await Category.countDocuments({
        parent: category._id,
        isDeleted: false,
      });

      const siblings = await Category.find({
        parent: category.parent,
        _id: { $ne: category._id },
        isDeleted: false,
      })
        .select("name slug type order")
        .sort({ order: 1 });

      res
        .status(200)
        .json({
          success: true,
          data: { ...category.toObject(), childrenCount, siblings },
        });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await Category.findOne({ slug })
        .populate("parent", "name slug type fullSlug level")
        .populate("ancestors", "name slug type fullSlug");

      if (!category || category.isDeleted)
        throw new AppError("Category not found", 404);

      // const childrenCount = await Category.countDocuments({
      //   parent: category._id,
      //   isDeleted: false,
      // });

      const children = await Category.find({
        parent: category,
        _id: { $ne: category._id },
        isDeleted: false,
      })
        .populate("parent", "name slug type fullSlug level")
        .populate("ancestors", "name slug type fullSlug")
        .sort({ order: 1 });

      res
        .status(200)
        .json({
          success: true,
          data: { ...category.toObject(), children },
        });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- UPDATE CATEGORY ----------------
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?._id;

    const existing = await Category.findById(id);
    if (!existing || existing.isDeleted)
      throw new AppError("Category not found", 404);

    if (updateData.type === TypeOfCategory.MASTER) {
      updateData.parent = null;
    }

    const slugChanged = updateData.slug && updateData.slug !== existing.slug;
    const parentChanged =
      updateData.parent !== undefined &&
      updateData.parent !== existing.parent?.toString();

    // Slug uniqueness
    if (slugChanged) {
      const slugExists = await Category.findOne({
        slug: updateData.slug,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (slugExists)
        throw new AppError("Category with this slug already exists", 409);
    }

    // Parent change validation
    if (parentChanged) {
      if (updateData.parent) {
        const newParent = await Category.findById(updateData.parent);
        if (!newParent || newParent.isDeleted)
          throw new AppError("Parent category not found", 404);

        if (
          newParent.ancestors?.some((a: Types.ObjectId) => a.toString() === id)
        )
          throw new AppError("Cannot create circular category hierarchy", 400);

        if (updateData.parent === id)
          throw new AppError("Category cannot be its own parent", 400);
      }
    }

    const { type, ...sanitizedUpdateData } = updateData;

    const updated = await Category.findByIdAndUpdate(
      id,
      { ...sanitizedUpdateData, updatedBy: userId },
      { new: true, runValidators: true }
    )
      .populate("parent", "name slug type fullSlug")
      .populate("ancestors", "name slug type fullSlug");

    if (!updated) throw new AppError("Failed to update category", 500);

    if (slugChanged || parentChanged)
      await Category.rebuildTree(updated._id as Types.ObjectId);

    // Refetch to get the updated type
    const finalCategory = await Category.findById(id)
      .populate("parent", "name slug type fullSlug")
      .populate("ancestors", "name slug type fullSlug");

    res
      .status(200)
      .json({
        success: true,
        message: "Category updated successfully",
        data: finalCategory,
      });
     

  },

  // ---------------- DELETE CATEGORY (fixed) ----------------
  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const options = req.query as DeleteCategoryQuery;

      // ✅ helper to parse string/boolean safely
      const parseBool = (val: unknown): boolean => {
        if (typeof val === "string") return val.toLowerCase() === "true";
        return Boolean(val);
      };

      await Category.deleteCategory(new Types.ObjectId(id as string), {
        cascade: parseBool(options.cascade),
        reparent: parseBool(options.reparent),
        permanent: parseBool(options.permanent),
      });

      res.status(200).json({
        success: true,
        message: parseBool(options.cascade)
          ? "Category and subcategories deleted successfully"
          : "Category deleted successfully",
        data: { id, deletedAt: new Date() },
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- BULK DELETE ----------------
  async deleteCategoryBulk(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await Category.deleteCategoryBulk();
    res
      .status(200)
      .json({ success: true, message: "Categories deleted successfully" });
  },

  // ---------------- RESTORE CATEGORY ----------------
  async restoreCategory(req: AuthRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const restored = await Category.restoreCategory(new Types.ObjectId(id as string));
    res
      .status(200)
      .json({
        success: true,
        message: "Category restored successfully",
        data: restored,
      });
  },

  // ---------------- REBUILD TREE ----------------
  async rebuildTree(req: AuthRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    if (id !== "all") {
      const category = await Category.findById(id);
      if (!category) throw new AppError("Category not found", 404);
    }

    const categoryId = id === "all" ? null : new Types.ObjectId(id as string);
    await Category.rebuildTree(categoryId);

    res
      .status(200)
      .json({
        success: true,
        message:
          id === "all"
            ? "Entire category tree rebuilt successfully"
            : "Category tree rebuilt successfully",
      });
  },

  async getCategoryTree(req: AuthRequest, res: Response, next: NextFunction) {
    const query = req.query as {
      type?: TypeOfCategory;
      includeDeleted?: boolean;
      maxDepth?: number;
    };

    if (!query.type) query.type = TypeOfCategory.MASTER;

    const baseFilter: any = {};
    if (!query.includeDeleted) baseFilter.isDeleted = false;
    if (query.maxDepth !== undefined)
      baseFilter.level = { $lte: query.maxDepth };

    const roots = await Category.find({ ...baseFilter, type: query.type })
      .populate("parent", "name slug type fullSlug level")
      .populate("ancestors", "name slug type fullSlug level")
      .sort({ order: 1 })
      .lean();

    if (roots.length === 0) {
      res
        .status(200)
        .json({
          success: true,
          data: [],
          meta: { message: `No ${query.type} categories found.` },
        });
      return;
    }

    const rootIds = roots.map((r) => r._id);
    const descendants = await Category.find({ ...baseFilter, ancestors: { $in: rootIds }, })
      .populate("parent", "name slug type fullSlug level")
      .populate("ancestors", "name slug type fullSlug level")
      .sort({ level: 1, order: 1 })
      .lean();

    const categoryMap = new Map<string, any>();
    [...roots, ...descendants].forEach((c) =>
      categoryMap.set(c._id.toString(), { ...c, children: [] })
    );

    const tree: any[] = [];
    roots.forEach((r) => {
      const node = categoryMap.get(String(r._id));
      if (node) tree.push(node);
    });

    descendants.forEach((c) => {
      const node = categoryMap.get(c._id.toString());
      if (c.parent) {
        const parent = categoryMap.get(c.parent._id.toString());
        if (parent) parent.children.push(node);
      }
    });

    res.status(200).json({
      success: true,
      data: tree,
      meta: {
        totalRoots: roots.length,
        totalDescendants: descendants.length,
        totalCategories: roots.length + descendants.length,
        type: query.type,
      },
    });
  },

  async getCategoriesForDisplay(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { masterId } = req.query;

    // Base filter: Get CATEGORY level (level 3) only
    const filter: any = {
      type: TypeOfCategory.CATEGORY,
      isActive: true,
      isDeleted: false,
    };

    // Filter by master category if provided
    if (masterId) {
      filter.ancestors = new Types.ObjectId(masterId as string);
    }

    // Fetch categories with their subcategories
    const categories = await Category.find(filter)
      .populate("parent", "name slug type fullSlug level")
      .populate("ancestors", "name slug type fullSlug level")
      .sort({ order: 1 })
      .lean();

    // Get all subcategories for these categories in one query
    const categoryIds = categories.map((c) => c._id);
    const subcategories = await Category.find({
      type: TypeOfCategory.SUBCATEGORY,
      parent: { $in: categoryIds },
      isActive: true,
      isDeleted: false,
    })
      .select("_id name slug parent")
      .sort({ order: 1 })
      .lean();

    // Group subcategories by parent
    const subcategoriesMap = new Map<string, any[]>();
    subcategories.forEach((sub) => {
      if (!sub.parent) return;
      const parentId = sub?.parent?.toString();
      if (!subcategoriesMap.has(parentId)) {
        subcategoriesMap.set(parentId, []);
      }
      subcategoriesMap.get(parentId)!.push({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
      });
    });

    // Build response with flattened structure
    let displayCategories = categories.map((category) => {
      const masterCategory = category.ancestors?.find((a: any) => a.type === TypeOfCategory.MASTER);

      return {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        fullSlug: category.fullSlug,
        thumbnail: category.thumbnail,
        subtitle: category.subtitle,
        level: category.level,
        order: category.order,
        masterId: masterCategory?._id,
        subcategories: subcategoriesMap.get(category._id.toString()) || [],
        subcategoryIds: (subcategoriesMap.get(category._id.toString()) || []).map(
          (s) => s._id
        ),
      };
    });
    
    const allSubcategoryIds = displayCategories.flatMap((cat) => cat.subcategoryIds);

    const productCounts = await Product.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
          categoryId: { $in: allSubcategoryIds },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((pc) =>
      countMap.set(pc._id.toString(), pc.count)
    );

    // 🔥 Filter out categories with 0 total products
    displayCategories = displayCategories.filter((cat) => {
      const hasProducts = cat.subcategoryIds.some((subId: any) =>
        countMap.has(subId.toString())
      );
      return hasProducts;
    });

    res.status(200).json({
      success: true,
      message: "Display Categories are fetched successfully",
      data: {
        categories: displayCategories,
        meta: {
          count: displayCategories.length,
          masterId: masterId || null,
        },
      },
    });
  },
};
