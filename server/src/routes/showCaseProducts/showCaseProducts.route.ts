import express from "express";
import { showcaseProductController } from "../../controllers/showCaseProducts/showCaseProducts.controller";
import { withAuth } from "../../lib/middlewares/index";

const showCaseProductsRouter = express.Router();

showCaseProductsRouter.post("/", withAuth(true), showcaseProductController.createShowcaseProduct);
showCaseProductsRouter.get("/", showcaseProductController.getShowcaseProducts);
showCaseProductsRouter.get("/:id", showcaseProductController.getShowcaseProductById);
showCaseProductsRouter.put("/:id", withAuth(true), showcaseProductController.updateShowcaseProduct);
showCaseProductsRouter.delete("/:id", withAuth(true), showcaseProductController.deleteShowcaseProduct);

export default showCaseProductsRouter;
