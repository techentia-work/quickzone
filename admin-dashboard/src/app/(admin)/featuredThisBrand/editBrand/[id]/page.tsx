"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EditFeaturedWeekBrandForm } from "../../_components";

const EditFeaturedWeekBrandPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditFeaturedWeekBrandForm id={params.id} />
    </div>
  );
};

export default EditFeaturedWeekBrandPage;
