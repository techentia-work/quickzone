import { NextFunction, Response } from "express";
import { AppError, AuthRequest } from "../../lib/types/index";
import mongoose from "mongoose";
import { ShowcaseProduct } from "../../models/showCaseProducts/showCaseProducts.model";
import { Product, Category } from "../../models/index";

export const showcaseProductController = {
  // =========================
  // CREATE SHOWCASE PRODUCT
  // =========================
  async createShowcaseProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        showcaseType,
        masterCategoryId,
        subCategoryIds,
        productIds,
        displayOrder = 0,
      } = req.body;

      if (!showcaseType)
        throw new AppError("Showcase type is required", 400);

      if (!mongoose.isValidObjectId(masterCategoryId))
        throw new AppError("Invalid master category ID", 400);

      if (!Array.isArray(subCategoryIds) || subCategoryIds.length === 0)
        throw new AppError("Sub categories are required", 400);

      if (!Array.isArray(productIds) || productIds.length === 0)
        throw new AppError("Product IDs are required", 400);

      // validate master category
      const masterCategoryExists = await Category.exists({
        _id: masterCategoryId,
        isDeleted: false,
      });
      if (!masterCategoryExists)
        throw new AppError("Invalid master category ID", 400);

      // validate sub categories
      const subCount = await Category.countDocuments({
        _id: { $in: subCategoryIds },
        isDeleted: false,
      });
      if (subCount !== subCategoryIds.length)
        throw new AppError("Invalid sub category IDs", 400);

      // validate products
      const productCount = await Product.countDocuments({
        _id: { $in: productIds },
        isDeleted: false,
      });
      if (productCount !== productIds.length)
        throw new AppError("Invalid product IDs", 400);

      const showcase = await ShowcaseProduct.create({
        showcaseType,
        masterCategory: masterCategoryId,
        subCategories: subCategoryIds,
        products: productIds,
        displayOrder,
      });

      // ✅ FIX 1: Add variants populate
      const populated = await ShowcaseProduct.findById(showcase._id)
        .populate({
          path: "products",
          select: "name slug mainImage thumbnail images variants masterCategoryId categoryId",
          populate: {
            path: "variants",
            select: "_id price mrp discountedPrice weight unit stock isActive",
          },
        })
        .populate("subCategories", "name slug")
        .populate("masterCategory", "name slug");

      res.status(201).json({
        success: true,
        message: "Showcase created successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================
  // GET SHOWCASE PRODUCTS (PAGINATED)
  // =========================
  async getShowcaseProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.max(Number(req.query.limit) || 10, 1);
      const skip = (page - 1) * limit;

      const filter = { isDeleted: false };

      const [total, showcases] = await Promise.all([
        ShowcaseProduct.countDocuments(filter),
        ShowcaseProduct.find(filter)
          .sort({ displayOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          // ✅ FIX 2: Add variants populate
          .populate({
            path: "products",
            select: "name slug mainImage thumbnail images variants masterCategoryId categoryId",
            populate: {
              path: "variants",
              select: "_id price mrp discountedPrice weight unit stock isActive",
            },
          })
          .populate("subCategories", "name slug")
          .populate("masterCategory", "name slug")
          .lean(),
      ]);

      res.json({
        success: true,
        message: "Showcases fetched successfully",
        data: {
          showcases,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================
  // GET SHOWCASE BY ID OR TYPE
  // =========================
  async getShowcaseProductById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { showcaseType: id };

      // ✅ FIX 3: Add variants populate
      const showcase = await ShowcaseProduct.findOne({
        ...query,
        isDeleted: false,
      })
        .populate({
          path: "products",
          select: "name slug mainImage thumbnail images variants masterCategoryId categoryId",
          populate: {
            path: "variants",
            select: "_id price mrp discountedPrice weight unit stock isActive",
          },
        })
        .populate("subCategories", "name slug")
        .populate("masterCategory", "name slug");

      if (!showcase)
        throw new AppError("Showcase not found", 404);

      res.json({
        success: true,
        message: "Showcase fetched successfully",
        data: showcase,
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================
  // UPDATE SHOWCASE PRODUCT
  // =========================
  async updateShowcaseProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const {
        showcaseType,
        masterCategoryId,
        subCategoryIds,
        productIds,
        addProductIds,
        removeProductIds,
        isActive,
        displayOrder,
      } = req.body;

      const showcase = await ShowcaseProduct.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!showcase)
        throw new AppError("Showcase not found", 404);

      if (showcaseType) showcase.showcaseType = showcaseType;
      if (typeof isActive === "boolean") showcase.isActive = isActive;

      // replace sub categories
      if (Array.isArray(subCategoryIds)) {
        showcase.subCategories = subCategoryIds;
      }

      // replace products
      if (Array.isArray(productIds)) {
        showcase.products = productIds;
      }

      // add products
      if (Array.isArray(addProductIds)) {
        showcase.products = Array.from(
          new Set([...showcase.products, ...addProductIds])
        );
      }

      // remove products
      if (Array.isArray(removeProductIds)) {
        showcase.products = showcase.products.filter(
          (pid) => !removeProductIds.includes(pid.toString())
        );
      }

      // update master category
      if (masterCategoryId) {
        const exists = await Category.exists({
          _id: masterCategoryId,
          isDeleted: false,
        });
        if (!exists)
          throw new AppError("Invalid master category ID", 400);

        showcase.masterCategory = masterCategoryId;
      }

      await showcase.save();

      // ✅ FIX 4: Add variants populate
      const populated = await ShowcaseProduct.findById(showcase._id)
        .populate({
          path: "products",
          select: "name slug mainImage thumbnail images variants masterCategoryId categoryId",
          populate: {
            path: "variants",
            select: "_id price mrp discountedPrice weight unit stock isActive",
          },
        })
        .populate("subCategories", "name slug")
        .populate("masterCategory", "name slug");

      res.json({
        success: true,
        message: "Showcase updated successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================
  // DELETE SHOWCASE PRODUCT (PERMANENT)
  // =========================
  async deleteShowcaseProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid showcase ID", 400);
      }

      const deleted = await ShowcaseProduct.findByIdAndDelete(id);

      if (!deleted) {
        throw new AppError("Showcase not found", 404);
      }

      res.json({
        success: true,
        message: "Showcase permanently deleted",
        data: { id },
      });
    } catch (err) {
      next(err);
    }
  }
};
