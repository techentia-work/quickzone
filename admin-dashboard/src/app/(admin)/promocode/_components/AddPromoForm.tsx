"use client";
import React, { useRef, useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  FormGrid,
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormSubmitButton,
  FormCancelButton,
  FormActions,
} from "@/components";
import { CreatePromoPayload } from "@/lib/types/promocode/promocode.payload";
import { DiscountType } from "@/lib/types/promocode/promocode.enums";

interface AddPromoFormProps {
  onSubmit?: (data: CreatePromoPayload) => Promise<void>;
  isLoading?: boolean;
}

export function AddPromoForm({
  onSubmit,
  isLoading = false,
}: AddPromoFormProps) {
  const [formData, setFormData] = useState<CreatePromoPayload>({
    code: "",
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    description: "",
    usageLimit: undefined,
    minCartValue: undefined,
    maxDiscount: undefined,
    endDate: "",
    active: true,
    isDeleted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === "" || isNaN(Number(value))
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0,
      description: "",
      usageLimit: 0,
      minCartValue: 0,
      maxDiscount: 0,
      endDate: "",
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Promo code is required");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreatePromoPayload = {
        ...formData,
        description: formData.description || undefined,
        usageLimit: formData.usageLimit || undefined,
        minCartValue: formData.minCartValue || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        endDate: formData.endDate || undefined,
      };

      console.log("payload", typeof payload.discountValue);

      if (onSubmit) await onSubmit(payload);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Add New Promo Code
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGrid cols={2}>
          <FormInput
            label="Promo Code"
            name="code"
            required
            value={formData.code}
            onChange={handleChange}
          />

          <FormSelect
            label="Discount Type"
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            options={[
              { value: DiscountType.PERCENTAGE, label: "Percentage" },
              { value: DiscountType.FLAT, label: "Flat Amount" },
            ]}
          />

          <FormInput
            label="Discount Value"
            name="discountValue"
            type="number"
            required
            min="1"
            value={formData.discountValue}
            onChange={handleChange}
          />

          <FormInput
            label="Usage Limit"
            name="usageLimit"
            type="number"
            value={
              formData.usageLimit === undefined
                ? ""
                : Number(formData.usageLimit)
            }
            onChange={handleChange}
            placeholder="Optional"
          />

          <FormInput
            label="Min Order Amount"
            name="minCartValue"
            type="number"
            value={
              formData.minCartValue === undefined
                ? ""
                : Number(formData.minCartValue)
            }
            onChange={handleChange}
            placeholder="Optional"
          />

          <FormInput
            label="Max Discount Amount"
            name="maxDiscount"
            type="number"
            value={
              formData.maxDiscount === undefined
                ? ""
                : Number(formData.maxDiscount)
            }
            onChange={handleChange}
            placeholder="Optional"
          />

          <FormInput
            label="Expiry Date"
            name="endDate"
            type="date"
            value={formData.endDate ?? ""}
            onChange={handleChange}
          />
        </FormGrid>
        <FormTextArea
          label="Description"
          name="description"
          value={formData.description ?? ""}
          onChange={handleChange}
          placeholder="Add details about this promo"
        />

        <FormCheckbox
          label="Active"
          name="isActive"
          checked={formData.active}
          onChange={handleChange}
        />

        <FormActions>
          <FormCancelButton onClick={resetForm} disabled={isFormLoading}>
            Reset
          </FormCancelButton>
          <FormSubmitButton
            isLoading={isFormLoading}
            loadingText="Creating Promo..."
            icon={<Save className="w-4 h-4" />}
          >
            Create Promo
          </FormSubmitButton>
        </FormActions>
      </form>
    </div>
  );
}
