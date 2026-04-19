"use client";

import React from "react";
import { EditBrandForm } from "../../_components";
import { useParams } from "next/navigation";

const EditBrandPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditBrandForm brandId={params.id} />
    </div>
  );
};

export default EditBrandPage;
