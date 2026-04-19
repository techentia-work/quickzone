import { Router } from "express";
import mongoose from "mongoose";
import { withAuth, validate } from "../../lib/middlewares/index";
import { bannerSchema } from "../../lib/schema/banner/banner.schema";
import { bannerController } from "../../controllers/banner/banner.controller";
import { Banner } from "../../models/index";


export const bannerRouter = Router();

// ➕ CREATE
bannerRouter.post(
  "/",
  withAuth(true),
  validate(bannerSchema.createBannerSchema),
  bannerController.create
);

// 📋 GET ALL
bannerRouter.get("/", bannerController.getAll);

// 🔍 GET BY ID
bannerRouter.get("/:id", bannerController.getById);


// ✏️ UPDATE
bannerRouter.put(
  "/:id",
  withAuth(true),
  validate(bannerSchema.updateBannerSchema),
  bannerController.update
);

// ❌ DELETE
bannerRouter.delete("/:id", withAuth(true), bannerController.remove);

// 🟢 TOGGLE STATUS
bannerRouter.patch(
  "/:bannerId/toggle-status",
  withAuth(true),
  bannerController.toggleStatus
);

// ⚡ BULK CREATION
bannerRouter.post("/bulk", withAuth(true), async (req, res) => {
  const banners = req.body;
  if (!Array.isArray(banners) || banners.length === 0) {
    throw new Error("No banners provided");
  }

  const created: any[] = [];
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const banner of banners) {
        const newBanner = new Banner(banner);
        await newBanner.save({ session });
        created.push(newBanner);
      }
    });

    return res.status(201).json({
      message: "Banners created successfully",
      data: created,
    });
  } finally {
    session.endSession();
  }
});

export default bannerRouter;
