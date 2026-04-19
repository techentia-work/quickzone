import { NextFunction, Response } from "express";
import { AuthRequest, AppError, FeaturedModelType } from "../../lib/types/index";
import { Product, Category } from "../../models/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";

export const createFeaturedController = (Model: FeaturedModelType, entityName: string) => ({
  // ---------- CREATE ----------
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const userId = req.user?._id;

      // ✅ Check for duplicate order within same position + mapType
      if (data.order !== undefined && data.order !== null) {
        const existingOrder = await Model.findOne({
          order: data.order,
          position: data.position,
          mapType: data.mapType || "NONE",
          isDeleted: false,
        });
        if (existingOrder)
          throw new AppError(
            `Order ${data.order} is already used in ${data.position} position`,
            409
          );
      }

      // ✅ Ensure null-safe references + ensure mapType/mappings are respected
      const createPayload = {
        ...data,

        imageUrl: data.imageUrl || null,
        imageUrl1: data.imageUrl1 || null, // ✅ ADD THIS

        mapType:
          data.mapType && ["SUBCATEGORY", "PRODUCT", "NONE"].includes(data.mapType)
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


      console.log("2️⃣ Payload before Model.create:", JSON.stringify(createPayload, null, 2));

      // ✅ Create new document
      const created = await Model.create(createPayload);

      // ✅ Populate categories
      const populated = await Model.findById(created._id)
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      console.log("4️⃣ Populated document:", JSON.stringify(populated, null, 2));
      console.log("========== END CREATE FEATURED ==========");

      res.status(201).json({
        success: true,
        message: `${entityName} created successfully`,
        data: populated,
      });
    } catch (err) {
      console.error("CREATE ERROR:", err);
      next(err);
    }
  },


  // ---------- UPDATE ----------
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user?._id;

      const existing = await Model.findOne({ _id: id, isDeleted: false });
      if (!existing) throw new AppError(`${entityName} not found`, 404);

      // ✅ Check for duplicate order within same position (exclude self)
      if (data.order !== undefined && data.order !== null) {
        const orderExists = await Model.findOne({
          _id: { $ne: id },
          position: data.position || existing.position,
          order: data.order,
          isDeleted: false,
        });
        if (orderExists)
          throw new AppError(`Order ${data.order} is already used in ${data.position} position`, 409);
      }

      const updatePayload = {
        ...data,

        imageUrl:
          data.imageUrl !== undefined
            ? data.imageUrl
            : existing.imageUrl,

        imageUrl1:
          data.imageUrl1 !== undefined
            ? data.imageUrl1
            : existing.imageUrl1, // ✅ ADD THIS

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
        updatedBy: userId,
      };


      const updated = await Model.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      res.json({
        success: true,
        message: `${entityName} updated successfully`,
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
      const { filter, pagination, sort } = helperServerUtils.buildQuery(
        req.query,
        ["isActive", "order", "type", "mapType", "position", "masterCategory"],
        "createdAt",
        ["title", "slug", "metaTitle", "metaDescription"]
      );

      const query = {
        ...filter,
        isDeleted: false,
        position: position || ["TOP", "BOTTOM", "MIDDLE", "APP", "APP1", "APP2", "APP3", "APP4", "APP5", "APP6", "APP7", "APP8"],
      };

      const [list, total] = await Promise.all([
        Model.find(query)
          .populate("masterCategory", "name slug type")
          .populate("category", "name slug type")
          .populate("subcategory", "name slug type")
          .sort({ order: 1, ...sort })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        Model.countDocuments({ ...filter, isDeleted: false }),
      ]);

      // ✅ Populate mapping references (products/subcategories)
      const populatedList = await Promise.all(
        list.map(async (item) => {
          if (!Array.isArray(item.mappings)) return item;
          const mappings = await Promise.all(
            item.mappings.map(async (map: any) => {
              if (map.type === "PRODUCT" && map.refId) {
                const product = await Product.findById(map.refId)
                  .select("name slug mainImage price variants")
                  .lean();
                return { ...map, data: product };
              } else if (map.type === "SUBCATEGORY" && map.refId) {
                const sub = await Category.findById(map.refId)
                  .select("name slug thumbnail")
                  .lean();
                return { ...map, data: sub };
              } else if (map.type === "CATEGORY" && map.refId) {
                const cat = await Category.findById(map.refId)
                  .select("name slug thumbnail")
                  .lean();
                return { ...map, data: cat };
              }
              return map;
            })
          );
          return { ...item, mappings };
        })
      );

      res.status(200).json({
        success: true,
        message: `${entityName} list fetched successfully`,
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
      const item = await Model.findOne({ _id: req.params.id, isDeleted: false })
        .populate("masterCategory", "name slug type")
        .populate("category", "name slug type")
        .populate("subcategory", "name slug type");

      if (!item) throw new AppError(`${entityName} not found`, 404);

      res.json({
        success: true,
        message: `${entityName} fetched successfully`,
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
      const deleted = await Model.findByIdAndDelete(id);
      if (!deleted) throw new AppError(`${entityName} not found`, 404);

      res.json({
        success: true,
        message: `${entityName} deleted successfully`,
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
      const item = await Model.findById(id);
      if (!item) throw new AppError(`${entityName} not found`, 404);

      item.isActive = !item.isActive;
      await item.save();

      res.json({
        success: true,
        message: `${entityName} ${item.isActive ? "activated" : "deactivated"} successfully`,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },
});
