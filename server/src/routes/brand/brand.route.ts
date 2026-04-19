import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { brandSchema } from "../../lib/schema/index";
import { brandController } from "../../controllers/index";
    
export const brandRouter = Router();

brandRouter.post("/", withAuth(true), validate(brandSchema.createBrandSchema), brandController.createBrand);
brandRouter.get("/", brandController.getBrands);
brandRouter.get("/:id", brandController.getBrandById);
brandRouter.get("/slug/:slug", brandController.getBrandBySlug);
brandRouter.put("/:id", withAuth(true), validate(brandSchema.updateBrandSchema), brandController.updateBrand);
brandRouter.delete("/:id", withAuth(true), brandController.deleteBrand);
brandRouter.patch("/:id/toggle-status", withAuth(true), brandController.toggleBrandStatus);
