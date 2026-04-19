// src/routes/cart.routes.ts
import { Router } from "express";
import { cartController } from "../../controllers/index";
import { withAuth, validate } from "../../lib/middlewares/index";
import { cartSchema } from "../../lib/schema/index";

export const cartRouter = Router();

cartRouter.get("/", withAuth(false), cartController.getCart);
cartRouter.post("/add", withAuth(false), validate(cartSchema.addCartItemSchema), cartController.addItem);
cartRouter.patch("/update", withAuth(false), validate(cartSchema.updateCartItemSchema), cartController.updateItemQuantity);
cartRouter.delete("/remove/:variantId", withAuth(false), cartController.removeItem);
cartRouter.delete("/clear", withAuth(false), cartController.clearCart);
