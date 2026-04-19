import { Response } from "express";
import { Transaction, Wallet } from "../../models/index";
import { AppError, AuthRequest } from "../../lib/types/index";

export const transactionController = {
  // ================= USER CONTROLLERS =================
  createTransaction: async (req: AuthRequest, res: Response) => {
    const { walletId, type, source, amount, description, referenceId, meta } =
      req.body;
    if (!walletId || !type || !amount)
      throw new AppError("Missing required fields", 400);

    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError("Wallet not found", 404);

    const newBalance =
      type === "CREDIT" ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0) throw new AppError("Insufficient balance", 400);

    wallet.balance = newBalance;
    await wallet.save();

    const transaction = await Transaction.create({
      walletId,
      type,
      source,
      amount,
      balanceAfter: newBalance,
      description,
      referenceId,
      meta,
      status: "SUCCESS",
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Transaction recorded",
        data: { transaction },
      });
  },

  getTransactions: async (req: AuthRequest, res: Response) => {
    const { walletId } = req.params;
    const transactions = await Transaction.find({ walletId }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  },

  getTransactionById: async (req: AuthRequest, res: Response) => {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new AppError("Transaction not found", 404);
    res.json({
      success: true,
      message: "Transaction fetched successfully",
      data: { transaction },
    });
  },

  getWalletBalanceSummary: async (req: AuthRequest, res: Response) => {
    const { walletId } = req.params;
    const transactions = await Transaction.find({
      walletId,
      status: "SUCCESS",
    });
    const totalCredit = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);
    res.json({
      success: true,
      data: { totalCredit, totalDebit, net: totalCredit - totalDebit },
    });
  },

  // ================= ADMIN CONTROLLERS =================
  getAllTransactions: async (req: AuthRequest, res: Response) => {
    const transactions = await Transaction.find()
      .populate("walletId")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  },

  getTransactionsByUser: async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const wallet = await Wallet.findOne({ ownerId: userId });
    if (!wallet) throw new AppError("User wallet not found", 404);
    const transactions = await Transaction.find({ walletId: wallet._id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  },

  adjustTransaction: async (req: AuthRequest, res: Response) => {
    const { walletId, type, amount, source, description } = req.body;
    if (!walletId || !type || !amount)
      throw new AppError("Missing required fields", 400);

    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError("Wallet not found", 404);

    const newBalance =
      type === "CREDIT" ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0) throw new AppError("Insufficient balance", 400);

    wallet.balance = newBalance;
    await wallet.save();

    const transaction = await Transaction.create({
      walletId,
      type,
      source: source || "MANUAL",
      amount,
      balanceAfter: newBalance,
      description,
      status: "SUCCESS",
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Transaction adjusted",
        data: { transaction },
      });
  },

  getTransactionStats: async (req: AuthRequest, res: Response) => {
    const transactions = await Transaction.find({ status: "SUCCESS" });
    const totalTransactions = transactions.length;
    const totalCredit = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);
    res.json({
      success: true,
      data: {
        totalTransactions,
        totalCredit,
        totalDebit,
        totalVolume: totalCredit + totalDebit,
      },
    });
  },
};
