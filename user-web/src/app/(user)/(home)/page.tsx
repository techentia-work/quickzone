// app/(user)/(home)/page.tsx
"use client";

import {
  BannerMiddle,
  BannerTop,
  CategoryCarousel,
  SubNavbar,
} from "./_components";
import { WhyQuickZone } from "./_components/extra/WhyQuickZone";

import { SliderSections } from "./_components/slider/sliderCategory";
import { FeaturedCategoryTop } from "./_components/featured/featuredCategoryTop";
import { FeaturedCategoryMiddle } from "./_components/featured/featuredCategoryMiddle";
import { FeaturedCategoryBottom } from "./_components/featured/featuredCategoryBottom";
import PopularProducts from "./_components/popularProducts/PopularProducts";
import CategoryProducts from "./_components/products/products";
import FeaturedProducts from "./_components/featuredProducts/FeaturedProducts";
import { FeaturedProductTop } from "./_components/featured/featuredProdcutTop";
import { FeaturedProductBottom } from "./_components/featured/featuredProductBottom";
import { FeaturedProductMiddle } from "./_components/featured/featuredProductMiddle";
import ShowCaseProducts from "./_components/showCaseProducts/showCaseProduct";
import { Footer } from "@/components";
import MobileAppPopup from "./MobileAppPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* === Sticky Sub Navigation === */}
      <div className="sticky top-28 md:top-20 z-40 bg-white shadow-sm">
        <SubNavbar />
      </div>

      <section className="bg-white pt-1">
        <BannerTop />
      </section>

      <div className=" mx-auto w-full px-3 md:px-6 lg:px-8 py-3">
        <CategoryCarousel />
      </div>

      <section className="bg-white border-t border-gray-100">
        <FeaturedCategoryTop />
      </section>
      <section className="bg-white">
        <ShowCaseProducts type="PREMIUM" />
      </section>
      <section className="bg-white border-t border-gray-100">
        <FeaturedProductTop />
      </section>

      <section className="bg-white">
        <SliderSections position="TOP" />
      </section>

      <section className="bg-white">
        <ShowCaseProducts type="BEST_DEALS" />
      </section>


      <section className="bg-white border-t border-gray-100">
        <FeaturedProductMiddle />
      </section>

      <section className="bg-white">
        <ShowCaseProducts type="NEW_IN_STORE" />
      </section>

      <section className="bg-white border-t border-gray-100">
        <FeaturedProductBottom />
      </section>

      
      <section className="bg-white border-t border-gray-100">
        <CategoryProducts />
      </section>
       

      <section className="bg-white border-t border-gray-100">
        <Footer />
      </section>

      <MobileAppPopup/>
    </main>
  );
}
