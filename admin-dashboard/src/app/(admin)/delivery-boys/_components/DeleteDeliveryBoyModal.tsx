"use client";

import { FormActions, FormCancelButton, BaseModal } from "@/components";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";

interface DeleteDeliveryBoyModalProps {
  isOpen: boolean;
  closeModal: () => void;
  deliveryBoy: DeliveryBoyType | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteDeliveryBoyModal({
  isOpen,
  closeModal,
  deliveryBoy: selectedDeliveryBoy,
  onConfirm,
  isLoading = false,
}: DeleteDeliveryBoyModalProps) {
  const handleConfirm = async () => {
    if (!selectedDeliveryBoy?._id) return;

    try {
      await onConfirm(selectedDeliveryBoy._id);
      closeModal();
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
    }
  };

  if (!selectedDeliveryBoy) return null;

  return (
    <BaseModal isOpen={isOpen} closeModal={closeModal} className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Delivery Boy</h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the delivery boy{" "}
            <span className="font-medium text-gray-900">
              "{selectedDeliveryBoy.name}"
            </span>
            ? This action cannot be undone.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  Deleting this delivery boy will remove all related records and
                  make them unavailable for new order assignments.
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
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Delivery Boy
                </>
              )}
            </button>
          </FormActions>
        </div>
      </div>
    </BaseModal>
  );
}