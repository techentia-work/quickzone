"use client";
import React from "react";
import { useParams } from "next/navigation";
import { EditSliderForm } from "../../_components/EditSliderForm";

const EditBannerPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditSliderForm sliderId={params.id} />
    </div>
  );
};

export default EditBannerPage;
