// src/routes/wishlist.routes.ts
import { Router } from "express";
import { wishlistController } from "../../controllers/index";
import { withAuth, validate } from "../../lib/middlewares/index";
import { wishlistSchema } from "../../lib/schema/index";

export const wishlistRouter = Router();

wishlistRouter.get("/", withAuth(false), wishlistController.getWishlist);
wishlistRouter.post("/", withAuth(false), validate(wishlistSchema.addWishlistItemSchema), wishlistController.addItem);
wishlistRouter.delete("/", withAuth(false), wishlistController.clearWishlist);
wishlistRouter.delete("/:variantId", withAuth(false), wishlistController.removeItem);
