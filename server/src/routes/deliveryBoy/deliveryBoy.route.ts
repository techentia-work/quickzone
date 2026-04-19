// @/routes/deliveryBoy/deliveryBoy.routes.ts

import { Router } from "express";
import { withAuth, validate } from "../../lib/middlewares/index";
import { deliveryBoyController } from "../../controllers/deliveryBoy/deliveryBoy.controller";
import { deliveryBoySchema } from "../../lib/schema/deliveryBoy/deliveryBoy.schema";
import { UserRole } from "../../lib/types/index";

export const deliveryBoyRouter = Router();

deliveryBoyRouter.post("/login", validate(deliveryBoySchema.loginSchema), deliveryBoyController.login);
deliveryBoyRouter.post("/logout", withAuth(false, UserRole.DELIVERY_BOY), deliveryBoyController.logout);
deliveryBoyRouter.get("/profile", withAuth(false, UserRole.DELIVERY_BOY), deliveryBoyController.getProfile);
deliveryBoyRouter.get("/me", withAuth(false, UserRole.DELIVERY_BOY), deliveryBoyController.getCurrentdeliveryBoy);
deliveryBoyRouter.get("/orders/assigned", withAuth(false, UserRole.DELIVERY_BOY), deliveryBoyController.getAssignedOrders);
deliveryBoyRouter.get("/orders/all", withAuth(false, UserRole.DELIVERY_BOY), deliveryBoyController.getAllOrders);
deliveryBoyRouter.post("/orders/accept", withAuth(false, UserRole.DELIVERY_BOY), validate(deliveryBoySchema.acceptRejectOrderSchema), deliveryBoyController.acceptAssignedOrder);
deliveryBoyRouter.post("/orders/reject", withAuth(false, UserRole.DELIVERY_BOY), validate(deliveryBoySchema.acceptRejectOrderSchema), deliveryBoyController.rejectAssignedOrder);
deliveryBoyRouter.patch("/orders/status", withAuth(false, UserRole.DELIVERY_BOY), validate(deliveryBoySchema.updateDeliveryStatusSchema), deliveryBoyController.updateDeliveryStatus);

// ADMIN ROUTES (Protected - Admin Only)
deliveryBoyRouter.post("/create", withAuth(true), validate(deliveryBoySchema.createDeliveryBoySchema), deliveryBoyController.createDeliveryBoy);
deliveryBoyRouter.get("/all", withAuth(true), deliveryBoyController.getDeliveryBoys);
deliveryBoyRouter.get("/available", withAuth(true), deliveryBoyController.getAvailableDeliveryBoys);
deliveryBoyRouter.post("/assign", withAuth(true), validate(deliveryBoySchema.assignOrderSchema), deliveryBoyController.assignOrder);
deliveryBoyRouter.post("/unassign", withAuth(true), validate(deliveryBoySchema.unassignOrderSchema), deliveryBoyController.unassignOrder);
deliveryBoyRouter.get("/:id", withAuth(true), deliveryBoyController.getDeliveryBoyById);
deliveryBoyRouter.get("/:id/stats", withAuth(true), deliveryBoyController.getDeliveryBoyStats);
deliveryBoyRouter.patch("/:id", withAuth(true), validate(deliveryBoySchema.updateDeliveryBoySchema), deliveryBoyController.updateDeliveryBoy);
deliveryBoyRouter.patch("/:id/status", withAuth(true), validate(deliveryBoySchema.updateStatusSchema), deliveryBoyController.updateStatus);
deliveryBoyRouter.patch("/:id/toggle-active", withAuth(true), deliveryBoyController.toggleActiveStatus);
deliveryBoyRouter.delete("/:id", withAuth(true), deliveryBoyController.deleteDeliveryBoy);

export default deliveryBoyRouter;
