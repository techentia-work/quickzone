"use client";

import { useAdminDeliveryBoy } from "@/hooks/entities/useAdminDeliveryBoy";
import { CreateDeliveryBoyPayload } from "@/lib/types/deliveryBoy/deliveryBoypayload";
import React from "react";
import { AddDeliveryBoyForm } from "../_components/AddDeliveryBoyForm";

const AddDeliveryBoyPage = () => {
  const { createDeliveryBoy, deliveryBoys } = useAdminDeliveryBoy();

  const AdminDeliveryBoys = deliveryBoys;

  console.log("Delivery Boys in Add Delivery Boy Page:", deliveryBoys);

  const handleAddDeliveryBoy = async (data: CreateDeliveryBoyPayload) => {
    const payload = { ...data };

    // // Clean empty optional fields
    // if (payload.phoneNumber === "") delete payload.phoneNumber;
    // if (payload.address === "") delete payload.address;
    // if (payload.vehicleNumber === "") delete payload.vehicleNumber;
    // if (payload.email === "") delete payload.email;

    await createDeliveryBoy(payload);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <AddDeliveryBoyForm />
    </div>
  );
};

export default AddDeliveryBoyPage;
