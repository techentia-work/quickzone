"use client";
import { Navbar, Toaster } from "@/components";
import MobileBottomNav from "@/components/navbar/MobileBottomNav";
import MobileCartBar from "@/components/cart/MobileCartBar";
import { useAuth } from "@/hooks";

export default function UserLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <Toaster />
      <div className={`flex flex-col min-h-screen transition-all duration-300`}>
        <Navbar />
        {/*offset for fixed header: header (64px) + mobile search (approx 56px) on small screens*/}
        <main className="max-w-7xl w-full mx-auto flex-1 pt-[112px] md:pt-[80px] pb-24 sm:pb-0 bg-white px-4 sm:px-6">
          {children}
        </main>
        <MobileCartBar />
        <MobileBottomNav />
      </div>
    </>
  );
}
