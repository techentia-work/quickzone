import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AppError } from "../../lib/types/index";

export const ImageUploadController = {
  /* =====================================================
     SINGLE IMAGE UPLOAD (LOCAL)
  ===================================================== */
  singleImage: async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      throw new AppError("No file uploaded", 400);
    }

    const imageUrl = `${process.env.BASE_URL}/uploads/images/${file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl,
        publicId: `images/${file.filename}`, // for delete
      },
    });
  },

  /* =====================================================
     BULK IMAGE UPLOAD (LOCAL)
  ===================================================== */
  uploadBulkImage: async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    const successful = files.map((file) => ({
      imageUrl: `${process.env.BASE_URL}/uploads/images/${file.filename}`,
      publicId: `images/${file.filename}`,
    }));

    res.status(200).json({
      success: true,
      message: `${successful.length} images uploaded successfully`,
      data: {
        successful,
        totalUploaded: successful.length,
        totalFailed: 0,
      },
    });
  },

  /* =====================================================
     DELETE IMAGE (LOCAL)
  ===================================================== */
  deleteImage: async (req: Request, res: Response) => {
    let { publicId } = req.params;

    if (!publicId) {
      throw new AppError("Public ID is required", 400);
    }

    publicId = decodeURIComponent(publicId as string);

    // Ensure path is relative to the absolute uploads directory
    const filePath = path.join(process.cwd(), "uploads", publicId);
    
    try {
      await fs.promises.access(filePath);
      await fs.promises.unlink(filePath);
      console.log(`🗑️  Deleted file: ${filePath}`);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.warn(`⚠️  File not found during deletion: ${filePath}`);
      } else {
        console.error(`❌  Error deleting file: ${filePath}`, err);
        throw new AppError("Failed to delete image from server", 500);
      }
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  },
};
