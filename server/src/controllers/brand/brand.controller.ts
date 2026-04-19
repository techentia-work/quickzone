import { Request, Response, NextFunction } from "express";
import { Brand, Product } from "../../models/index";
import { AppError, IBrandDocument } from "../../lib/types/index";
import { helperServerUtils } from "../../lib/utils/index";

export const brandController = {
    // ---------------- CREATE BRAND ----------------
    async createBrand(req: Request, res: Response, next: NextFunction) {
        const data = req.body;

        const exists = await Brand.findOne({ slug: data.slug });
        if (exists) {
            throw new AppError("Brand slug already exists", 409);
        }

        const brand = await Brand.create(data);

        res.status(201).json({ success: true, message: "Brand created successfully", data: brand, });
    },

    // ---------------- GET ALL BRANDS ----------------
    async getBrands(req: Request, res: Response, next: NextFunction) {
        try {
            const queryParams = req.query;

            // Build dynamic filter, pagination, and sort
            const { filter, pagination, sort } =
                helperServerUtils.buildQuery<IBrandDocument>(
                    queryParams,
                    // Allowed filterable fields
                    [
                        "name",
                        "slug",
                        "isActive",
                        "createdAt",
                        "updatedAt",
                    ],
                    // Default sort field
                    "createdAt",
                    // Text-searchable fields
                    ["name", "slug"]
                );

            // Pagination
            const skip = pagination.skip;
            const limit = pagination.limit;

            // Query DB
            const [brands, total] = await Promise.all([
                Brand.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Brand.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                success: true,
                message: "Brands fetched successfully",
                data: {
                    brands,
                    pagination: {
                        currentPage: pagination.page,
                        totalPages,
                        totalCount: total,
                        limit,
                        hasNextPage: pagination.page < totalPages,
                        hasPrevPage: pagination.page > 1,
                    },
                },
            });
        } catch (err) {
            next(err);
        }
    },
    // ---------------- GET BRAND BY ID ----------------
    async getBrandById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const brand = await Brand.findById(id);
        if (!brand) throw new AppError("Brand not found", 404);

        res.json({ success: true, message: "Brand fetched successfully", data: brand, });
    },

    // ---------------- GET BRAND BY SLUG ----------------
    async getBrandBySlug(req: Request, res: Response, next: NextFunction) {
        const { slug } = req.params;

        const brand = await Brand.findOne({ slug });
        if (!brand) throw new AppError("Brand not found", 404);

        res.json({ success: true, message: "Brand fetched successfully", data: brand, });
    },

    // ---------------- UPDATE BRAND ----------------
    async updateBrand(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const data = req.body;

        const existingSlug = await Brand.findOne({ slug: data.slug, _id: { $ne: id }, });

        if (existingSlug) throw new AppError("Brand slug already exists", 409);

        const brand = await Brand.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        if (!brand) throw new AppError("Brand not found", 404);

        res.json({ success: true, message: "Brand updated successfully", data: brand, });
    },

    // ---------------- DELETE BRAND ----------------
    async deleteBrand(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) throw new AppError("Brand not found", 404);

        const productsUsingBrand = await Product.countDocuments({ brandId: id });

        if (productsUsingBrand > 0) {
            throw new AppError("Cannot delete brand because it is used by existing products", 400);
        }


        res.json({ success: true, message: "Brand deleted successfully", });
    },

    // ---------------- TOGGLE ACTIVE/INACTIVE ----------------
    async toggleBrandStatus(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const brand = await Brand.findById(id);
        if (!brand) throw new AppError("Brand not found", 404);

        brand.isActive = !brand.isActive;
        await brand.save();

        res.json({ success: true, message: "Brand status updated", data: brand, });
    },
};
