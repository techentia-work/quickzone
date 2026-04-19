import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { shopByStoreSchema } from "../../lib/schema/shopByStore/shopByStore.schema";
import { shopByStoreController } from "../../controllers/shopByStore/shopByStore.controller";

export const shopByStoreRouter = Router();

// CREATE
shopByStoreRouter.post(
  "/",
  withAuth(true),
  validate(shopByStoreSchema.createShopByStoreSchema),
  shopByStoreController.create
);

// GET ALL
shopByStoreRouter.get("/", shopByStoreController.getAll);

// GET BY ID
shopByStoreRouter.get("/:id", shopByStoreController.getById);

// UPDATE
shopByStoreRouter.put(
  "/:id",
  withAuth(true),
  validate(shopByStoreSchema.updateShopByStoreSchema),
  shopByStoreController.update
);

// DELETE
shopByStoreRouter.delete(
  "/:id",
  withAuth(true),
  shopByStoreController.remove
);

// TOGGLE ACTIVE / INACTIVE
shopByStoreRouter.patch(
  "/:id/toggle-status",
  withAuth(true),
  shopByStoreController.toggleStatus
);
