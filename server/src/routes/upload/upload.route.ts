import { Router } from "express";
import { upload } from "../../lib/middlewares/index";
import { ImageUploadController } from "../../controllers/image/image.controller";

export const imageRouter = Router();

imageRouter.post(
  "/upload-single-image",
  upload.single("image"),
  ImageUploadController.singleImage
);
imageRouter.post(
  "/upload/bulk",
  upload.array("images", 10),
  ImageUploadController.uploadBulkImage
);
imageRouter.delete("/delete/:publicId", ImageUploadController.deleteImage);
