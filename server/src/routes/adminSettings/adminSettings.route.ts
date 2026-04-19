import { Router } from "express";
import { withAuth } from "../../lib/middlewares/index";
import { adminSettingController } from "../../controllers/adminSettings/adminSettings.controller";

export const adminSettingRouter = Router();

adminSettingRouter.get("/public", adminSettingController.getPublicSettings);
adminSettingRouter.get("/", withAuth(true), adminSettingController.getSettings);
adminSettingRouter.put("/", withAuth(true), adminSettingController.updateSettings);
adminSettingRouter.delete("/reset", withAuth(true), adminSettingController.resetSettings);
adminSettingRouter.get("/summary", withAuth(true), adminSettingController.getSettingsSummary);

export default adminSettingRouter;
