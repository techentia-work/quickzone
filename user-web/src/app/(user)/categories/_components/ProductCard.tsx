// app/categories/[slug]/_components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { ProductType } from "@/lib/types";
import { useState } from "react";

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const mainVariant = product.variants[0];
  const discountPercent = mainVariant?.discountPercent || 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.mainImage || product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountPercent}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart
              size={18}
              className={`transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.ratings && product.ratings.count > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  {product.ratings.avg.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.ratings.count.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl font-bold text-gray-900">
              ₹{mainVariant?.discountedPrice || mainVariant?.price}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{mainVariant?.mrp}
                </span>
                <span className="text-xs text-green-600 font-semibold">
                  Save ₹
                  {(mainVariant?.mrp || 0) -
                    (mainVariant?.discountedPrice || mainVariant?.price || 0)}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            // Add to cart logic
          }}
          className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
