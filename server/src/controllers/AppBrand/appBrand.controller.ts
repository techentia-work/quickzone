import { Request, Response, NextFunction } from "express";
import { AppBrand } from "../../models/AppBrand/appBrand.model";
import { AppError } from "../../lib/types/index";
import { helperServerUtils } from "../../lib/utils/index";

export const appBrandController = {
  // ---------------- CREATE ----------------
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const exists = await AppBrand.findOne({ brand: data.brand, isDeleted: false });
      if (exists) {
        throw new AppError("This brand is already added to App Brands", 409);
      }

      const created = await AppBrand.create(data);
      const populated = await AppBrand.findById(created._id)
        .populate("brand")
        .populate("masterCategory", "name slug type");

      res.status(201).json({
        success: true,
        message: "App brand added successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- GET ALL ----------------
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { filter, pagination, sort } = helperServerUtils.buildQuery(
        req.query,
        ["isActive", "isDeleted", "brand"],
        "order",
        []
      );

      const query = { ...filter, isDeleted: false };

      const [items, total] = await Promise.all([
        AppBrand.find(query)
          .populate("brand")
          .populate("masterCategory", "name slug type")
          .sort({ order: 1, ...sort })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        AppBrand.countDocuments(query),
      ]);

      res.json({
        success: true,
        message: "App brands fetched successfully",
        data: {
          items,
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

  // ---------------- UPDATE ----------------
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await AppBrand.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate("brand").populate("masterCategory", "name slug type");

      if (!updated) throw new AppError("App brand not found", 404);

      res.json({
        success: true,
        message: "App brand updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- DELETE ----------------
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await AppBrand.findByIdAndDelete(req.params.id);
      if (!deleted) throw new AppError("App brand not found", 404);

      res.json({
        success: true,
        message: "App brand removed successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- TOGGLE STATUS ----------------
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await AppBrand.findById(req.params.id);
      if (!item) throw new AppError("App brand not found", 404);

      item.isActive = !item.isActive;
      await item.save();

      res.json({
        success: true,
        message: `App brand ${item.isActive ? "activated" : "deactivated"}`,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },
};
