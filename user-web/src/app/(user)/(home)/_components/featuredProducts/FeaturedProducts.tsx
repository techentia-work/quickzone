"use client";

import { useProducts } from "@/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const FeaturedProducts = () => {
  const { products, isLoading, error } = useProducts("");

  const router = useRouter();

  // Filter products where featured === true
  const popularOnes = products?.filter((p: any) => p.featured === true) || [];

  if (isLoading) return <div className="py-10 text-center">Loading...</div>;
  if (error)
    return (
      <div className="py-10 text-center text-red-500">
        Error loading products.
      </div>
    );

  if (popularOnes.length === 0)
    return (
      <p className="py-10 text-center text-gray-500">
        No popular products found.
      </p>
    );

  return (
    <section className="py-6 bg-white">
      <div className="mx-auto px-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Featured Products
        </h2>

        <div className="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory">
          {popularOnes.map((p: any) => {
            const imageUrl =
              p.mainImage ||
              p.thumbnail ||
              (Array.isArray(p.images) ? p.images[0] : null) ||
              "/placeholder.png";

            const link = `/product/${p.slug}`;

            return (
              <div
                key={p._id}
                onClick={() => router.push(link)}
                className="flex-shrink-0 w-36 sm:w-40 snap-center bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition cursor-pointer"
              >
                <div className="relative w-full h-28 mb-2">
                  <Image
                    src={imageUrl}
                    alt={p.name || "Product"}
                    fill
                    unoptimized
                    className="object-contain rounded-lg"
                  />
                </div>

                <h3 className="text-xs font-medium text-gray-800 line-clamp-2 text-center">
                  {p.name}
                </h3>

                <div className="text-center mt-1">
                  {p.variants[0].discountedPrice ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-semibold text-green-600">
                          ₹{p.variants[0].discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{p.variants[0].mrp || p.price}
                        </span>
                      </div>
                      {(p.variants[0].discountPercent ?? 0) > 0 && (
                        <span className="text-[11px] font-medium text-red-500">
                          {p.variants[0].discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[13px] font-semibold text-gray-800">
                      ₹{p.variants[0].price?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
