"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useBanner } from "@/hooks/entities/useBanner";
import Link from "next/link";

export function BannerBottom() {
  const {
    data: banners,
    isLoading,
    error,
  } = useBanner({ queryParams: "position=BOTTOM" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedBanners = banners
    ? [...banners].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  useEffect(() => {
    if (!sortedBanners.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sortedBanners.length]);

  const goToPrevious = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? sortedBanners.length - 1 : prev - 1
    );
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % sortedBanners.length);

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 py-20 bg-white">
        Failed to load bottom banners.
      </div>
    );

  if (!sortedBanners.length)
    return (
      <div className="text-center text-gray-500 py-20 bg-white">
        No bottom banners available.
      </div>
    );

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white group">
      <div className=" mx-auto px-3 md:px-6 lg:px-8 py-4">
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {sortedBanners.map((banner: any) => {
              const imageSrc = banner.imageUrl || "/placeholder.png";
              const heightClass =
                "h-[160px] sm:h-[220px] md:h-[280px] lg:h-[320px]";
              return (
                <div key={banner._id} className="flex-shrink-0 w-full">
                  <div className={`relative w-full ${heightClass}`}>
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
                          className="object-cover object-center"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          {sortedBanners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {sortedBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {sortedBanners.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? "w-5 h-1.5 bg-green-600"
                      : "w-1.5 h-1.5 bg-white/80 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}