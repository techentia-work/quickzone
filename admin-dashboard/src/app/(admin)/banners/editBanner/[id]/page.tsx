"use client";
import React from "react";
import { EditBannerForm } from "../../_components/EditBannerForm";
import { useParams } from "next/navigation";

const EditBannerPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditBannerForm bannerId={params.id} />
    </div>
  );
};

export default EditBannerPage;
