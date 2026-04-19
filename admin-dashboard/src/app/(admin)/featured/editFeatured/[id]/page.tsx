"use client";
import React from "react";
import { useParams } from "next/navigation";
import { EditFeaturedForm } from "../../_components/EditFeaturedForm";

const EditBannerPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditFeaturedForm featuredId={params.id} />
    </div>
  );
};

export default EditBannerPage;
