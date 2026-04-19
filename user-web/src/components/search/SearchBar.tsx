"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useProducts, useDebouncedThrottle } from "@/hooks";
import { useRouter } from "next/navigation";

type Props = {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function SearchBar({
  placeholder = "Search for fruits, snacks, etc.",
  className = "",
  size = "md",
}: Props) {
  const [query, setQuery] = useState("");
  const padding =
    size === "sm" ? "py-2 px-3" : size === "lg" ? "py-3 px-4" : "py-2.5 px-4";
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm";

  const debouncedQuery = useDebouncedThrottle(query, 400);
  const { products, isLoading, error, refetch } = useProducts(
    `search=${debouncedQuery}`,
    { enabled: false }
  );

  useEffect(() => {
    if (debouncedQuery.trim()) refetch();
  }, [debouncedQuery, refetch]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) refetch();
  }

  const router = useRouter()

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={onSubmit} role="search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${padding} ${text} w-full pl-9 rounded-xl bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-green-300 outline-none transition-all`}
        />
      </form>

      {debouncedQuery && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl border border-gray-100 z-50 max-h-64 overflow-auto">
          {isLoading && (
            <p className="p-3 text-sm text-gray-500 text-center">Searching...</p>
          )}
          {error && (
            <p className="p-3 text-sm text-red-500 text-center">
              Failed to fetch products
            </p>
          )}
          {!isLoading && products?.length === 0 && (
            <p className="p-3 text-sm text-gray-500 text-center">
              No products found
            </p>
          )}
          {!isLoading &&
            products?.map((product: any) => (
              <div
                key={product._id}
                onClick={() => {
                  router.push(`/product/${product.slug}`);
                  setQuery("");
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer transition flex gap-1"
              >
                <img
                  src={product.mainImage || "/placeholder.png"}
                  alt={product.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <p className="text-sm font-medium text-gray-800">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;