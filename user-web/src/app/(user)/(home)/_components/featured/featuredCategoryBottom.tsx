"use client";

import Image from "next/image";
import { useFeatured } from "@/hooks/entities/useFeatured";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function FeaturedCategoryBottom() {
  const { data: featured, isLoading, error } = useFeatured({ queryParams: "position=BOTTOM" });
  const router = useRouter();

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load bottom featured items.
      </div>
    );

  if (!featured?.length)
    return null

  let sortedFeatured = [...featured].sort(
    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
  );

  sortedFeatured = sortedFeatured.filter(
    (feature: any) => feature.mapType === "CATEGORY"
  );

  return (
    <section className="py-5 bg-white">
      <div className="mx-auto px-3 md:px-6 lg:px-8 space-y-5">
        {sortedFeatured.map((feature: any) => {
          const bannerUrl = feature.imageUrl || "/placeholder.png";

          return (
            <div
              key={feature._id}
              className="overflow-hidden rounded-xl shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative w-full h-32 sm:h-40 md:h-48">
                <Image
                  src={bannerUrl}
                  alt={feature.title || "Featured Banner"}
                  fill
                  className="object-cover"
                />
              </div>

              {feature.mappings?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-4 bg-white">
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
                        : "";

                    return (
                      <div
                        key={idx}
                        onClick={() => link && router.push(link)}
                        className="group flex flex-col items-center bg-white rounded-xl p-3 hover:bg-white border border-gray-100 hover:border-green-200 transition cursor-pointer hover:shadow-sm"
                      >
                        <div className="relative w-20 h-20 mb-2">
                          <Image
                            src={imageUrl}
                            alt={product.name || "Product"}
                            fill
                            unoptimized
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="text-xs font-medium text-gray-800 text-center line-clamp-2">
                          {product.name || "Untitled"}
                        </h3>
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