"use client";

import React, { useState } from "react";
import { Save, Copy, X } from "lucide-react";
import {
  FormInput,
  FormGrid,
  FormSubmitButton,
  FormCancelButton,
  FormActions,
  FormTextArea,
} from "@/components";
import toast from "react-hot-toast";
import {
  CreateDeliveryBoyPayload,
  DeliveryBoyFormErrors,
} from "@/lib/types/deliveryBoy/deliveryBoypayload";
import { useAdminDeliveryBoy } from "@/hooks/entities/useAdminDeliveryBoy";
import { log } from "node:console";
import { DeliveryBoyProfileResponse } from "@/lib/types/deliveryBoy/deliveryBoy.types";

export function AddDeliveryBoyForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<DeliveryBoyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const { createDeliveryBoy } = useAdminDeliveryBoy();

  const validateForm = () => {
    const newErrors: DeliveryBoyFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", address: "" });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      } as CreateDeliveryBoyPayload;

      const res = await createDeliveryBoy(payload) as DeliveryBoyProfileResponse;

      console.log("res" , res);
      

      if(!res.success) {
        toast.error(res.message || "Failed to create delivery boy");
        return
      }

      if (res.data.credentials) {
        setCredentials(res.data.credentials);
        setShowDialog(true);
      } else {
        toast.success("Delivery boy created");
      }

      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to create delivery boy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Delivery Boy
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormGrid cols={2}>
            <FormInput
              label="Full Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter full name"
            />
            <FormInput
              label="Phone Number"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter 10-digit phone number"
            />
          </FormGrid>

          <FormTextArea
            label="Address"
            name="address"
            value={formData.address ?? ""}
            onChange={handleChange}
            rows={3}
            placeholder="Enter address (optional)"
          />

          <FormActions>
            <FormCancelButton onClick={resetForm} disabled={isSubmitting}>
              Reset
            </FormCancelButton>
            <FormSubmitButton
              isLoading={isSubmitting}
              loadingText="Creating..."
              icon={<Save className="w-4 h-4" />}
            >
              Create Delivery Boy
            </FormSubmitButton>
          </FormActions>
        </form>
      </div>


      {showDialog && credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-2">
              Delivery Boy Credentials
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Save these credentials securely — they won’t be shown again.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <span className="font-medium">Email:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{credentials.email}</span>
                  <button
                    onClick={() => handleCopy(credentials.email)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <span className="font-medium">Password:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{credentials.password}</span>
                  <button
                    onClick={() => handleCopy(credentials.password)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
