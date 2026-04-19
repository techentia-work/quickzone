"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MobileAppPopup() {
  const [open, setOpen] = useState(false);

  // Always check screen width — not just first time
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 550) {
        setOpen(true);    // show ALWAYS below 550
      } else {
        setOpen(false);   // hide ALWAYS above 550
      }
    }

    handleResize(); // run on first load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end justify-center">
      <div className="bg-yellow-50 w-full max-w-[500px] rounded-t-3xl shadow-xl pb-6 animate-slideUp">

        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full text-xl"
        >
          ✕
        </button>

        <div className="text-center ">
          <Image
            src="/logo.png"
            alt="logo"
            width={130}
            height={130}
            className="mx-auto"
          />

          <p className="text-center text-gray-700 text-lg font-semibold">
            Get the app for
          </p>

          <p className="tracking-[4px] text-gray-400 text-xs mb-3">
            INCLUDING MORE ITEMS
          </p>

          <h2 className="text-2xl font-bold mb-4">Free Delivery</h2>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg">
            Download the app now
          </button>

          <button
            className="w-full mt-3 text-green-700 font-medium"
            onClick={() => setOpen(false)}
          >
            Continue on web
          </button>
        </div>
      </div>
    </div>
  );
}
