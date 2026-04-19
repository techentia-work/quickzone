import { Router } from "express";
import { transactionController } from "../../controllers/index";
import { withAuth } from "../../lib/middlewares/index";

export const transactionRouter = Router();

// ===================== USER ROUTES =====================
transactionRouter.post("/", withAuth(false), transactionController.createTransaction);
transactionRouter.get("/wallet/:walletId", withAuth(false), transactionController.getTransactions);
transactionRouter.get("/detail/:transactionId", withAuth(false), transactionController.getTransactionById);
transactionRouter.get("/wallet/:walletId/summary", withAuth(false), transactionController.getWalletBalanceSummary);

// ===================== ADMIN ROUTES =====================
transactionRouter.get("/admin/all", withAuth(true), transactionController.getAllTransactions);
transactionRouter.get("/admin/user/:userId", withAuth(true), transactionController.getTransactionsByUser);
transactionRouter.post("/admin/adjust", withAuth(true), transactionController.adjustTransaction);
transactionRouter.get("/admin/stats", withAuth(true), transactionController.getTransactionStats);
