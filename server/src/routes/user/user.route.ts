import { Router } from "express";
import { userController } from "../../controllers/index";
import { withAuth } from "../../lib/middlewares/index";

export const userRouter = Router();

userRouter.get("/profile", withAuth(false), userController.profile);
userRouter.put("/profile", withAuth(false), userController.updateProfile);

userRouter.get("/all", withAuth(true), userController.getAllUsers);

userRouter.get("/details", withAuth(true), userController.getUserDetails);
userRouter.get("/details/:id", withAuth(true), userController.getUserDetails);
userRouter.post(
  "/save-fcm-token",
  withAuth(false), // 👈 logged in user
  userController.saveFcmToken
);
export default userRouter;
