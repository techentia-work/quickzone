import { Request, Response, NextFunction } from "express";
import { BrandOfTheDay } from "../../models/brandOfTheDay/brandOfTheDay.modal";
import { AppError } from "../../lib/types/index";
import { IBrandOfTheDayDocument } from "../../lib/types/brandOfTheDay/brandOfTheDay.types";
import { helperServerUtils } from "../../lib/utils/index";

export const brandOfTheDayController = {
  // ================= CREATE =================
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const created = await BrandOfTheDay.create({
        ...data,
        masterCategory: data.masterCategory || null,
      });

      const populated = await BrandOfTheDay.findById(created._id)
        .populate("masterCategory", "name slug type");

      res.status(201).json({
        success: true,
        message: "Brand of the day created successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ================= GET ALL =================
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { filter, pagination, sort } =
        helperServerUtils.buildQuery<IBrandOfTheDayDocument>(
          req.query,
          [
            "name",
            "title",
            "websiteUrl",
            "isActive",
            "masterCategory",
            "createdAt",
          ],
          "createdAt",
          ["name", "title"]
        );

      const [items, total] = await Promise.all([
        BrandOfTheDay.find(filter)
          .populate("masterCategory", "name slug type")
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
        BrandOfTheDay.countDocuments(filter),
      ]);

      res.json({
        success: true,
        message: "Brand of the day fetched successfully",
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

  // ================= GET BY ID =================
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await BrandOfTheDay.findById(req.params.id)
        .populate("masterCategory", "name slug type");

      if (!item) throw new AppError("Item not found", 404);

      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  // ================= UPDATE =================
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await BrandOfTheDay.findByIdAndUpdate(
        id,
        {
          ...data,
          masterCategory: data.masterCategory || null,
        },
        { new: true, runValidators: true }
      ).populate("masterCategory", "name slug type");

      if (!updated) throw new AppError("Item not found", 404);

      res.json({
        success: true,
        message: "Brand of the day updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ================= DELETE =================
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await BrandOfTheDay.findByIdAndDelete(req.params.id);
      if (!deleted) throw new AppError("Item not found", 404);

      res.json({
        success: true,
        message: "Brand of the day deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // ================= TOGGLE STATUS =================
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await BrandOfTheDay.findById(req.params.id);
      if (!item) throw new AppError("Item not found", 404);

      item.isActive = !item.isActive;
      await item.save();

      const populated = await BrandOfTheDay.findById(item._id)
        .populate("masterCategory", "name slug type");

      res.json({
        success: true,
        message: "Status updated successfully",
        data: populated,
      });
    } catch (err) {
      next(err);
    }
  },
};
