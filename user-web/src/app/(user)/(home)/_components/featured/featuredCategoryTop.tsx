"use client";

import Image from "next/image";
import { useFeatured } from "@/hooks/entities/useFeatured";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { useMemo } from "react";

export function FeaturedCategoryTop() {
  const { data: featured, isLoading, error } = useFeatured({ queryParams: "position=TOP" });
  const router = useRouter();

  const { selectedMasterCategoryId } = useAppSelector((state) => state.category);

  // Filter and sort featured items based on selected master category
  const filteredFeatured = useMemo(() => {
    if (!featured) return [];

    let filtered: any[] = [];

    if (!selectedMasterCategoryId) {
      filtered = featured.filter((item: any) => !item.masterCategory);
    } else {
      filtered = featured.filter((item: any) => item.masterCategory?._id === selectedMasterCategoryId);
    }

    // Only SUBCATEGORY type
    filtered = filtered.filter((feature: any) => feature.mapType === "SUBCATEGORY");

    return [...filtered].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [featured, selectedMasterCategoryId]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load top featured items.
      </div>
    );

  if (!filteredFeatured?.length) return null;

  return (
    <section className="py-5 bg-white">
      <div className="mx-auto px-3 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFeatured.slice(0, 2).map((feature: any) => {
          const bannerUrl = feature.imageUrl || "/placeholder.png";
          const bgColor = feature.color || "#ffffff";

          return (
            <div
              key={feature._id}
              className="overflow-hidden rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300"
              style={{ backgroundColor: bgColor }}
            >
              {/* Banner */}
              <div className="relative w-full h-40 sm:h-48 md:h-56">
                <Image src={bannerUrl} alt={feature.title || "Featured Banner"} fill />
              </div>

              {/* Horizontal Slider */}
              {feature.mappings?.length > 0 && (
                <div className="relative">
                  {/* Left Scroll Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = document.getElementById(`category-scroll-${feature._id}`);
                      container?.scrollBy({ left: -300, behavior: "smooth" });
                    }}
                    id={`category-left-btn-${feature._id}`}
                    className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-1 text-white hover:text-gray-900 w-9 h-9 flex items-center justify-center rounded-full shadow-md hover:shadow-lg z-20 transition-all duration-200 opacity-0 pointer-events-none border border-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Right Scroll Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = document.getElementById(`category-scroll-${feature._id}`);
                      container?.scrollBy({ left: 300, behavior: "smooth" });
                    }}
                    id={`category-right-btn-${feature._id}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-1 bg-white/95 text-gray-700 hover:bg-white hover:text-gray-900 w-9 h-9 flex items-center justify-center rounded-full shadow-md hover:shadow-lg z-20 transition-all duration-200 border"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Scroll Container */}
                  <div
                    id={`category-scroll-${feature._id}`}
                    className="overflow-x-auto flex gap-3 px-3 py-4 scrollbar-hide scroll-smooth"                    onScroll={(e) => {
                      const container = e.currentTarget;
                      const leftBtn = document.getElementById(`category-left-btn-${feature._id}`);
                      const rightBtn = document.getElementById(`category-right-btn-${feature._id}`);

                      if (leftBtn && rightBtn) {
                        if (container.scrollLeft > 10) {
                          leftBtn.classList.remove("opacity-0", "pointer-events-none");
                          leftBtn.classList.add("opacity-100", "pointer-events-auto");
                        } else {
                          leftBtn.classList.add("opacity-0", "pointer-events-none");
                          leftBtn.classList.remove("opacity-100", "pointer-events-auto");
                        }

                        const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
                        if (isAtEnd) {
                          rightBtn.classList.add("opacity-0", "pointer-events-none");
                          rightBtn.classList.remove("opacity-100", "pointer-events-auto");
                        } else {
                          rightBtn.classList.remove("opacity-0", "pointer-events-none");
                          rightBtn.classList.add("opacity-100", "pointer-events-auto");
                        }
                      }
                    }}
                  >
                    {feature.mappings.map((map: any, idx: number) => {
                      const product = map.data;
                      if (!product) return null;

                      const imageUrl =
                        product.mainImage ||
                        product.thumbnail ||
                        product.imageUrl ||
                        (Array.isArray(product.images) ? product.images[0] : null) ||
                        "/placeholder.png";

                      // Correct subcategory link: parent category slug + subcategory ID
                      const link =
                        map?.type === "SUBCATEGORY" && feature.category
                          ? `/categories/${feature.category.slug}?subcategory=${product._id}`
                          : `/product/${product.slug}`;

                      return (
                        <div
                          key={idx}
                          onClick={() => link && router.push(link)}
                          className="group shrink-0 w-20 sm:w-28 flex flex-col items-center transition cursor-pointer"                        >
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-1">
                            <Image
                              src={imageUrl}
                              alt={product.name || "Product"}
                              fill
                              unoptimized
                              className="object-contain group-hover:scale-105 transition-transform duration-300 rounded-full"
                            />
                          </div>

                          {map?.type === "PRODUCT" && (
                            <div className="mt-1 text-center">
                              {product.variants[0].discountedPrice ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[13px] font-semibold text-green-600">
                                      ₹{product.variants[0].discountedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-gray-400 line-through">
                                      ₹{product.variants[0].mrp || product.variants[0].price}
                                    </span>
                                  </div>
                                  {product.variants[0].discountPercent && (
                                    <span className="text-[11px] font-medium text-red-500">
                                      {product.variants[0].discountPercent}% OFF
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[13px] font-semibold text-gray-800">
                                  ₹{product.variants[0].price?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
