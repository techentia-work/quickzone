"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, ShoppingBag, Wallet, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useUserProfile } from "@/hooks";

const navLinks = [
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Address", icon: MapPin, href: "/profile/address" },
  { name: "Orders", icon: ShoppingBag, href: "/profile/orders" },
  { name: "Wallet", icon: Wallet, href: "/profile/wallet" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();

  return (
    <aside className="hidden lg:block fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 border-r border-gray-100 bg-gradient-to-b from-yellow-50 to-green-50 shadow-md">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-2 py-3 border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-500  shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-600 shadow-md">
              <User size={26} />
            </div>
            <div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <h2 className="text-xl font-bold text-white">Loading...</h2>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white">
                  {profile?.firstName || "User"}
                </h2>
              )}
              <p className="text-yellow-100 text-xs mt-0.5">
                Manage your profile
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                    : "text-gray-700 hover:bg-yellow-50 hover:text-green-700"
                )}
              >
                <Icon
                  size={20}
                  className={clsx(
                    "transition-colors",
                    isActive ? "text-green-600" : "text-gray-500"
                  )}
                />
                <span className={isActive ? "font-semibold" : ""}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400 text-center">
            © 2025 QuickZone
          </p>
        </div>
      </div>
    </aside>
  );
}