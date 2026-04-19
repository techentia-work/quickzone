// app/_components/CategoryCarousel.tsx
"use client";

import { useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useCategory } from "@/hooks";
import { CategoryType, TypeOfCategory } from "@/lib/types";
import { useAppSelector } from "@/lib/store";

interface CategoryCardProps {
  category: CategoryType;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="shrink-0 flex flex-col items-center">
      <Link href={`/categories/${category.slug}`} className="group">
        <div className="relative w-[90px] h-20 sm:w-20 sm:h-20 md:w-30 md:h-30 rounded-2xl overflow-hidden transition-all duration-300 ">
          <Image
            src={category.thumbnail as string}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300 p-2"
          />
        </div>
      </Link>

      <p className="text-[10px] sm:text-sm md:text-base font-semibold text-black text-center line-clamp-2 hover:text-green-600 transition-colors max-w-[70px] sm:max-w-[60px] md:max-w-[120px]">
        {category.name}
      </p>
    </div>
  );
}

export function CategoryCarousel() {
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  const { data: masterCategories, isLoading } = useCategory({
    type: TypeOfCategory.MASTER,
    tree: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 4,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const allChildCategories = useMemo(() => {
    if (!masterCategories || masterCategories.length === 0) return [];

    let superCategories = [];

    if (!selectedMasterCategoryId) {
      superCategories = masterCategories.flatMap((master: any) => master.children || []);
    } else {
      const selectedMaster = masterCategories.find(
        (master: any) => master._id === selectedMasterCategoryId
      );
      superCategories = selectedMaster?.children || [];
    }

    return superCategories.flatMap((superCat: any) => superCat.children || []).slice(0, 20);
  }, [masterCategories, selectedMasterCategoryId]);

  if (isLoading) {
    return (
      <div className="animate-pulse py-2">
        <div className="flex gap-4 md:gap-6">
          {[...Array(8)].map((_, j) => (
            <div key={j} className="shrink-0 w-24 md:w-28">
              <div className="aspect-square bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl mb-3" />
              <div className="h-4 bg-linear-to-br from-gray-200 to-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (allChildCategories.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Check back later for new categories
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
     <div className="flex justify-end mb-2 px-2">
  <Link
    href="/categories"
    className="text-sm text-green-600 font-medium hover:underline"
  >
    View All
  </Link>
</div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
          {allChildCategories.map((category: any) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
