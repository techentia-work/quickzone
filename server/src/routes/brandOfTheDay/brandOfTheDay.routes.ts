import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { brandOfTheDaySchema } from "../../lib/schema/brandOfTheDay/brandOfTheDay.schema";
import { brandOfTheDayController } from "../../controllers/brandOfTheDay/brandOfTheDay.controller";

export const brandOfTheDayRouter = Router();

// CREATE
brandOfTheDayRouter.post(
  "/",
  withAuth(true),
  validate(brandOfTheDaySchema.createBrandOfTheDaySchema),
  brandOfTheDayController.create
);

// GET ALL
brandOfTheDayRouter.get(
  "/",
  brandOfTheDayController.getAll
);

// GET BY ID
brandOfTheDayRouter.get(
  "/:id",
  brandOfTheDayController.getById
);

// UPDATE
brandOfTheDayRouter.put(
  "/:id",
  withAuth(true),
  validate(brandOfTheDaySchema.updateBrandOfTheDaySchema),
  brandOfTheDayController.update
);

// DELETE
brandOfTheDayRouter.delete(
  "/:id",
  withAuth(true),
  brandOfTheDayController.remove
);

// TOGGLE ACTIVE / INACTIVE
brandOfTheDayRouter.patch(
  "/:id/toggle-status",
  withAuth(true),
  brandOfTheDayController.toggleStatus
);
