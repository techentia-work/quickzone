import React from "react";

export default function SubNavLoader() {
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:gap-4 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl animate-pulse flex-shrink-0"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
