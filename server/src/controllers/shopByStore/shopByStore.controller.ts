import { Request, Response, NextFunction } from "express";
import { ShopByStore } from "../../models/shopByStore/shopByStore.model";
import { AppError } from "../../lib/types/index";
import { IShopByStoreDocument } from "../../lib/types/shopByStore/shopByStore.types";
import { helperServerUtils } from "../../lib/utils/index";

export const shopByStoreController = {
  // ================= CREATE =================
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const exists = await ShopByStore.findOne({ slug: data.slug });
      if (exists) throw new AppError("Slug already exists", 409);

      const created = await ShopByStore.create({
        ...data,
        masterCategory: data.masterCategory || null,
      });

      const populated = await ShopByStore.findById(created._id)
        .populate("masterCategory", "name slug type");

      res.status(201).json({
        success: true,
        message: "Shop by store created successfully",
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
        helperServerUtils.buildQuery<IShopByStoreDocument>(
          req.query,
          ["name", "slug", "isActive", "masterCategory", "createdAt"],
          "createdAt",
          ["name", "slug"]
        );

      const [items, total] = await Promise.all([
        ShopByStore.find(filter)
          .populate("masterCategory", "name slug type")
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
        ShopByStore.countDocuments(filter),
      ]);

      res.json({
        success: true,
        message: "Shop by stores fetched successfully",
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
      const item = await ShopByStore.findById(req.params.id)
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

      if (data.slug) {
        const slugExists = await ShopByStore.findOne({
          slug: data.slug,
          _id: { $ne: id },
        });
        if (slugExists) throw new AppError("Slug already exists", 409);
      }

      const updated = await ShopByStore.findByIdAndUpdate(
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
        message: "Shop by store updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // ================= DELETE =================
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await ShopByStore.findByIdAndDelete(req.params.id);
      if (!deleted) throw new AppError("Item not found", 404);

      res.json({
        success: true,
        message: "Shop by store deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // ================= TOGGLE STATUS =================
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ShopByStore.findById(req.params.id);
      if (!item) throw new AppError("Item not found", 404);

      item.isActive = !item.isActive;
      await item.save();

      const populated = await ShopByStore.findById(item._id)
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
