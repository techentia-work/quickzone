"use client";

import Image from "next/image";
import Link from "next/link";
import { useBanner } from "@/hooks/entities/useBanner";
import { Loader2 } from "lucide-react";

export function BannerMiddle() {
  const {
    data: banners,
    isLoading,
    error,
  } = useBanner({ queryParams: "position=MIDDLE" });

  // Sort banners by order
  const sortedBanners = banners
    ? [...banners].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16 bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 py-10 bg-white">
        Failed to load middle banners.
      </div>
    );

  if (!sortedBanners.length)
    return null

  return (
    <section className="w-full bg-white py-4 md:py-6">
      <div className=" mx-auto px-3 md:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
        {sortedBanners.map((banner: any) => {
          const imageSrc = banner.imageUrl || "/placeholder.png";
          const heightClass = "h-[160px] sm:h-[200px] md:h-[240px]";
          return (
            <div
              key={banner._id}
              className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {!banner.isClickable && banner.category?.slug ? (
                <Link
                  href={`/categories/${
                    banner.category.slug
                  }?status=all&categoryId=${
                    banner.subcategory?._id || ""
                  }&page=1&limit=10&sortBy=createdAt&sortOrder=desc`}
                  className="block w-full h-full"
                >
                  <Image
                    src={imageSrc}
                    alt={banner.title || "Banner"}
                    fill
                    className={`object-cover object-center ${heightClass}`}
                  />
                </Link>
              ) : (
                <Image
                  src={imageSrc}
                  alt={banner.title || "Banner"}
                  fill
                  className={`object-cover object-center ${heightClass}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}