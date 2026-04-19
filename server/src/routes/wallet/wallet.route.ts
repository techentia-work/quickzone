import { Router } from "express";
import { walletController } from "../../controllers/index";
import { withAuth } from "../../lib/middlewares/index";

export const walletRouter = Router();

/** ================================
 * USER ROUTES
 * ================================ */
walletRouter.post("/", withAuth(false), walletController.createWallet);
walletRouter.get("/", withAuth(false), walletController.getWallet);

walletRouter.patch("/:walletId/deactivate", withAuth(false), walletController.deactivateWallet);

// 🧾 Get promo cash for logged-in user
walletRouter.get("/promocash", withAuth(false), walletController.getPromoCash);

/** ================================
 * ADMIN ROUTES
 * ================================ */
walletRouter.get("/admin/all", withAuth(true), walletController.getAllWallets);
walletRouter.get("/admin/:walletId", withAuth(true), walletController.getWalletById);

walletRouter.patch("/admin/adjust", withAuth(true), walletController.adjustWalletBalance);

walletRouter.patch("/admin/:walletId/status", withAuth(true), walletController.setWalletStatus);

// 🎁 Adjust promo cash (add or reduce with validity)
walletRouter.patch("/admin/promocash", withAuth(true), walletController.adjustPromoCash);

// 📊 Get promo cash stats (analytics)
walletRouter.get("/admin/promocash/stats", withAuth(true), walletController.getPromoCashStats);
walletRouter.post(
  "/topup/create",
  withAuth(false),
  walletController.createWalletTopup
);

