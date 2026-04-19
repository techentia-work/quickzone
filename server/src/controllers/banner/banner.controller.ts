import { Banner } from "../../models/index";
import { createFeaturedController } from "../featured/base.controller";

export const bannerController = createFeaturedController(Banner, "Banner");
