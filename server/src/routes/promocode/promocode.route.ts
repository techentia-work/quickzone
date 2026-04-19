// src/routes/promo.routes.ts
import { Router } from "express";
import { adminPromocodeController, promoController } from "../../controllers/index";
import { withAuth, validate } from "../../lib/middlewares/index";
import { promocodeSchema } from "../../lib/schema/index";

export const promoRouter = Router();

promoRouter.post("/apply", withAuth(false), validate(promocodeSchema.applyPromoSchema), promoController.applyPromo);
promoRouter.post("/remove", withAuth(false), promoController.removePromo);
promoRouter.post("/validate", withAuth(false), validate(promocodeSchema.applyPromoSchema), promoController.validatePromo);
promoRouter.get("/", adminPromocodeController.getAllPromos);

// Admin routes
promoRouter.post("/", withAuth(true), validate(promocodeSchema.createPromoSchema), adminPromocodeController.createPromo);
promoRouter.post("/bulk", withAuth(true), validate(promocodeSchema.bulkCreatePromoSchema), adminPromocodeController.bulkCreatePromos);
promoRouter.get("/statistics", withAuth(true), adminPromocodeController.getPromoStats);
promoRouter.get("/:id", withAuth(true), adminPromocodeController.getPromoById);
promoRouter.put("/:id", withAuth(true), validate(promocodeSchema.updatePromoSchema), adminPromocodeController.updatePromo);
promoRouter.patch("/:id/toggle-status", withAuth(true), adminPromocodeController.togglePromoStatus);
promoRouter.get("/:id/usage-history", withAuth(true), adminPromocodeController.getPromoUsageHistory);
promoRouter.delete("/:id", withAuth(true), adminPromocodeController.deletePromo)
