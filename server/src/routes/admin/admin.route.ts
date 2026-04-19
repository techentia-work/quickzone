import { Router } from "express";
import { adminController } from "../../controllers/index";
import { withAuth } from "../../lib/middlewares/index";

export const adminRouter = Router();

adminRouter.use(withAuth(true));

adminRouter.get("/dashboard", adminController.dashboard);
adminRouter.get("/users", adminController.listUsers);
adminRouter.patch("/users/:id/deactivate", adminController.deactivateUser);
