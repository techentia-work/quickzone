"use client";
import React, { useContext } from "react";
import { useAuth, useUserNotification } from "@/hooks";
import { GlobalModalContext } from "../providers/modals/modals.provider";
import Image from "next/image";
import { User, ShoppingCart, ChevronDown, Wallet2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/entities/useCart";
import Link from "next/link";
import { UserNotificationBell } from "../notificationBell/UserNotificationBell";
import { SearchBar } from "../search/SearchBar";
import { useAddress } from "@/hooks/entities/useAddress";
import { useAppSelector } from "@/lib/store";
import { useOrder } from "@/hooks/entities/useOrder";

export default function Navbar() {
  const { isAuthenticated,user } = useAuth();

  const modals = useContext(GlobalModalContext);
  const { loginModal, registerModal, locationModal } = modals || {};

  const router = useRouter();

  const { totalItems } = useCart();

  const { defaultAddress } = useAddress();

  const { } = useOrder();



  const settings = useAppSelector((state) => state.websiteSettings.settings);
  const { } = useUserNotification();

  return (
    <header className="fixed w-full top-0 left-0 right-0 z-[100]">
      <nav
        style={{
          backgroundImage: `linear-gradient(to bottom, ${settings?.primaryColor}CC, ${settings?.primaryColor}88)`,
        }}
        className={`backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm border-b border-gray-100`}
      >
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16 md:h-20">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-3">
                <div className="ml-0 w-20 h-20 md:w-27 md:h-27 relative rounded-lg overflow-hidden transition-transform hover:scale-105">
                  <Image
                    src={settings?.siteLogo || "/logo.png"} // ✅ Dynamic logo from settings
                    fill
                    priority
                    alt={settings?.siteName || "Logo"}
                    className="object-contain" // ✅ Changed to object-contain for better logo display
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-green-600 hidden sm:block truncate">

                </span>
              </Link>
            </div>

            {/* Vertical divider after Quickzon */}
            <div className="hidden md:block h-16 md:h-20 w-px bg-gray-200 backdrop-blur-xl bg-white/30"></div>


            {user && (
              <div className="flex flex-col">
                <button
                  onClick={locationModal.openModal}
                  className="hidde flex items-center  text-sm font-semibold text-gray-800 hover:text-green-700"
                >
                  <span>Location</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <p className="text-sm text-green-700 line-clamp-1 max-w-32">
                  {defaultAddress
                    ? defaultAddress.googleLocation || defaultAddress.addressLine2 || "No address"
                    : "No address"}
                </p>
              </div>
            )}

            {/* Desktop search */}
            <div className="hidden md:block flex-1">
              <SearchBar />
            </div>

            {/* Vertical divider after search */}
            <div className="hidden md:block h-16 md:h-20 w-px bg-gray-200 backdrop-blur-xl bg-white/30"></div>

            {/* Right controls */}
            <div className="flex gap-2 md:gap-3 items-center ml-auto">
              {user?.email ? (
                <>
                  <div className="hidden sm:flex">
                    <UserNotificationBell />
                  </div>
                  <button
                    onClick={() => router.push("/profile/wallet")}
                    className="relative cursor-pointer p-2.5 md:p-3 rounded-full text-gray-800 hover:text-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Wallet2Icon size={20} className="md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={() => router.push("/cart")}
                    className="relative p-2.5 md:p-3 cursor-pointer rounded-full bg-green-600 hover:bg-green-600 text-white hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart size={20} className="md:w-6 md:h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="p-2.5 md:p-3 rounded-full cursor-pointer bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    aria-label="User Profile"
                  >
                    <User size={20} className="md:w-6 md:h-6" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={loginModal?.openModal}
                    className="px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Login
                  </button>
                  <button
                    onClick={registerModal?.openModal}
                    className="px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile search below header */}
      <div className="md:hidden bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 pb-2 pt-2">
          <SearchBar size="sm" />
        </div>
      </div>
    </header>
  );
}