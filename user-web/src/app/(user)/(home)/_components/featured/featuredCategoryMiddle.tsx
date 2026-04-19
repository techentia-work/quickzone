"use client";

import Image from "next/image";
import { useFeatured } from "@/hooks/entities/useFeatured";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function FeaturedCategoryMiddle() {
  const {
    data: featured,
    isLoading,
    error,
  } = useFeatured({ queryParams: "position=MIDDLE" });
  const router = useRouter();

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load middle featured items.
      </div>
    );

  if (!featured?.length) return null;

  let sortedFeatured = [...featured].sort(
    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
  );

   sortedFeatured = sortedFeatured.filter(
    (feature: any) => feature.mapType === "CATEGORY"
  );

  return (
    <section className="py-5">
      <div className="mx-auto px-3 md:px-6 lg:px-8 space-y-5">
        {sortedFeatured.map((feature: any) => {
          const bannerUrl = feature.imageUrl || "/placeholder.png";

          return (
            <div
              key={feature._id}
              className="relative overflow-hidden rounded-xl shadow-sm transition-shadow duration-300"
            >
              {/* Banner - Full width background */}
              <div className="absolute inset-0">
                <Image
                  src={bannerUrl}
                  alt={feature.title || "Featured Banner"}
                  width={1600}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Products - Scrollable from right side */}
              {feature.mappings?.length > 0 && (
                <div className="relative z-10 overflow-x-auto flex gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 lg:p-10 scrollbar-hide justify-end">
                  {/* Spacer for proper alignment */}
                  <div className="flex-shrink-0 w-0" />
                  
                  {feature.mappings.map((map: any, idx: number) => {
                    const product = map.data;
                    if (!product) return null;

                    const imageUrl =
                      product.mainImage ||
                      product.thumbnail ||
                      product.imageUrl ||
                      (Array.isArray(product.images)
                        ? product.images[0]
                        : null) ||
                      "/placeholder.png";

                    const link =
                      map?.type === "SUBCATEGORY" && feature.category
                        ? `/categories/${feature.category.slug}?status=all&categoryId=${product._id}`
                        : `/product/${product.slug}`;

                    return (
                      <div
                        key={idx}
                        onClick={() => link && router.push(link)}
                        className="group flex-shrink-0 w-32 sm:w-36 md:w-40 flex flex-col items-center bg-white/95 backdrop-blur-sm rounded-lg p-3 sm:p-4 transition cursor-pointer shadow-md hover:shadow-xl"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 sm:mb-3">
                          <Image
                            src={imageUrl}
                            alt={product.name || "Product"}
                            fill
                            unoptimized
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Product Name */}
                        <h3 className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-2 mb-1 sm:mb-2">
                          {product.name || "Untitled"}
                        </h3>

                        {/* Pricing Section */}
                        {map?.type === "PRODUCT" && (
                          <div className="mt-auto text-center">
                            {product.variants[0].discountedPrice ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs sm:text-sm font-bold text-gray-800">
                                    ₹
                                    {product.variants[0].discountedPrice.toFixed(
                                      2
                                    )}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-600 line-through">
                                    ₹{product.variants[0].mrp || product.variants[0].price}
                                  </span>
                                </div>
                                {product.variants[0].discountPercent && (
                                  <span className="text-[10px] sm:text-xs font-semibold text-red-700">
                                    {product.variants[0].discountPercent}% OFF
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-gray-800">
                                ₹{product.variants[0].price?.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}