"use client";

import Link from "next/link";
import { useCategory } from "@/hooks";
import { TypeOfCategory } from "@/lib/types";
import { useMemo } from "react";

export default function Footer() {
  const { data: masterCategories, isLoading } = useCategory({
    type: TypeOfCategory.MASTER,
    tree: true,
  });

  const allChildCategories = useMemo(() => {
    if (!masterCategories || masterCategories.length === 0) return [];
    const superCategories = masterCategories.flatMap((master: any) => master.children || []);
    return superCategories.flatMap((superCat: any) => superCat.children || []);
  }, [masterCategories]);

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            QuickZon
          </h3>
          <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
            Your one-stop destination for groceries, snacks, and daily essentials delivered in no time! 
            Enjoy fresh produce, irresistible deals, and all your favorite household items brought 
            straight to your doorstep with speed and convenience.
          </p>

          {/* Coming Soon Badge */}
          

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Google Play */}
            <button className="group bg-black hover:bg-gray-900 text-white rounded-lg px-6 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.04] shadow-md hover:shadow-lg cursor-not-allowed opacity-80">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left leading-tight">
                <p className="text-[11px] opacity-90">GET IT ON</p>
                <p className="text-[15px] font-semibold -mt-0.5">Google Play</p>
              </div>
            </button>

            {/* Apple Store */}
            <button className="group bg-black hover:bg-gray-900 text-white rounded-lg px-6 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.04] shadow-md hover:shadow-lg cursor-not-allowed opacity-80">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left leading-tight">
                <p className="text-[11px] opacity-90">Download on the</p>
                <p className="text-[15px] font-semibold -mt-0.5">App Store</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-gray-200 pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Categories */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Categories</h4>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {allChildCategories.slice(0, 12).map((category: any) => (
                    <Link
                      key={category._id}
                      href={`/categories/${category.slug}`}
                      className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About Us */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/return" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 🌐 Social Media Links */}
          <div className="mt-10 flex justify-center gap-6">
            {/* Facebook */}
            <Link
              href="https://www.facebook.com/"
              target="_blank"
              className="text-gray-500 hover:text-green-600 transition"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h2v3h-2c-.3 0-.5.2-.5.5V12H16l-.5 3h-2v7A10 10 0 0 0 22 12Z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/"
              target="_blank"
              className="text-gray-500 hover:text-green-600 transition"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.6 0 3 1.4 3 3v10c0 1.6-1.4 3-3 3H7c-1.6 0-3-1.4-3-3V7c0-1.6 1.4-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.5 5.5 0 0 0 12 7.5zm0 9A3.5 3.5 0 1 1 15.5 13 3.5 3.5 0 0 1 12 16.5zM17.8 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
              </svg>
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/"
              target="_blank"
              className="text-gray-500 hover:text-green-600 transition"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M8.1 17.4V10.9H5.6V17.4H8.1M6.9 9.8A1.3 1.3 0 1 0 6.9 7.2 1.3 1.3 0 0 0 6.9 9.8M18.4 17.4V13.8C18.4 12.1 17.9 10.8 16 10.8C15 10.8 14.3 11.3 14 11.9H14V10.9H11.6V17.4H14.1V14.3C14.1 13.3 14.3 12.3 15.5 12.3C16.6 12.3 16.6 13.3 16.6 14.3V17.4H18.4Z" />
              </svg>
            </Link>

            {/* 🐦 Twitter */}
            <Link
              href="https://twitter.com/"
              target="_blank"
              className="text-gray-500 hover:text-green-600 transition"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.41 8.41 0 0 1-2.7 1.03A4.22 4.22 0 0 0 16.1 4a4.23 4.23 0 0 0-4.23 4.23c0 .33.04.65.1.96A12 12 0 0 1 3.1 5.16a4.23 4.23 0 0 0 1.31 5.64 4.13 4.13 0 0 1-1.91-.53v.05a4.23 4.23 0 0 0 3.38 4.15c-.47.13-.97.2-1.48.2-.36 0-.72-.03-1.07-.1a4.25 4.25 0 0 0 3.95 2.93A8.48 8.48 0 0 1 2 19.54a12 12 0 0 0 6.52 1.91c7.82 0 12.1-6.48 12.1-12.1 0-.18-.01-.35-.02-.53A8.6 8.6 0 0 0 22.46 6z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-gray-700">QuickZon</span>. All rights reserved.{" "}
            Made with ❤️ by{" "}
            <Link
              href="https://www.techentia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Techentia
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
