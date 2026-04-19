"use client";
import React from "react";
import { AddFeaturedForm } from "../_components/AddFeaturedForm";

const AddFeaturedPage = () => {

  return (
    <div className="max-w-6xl mx-auto py-10">
      <AddFeaturedForm mapType="PRODUCT" />
    </div>
  );
};

export default AddFeaturedPage;
