import { Router } from "express";
import mongoose from "mongoose";
import { withAuth, validate } from "../../lib/middlewares/index";
import { sliderSchema } from "../../lib/schema/slider/slider.schema";
import { sliderController } from "../../controllers/slider/slider.controller";
import { Slider } from "../../models/index";

export const sliderRouter = Router();

sliderRouter.post(
  "/",
  withAuth(true),
  validate(sliderSchema.createSliderSchema),
  sliderController.create
);

sliderRouter.get("/", sliderController.getAll);

sliderRouter.get("/:id", sliderController.getById);


sliderRouter.put(
  "/:id",
  withAuth(true),
  validate(sliderSchema.updateSliderSchema),
  sliderController.update
);

sliderRouter.delete("/:id", withAuth(true), sliderController.remove);

sliderRouter.patch(
  "/:sliderId/toggle-status",
  withAuth(true),
  sliderController.toggleStatus
);

sliderRouter.post("/bulk", withAuth(true), async (req, res) => {
  const sliders = req.body;
  if (!Array.isArray(sliders) || sliders.length === 0) {
    throw new Error("No sliders provided");
  }

  const created: any[] = [];
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const slider of sliders) {
        const newSlider = new Slider(slider);
        await newSlider.save({ session });
        created.push(newSlider);
      }
    });

    return res.status(201).json({
      message: "Sliders created successfully",
      data: created,
    });
  } finally {
    session.endSession();
  }
});

export default sliderRouter;
