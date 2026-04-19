import { Router } from "express";
import { appBrandController } from "../../controllers/AppBrand/appBrand.controller";
import { validate } from "../../lib/middlewares/index";
import { createAppBrandSchema, updateAppBrandSchema } from "../../lib/schema/appBrand/appBrand.schema";

const router = Router();

router.get("/", appBrandController.getAll);
router.post("/", validate(createAppBrandSchema), appBrandController.create);
router.patch("/:id", validate(updateAppBrandSchema), appBrandController.update);
router.delete("/:id", appBrandController.remove);
router.patch("/:id/toggle-status", appBrandController.toggleStatus);

export const appBrandRouter = router;
