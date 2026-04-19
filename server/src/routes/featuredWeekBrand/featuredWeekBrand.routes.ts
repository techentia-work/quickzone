// routes/admin/featuredWeekBrand.routes.ts
import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { featuredWeekBrandSchema } from "../../lib/schema/featuredWeekBrand/featuredWeekBrand.schema";
import { featuredWeekBrandController } from "../../controllers/featuredWeekBrand/featuredWeekBrand.controller";

export const featuredWeekBrandRouter = Router();

// CREATE
featuredWeekBrandRouter.post(
  "/",
  withAuth(true),
  validate(featuredWeekBrandSchema.createFeaturedWeekBrandSchema),
  featuredWeekBrandController.create
);

// GET ALL
featuredWeekBrandRouter.get(
  "/",
  featuredWeekBrandController.getAll
);

// GET BY ID
featuredWeekBrandRouter.get(
  "/:id",
  featuredWeekBrandController.getById
);

// UPDATE
featuredWeekBrandRouter.put(
  "/:id",
  withAuth(true),
  validate(featuredWeekBrandSchema.updateFeaturedWeekBrandSchema),
  featuredWeekBrandController.update
);

// DELETE
featuredWeekBrandRouter.delete(
  "/:id",
  withAuth(true),
  featuredWeekBrandController.remove
);

// TOGGLE ACTIVE / INACTIVE
featuredWeekBrandRouter.patch(
  "/:id/toggle-status",
  withAuth(true),
  featuredWeekBrandController.toggleStatus
);
