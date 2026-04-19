import { NextFunction, Response } from "express";
import { AuthRequest, AppError } from "../../lib/types/index";
import { Product, Category, Brand } from "../../models/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";
import AppFeatured from "../../models/Appfeatured/appFeatured.model";

export const appFeaturedController = {
  // ---------- CREATE ----------
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // ✅ Check duplicate order (APP specific)
      if (data.order !== undefined && data.order !== null) {
        const existingOrder = await AppFeatured.findOne({
          order: data.order,
          position: data.position,
          mapType: data.mapType || "NONE",
          isDeleted: false,
        });

        if (existingOrder) {
          throw new AppError(
            `Order ${data.order} is already used in ${data.position} position`,
            409
          );
        }
      }

      // ✅ Build payload (null-safe)
      const createPayload = {
        ...data,
        mapType:
          data.mapType && ["SUBCATEGORY", "PRODUCT", "BRAND", "NONE"].includes(data.mapType)
            ? data.mapType
            : "NONE",

        mappings: Array.isArray(data.mappings) ? data.mappings : [],

        masterCategory: data.masterCategory || null,

        category: Array.isArray(data.category)
          ? data.category
          : data.category
          ? [data.category]
          : [],

        subcategory: Array.isArray(data.subcategory)
          ? data.subcategory
          : data.subcategory
          ? [data.subcategory]
          : [],
      };

      const created = await AppFeatured.create(createPayload);

      const populated = await AppFeatured.findById(created._id)
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      res.status(201).json({
        success: true,
        message: "App Featured created successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------- UPDATE ----------
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await AppFeatured.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!existing) {
        throw new AppError("App Featured not found", 404);
      }

      if (data.order !== undefined && data.order !== null) {
        const orderExists = await AppFeatured.findOne({
          _id: { $ne: id },
          position: data.position || existing.position,
          order: data.order,
          isDeleted: false,
        });

        if (orderExists) {
          throw new AppError(
            `Order ${data.order} is already used in ${data.position} position`,
            409
          );
        }
      }

      const updatePayload = {
        ...data,
        masterCategory: data.masterCategory || null,

        category: Array.isArray(data.category)
          ? data.category
          : data.category
          ? [data.category]
          : [],

        subcategory: Array.isArray(data.subcategory)
          ? data.subcategory
          : data.subcategory
          ? [data.subcategory]
          : [],

        mappings: Array.isArray(data.mappings) ? data.mappings : [],
      };

      const updated = await AppFeatured.findByIdAndUpdate(
        id,
        updatePayload,
        { new: true, runValidators: true }
      )
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      res.json({
        success: true,
        message: "App Featured updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------- GET ALL ----------
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { position } = req.query;

      const { filter, pagination, sort } =
        helperServerUtils.buildQuery(
          req.query,
          ["isActive", "order", "type", "mapType", "position"],
          "createdAt",
          ["title", "slug", "metaTitle", "metaDescription"]
        );

      const query = {
        ...filter,
        isDeleted: false,
        position: position || ["TOP", "MIDDLE", "BOTTOM",],
      };

      const [list, total] = await Promise.all([
        AppFeatured.find(query)
          .populate("masterCategory", "name slug type")
          .populate("category", "name slug type")
          .populate("subcategory", "name slug type")
          .sort({ order: 1, ...sort })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),

        AppFeatured.countDocuments({
          ...filter,
          isDeleted: false,
        }),
      ]);

      const populatedList = await Promise.all(
        list.map(async (item: any) => {
          if (!Array.isArray(item.mappings)) return item;

          const mappings = await Promise.all(
            item.mappings.map(async (map: any) => {
              if (map.type === "PRODUCT" && map.refId) {
                const product = await Product.findById(map.refId)
                  .select("name slug mainImage price variants")
                  .lean();
                return { ...map, data: product };
              }

              if (map.type === "SUBCATEGORY" && map.refId) {
                const sub = await Category.findById(map.refId)
                  .select("name slug thumbnail")
                  .lean();
                return { ...map, data: sub };
              }

              if (map.type === "BRAND" && map.refId) {
                const brand = await Brand.findById(map.refId)
                  .select("name slug thumbnail banner")
                  .lean();
                return { ...map, data: brand };
              }

              return map;
            })
          );

          return { ...item, mappings };
        })
      );

      res.status(200).json({
        success: true,
        message: "App Featured list fetched successfully",
        data: {
          items: populatedList,
          pagination: {
            currentPage: pagination.page,
            totalPages: Math.ceil(total / pagination.limit),
            totalCount: total,
            limit: pagination.limit,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------- GET BY ID ----------
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await AppFeatured.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      if (!item) {
        throw new AppError("App Featured not found", 404);
      }

      res.json({
        success: true,
        message: "App Featured fetched successfully",
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------- DELETE ----------
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleted = await AppFeatured.findByIdAndDelete(id);
      if (!deleted) {
        throw new AppError("App Featured not found", 404);
      }

      res.json({
        success: true,
        message: "App Featured deleted successfully",
        data: { id: deleted._id },
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------- TOGGLE STATUS ----------
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const item = await AppFeatured.findById(id);
      if (!item) {
        throw new AppError("App Featured not found", 404);
      }

      item.isActive = !item.isActive;
      await item.save();

      res.json({
        success: true,
        message: `App Featured ${
          item.isActive ? "activated" : "deactivated"
        } successfully`,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },
};
