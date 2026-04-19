"use client";

import React, { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/entities/useCart";
import { useShowcaseProduct } from "@/hooks/entities/useShowCaseProdcuts";
import { useAuth } from "@/hooks";
import { useAppSelector } from "@/lib/store";

// 🔒 ONLY ALLOWED SECTIONS
const ALLOWED_TYPES = ["NEW_IN_STORE", "PREMIUM", "BEST_DEAL"];

// 🔥 NORMALIZER
const normalize = (v?: string) =>
  v?.toUpperCase().replace(/\s+/g, "_");

const ShowCaseProducts = ({ type }: { type: string }) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { showcases, isLoadingShowcases } = useShowcaseProduct("limit=100");
  const { cart: userCart, addItem, updateQuantity, removeItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  // =====================
  // CART HELPERS
  // =====================
  const getCartQty = (productId: string) =>
    userCart?.cart?.items?.find(
      (i: any) => i?.productId?._id === productId
    )?.quantity ?? 0;

  const checkAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to add items to cart");
      return false;
    }
    return true;
  };

  // =====================
  // CART ACTIONS
  // =====================
  const handleAddToCart = async (productId: string, variantId: string) => {
    if (!checkAuth()) return;
    await addItem({ productId, variantId, quantity: 1 });
  };

  const updateCart = async (
    productId: string,
    change: number,
    variantId: string
  ) => {
    if (!checkAuth()) return;

    const current = getCartQty(productId);
    const next = current + change;

    if (next <= 0) {
      await removeItem({ variantId });
      return;
    }

    if (next > 5) {
      toast.error("Maximum 5 items allowed");
      await updateQuantity({ productId, variantId, quantity: 5 });
      return;
    }

    await updateQuantity({ productId, variantId, quantity: next });
  };

  // =====================
  // 🔥 FIXED PRODUCT FILTER
  // =====================
    const products = useMemo(() => {
    if (!Array.isArray(showcases)) return [];

    const wantedType = normalize(type);
    if (!wantedType || !ALLOWED_TYPES.includes(wantedType)) return [];

    // Filter showcases by type
    const filteredShowcases = showcases.filter((s: any) => {
      return (
        normalize(s.showcaseType) === wantedType &&
        s.isActive &&
        !s.isDeleted &&
        Array.isArray(s.products) &&
        s.products.length > 0
      );
    });

    // If no master category is selected, return all products
    if (!selectedMasterCategoryId) {
      return filteredShowcases.flatMap((s: any) => s.products);
    }

    // Filter by showcase's master category
    return filteredShowcases
      .filter((s: any) => s.masterCategory?._id === selectedMasterCategoryId)
      .flatMap((s: any) => s.products);
  }, [showcases, type, selectedMasterCategoryId]);

  if (isLoadingShowcases) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  if (products.length === 0) return null;

  const sectionTitle =
    normalize(type) === "NEW_IN_STORE"
      ? "New In Store"
      : normalize(type) === "PREMIUM"
      ? "Premium"
      : "Best Deals";

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });

  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  // =====================
  // RENDER
  // =====================
  return (
    <section className="py-6 bg-white relative">
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">{sectionTitle}</h2>

        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-3 shadow rounded-full z-10 hover:bg-gray-50"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-3 shadow rounded-full z-10 hover:bg-gray-50"
        >
          <ChevronRight />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
        >
          {products.map((prod: any) => {
            const variant = prod?.variants?.[0];
            if (!variant) return null;

            const price = variant.discountedPrice ?? variant.price ?? 0;
            const mrp = variant.mrp ?? variant.price ?? 0;
            const discount =
              mrp > price && price > 0
                ? Math.round(((mrp - price) / mrp) * 100)
                : 0;

            const inCart = getCartQty(prod._id);

            return (
              <div
                key={prod._id}
                className="group w-46 sm:w-40 flex-shrink-0 snap-center border rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow bg-white"
                onClick={() => router.push(`/product/${prod.slug}`)}
              >
                {discount > 0 && (
                  <span className="inline-block text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded mb-2">
                    {discount}% OFF
                  </span>
                )}

                <div className="relative h-30">
                  <Image
                    src={
                      prod.mainImage ||
                      prod.thumbnail ||
                      prod.images?.[0] ||
                      "/placeholder.png"
                    }
                    alt={prod.name || "Product"}
                    fill
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <p className="text-sm text-center font-medium line-clamp-2 min-h-[25px] ">
                  {prod.name}
                </p>

                {/* Weight/Measurement */}
                {Boolean(variant.measurement) && (
                  <p className="text-[12px] text-gray-600 text-center ">
                    {variant.measurement} {variant.measurementUnit || "gm"}
                  </p>
                )}

                <div className="text-center mb-2">
                  {price !== mrp && mrp > 0 ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-bold text-green-700">₹{price}</span>
                      <span className="text-xs line-through text-gray-500">
                        ₹{mrp}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-800">₹{price}</span>
                  )}
                </div>

                {inCart > 0 ? (
                  <div
                    className="flex justify-between items-center bg-green-600 text-white rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => updateCart(prod._id, -1, variant._id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-green-700"
                    >
                      –
                    </button>
                    <span className="text-xs font-medium">{inCart}</span>
                    <button
                      onClick={() => updateCart(prod._id, 1, variant._id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-green-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(prod._id, variant._id);
                    }}
                    className="w-full bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShowCaseProducts;