import { Router } from "express";
import mongoose from "mongoose";
import { withAuth, validate } from "../../lib/middlewares/index";
import { appFeaturedSchema } from "../../lib/schema/appFeatured/appFeatured.schema";
import AppFeatured from "../../models/Appfeatured/appFeatured.model";
import { Product } from "../../models/index";
import { appFeaturedController } from "../../controllers/AppFeatured/appFeatured.controller";

export const appFeaturedRouter = Router();

/* ---------- CREATE ---------- */
appFeaturedRouter.post(
  "/",
  withAuth(true),
  validate(appFeaturedSchema.createAppFeaturedSchema),
  appFeaturedController.create
);

/* ---------- GET ALL ---------- */
appFeaturedRouter.get("/", appFeaturedController.getAll);

/* ---------- GET BY ID ---------- */
appFeaturedRouter.get("/:id", appFeaturedController.getById);

/* ---------- UPDATE ---------- */
appFeaturedRouter.put(
  "/:id",
  withAuth(true),
  validate(appFeaturedSchema.updateAppFeaturedSchema),
  appFeaturedController.update
);

/* ---------- DELETE ---------- */
appFeaturedRouter.delete(
  "/:id",
  withAuth(true),
  appFeaturedController.remove
);

/* ---------- TOGGLE STATUS ---------- */
appFeaturedRouter.patch(
  "/:id/toggle-status",
  withAuth(true),
  appFeaturedController.toggleStatus
);

/* ---------- BULK CREATE (APP) ---------- */
appFeaturedRouter.post(
  "/bulk",
  withAuth(true),
  async (req, res, next) => {
    const list = req.body;

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No app featured items provided",
      });
    }

    const createdItems: any[] = [];
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const item of list) {
          // ✅ Validate product references (APP)
          if (Array.isArray(item.mappings)) {
            for (const map of item.mappings) {
              if (map.type === "PRODUCT" && map.refId) {
                const product = await Product.findById(map.refId).session(
                  session
                );
                if (!product) {
                  throw new Error(
                    `Product not found for featured: ${item.title}`
                  );
                }
              }
            }
          }

          const featured = new AppFeatured(item);
          await featured.save({ session });
          createdItems.push(featured);
        }
      });

      res.status(201).json({
        success: true,
        message: "App Featured items created successfully",
        data: createdItems,
      });
    } catch (err) {
      next(err);
    } finally {
      session.endSession();
    }
  }
);

export default appFeaturedRouter;
