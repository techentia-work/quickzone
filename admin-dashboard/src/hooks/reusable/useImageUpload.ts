"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { imageUploadApi } from "@/lib/api";
import toast from "react-hot-toast";
import { UploadedImage } from "@/lib/types";

interface UploadProgress {
  file: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

export const useImageUpload = () => {
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Upload single image mutation
  const uploadSingleMutation = useMutation({
    mutationFn: (formData: FormData) => imageUploadApi.uploadSingle(formData),
    onSuccess: (response) => {
      if (response?.data) {
        setUploadedImages((prev) => [...prev, response.data as UploadedImage]);
      }
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    },
  });

  // ✅ Upload bulk images mutation (fixed)
  const uploadBulkMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await imageUploadApi.uploadBulk(formData);
      console.log("Res" , res)
      // ✅ Return only the array of successful images
      return res?.data?.successful as UploadedImage[];
    },
    onSuccess: (uploadedImages) => {
      if (uploadedImages?.length) {
        setUploadedImages((prev) => [...prev, ...uploadedImages]);
        console.log("Bulk upload response data:", uploadedImages);
        toast.success(
          `${uploadedImages.length} image(s) uploaded successfully`
        );
      }
    },
    onError: (error) => {
      console.error("Error uploading bulk images:", error);
      toast.error("Failed to upload images");
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: (publicId: string) => imageUploadApi.delete(publicId),
    onSuccess: (response, publicId) => {
      setUploadedImages((prev) =>
        prev.filter((img) => img.publicId !== publicId)
      );
      toast.success(response?.data?.message || "Image deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    },
  });

  // Helper: Upload single image
  const uploadSingle = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await uploadSingleMutation.mutateAsync(formData);
        console.log(response) 
        return response?.data ?? null;
      } catch (error) {
        console.error("Upload single error:", error);
        throw error;
      }
    },
    [uploadSingleMutation]
  );

  // ✅ Helper: Upload bulk images (fixed)
  const uploadBulk = useCallback(
    async (files: File[]): Promise<UploadedImage[]> => {
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

        // Initialize progress tracking
        setUploadProgress(
          files.map((file) => ({
            file: file.name,
            progress: 0,
            status: "pending",
          }))
        );

        const uploadedImages = await uploadBulkMutation.mutateAsync(formData);

        // Mark all as success
        setUploadProgress((prev) =>
          prev.map((p) => ({ ...p, progress: 100, status: "success" }))
        );

        return uploadedImages ?? [];
      } catch (error) {
        // Mark all as error
        setUploadProgress((prev) =>
          prev.map((p) => ({ ...p, status: "error" }))
        );
        console.error("Upload bulk error:", error);
        throw error;
      }
    },
    [uploadBulkMutation]
  );

  // Helper: Delete image
  const deleteImage = useCallback(
    async (publicId: string): Promise<void> => {
      try {
        await deleteImageMutation.mutateAsync(publicId);
      } catch (error) {
        console.error("Delete image error:", error);
        throw error;
      }
    },
    [deleteImageMutation]
  );

  // Helper: Delete multiple images
  const deleteMultipleImages = useCallback(
    async (publicIds: string[]): Promise<void> => {
      try {
        await Promise.all(publicIds.map((id) => deleteImage(id)));
        toast.success(`${publicIds.length} image(s) deleted successfully`);
      } catch (error) {
        console.error("Delete multiple images error:", error);
        toast.error("Failed to delete some images");
        throw error;
      }
    },
    [deleteImage]
  );

  const clearUploadedImages = useCallback(() => setUploadedImages([]), []);
  const clearUploadProgress = useCallback(() => setUploadProgress([]), []);

  const getImageUrls = useCallback(
    () => uploadedImages.map((img) => img.imageUrl),
    [uploadedImages]
  );

  const validateFileType = useCallback((file: File): boolean => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    return allowedTypes.includes(file.type);
  }, []);

  const validateFileSize = useCallback(
    (file: File, maxSizeMB: number = 5): boolean =>
      file.size <= maxSizeMB * 1024 * 1024,
    []
  );

  const validateFiles = useCallback(
    (
      files: File[],
      maxSizeMB: number = 5
    ): { valid: File[]; invalid: File[] } => {
      const valid: File[] = [];
      const invalid: File[] = [];

      files.forEach((file) => {
        if (validateFileType(file) && validateFileSize(file, maxSizeMB))
          valid.push(file);
        else invalid.push(file);
      });

      if (invalid.length > 0)
        toast.error(
          `${invalid.length} file(s) rejected: Invalid type or size > ${maxSizeMB}MB`
        );

      return { valid, invalid };
    },
    [validateFileType, validateFileSize]
  );

  return {
    uploadedImages,
    uploadProgress,
    isUploadingSingle: uploadSingleMutation.isPending,
    isUploadingBulk: uploadBulkMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
    isMutating:
      uploadSingleMutation.isPending ||
      uploadBulkMutation.isPending ||
      deleteImageMutation.isPending,

    uploadSingle,
    uploadBulk,
    deleteImage,
    deleteMultipleImages,

    mutations: {
      uploadSingle: uploadSingleMutation,
      uploadBulk: uploadBulkMutation,
      delete: deleteImageMutation,
    },

    clearUploadedImages,
    clearUploadProgress,
    getImageUrls,
    validateFileType,
    validateFileSize,
    validateFiles,

    totalUploadedImages: uploadedImages.length,
    uploadSuccessCount: uploadProgress.filter((p) => p.status === "success")
      .length,
    uploadErrorCount: uploadProgress.filter((p) => p.status === "error").length,
  };
};
