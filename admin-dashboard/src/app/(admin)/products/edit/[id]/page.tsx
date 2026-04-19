"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EditProductForm } from "../../_components/EditProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-6xl mx-auto py-10">
      <EditProductForm productId={id} />
    </div>
  );
}
