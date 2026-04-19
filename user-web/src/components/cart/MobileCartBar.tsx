"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks";
import { useCart } from "@/hooks/entities/useCart";

export function MobileCartBar() {
  const { user } = useAuth();
  const { totalItems } = useCart();

  if (!totalItems || totalItems <= 0) return null;

  return (
    <div className="fixed left-3 right-3 bottom-16 sm:bottom-4 z-[96] sm:z-[90] sm:hidden">
      <Link
        href="/cart"
        className="flex items-center justify-between rounded-xl bg-green-600 text-white px-4 py-3 shadow-lg ring-1 ring-black/5"
      >
        <div className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-5 w-5" />
          <span>
            {totalItems} item{totalItems > 1 ? "s" : ""} in cart
          </span>
        </div>
        <span className="text-sm font-bold bg-white/15 px-3 py-1 rounded-lg">
          View Cart
        </span>
      </Link>
    </div>
  );
}

export default MobileCartBar;
