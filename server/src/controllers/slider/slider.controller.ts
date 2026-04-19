import { Slider } from "../../models/index";
import { createFeaturedController } from "../featured/base.controller";

export const sliderController = createFeaturedController(Slider, "Slider");
