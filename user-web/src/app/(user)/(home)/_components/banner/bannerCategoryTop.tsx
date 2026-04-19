"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useBanner } from "@/hooks/entities/useBanner";
import { useAppSelector } from "@/lib/store";
import Link from "next/link";

export function BannerTop() {
  const {
    data: banners,
    isLoading,
    error,
  } = useBanner({ queryParams: "position=TOP" });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get selected master category from Redux store
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  // Filter and sort banners based on selected master category
  const filteredBanners = useMemo(() => {
    if (!banners) return [];

    let filtered = [];

    if (!selectedMasterCategoryId) {
      // When "All" is selected, show only banners with null masterCategory
      filtered = banners.filter((banner: any) => !banner.masterCategory);
    } else {
      // When specific master category is selected, show only its banners
      filtered = banners.filter((banner: any) => {
        return banner.masterCategory?._id === selectedMasterCategoryId;
      });
    }

    // Sort by order field
    return [...filtered].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [banners, selectedMasterCategoryId]);

  // Reset current index when filtered banners change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredBanners.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!filteredBanners.length || filteredBanners.length === 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredBanners.length]);

  // Navigation Handlers
  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredBanners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
  };

  // Helper function to generate banner link
  const getBannerLink = (banner: any) => {
    // If isClickable is true, don't make it clickable
    if (banner.isClickable) {
      return null;
    }

    if (!banner.category?.slug) {
      return null;
    }

    const subcategoryId = banner.subcategory?.[0]?._id || "";
    const queryParams = `?status=all&categoryId=${subcategoryId}&page=1&limit=10&sortBy=createdAt&sortOrder=desc`;

    // Always use same URL structure - just category slug
    return `/categories/${banner.category.slug}${queryParams}`;
  };

  // Loading State
  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20 bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading banners...</p>
        </div>
      </div>
    );

  // Error State
  if (error)
    return (
      <div className="text-center text-gray-500 py-20 bg-white">
        <p className="text-lg font-medium text-red-600">
          Failed to load banners.
        </p>
        <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
      </div>
    );

  // Empty State - don't show anything if no banners
  if (!filteredBanners.length) return null;

  // Main Slider
  return (
    <section className="relative w-full bg-white">
      <div className="mx-auto px-3 md:px-6 lg:px-8 py-4">
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {filteredBanners.map((banner: any) => {
              const heightClass =
                "h-[160px] sm:h-[220px] md:h-[280px] lg:h-[275px]";
              const imageSrc = banner.imageUrl || "/placeholder.png";
              const link = getBannerLink(banner);

              return (
                <div key={banner._id} className="flex-shrink-0 w-full">
                  <div className={`relative w-full ${heightClass}`}>
                    {link ? (
                      <Link href={link} className="block w-full h-full">
                        <Image
                          src={imageSrc}
                          alt={banner.title || "Banner"}
                          fill
                          priority
                          className="object-cover object-center"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={banner.title || "Banner"}
                        fill
                        priority
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          {filteredBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {filteredBanners.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? "w-5 h-1.5 bg-green-600"
                      : "w-1.5 h-1.5 bg-white/80 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}