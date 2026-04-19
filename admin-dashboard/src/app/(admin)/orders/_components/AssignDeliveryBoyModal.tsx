"use client";

import React, { useState } from "react";
import { BaseModal, FormActions, FormCancelButton, Button } from "@/components";
import { DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";
import { Truck, Check, XCircle } from "lucide-react";

interface AssignDeliveryBoyModalProps {
  isOpen: boolean;
  closeModal: () => void;
  deliveryBoys: DeliveryBoyType[];
  onConfirm: (deliveryBoyId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AssignDeliveryBoyModal({
  isOpen,
  closeModal,
  deliveryBoys,
  onConfirm,
  isLoading = false,
}: AssignDeliveryBoyModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");

  const handleConfirm = async () => {
    if (!selectedId) return;
    
    await onConfirm(selectedId);
  };

  return (
    <BaseModal isOpen={isOpen} closeModal={closeModal} className="w-full max-w-lg">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Truck className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Assign Delivery Boy
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {deliveryBoys.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No available delivery boys right now.
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {deliveryBoys.map((boy) => (
                <li
                  key={boy._id}
                  onClick={() => setSelectedId(boy._id)}
                  className={`p-4 flex items-center justify-between cursor-pointer rounded-md ${
                    selectedId === boy._id
                      ? "bg-blue-50 border border-blue-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{boy.name}</p>
                    <p className="text-sm text-gray-500">{boy.phone}</p>
                  </div>
                  {selectedId === boy._id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <FormActions>
            <FormCancelButton onClick={closeModal} disabled={isLoading}>
              Cancel
            </FormCancelButton>
            <Button
              onClick={() => {
                console.log("holaaaa");
                
                handleConfirm()
              
              }}
              disabled={!selectedId || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Assigning..." : "Assign Delivery Boy"}
            </Button>
          </FormActions>
        </div>
      </div>
    </BaseModal>
  );
}