import React from "react";
import TrackOrderPage from "../_components/orderTrackPage";

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <TrackOrderPage id={params.id} />
    </div>
  );
};

export default page;
