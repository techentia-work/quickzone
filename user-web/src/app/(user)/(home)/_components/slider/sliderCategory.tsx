"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useSlider } from "@/hooks/entities/useSlider";
import { useRef, useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/lib/store";

export function SliderSections({ position }: { position: "TOP" | "MIDDLE" | "BOTTOM" }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const {
    data: sliders = [],
    isLoading,
    error,
  } = useSlider({
    queryParams: `position=${position}`,
  });

  // Get selected master category from Redux store
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  // Filter and sort sliders based on selected master category
  const filteredSliders = useMemo(() => {
    if (!sliders) return [];

    let filtered = [];

    if (!selectedMasterCategoryId) {
      // When "All" is selected, show only sliders with null masterCategory
      filtered = sliders.filter((slider: any) => !slider.masterCategory);
    } else {
      // When specific master category is selected, show only its sliders
      filtered = sliders.filter((slider: any) => {
        return slider.masterCategory?._id === selectedMasterCategoryId;
      });
    }

    // Sort by order field
    return [...filtered].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [sliders, selectedMasterCategoryId]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [filteredSliders]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16 bg-white">
        <Loader2 className="w-7 h-7 animate-spin text-green-600" />
        <p className="ml-3 text-gray-700 text-sm font-medium">Loading sliders...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 bg-white text-red-600 font-medium">
        Failed to load slider
      </div>
    );

  // Don't show anything if no filtered sliders
  if (!filteredSliders.length) return null;

  return (
    <section className="py-6 bg-white">
      <div className="mx-auto px-3 md:px-6 lg:px-8">
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-opacity duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-opacity duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredSliders.map((item: any) => {
              // Use category slug for the link
              const categorySlug = item.category?.slug || "";
              const subcategoryId = item.subcategory?.[0]?._id || "";
              const link = `/categories/${categorySlug}?status=all&categoryId=${subcategoryId}&page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
              const imageUrl = item.imageUrl || "/placeholder.png";

              return (
                <Link href={link} key={item._id} className="shrink-0">
                  <div className="relative w-[280px] sm:w-[320px] md:w-[320px] h-[140px] sm:h-[170px] md:h-[220px] rounded-2xl overflow-hidden shadow-md group/item bg-white hover:shadow-lg border border-gray-100 hover:border-green-200 transition-all duration-300">
                    <Image
                      src={imageUrl}
                      alt={item.title || 'Slider Item'}
                      fill
                      className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                      priority
                    />
                  </div>
                </Link>

              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}