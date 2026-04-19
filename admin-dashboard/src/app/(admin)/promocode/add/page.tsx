"use client";
import React from "react";
import { useAdminPromo } from "@/hooks/entities/useAdminPromo";
import { CreatePromoPayload } from "@/lib/types/promocode/promocode.payload";
import { AddPromoForm } from "../_components/AddPromoForm";
import toast from "react-hot-toast";

const AddPromoPage = () => {
  const { createPromo } = useAdminPromo();

  const handleAddPromo = async (data: CreatePromoPayload) => {
    const payload = { ...data };

    // Clean empty optional fields
    if (!payload.description) delete payload.description;
    if (!payload.usageLimit) delete payload.usageLimit;
    if (!payload.minCartValue) delete payload.minCartValue;
    if (!payload.maxDiscount) delete payload.maxDiscount;
    if (!payload.endDate) delete payload.endDate;

    const res = await createPromo(payload);
    if (res.success) {
      toast.success("Promo code created successfully");
    } else {
      toast.error("Failed to create promo code");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <AddPromoForm onSubmit={handleAddPromo} isLoading={false} />
    </div>
  );
};

export default AddPromoPage;
