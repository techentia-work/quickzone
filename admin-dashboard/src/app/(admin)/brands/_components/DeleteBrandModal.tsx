"use client";

import { FormActions, FormCancelButton, BaseModal } from "@/components";
import { AlertTriangle, Trash2, X, Tag } from "lucide-react";
import Image from "next/image";

interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  isActive?: boolean;
}

interface DeleteBrandModalProps {
  isOpen: boolean;
  closeModal: () => void;
  brand: BrandItem | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteBrandModal({
  isOpen,
  closeModal,
  brand: selectedBrand,
  onConfirm,
  isLoading = false,
}: DeleteBrandModalProps) {
  const handleConfirm = async () => {
    if (!selectedBrand?._id) return;
    try {
      await onConfirm(selectedBrand._id);
      closeModal();
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  if (!selectedBrand) return null;

  return (
    <BaseModal isOpen={isOpen} closeModal={closeModal} className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Brand</h2>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the brand{" "}
            <span className="font-medium text-gray-900">"{selectedBrand.name}"</span>?
            This action cannot be undone.
          </p>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
            {selectedBrand.banner ? (
              <Image
                src={selectedBrand.banner}
                width={56}
                height={56}
                alt={selectedBrand.name}
                className="w-14 h-14 rounded-md object-cover border"
              />
            ) : (
              <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center">
                <Tag className="w-6 h-6 text-gray-500" />
              </div>
            )}

            <div>
              <span className="text-sm font-semibold text-gray-800">
                {selectedBrand.name}
              </span>
              <p className="text-xs text-gray-500">Slug: {selectedBrand.slug}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete the brand. Products associated with
                  this brand may lose brand labels or require manual updates.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <FormActions>
            <FormCancelButton onClick={closeModal} disabled={isLoading}>
              Cancel
            </FormCancelButton>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Brand
                </>
              )}
            </button>
          </FormActions>
        </div>
      </div>
    </BaseModal>
  );
}
