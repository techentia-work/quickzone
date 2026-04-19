// controllers/featuredWeekBrand.controller.ts
import { Request, Response, NextFunction } from "express";
import { FeaturedWeekBrand, Product } from "../../models/index";
import { AppError, IFeaturedWeekBrandDocument } from "../../lib/types/index";
import { helperServerUtils } from "../../lib/utils/index";

export const featuredWeekBrandController = {
  // ---------------- CREATE ----------------
  async create(req: Request, res: Response, next: NextFunction) {
    const data = req.body;

    const exists = await FeaturedWeekBrand.findOne({ slug: data.slug });
    if (exists) throw new AppError("Slug already exists", 409);

    const created = await FeaturedWeekBrand.create({
      ...data,
      masterCategory: data.masterCategory || null,
    });

    const populated = await FeaturedWeekBrand.findById(created._id)
      .populate("masterCategory", "name slug type");

    res.status(201).json({
      success: true,
      message: "Featured week brand created successfully",
      data: populated,
    });
  },

  // ---------------- GET ALL ----------------
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { filter, pagination, sort } =
        helperServerUtils.buildQuery<IFeaturedWeekBrandDocument>(
          req.query,
          ["name", "slug", "isActive", "masterCategory", "createdAt"],
          "createdAt",
          ["name", "slug"]
        );

      const [items, total] = await Promise.all([
        FeaturedWeekBrand.find(filter)
          .populate("masterCategory", "name slug type")
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        FeaturedWeekBrand.countDocuments(filter),
      ]);

      res.json({
        success: true,
        message: "Featured week brands fetched successfully",
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

  // ---------------- GET BY ID ----------------
  async getById(req: Request, res: Response) {
    const item = await FeaturedWeekBrand.findById(req.params.id)
      .populate("masterCategory", "name slug type");

    if (!item) throw new AppError("Item not found", 404);

    res.json({ success: true, data: item });
  },

  // ---------------- UPDATE ----------------
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const slugExists = await FeaturedWeekBrand.findOne({
      slug: data.slug,
      _id: { $ne: id },
    });
    if (slugExists) throw new AppError("Slug already exists", 409);

    const updated = await FeaturedWeekBrand.findByIdAndUpdate(
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
      message: "Featured week brand updated successfully",
      data: updated,
    });
  },

  // ---------------- DELETE ----------------
  async remove(req: Request, res: Response) {
    const deleted = await FeaturedWeekBrand.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError("Item not found", 404);

    res.json({
      success: true,
      message: "Featured week brand deleted successfully",
    });
  },

  // ---------------- TOGGLE STATUS ----------------
  async toggleStatus(req: Request, res: Response) {
    const item = await FeaturedWeekBrand.findById(req.params.id);
    if (!item) throw new AppError("Item not found", 404);

    item.isActive = !item.isActive;
    await item.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: item,
    });
  },
};
