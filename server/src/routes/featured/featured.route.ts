import { Router } from "express";
import mongoose from "mongoose";
import { withAuth, validate } from "../../lib/middlewares/index";
import { featuredSchema } from "../../lib/schema/index";
import { FeaturedSection, Category, Product } from "../../models/index";
import { featuredSectionController } from "../../controllers/featured/featured.controller";

export const featuredSectionRouter = Router();

featuredSectionRouter.post(
  "/",
  withAuth(true),
  validate(featuredSchema.createFeaturedSchema),
  featuredSectionController.create
);

featuredSectionRouter.get("/", featuredSectionController.getAll);

featuredSectionRouter.get("/:id", featuredSectionController.getById);



featuredSectionRouter.put(
  "/:id",
  withAuth(true),
  validate(featuredSchema.updateFeaturedSchema),
  featuredSectionController.update
);

featuredSectionRouter.delete(
  "/:id",
  withAuth(true),
  featuredSectionController.remove
);

featuredSectionRouter.patch(
  "/:featuredId/toggle-status",
  withAuth(true),
  featuredSectionController.toggleStatus
);

featuredSectionRouter.post("/bulk", withAuth(true), async (req, res) => {
  const list = req.body;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("No featured sections provided");
  }

  const createdSections: any[] = [];
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const item of list) {
        if (item.products?.length) {
          for (const prodId of item.products) {
            const product = await Product.findById(prodId).session(session);
            if (!product)
              throw new Error(`Product not found for: ${item.title}`);
          }
        }

        const featured = new FeaturedSection(item);
        await featured.save({ session });
        createdSections.push(featured);
      }
    });

    return res.status(201).json({
      message: "Featured sections created successfully",
      data: createdSections,
    });
  } finally {
    session.endSession();
  }
});

export default featuredSectionRouter;
