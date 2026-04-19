// LocationModal.tsx – No Google Maps dependency; uses Leaflet + OpenStreetMap
"use client";

import React, { useEffect, useState } from "react";
import { LocationAddressStepType, CreateAddressPayload } from "@/lib/types";
import { defaultAddressForm } from "@/lib/consts";
import BaseModal from "../BaseModal";
import LocationListStep from "./_components/LocationListStep";
import LocationMapStep from "./_components/LocationMapStep";
import LocationFormStep from "./_components/LocationFormStep";

export default function LocationModal({
  isOpen,
  onClose,
  Step,
}: {
  isOpen: boolean;
  onClose: () => void;
  Step: LocationAddressStepType;
}) {
  const [step, setStep] = useState<LocationAddressStepType>(Step);
  const [form, setForm] = useState<CreateAddressPayload>(defaultAddressForm);

  useEffect(() => {
    if (isOpen) setStep("list");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      closeModal={onClose}
      className="p-0 bg-white max-w-lg w-[95%] h-[90vh] flex flex-col"
    >
      {/* Scrollable content wrapper */}
      <div className="flex-1 overflow-y-auto">
        {step === "list" && (
          <LocationListStep
            onClose={onClose}
            form={form}
            setForm={setForm}
            setStep={setStep}
          />
        )}
        {step === "map" && (
          <LocationMapStep
            onClose={onClose}
            form={form}
            setForm={setForm}
            setStep={setStep}
          />
        )}
        {step === "form" && (
          <LocationFormStep
            onClose={onClose}
            form={form}
            setForm={setForm}
            Step={Step}
            setStep={setStep}
          />
        )}
      </div>
    </BaseModal>
  );
}