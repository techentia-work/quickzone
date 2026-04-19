// productController.ts
import { NextFunction, Response } from "express";
import {
  AppError,
  AuthRequest,
  IProductDocument,
} from "../../lib/types/index";
import { Brand, Category, Product, Seller } from "../../models/index";
import mongoose, { Types } from "mongoose";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";

export const productController = {
  async createProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const productData = req.body;
    const userId = req.user?._id;

    // Check if product with same slug exists
    const existingProduct = await Product.findOne({
      slug: productData.slug,
      isDeleted: false,
    });

    if (existingProduct) {
      throw new AppError("Product with this slug already exists", 409);
    }

    // Validate category exists
    const category = await Category.findById(productData.categoryId);
    if (!category || category.isDeleted) {
      throw new AppError("Category not found", 404);
    }

    // If sellerId is provided, validate seller exists
    if (productData.sellerId) {
      const seller = await Seller.findById(productData.sellerId);
      if (!seller || seller.isDeleted) {
        throw new AppError("Seller not found", 404);
      }
    }
    if (productData.brandId) {
      const brand = await Brand.findById(productData.brandId);
      if (!brand) {
        throw new AppError("Brand not found", 404);
      }
      if (!brand.isActive) {
        throw new AppError("Brand is not active", 404);
      }
    }

    // Validate unique SKUs in variants
    if (productData.variants && productData.variants.length > 0) {
      const skus = productData.variants.map((v: any) => v.sku);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        throw new AppError("Duplicate SKUs found in variants", 400);
      }

      // Check if any SKU already exists in database
      const existingSku = await Product.findOne({
        "variants.sku": { $in: skus },
        isDeleted: false,
      });
      if (existingSku) {
        throw new AppError("One or more SKUs already exist", 409);
      }

      productData.variants = productData.variants.map((variant: any) => {
        if (variant.stock != null) {
          variant.inventoryType = "LIMITED";
        } else {
          variant.inventoryType = "UNLIMITED";
        }

        return variant;
      });
    }

    const product = await Product.create({
      ...productData,
      createdBy: userId,
      updatedBy: userId,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("categoryId", "name slug type")
      .populate("categoryPath", "name fullSlug type")
      .populate("brandId", "name slug banner thumbnail")

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populatedProduct,
    });
  },

  async getProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryParams = req.query;

      // Use helper to build filters dynamically
      const { filter, pagination, sort } =
        helperServerUtils.buildQuery<IProductDocument>(
          queryParams,
          ["categoryId", "categoryId.type", "sellerId", "status", "isActive", "isDeleted", "brandId", "productType", "tags", "name", "popularity", "featured", "createdAt", "updatedAt", "variants.price", "variants.stock", "variants.inventoryType", "variants.variantType"],
          "createdAt",
          ["name", "slug", "description", "shortDescription", "metaTitle", "metaKeywords", "variants.sku", "variants.barcode"]
        );

      // Handle stock filtering separately (if inStock param is present)
      if (queryParams.inStock === "true") {
        filter.$or = [
          { "variants.inventoryType": "UNLIMITED" },
          { "variants.stock": { $gt: 0 } },
        ];
      }

      // Pagination calculations
      const skip = pagination.skip;
      const limit = pagination.limit;

      // Execute query with population
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate("categoryId", "name slug type")
          .populate("categoryPath", "name fullSlug type")
          .populate("brandId", "name slug banner thumbnail")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: {
          products,
          pagination: {
            currentPage: pagination.page,
            totalPages,
            totalCount: total,
            limit: limit,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1,
          },
        },
      });
    } catch (err: any) {
      console.error("Error fetching products:", err);
      next(err);
    }
  },

  async getProductById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = req.params.id;

    console.log("Id..", id);

    if (!id || !mongoose.isValidObjectId(id))
      throw new AppError("Product Id not found/valid", 404);

    const product = await Product.findById(id)
      .populate("categoryId", "name slug type fullSlug ancestors")
      .populate("categoryPath", "name fullSlug type")
      .populate("brandId", "name slug banner thumbnail")

    console.log(product, id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  },

  async getProductBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const product = await Product.findOne({
      slug: req.params.id,
      isDeleted: false,
    })
      .populate("categoryId", "name slug type fullSlug ancestors")
      .populate("categoryPath", "name fullSlug type")
      .populate("brandId", "name slug banner thumbnail")

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  },

  async updateProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      const productId = req.params.id;
      const updates = req.body;

      // ------------------------------------
      // 1️⃣ Find existing product
      // ------------------------------------
      const product = await Product.findOne({ _id: productId, isDeleted: false, });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // ------------------------------------
      // 2️⃣ Validate slug if updated
      // ------------------------------------
      if (updates.slug && updates.slug !== product.slug) {
        const slugExists = await Product.findOne({ slug: updates.slug, _id: { $ne: productId }, isDeleted: false, });

        if (slugExists) {
          throw new AppError("Product with this slug already exists", 409);
        }
      }

      // ------------------------------------
      // 3️⃣ Validate category if updated
      // ------------------------------------
      if (
        updates.categoryId &&
        updates.categoryId !== product.categoryId?.toString()
      ) {
        const category = await Category.findById(updates.categoryId);

        if (!category || category.isDeleted) {
          throw new AppError("Category not found", 404);
        }
      }

      // ------------------------------------
      // 4️⃣ Validate variant SKUs if updated
      // ------------------------------------
      if (updates.variants) {
        const skus = updates.variants.map((v: any) => v.sku);
        const uniqueSkus = new Set(skus);

        if (skus.length !== uniqueSkus.size) {
          throw new AppError("Duplicate SKUs found in variants", 400);
        }

        const existingSku = await Product.findOne({
          "variants.sku": { $in: skus },
          _id: { $ne: productId },
          isDeleted: false,
        });

        if (existingSku) {
          throw new AppError("One or more SKUs already exist", 409);
        }
      }

      // ------------------------------------
      // 5️⃣ Apply updates to product (partial)
      // ------------------------------------
      Object.keys(updates).forEach((key) => {
        // Handle nested variants replacement
        if (key === "variants" && Array.isArray(updates.variants)) {
          product.variants = updates.variants;
        } else {
          (product as any)[key] = updates[key];
        }
      });

      await product.save();

      await product.populate([
        { path: "categoryId", select: "name slug type" },
        { path: "categoryPath", select: "name fullSlug type" },
        { path: "brandId", select: "name slug banner thumbnail" },
      ]);

      res.json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user?._id;
    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
        isActive: false,
      },
      { new: true }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: { id: productId, deletedAt: product.deletedAt },
    });
  },

  async bulkUpdateProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { productIds, updateData } = req.body;
    const userId = req.user?._id;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError("Product IDs array is required", 400);
    }

    const result = await Product.updateMany(
      {
        _id: { $in: productIds },
        isDeleted: false,
      },
      {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  },

  async getProductsByBrand(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const { brandId } = req.params;
    const queryParams = req.query;

    // default filters
    queryParams.isActive = queryParams.isActive ?? "true";
    queryParams.isDeleted = "false";

    queryParams.brandId = brandId;

    const { filter, pagination, sort } =
      helperServerUtils.buildQuery<IProductDocument>(
        queryParams,
        [
          "brandId",
          "categoryId",
          "categoryPath",
          "sellerId",
          "status",
          "isActive",
          "productType",
          "tags",
          "name",
          "createdAt",
          "updatedAt",
          "variants.price",
          "variants.stock",
          "variants.inventoryType",
          "variants.variantType",
        ],
        "createdAt",
        [
          "name",
          "slug",
          "description",
          "shortDescription",
          "metaTitle",
          "metaKeywords",
        ]
      );

    // Handle inStock separately
    if (queryParams.inStock === "true") {
      filter.$or = [
        { "variants.inventoryType": "UNLIMITED" },
        { "variants.stock": { $gt: 0 } },
      ];
    }

    console.log(filter)


    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug type")
        .populate("categoryPath", "name fullSlug type")
        .populate("brandId", "name slug banner thumbnail")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalCount: total,
          limit: pagination.limit,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1,
        },
      },
    });
  },

  async getProductsByCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { categoryId } = req.params;
      const queryParams = req.query;

      queryParams.isActive = queryParams.isActive ?? "true";
      queryParams.isDeleted = "false";

      if (queryParams.includeSubcategories === "true") {
        // Use categoryPath to include products in subcategories
        queryParams.categoryPath = categoryId;
      } else {
        queryParams.categoryId = categoryId;
      }

      // Build filter, pagination, and sort using helper
      const { filter, pagination, sort } =
        helperServerUtils.buildQuery<IProductDocument>(
          queryParams,
          [
            "categoryId",
            "categoryPath",
            "sellerId",
            "status",
            "isActive",
            "brandId",
            "productType",
            "tags",
            "name",
            "createdAt",
            "updatedAt",
            "variants.price",
            "variants.stock",
            "variants.inventoryType",
            "variants.variantType",
          ],
          "createdAt",
          [
            "name",
            "slug",
            "description",
            "shortDescription",
            "metaTitle",
            "metaKeywords",
          ]
        );

      // Handle inStock override
      if (queryParams.inStock === "true") {
        filter.$or = [
          { "variants.inventoryType": "UNLIMITED" },
          { "variants.stock": { $gt: 0 } },
        ];
      }

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate("categoryId", "name slug type")
          .populate("categoryPath", "name fullSlug type")
          .populate("brandId", "name slug banner thumbnail")
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / pagination.limit);

      res.json({
        success: true,
        message: "Products fetched successfully",
        data: {
          products,
          pagination: {
            currentPage: pagination.page,
            totalPages,
            totalCount: total,
            limit: pagination.limit,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductsByCategoryTree(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const { categoryId } = req.params;
    const queryParams = req.query;

    // Default filters
    queryParams.isActive = queryParams.isActive ?? "true";
    queryParams.isDeleted = "false";

    // ALWAYS include subcategories for this endpoint
    queryParams.categoryPath = categoryId;

    // Build filter using existing helper
    const { filter, pagination, sort } =
      helperServerUtils.buildQuery<IProductDocument>(
        queryParams,
        ["categoryPath", "sellerId", "status", "isActive", "isDeleted", "brandId", "productType", "tags",],
        "order", // Sort by order field for consistent display
        ["name", "slug", "description", "metaTitle"]
      );

    // Handle inStock filter
    if (queryParams.inStock === "true") {
      filter.$or = [
        { "variants.inventoryType": "UNLIMITED" },
        { "variants.stock": { $gt: 0 } },
      ];
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug type")
        .populate("categoryPath", "name fullSlug type")
        .populate("brandId", "name slug banner thumbnail")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalCount: total,
          limit: pagination.limit,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1,
        },
      },
    });
  },

  async getProductsBySeller(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { sellerId } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {
      sellerId,
      isDeleted: false,
    };

    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug type")
        .populate("categoryPath", "name fullSlug type")
        .populate("brandId", "name slug banner thumbnail")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount: total,
          limit: Number(limit),
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  },

  async toggleProductStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { productId } = req.params;
    const userId = req.user?._id;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    })
      .populate("categoryId", "name slug type")
      .populate("categoryPath", "name fullSlug type")
      .populate("brandId", "name slug banner thumbnail")

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"
        } successfully`,
      data: product,
    });
  },

  async updateProductVariant(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { productId, variantId } = req.params;
    const variantData = req.body;
    const userId = req.user?._id;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const variant = product.variants.find(
      (v) => (v._id as Types.ObjectId).toString() === variantId
    );
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    // Check SKU uniqueness if being updated
    if (variantData.sku && variantData.sku !== variant.sku) {
      const existingSku = await Product.findOne({
        "variants.sku": variantData.sku,
        isDeleted: false,
      });
      if (existingSku) {
        throw new AppError("SKU already exists", 409);
      }
    }

    // Update variant
    Object.assign(variant, variantData);
    await product.save();

    res.json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  },

  async deleteProductVariant(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { productId, variantId } = req.params;
    const userId = req.user?._id;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.variants.length <= 1) {
      throw new AppError(
        "Cannot delete the last variant. Product must have at least one variant.",
        400
      );
    }

    const variant = product.variants.find(
      (v) => (v._id as Types.ObjectId).toString() === variantId
    );
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    product.variants = product.variants.filter(
      (v) => (v._id as Types.ObjectId).toString() === variantId
    );
    await product.save();

    res.json({
      success: true,
      message: "Variant deleted successfully",
      data: { productId, variantId },
    });
  },

  async getProductStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { sellerId } = req.query;
    const matchQuery: any = { isDeleted: false };

    if (sellerId) {
      matchQuery.sellerId = new Types.ObjectId(sellerId as string);
    }

    const stats = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          approvedProducts: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          pendingProducts: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          rejectedProducts: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          totalVariants: { $sum: { $size: "$variants" } },
          avgRating: { $avg: "$ratings.avg" },
          totalRatingsCount: { $sum: "$ratings.count" },
        },
      },
    ]);

    // Get category-wise distribution
    const categoryStats = await Product.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$category.name" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      message: "Products stats fetched successfully",
      data: {
        counts: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          approvedProducts: 0,
          pendingProducts: 0,
          rejectedProducts: 0,
          totalVariants: 0,
          avgRating: 0,
          totalRatingsCount: 0,
        },
        categoryDistribution: categoryStats,
      },
    });
  },
};
